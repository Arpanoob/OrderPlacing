import { Request } from "express";

export interface User {
    name: string;
    email: string;
    password: string;
    getAuthToken: () => string;
    comparePassword: (password: string) => boolean;
}

export interface AuthRequest extends Request {
    user?: {
        _id: string;
    };
}