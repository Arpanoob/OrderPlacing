import { createLogger, format, transports } from 'winston';
import { options, PATH } from '../enums/options.enum';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = createLogger({
    level: options.INFO,
    format: combine(
        colorize({ all: true }),
        timestamp({ format: options.DATE_FORMATE }),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: PATH.LOGS, level: options.INFO })
    ]
});

export default logger;
