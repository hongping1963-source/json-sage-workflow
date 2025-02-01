/**
 * Default configuration for JSON Sage Workflow
 */
export const DEFAULT_CONFIG = {
    /**
     * Default prompt for AI interactions
     */
    prompt: `You are a helpful AI assistant specialized in JSON data analysis.
Your task is to help users understand and work with JSON data effectively.

Please analyze the provided JSON data and:
1. Validate its structure and format
2. Identify potential issues or improvements
3. Suggest optimizations if applicable
4. Answer any specific questions about the data

If you find any issues:
- Point them out clearly
- Explain why they are problematic
- Suggest specific improvements
- Provide examples where helpful`,

    /**
     * Error messages used throughout the application
     */
    errorMessages: {
        jsonParse: 'Error parsing JSON data. Please ensure the input is valid JSON.',
        commandError: 'Error executing command. Please check your input and try again.',
        fileNotFound: 'File not found. Please check the file path and try again.',
        invalidConfig: 'Invalid configuration. Please check your config file.',
        networkError: 'Network error occurred. Please check your connection and try again.',
        timeoutError: 'Operation timed out. Please try again.',
        validationError: 'Validation error occurred. Please check your input.',
        optimizationError: 'Error during optimization process.',
        unknownError: 'An unexpected error occurred. Please try again.'
    },

    /**
     * Default timeout values (in milliseconds)
     */
    timeouts: {
        command: 30000,    // 30 seconds
        request: 10000,    // 10 seconds
        process: 60000     // 1 minute
    },

    /**
     * Default retry configuration
     */
    retry: {
        maxAttempts: 3,
        delayMs: 1000,    // 1 second
        backoffFactor: 2   // Exponential backoff
    }
};
