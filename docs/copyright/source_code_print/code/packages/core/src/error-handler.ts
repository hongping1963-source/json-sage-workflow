/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { Logger } from './logger';

/**
 * 自定义错误类型
 */
export class JsonSageError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: any
    ) {
        super(message);
        this.name = 'JsonSageError';
    }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
    constructor(private logger: Logger) {}

    /**
     * 处理错误
     * @param error - 错误对象
     * @throws JsonSageError
     */
    handleError(error: any): never {
        if (error instanceof JsonSageError) {
            this.logger.error(`[${error.code}] ${error.message}`, error.details);
            throw error;
        }

        if (error instanceof SyntaxError) {
            const jsError = new JsonSageError(
                'Invalid JSON format',
                'INVALID_JSON',
                { originalError: error }
            );
            this.logger.error(`[${jsError.code}] ${jsError.message}`, error);
            throw jsError;
        }

        // API相关错误
        if (error.response) {
            const jsError = new JsonSageError(
                'API request failed',
                'API_ERROR',
                {
                    status: error.response.status,
                    data: error.response.data
                }
            );
            this.logger.error(`[${jsError.code}] ${jsError.message}`, error.response);
            throw jsError;
        }

        // 网络错误
        if (error.request) {
            const jsError = new JsonSageError(
                'Network error occurred',
                'NETWORK_ERROR',
                { originalError: error }
            );
            this.logger.error(`[${jsError.code}] ${jsError.message}`, error);
            throw jsError;
        }

        // 其他未知错误
        const jsError = new JsonSageError(
            'An unexpected error occurred',
            'UNKNOWN_ERROR',
            { originalError: error }
        );
        this.logger.error(`[${jsError.code}] ${jsError.message}`, error);
        throw jsError;
    }

    /**
     * 尝试执行可能出错的操作
     * @param operation - 要执行的操作
     * @param retries - 重试次数
     * @returns 操作结果
     */
    async tryOperation<T>(
        operation: () => Promise<T>,
        retries = 3
    ): Promise<T> {
        let lastError: any;

        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (i < retries - 1) {
                    const delay = Math.pow(2, i) * 1000; // 指数退避
                    this.logger.warn(`Retry ${i + 1}/${retries} after ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        this.handleError(lastError);
    }
}
