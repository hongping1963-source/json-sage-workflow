import { DEFAULT_CONFIG } from '../config/defaults';

/**
 * Custom error class for JSON Sage Workflow
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
 * Safely parse JSON with error handling
 */
export function safeJsonParse(data: string): { success: boolean; data?: any; error?: Error } {
    try {
        const parsed = JSON.parse(data);
        return { success: true, data: parsed };
    } catch (error) {
        return {
            success: false,
            error: new JsonSageError(
                DEFAULT_CONFIG.errorMessages.jsonParse,
                'INVALID_JSON',
                error
            )
        };
    }
}

/**
 * Safely execute a function with error handling
 */
export async function safeExecute<T>(
    fn: () => Promise<T> | T,
    errorMessage: string = DEFAULT_CONFIG.errorMessages.unknownError
): Promise<{ success: boolean; data?: T; error?: Error }> {
    try {
        const result = await fn();
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: new JsonSageError(
                errorMessage,
                'EXECUTION_ERROR',
                error
            )
        };
    }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options = DEFAULT_CONFIG.retry
): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (attempt === options.maxAttempts) break;
            
            // Calculate delay with exponential backoff
            const delay = options.delayMs * Math.pow(options.backoffFactor, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError || new Error('Operation failed after multiple retries');
}
