import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import logger from "../utils/logger";

const sqsClient = new SQSClient({
    region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL!;

export const pushOrderToQueue = async (
    userId: string,
    items: { productId: string; quantity: number }[],
    totalAmount: number,
    orderId: string
) => {
    const messageBody = {
        orderId,
        userId,
        items,
        totalAmount,
        createdAt: new Date().toISOString(),
    };

    const params = {
        QueueUrl: QUEUE_URL!,
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