import dotenv from 'dotenv';
import path from 'path';
import { ENV } from '../enums/env.enum';
import logger from '../utils/logger';
import { messages } from '../enums/messages.enum';
import { TEXTS } from '../enums/options.enum';

const EN = process.env.NODE_ENV || ENV.DEVELOPMENT;

const envFile = `${TEXTS.ENV}${EN}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

logger.info(`${messages.LOADED_ENVS} ${envFile}`);
