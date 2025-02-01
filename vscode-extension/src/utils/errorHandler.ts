export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class RetryableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RetryableError';
    }
}

export async function withRetry<T>(
    operation: () => Promise<T>,
    options: {
        maxRetries?: number;
        initialDelay?: number;
        maxDelay?: number;
        shouldRetry?: (error: any) => boolean;
    } = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        shouldRetry = (error) => {
            if (error instanceof ApiError) {
                return [502, 503, 504].includes(error.statusCode);
            }
            return error instanceof RetryableError;
        }
    } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (!shouldRetry(error) || attempt === maxRetries) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * 2, maxDelay);
        }
    }

    throw lastError;
}
