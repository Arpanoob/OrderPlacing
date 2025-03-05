import { EventTypes } from "../enums/event.enum";
import { eventBus } from "../events/eventBus.event";
import logger from "../utils/logger";

eventBus.on(EventTypes.PushInQueue, ({ orderId, success, error }) => {
    if (success) {
        logger.warn(`order with ${orderId} sucessy fully pushed in queue`)
    }
    else
        logger.warn(`order with ${orderId} have ${error}`)
})