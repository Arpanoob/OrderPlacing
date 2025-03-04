import { SendMessageCommand } from "@aws-sdk/client-sqs";
import logger from "../utils/logger";
import { sqsClientInvoke } from "../models/sqs.client";


export const pushOrderToQueue = async (
    userId: string,
    items: { productId: string; quantity: number }[],
    totalAmount: number,
    orderId: string
) => {
    const { QUEUE_URL, sqsClient } = sqsClientInvoke();
    const messageBody = {
        orderId,
        userId,
        items,
        totalAmount,
        createdAt: new Date().toISOString(),
    };

    const params = {
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(messageBody),
    };
    const command = new SendMessageCommand(params);

    try {
        const response = await sqsClient.send(command);
        logger.info("Order pushed to queue", response.MessageId);
    } catch (error) {
        logger.error("Failed to push order to queue", error);
        throw error;
    }
};