import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import ejs from "ejs";
import path from "path";

const sesClient = new SESClient({
    region: "eu-central-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export const sendOrderNotification = async (
    recipientEmail: string,
    orderId: string,
    items: { productId: string; quantity: number }[],
    status: string
) => {
    const templatePath = path.join(__dirname, "../templates/orderNotification.ejs");

    const htmlBody = await ejs.renderFile(templatePath, { orderId, items, status });

    const params = {
        Source: process.env.AWS_SES_SENDER_EMAIL!,
        Destination: { ToAddresses: [recipientEmail] },
        Message: {
            Subject: { Data: `Order Confirmation - Order #${orderId}` },
            Body: {
                Html: { Data: htmlBody },
                Text: { Data: `Your order #${orderId} has been ${status}.` }
            }
        }
    };

    const command = new SendEmailCommand(params);

    try {
        await sesClient.send(command);
        console.log(`Order email sent to ${recipientEmail}`);
    } catch (error) {
        console.error("Failed to send order notification email:", error);
    }
};
