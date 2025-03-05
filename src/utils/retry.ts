import logger from "./logger";

export const withRetry = async <T>(
    fn: () => Promise<T>,
    retries: number = 3
): Promise<T> => {
    let attempt = 0;
    let lastError: any = null;

    while (attempt < retries) {
        try {
            const result = await fn();

            return result;
        } catch (error) {
            lastError = error;
            attempt++;

            logger.warn(`Retry attempt ${attempt} failed.`);
        }
    }

    throw lastError;
};
