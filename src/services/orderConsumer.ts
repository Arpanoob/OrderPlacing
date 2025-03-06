import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import mongoose from 'mongoose';

import '../config/loadEnv';

import "../listeners/email.listener"
import "../listeners/db.listener"

import { Order } from '../models/order.model';
import logger from "../utils/logger";
import { User } from "../models/user.model";
import { messages } from "../enums/messages.enum";
import { ORDERS } from "../enums/orders.enum";
import { TEXTS } from "../enums/options.enum";
import { EXCEPTION } from "../enums/warnings.enum";
import { checkInventory, decrementInventory } from "./inventory.service";
import { sqsClientInvoke } from "../models/sqs.client";
import { eventBus } from "../events/eventBus.event";
import { EventTypes } from "../enums/event.enum";
import redisClient from "../models/radisdb";
import { withRetry } from "../utils/retry";




const processOrder = async (orderData: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findOne({ orderId: orderData?.orderId }).session(session);
        if (!order) {
            throw new Error(EXCEPTION.ORDER_NOTFOUND);
        }
        const { items } = order

        await checkInventory(order?.items,order.totalAmount)
        await decrementInventory(items, session);

        order.status = ORDERS.Processed;

        //update status in redis because
        //when 1st time user hit endpoint if its state is pending then redis chache the pending state
        //until it get expired but if it is proceeded then it must give updated state 

        const cacheKey = `order:${order.orderId}`;
        await redisClient.set(cacheKey, JSON.stringify(order), "EX", 600);

        await order.save({ session });

        const user = await User.findById(order.userId)
        if (!user)
            throw new Error(messages.USER_NOT_FOUND);
        const { email } = user;

        eventBus.emit(EventTypes.OrderProcessed, { email, order, status: ORDERS.Processed })

        await session.commitTransaction();
        session.endSession();

        logger.info(`Order ${order.orderId} processed.`);
        return true;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error(`${messages.FAILED_PROCESSING_ORDER} ${orderData.orderId}:`, error);

        const cacheKey = `order:${orderData.orderId}`;
        const cachedOrderStr = await redisClient.get(cacheKey);

        if (cachedOrderStr) {
            const cachedOrder = JSON.parse(cachedOrderStr);
            cachedOrder.status = ORDERS.Failed;

            await redisClient.set(cacheKey, JSON.stringify(cachedOrder), "EX", 600);
        }

        await Order.updateOne({ orderId: orderData.orderId }, { status: ORDERS.Failed });

        eventBus.emit(EventTypes.OrderProcessed, { email:orderData, order:orderData, status: ORDERS.Failed })

        return false;
    }

};

const processOrderWithRetry = async (orderData: any) => {
    return await withRetry(async () => {
        return await processOrder(orderData);
    }, 3, 1000);
};

const pollQueue = async () => {
    const { QUEUE_URL, sqsClient } = sqsClientInvoke();

    const params = {
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 10,
    };

    try {
        const command = new ReceiveMessageCommand(params);
        const data = await withRetry(() => sqsClient.send(command), 3, 1000);

        if (data.Messages && data.Messages.length > 0) {
            const message = data.Messages[0];
            const body = JSON.parse(message.Body || '{}');

            logger.info(body, `${TEXTS.PROCESSING_ORDER} ${body.orderId} ` + data);

            const success = await processOrderWithRetry(body);

            if (success) {
                const deleteCommand = new DeleteMessageCommand({
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: message.ReceiptHandle!,
                });
                await withRetry(() => sqsClient.send(deleteCommand), 3, 1000);
            }
        }
    } catch (error) {
        logger.error(EXCEPTION.SQS_POOLING_ERROR + error);
    }
};


const startPolling = async () => {
    while (true) {
        try {
            await pollQueue();
        } catch (error) {
            logger.error(`Polling loop error: ${error}`);
        }

        await new Promise(resolve => setTimeout(resolve, 11000));
    }
};


eventBus.emit(EventTypes.SERVER_STARTED);
startPolling().catch(console.error);
