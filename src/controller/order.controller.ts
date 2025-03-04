import { Request, Response } from "express";
import { createOrder, getOrderById } from "../services/order.services";
import { createOrderSchema, getOrderSchema } from "../models/order.model";
import { messages } from "../enums/messages.enum";

export const createOrderHandler = async (req: Request, res: Response) => {
    try {
        const { error } = createOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { userId, items, totalAmount } = req.body;

        const order = await createOrder(userId, items, totalAmount);
        res.status(201).json({ success: true, order, messages: messages.ORDER_RECIVED });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getOrderHandler = async (req: Request, res: Response) => {
    try {
        const { error } = getOrderSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { id } = req.params;

        const order = await getOrderById(id);
        res.status(200).json({ success: true, order });
    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
};
