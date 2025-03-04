import mongoose, { Document, Schema } from "mongoose";
import Joi from "joi";

import { ORDERS } from "../enums/orders.enum";
import { OrderDocument, Product } from "../interface/order.interface";
import { options } from "../enums/options.enum";


const orderSchema = new Schema<OrderDocument>({
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ORDERS, default: ORDERS.Pending }
});

export const Order = mongoose.model<OrderDocument>(options.ORDER_SCHEMA, orderSchema);


export const createOrderSchema = Joi.object({
    userId: Joi.string().required(),
    totalAmount: Joi.number().min(1).required(),
    items: Joi.array().items(
        Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().min(1).required()
        })
    ).min(1).required()
});

export const getOrderSchema = Joi.object({
    id: Joi.string().required()
});
