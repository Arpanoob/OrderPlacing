import { eventBus } from "../events/eventBus.event";
import { EventTypes } from "../enums/event.enum";
import { withRetry } from "../utils/retry";
import { sendOrderEmail } from "../services/ses.services";
import logger from "../utils/logger";
import { TEXTS } from "../enums/options.enum";

eventBus.on(EventTypes.OrderProcessed, async ({ email, order, status }) => {
    const { orderId } = order
    try {
        await withRetry(async () =>
            await sendOrderEmail(email, order, status)
            , 3);
        eventBus.emit(EventTypes.MailSend, { email, success: true });

    } catch (error) {
        eventBus.emit(EventTypes.Error, { orderId, success: false, error })
    }
});

eventBus.on(EventTypes.MailSend, async ({ email, success }) => {
    logger.info(TEXTS.Email_SENDED_TO + email)
});