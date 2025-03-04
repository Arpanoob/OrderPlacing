import { SQSClient } from "@aws-sdk/client-sqs";
import { StandardRetryStrategy } from "@aws-sdk/util-retry";

export function sqsClientInvoke() {
    const sqsClient = new SQSClient({
        region: "eu-north-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        //it will retry 3 times if network error
        retryStrategy: new StandardRetryStrategy(async () => 3),
    });
    const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;
    return { sqsClient, QUEUE_URL }
}
