export declare class ApiError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare class RetryableError extends Error {
    constructor(message: string);
}
export declare function withRetry<T>(operation: () => Promise<T>, options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: any) => boolean;
}): Promise<T>;
export declare function handleApiError(error: any): never;
