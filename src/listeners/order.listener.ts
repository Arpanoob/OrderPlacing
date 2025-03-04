import { eventBus } from "../events/eventBus.event";
import { EventTypes } from "../enums/event.enum";
import { checkInventory, decrementInventory } from "../services/inventory.service";

eventBus.on(EventTypes.OrderCreated, async ({ order }) => {
    const { orderId, userId, items, totalAmount } = order;
    try {
        await checkInventory(items);
        eventBus.emit(EventTypes.InventoryChecked, { orderId, userId, items, totalAmount, success: true });
    } catch (error) {
        eventBus.emit(EventTypes.InventoryChecked, { orderId, success: false, error });
    }
});
