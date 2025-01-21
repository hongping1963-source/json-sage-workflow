"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryableError = exports.ApiError = void 0;
exports.withRetry = withRetry;
exports.handleApiError = handleApiError;
const chalk_1 = __importDefault(require("chalk"));
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
class RetryableError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RetryableError';
    }
}
exports.RetryableError = RetryableError;
async function withRetry(operation, options = {}) {
    const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, shouldRetry = (error) => {
        if (error instanceof ApiError) {
            // 502, 503, 504 are retryable
            return [502, 503, 504].includes(error.statusCode);
        }
        return error instanceof RetryableError;
    } } = options;
    let lastError;
    let delay = initialDelay;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (!shouldRetry(error) || attempt === maxRetries) {
                throw error;
            }
            console.log(chalk_1.default.yellow(`\nAttempt ${attempt} failed: ${error.message}\nRetrying in ${delay / 1000} seconds...`));
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * 2, maxDelay);
        }
    }
    throw lastError;
}
function handleApiError(error) {
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
