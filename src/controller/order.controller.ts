import { Request, Response } from "express";
import { createOrder, getOrderById } from "../services/order.services";
import { createOrderSchema, getOrderSchema } from "../models/order.model";
import { messages } from "../enums/messages.enum";
import { AuthRequest } from "../interface/user.interface";

export const createOrderHandler = async (req: AuthRequest, res: Response) => {
    try {
        const { error } = createOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const { user: { _id: userId } = { _id: null } } = req;
        const { items, totalAmount } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not provided"
            });
        }
        
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
