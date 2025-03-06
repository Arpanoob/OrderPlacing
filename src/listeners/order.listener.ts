import { eventBus } from "../events/eventBus.event";
import { EventTypes } from "../enums/event.enum";
import { checkInventory } from "../services/inventory.service";

eventBus.on(EventTypes.OrderCreated, async ({ order }) => {
    const { orderId, userId, items, totalAmount } = order;
    try {
        //Again Adding checkInvetory check, which did't need but added because
        //saposse multiple order came for same product but in stock there is only one 
        //then what happen 1st inventory check passed then count did't reducted but at that perticulal time 
        //order came for same phone then it will create issue then what we need to do
        //add deducted count of inventory product in redis and check before placing it 
        //for improvement that logic will be placed here ,that's why i added this layer to tell another level of check can applied 
        await checkInventory(items,totalAmount);
        eventBus.emit(EventTypes.InventoryChecked, { orderId, userId, items, totalAmount, success: true });
    } catch (error) {
        eventBus.emit(EventTypes.InventoryChecked, { orderId, success: false, error });
    }
});
