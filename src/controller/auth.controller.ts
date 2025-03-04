import { Request, Response } from "express";
import { AuthRequest } from "../interface/user.interface";
import {
    registerUser,
    loginUser,
    refreshUserToken
} from "../services/user.service";
import { validateLogin, validateUser } from "../models/user.model";
import { EXCEPTION } from "../enums/warnings.enum";

export const register = async (req: Request, res: Response) => {
    try {
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const result = await registerUser(req.body);
        if (result.success && result.cookie) {
            res.cookie(result.cookie.name, result.cookie.token, result.cookie.options);
        }
        res.status(result.status).json(result);
    } catch (error) {
        console.error(EXCEPTION.LOGIN_ERROR, error);
        res.status(500).json({ success: false, message: EXCEPTION.INTERNAL_SERVER_ERROR });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const result = await loginUser(req.body);
        if (result.success && result.cookie) {
            res.cookie(result.cookie.name, result.cookie.token, result.cookie.options);
        }
        res.status(result.status).json(result);
    } catch (error) {
        console.error(EXCEPTION.LOGIN_ERROR, error);
        res.status(500).json({ success: false, message: EXCEPTION.INTERNAL_SERVER_ERROR });
    }
};

export const refresh = async (req: AuthRequest, res: Response) => {
    try {
        const result = await refreshUserToken(req.user?._id);
        if (result.success && result.cookie) {
            res.cookie(result.cookie.name, result.cookie.token, result.cookie.options);
        }
        res.status(result.status).json(result);
    } catch (error) {
        console.error(EXCEPTION.TOKEN_REFRESH_ERROR, error);
        res.status(500).json({ success: false, message: EXCEPTION.INTERNAL_SERVER_ERROR });
    }
};
