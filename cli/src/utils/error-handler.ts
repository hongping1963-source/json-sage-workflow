import chalk from 'chalk';

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
                // 502, 503, 504 are retryable
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

            console.log(chalk.yellow(
                `\nAttempt ${attempt} failed: ${error.message}\nRetrying in ${delay/1000} seconds...`
            ));

            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * 2, maxDelay);
        }
    }

    throw lastError;
}

export function handleApiError(error: any): never {
    if (error instanceof ApiError) {
        switch (error.statusCode) {
            case 502:
                throw new RetryableError('API服务暂时不可用 (502 Bad Gateway)');
            case 503:
                throw new RetryableError('API服务暂时过载 (503 Service Unavailable)');
            case 504:
                throw new RetryableError('API服务响应超时 (504 Gateway Timeout)');
            case 401:
                throw new Error('API密钥无效或未提供');
            case 429:
                throw new RetryableError('已超过API调用限制，请稍后重试');
            default:
                throw new Error(`API错误: ${error.message}`);
        }
    }
    throw error;
}
