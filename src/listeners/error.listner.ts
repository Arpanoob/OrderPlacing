import { EventTypes } from "../enums/event.enum";
import { eventBus } from "../events/eventBus.event";
import logger from "../utils/logger";

eventBus.on(EventTypes.Error, ({ orderId, success, error }) => {
    if (orderId)
        logger.warn(`order with ${orderId} have ${error}`)
    else
        logger.warn(`An Error : ${error}`)
})