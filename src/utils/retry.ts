import logger from "./logger";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const withRetry = async <T>(
    fn: () => Promise<T>,
    retries: number = 3, waitTime?: number
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

            if (waitTime)
                logger.warn(`Retry attempt ${attempt} failed. Retrying in ${waitTime / 1000} second... ${error}`);
            else
                logger.warn(`Retry attempt ${attempt} failed.`);

            if (waitTime && attempt < retries) {
                await delay(waitTime);
            }
        }
    }

    throw lastError;
};
