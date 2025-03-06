import mongoose from "mongoose";
import { Inventory } from "../models/inventory.model";
import logger from "../utils/logger";
import { EXCEPTION } from "../enums/warnings.enum";

export const checkInventory = async (items: { productId: string; quantity: number }[], totalAmount: number) => {
    const productChecks = items.map(async (item) => {
        const product = await Inventory.findOne({ productId: item.productId });
        if (!product || product.stock < item.quantity) {
            logger.warn(EXCEPTION.INSUFFICIENT_STOCK_FOR_PRODUCT, item.productId);
            throw new Error(`${EXCEPTION.INSUFFICIENT_STOCK_FOR_PRODUCT} ${item.productId}`);
        }
        return item.quantity;
    });

    const quantities = await Promise.all(productChecks);

    const sumQuantity = quantities.reduce((acc, quantity) => +acc + +quantity, 0);

    if (+sumQuantity !== +totalAmount) {
        throw new Error(`${EXCEPTION.TOTAL_AMOUNT_NOT_EQUAL_ACCTUALY_QUANTITY}`);
    }
};

export const decrementInventory = async (
    items: { productId: string; quantity: number }[],
    session?: mongoose.ClientSession
) => {
    const updatePromises = items.map(async (item) => {
        const productQuery = Inventory.findOne({ productId: item.productId });
        if (session) {
            productQuery.session(session);
        }

        const product = await productQuery.exec();

        if (!product || product.stock < item.quantity) {
            logger.warn(EXCEPTION.INSUFFICIENT_STOCK_FOR_PRODUCT, item.productId);
            throw new Error(`${EXCEPTION.INSUFFICIENT_STOCK_FOR_PRODUCT} ${item.productId}`);
        }

        product.stock -= item.quantity;

        return product.save({ session });
    });

    await Promise.all(updatePromises);
};
