// Another approch for retry can
// //error come then in catch i can emit same event to retry aumaticaly works And put retries count in redis
import { eventBus } from "../events/eventBus.event";
import { EventTypes } from "../enums/event.enum";
import { pushOrderToQueue } from "../services/orderProducer";
import { withRetry } from "../utils/retry";

eventBus.on(EventTypes.InventoryChecked, async ({ userId, items, totalAmount, orderId, success,error }) => {
    try {
        if (success) {
            await withRetry(async () =>
                await pushOrderToQueue(userId, items, totalAmount, orderId)
                , 3);
            eventBus.emit(EventTypes.PushInQueue, { orderId, success: true });
        }
        else {
            eventBus.emit(EventTypes.Error, { orderId, success: false, error })
        }

    } catch (error) {
        eventBus.emit(EventTypes.PushInQueue, { orderId, success: false, error });
    }
});
