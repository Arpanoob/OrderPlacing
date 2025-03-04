import mongoose from 'mongoose';
import logger from '../utils/logger';
import { messages } from '../enums/messages.enum';
import { EXCEPTION } from '../enums/warnings.enum';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error(EXCEPTION.MISSING_URI);
        }

        await mongoose.connect(mongoUri);
        logger.info(messages.DB_CONNECTED_SUCESSFULLY);
    } catch (error) {
        logger.error(`${messages.MONGO_CONNECTION_ERROR} ${(error as Error).message}`);
    }
};

export default connectDB;
