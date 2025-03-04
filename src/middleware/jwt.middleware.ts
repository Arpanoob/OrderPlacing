import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { messages } from "../enums/messages.enum";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const { cookies: { token } } = req
    if (!token) {
        return res.status(401).json({ success: false, message: messages.ACCESS_DENIED });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY as string) as { _id: string };
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: messages.INVALID_OR_EXPIRED_TOKEN });
    }
};
