import mongoose from "mongoose";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { ENV } from "../enums/env.enum";
import bcrypt from "bcrypt";
import { User as UserI} from "../interface/user.interface";
import { options } from "../enums/options.enum";

const Schema = new mongoose.Schema<UserI>({
    name: {
        type: String,
        required: true,
        lowercase: true,
        minlength: 5,
        maxlength: 50,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024,
    },
});

Schema.pre("save", async function (next) {
    if (this.isModified(options.Password)) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

Schema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

Schema.methods.getAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id },
        process.env.JWT_PRIVATE_KEY || ENV.JWT_PRIVATE_KEY
    );
    return token;
};

export function validateUser(user: UserI) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
    });

    return schema.validate(user);
}

export function validateLogin(data: Pick<UserI, options.EMAIL | options.Password>) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    });

    return schema.validate(data);
}

export const User = mongoose.model<UserI>(options.USER_SCHEMA, Schema);


export { Schema };