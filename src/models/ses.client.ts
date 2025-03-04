import { SendRawEmailCommand, SESClient } from "@aws-sdk/client-ses";
import nodemailer from 'nodemailer';

export function sesClientInvoke() {

    const sesClient = new SESClient({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    });
    const transporter = nodemailer.createTransport({
        SES: {
            ses: sesClient,
            aws: { SendRawEmailCommand }
        }
    });

    const AWS_SES_SENDER_EMAIL = process.env.AWS_SES_SENDER_EMAIL;
    return { sesClient, AWS_SES_SENDER_EMAIL, transporter }
}
