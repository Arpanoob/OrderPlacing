import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors'
import cookieParser from "cookie-parser";

import './config/loadEnv';

//for event-driven
import "./listeners/error.listner"
import "./listeners/inventory.listener"
import "./listeners/order.listener"
import "./listeners/sqs.listener"
import "./listeners/email.listener"
import "./listeners/db.listener"

import logger from './utils/logger';

import { EXCEPTION } from './enums/warnings.enum';
import { messages } from './enums/messages.enum';
import { EVENTS } from './enums/events.enum';
import { ENDPOINTS, TEXTS } from './enums/options.enum';

import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';

import { verifyToken } from './middleware/jwt.middleware';

import { withRetry } from './utils/retry';
import { eventBus } from './events/eventBus.event';
import { EventTypes } from './enums/event.enum';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());
app.use(cookieParser());

app.use(ENDPOINTS.AUTH_START, authRoutes);
app.use(verifyToken)
app.use(ENDPOINTS.API, orderRoutes)

app.get('/', (req, res) => {
    logger.info('Received GET request at /');
    res.send('Hello, World!');
});


const startServer = () => {
    return new Promise<void>((resolve, reject) => {
        const server = app.listen(PORT || 3000, () => {
            logger.info(`${messages.SERVER_RUNNING} ${PORT} ${TEXTS.IN} ${process.env.NODE_ENV} ${TEXTS.MODE}`);
            resolve();
            return;
        });

        server.on('error', (error) => {
            logger.error(`${messages.FAILED_TO_START_SERVER} ${error.message}`);
            reject(error);
        });
    });
};
const bootstrap = async () => {
    try {
        await withRetry(startServer, 3, 1000);
        //To connect with db only when server get started
        eventBus.emit(EventTypes.SERVER_STARTED)
        logger.info(messages.SERVER_START_SUCESSFULLY);
    } catch (error) {
        logger.error(`${messages.FAILED_TO_START_SERVER} ${(error as Error).message}`);
    }
};

bootstrap();

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(EXCEPTION.ERROR, err.message);
    res.status(500).send(EXCEPTION.INTERNAL_SERVER_ERROR);
});

process.on(EVENTS.UNHANDLED_REJECTION, (err: unknown) => {
    if (err instanceof Error) {
        console.error(err.name, err.message);
    }
    console.error(EXCEPTION.UNHANDLED_REJECTION);
});

process.on(EVENTS.UNCAUGHT, (err: Error) => {
    console.error(err.name, err.message);
    console.error(EXCEPTION.UNCAUGHT);
});