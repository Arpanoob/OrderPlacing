import { sesClientInvoke } from '../models/ses.client'
import ejs from 'ejs';
import path from 'path';



export const sendOrderEmail = async (email: string, order: any, status: string) => {
    const { AWS_SES_SENDER_EMAIL, transporter } = sesClientInvoke()

    const templatePath = path.join(__dirname, '../templates/orderNotification.ejs');

    const emailTemplate = await ejs.renderFile(templatePath, { order, status, orderId: order.orderId });

    await transporter.sendMail({
        from: AWS_SES_SENDER_EMAIL,
        to: email,
        subject: `Order ${status}: ${order.orderId}`,
        html: emailTemplate
    });
};