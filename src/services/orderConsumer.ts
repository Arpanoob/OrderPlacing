import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import mongoose from 'mongoose';
import path from 'path';
import ejs from 'ejs';
import { SendRawEmailCommand, SESClient } from "@aws-sdk/client-ses";

import '../config/loadEnv';

import connectDB from "../models/db";
import redisClient from "../models/radisdb";
import nodemailer from 'nodemailer';
import { Order } from '../models/order.model';
import logger from "../utils/logger";
import { User } from "../models/user.model";
import { messages } from "../enums/messages.enum";
import { ORDERS } from "../enums/orders.enum";
import { TEXTS } from "../enums/options.enum";
import { EXCEPTION } from "../enums/warnings.enum";
import { decrementInventory } from "./inventory.service";

const templatePath = path.join(__dirname, '../templates/orderNotification.ejs');

const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL!;

const transporter = nodemailer.createTransport({
    SES: {
        ses: sesClient,
        aws: { SendRawEmailCommand }
    }
});

const sendOrderEmail = async (email: string, order: any, status: string) => {
    const emailTemplate = await ejs.renderFile(templatePath, { order, status, orderId: order.orderId });

    await transporter.sendMail({
        from: process.env.AWS_SES_SENDER_EMAIL,
        to: email,
        subject: `Order ${status}: ${order.orderId}`,
        html: emailTemplate
    });
    logger.info(TEXTS.Email_SENDED_TO + email)
};

const processOrder = async (orderData: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findOne({ orderId: orderData.orderId }).session(session);

        if (!order) {
            throw new Error(EXCEPTION.ORDER_NOTFOUND);
        }
        const { items } = order
        
        await decrementInventory(items, session);
        order.status = ORDERS.Processed;
        await order.save({ session });
        await redisClient.set(`order:${order.orderId}`, JSON.stringify(order), 'EX', 600);

        const user = await User.findById(order.userId)
        if (!user)
            throw new Error(messages.USER_NOT_FOUND);

        await sendOrderEmail(user?.email!, order, ORDERS.Processed);

        await session.commitTransaction();
        session.endSession();

        logger.info(`Order ${order.orderId} processed and cached.`);
        return true;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error(`${messages.FAILED_PROCESSING_ORDER} ${orderData.orderId}:`, error);

        await Order.updateOne({ orderId: orderData.orderId }, { status: ORDERS.Failed });

        await sendOrderEmail(orderData.userEmail, orderData, ORDERS.Failed);

        return false;
    }
};

const pollQueue = async () => {
    const params = {
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 10,
    };

    try {
        const command = new ReceiveMessageCommand(params);
        const data = await sqsClient.send(command);

        if (data.Messages && data.Messages.length > 0) {
            const message = data.Messages[0];
            const body = JSON.parse(message.Body || '{}');

            logger.info(body, `${TEXTS.PROCESSING_ORDER} ${body.orderId} ` + data);

            const success = await processOrder(body);

            if (success) {
                const deleteCommand = new DeleteMessageCommand({
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: message.ReceiptHandle!,
                });
                await sqsClient.send(deleteCommand);
            }
        }
    } catch (error) {
        logger.error(EXCEPTION.SQS_POOLING_ERROR + error);
    }
};

const startPolling = async () => {
    await connectDB();

    while (true) {
        await pollQueue();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

startPolling().catch(console.error);
