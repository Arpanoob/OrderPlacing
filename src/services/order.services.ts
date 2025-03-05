import { Order } from "../models/order.model";
import { v4 as uuidv4 } from "uuid";
import { checkInventory, decrementInventory } from "./inventory.service";
import redisClient from "../models/radisdb";
import logger from "../utils/logger";
import { messages } from "../enums/messages.enum";
import { EXCEPTION } from "../enums/warnings.enum";
import { pushOrderToQueue } from "./orderProducer";
import { ORDERS } from "../enums/orders.enum";
import { EventTypes } from "../enums/event.enum";
import { eventBus } from "../events/eventBus.event";


export const createOrder = async (
    userId: string,
    items: { productId: string; quantity: number }[],
    totalAmount: number
) => {
    try {
        //if stock is out , the it throw error and on controller error get handled 
        //here not added order at redis because ,assuming the retrival will heavy than creation
        
        await checkInventory(items);
        const order = await Order.create({
            orderId: uuidv4(),
            userId,
            items,
            totalAmount,
            status: ORDERS.Pending
        });
        eventBus.emit(EventTypes.OrderCreated, { order });
        return order;
    } catch (error) {
        throw error;
    }
};



export const getOrderById = async (orderId: string) => {
    const cacheKey = `order:${orderId}`;

    const cachedOrder = await redisClient.get(cacheKey);
    if (cachedOrder) {
        logger.info(messages.FOUND_IN_REDIS)
        return JSON.parse(cachedOrder);
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
        logger.info(messages.NOTFOUND_IN_REDIS)
        throw new Error(EXCEPTION.ORDER_NOTFOUND);
    }

    await redisClient.set(cacheKey, JSON.stringify(order), "EX", 600);

    return order;
};


export const updateOrderStatus = async (orderId: string, status: string) => {
    await Order.updateOne({ orderId }, { status });
};