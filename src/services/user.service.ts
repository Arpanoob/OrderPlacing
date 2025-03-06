import { User } from "../models/user.model";
import { ENV } from "../enums/env.enum";
import { messages } from "../enums/messages.enum";
import { EXCEPTION } from "../enums/warnings.enum";
import { options } from "../enums/options.enum";

export const registerUser = async (data: { name: string, email: string, password: string }) => {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return { status: 400, success: false, message: messages.Already_Registered };
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = user.getAuthToken();

    return {
        status: 201,
        success: true,
        message: messages.SUCCESSFULLY_REGISTERED,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        token,
        cookie: {
            name: options.COOKIIE_NAME,
            token,
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === ENV.PRODUCTION,
                sameSite: options.SAMESITE_STRICT as options.SAMESITE_STRICT,
                maxAge: 3600000
            }
        }
    };
};

export const loginUser = async (data: { email: string, password: string }) => {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) {
        return { status: 400, success: false, message: EXCEPTION.INVALID_ID_PASSWORD };
    }

    const isValidPassword =  user.comparePassword(password);
    if (!isValidPassword) {
        return { status: 400, success: false, message: EXCEPTION.INVALID_ID_PASSWORD };
    }

    const token = user.getAuthToken();

    return {
        status: 200,
        success: true,
        message: messages.LOGIN_SUCESSFULL,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        token,
        cookie: {
            name: options.COOKIIE_NAME,
            token,
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === ENV.PRODUCTION,
                sameSite: options.SAMESITE_STRICT as options.SAMESITE_STRICT,
                maxAge: 3600000
            }
        }
    };
};

export const refreshUserToken = async (userId: string | undefined) => {
    if (!userId) {
        return { status: 404, success: false, message: EXCEPTION.USER_ID_NOT_FOUND };
    }

    const user = await User.findById(userId);
    if (!user) {
        return { status: 404, success: false, message: EXCEPTION.USER_NOT_FOUND };
    }

    const accessToken = user.getAuthToken();

    return {
        status: 200,
        success: true,
        message: EXCEPTION.TOKEN_REFRESH_SUCESSFULLY,
        token: accessToken,
        cookie: {
            name: options.COOKIIE_NAME,
            token: accessToken,
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === ENV.PRODUCTION,
                sameSite: options.SAMESITE_STRICT as options.SAMESITE_STRICT,
                maxAge: 15 * 60 * 1000
            }
        }
    };
};
