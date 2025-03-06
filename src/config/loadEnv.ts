import dotenv from 'dotenv';
import path from 'path';
import { ENV } from '../enums/env.enum';
import logger from '../utils/logger';
import { messages } from '../enums/messages.enum';
import { TEXTS } from '../enums/options.enum';
import { withRetry } from '../utils/retry';

const REQUIRED_ENV_VARS = [
    'PORT',
    'MONGO_URI',
    'JWT_PRIVATE_KEY',
    'REDIS_HOST',
    'REDIS_PORT',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SES_SENDER_EMAIL',
    'AWS_SQS_QUEUE_URL',
    'AWS_REGION',
];

const EN = process.env.NODE_ENV || ENV.DEVELOPMENT;
const envFile = `${TEXTS.ENV}${EN}`;

const validateEnvVars = () => {
    const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

const loadEnvWithRetry = async () => {
    await withRetry(async () => {
        dotenv.config({ path: path.resolve(process.cwd(), envFile) });

        logger.info(`${messages.LOADED_ENVS} ${envFile}`);

        validateEnvVars();
    }, 3, 1000);
};

export const loadEnvironment = async () => {
    try {
        await loadEnvWithRetry();
        logger.info(`All required environment variables are present.`);
    } catch (error) {
        logger.error(`Failed to load required environment variables after retries: ${error}`);
    }
};

loadEnvironment();