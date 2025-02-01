import { JsonSageAI } from '@json-sage-ai/core';
import { loadSchema } from './generate';
import { withRetry, handleApiError } from '../utils/error-handler';

export async function validateSchema(filePath: string) {
    const agent = new JsonSageAI({
        deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
        maxTokens: 2048
    });

    try {
        const schema = await loadSchema(filePath);
        const result = await withRetry(
            async () => {
                try {
                    return await agent.validateSchema(schema);
                } catch (error) {
                    return handleApiError(error);
                }
            },
            {
                maxRetries: 3,
                initialDelay: 1000,
                maxDelay: 10000
            }
        );

        return {
            valid: result.valid,
            errors: result.errors || []
        };
    } catch (error) {
        throw new Error(`Failed to validate schema: ${error.message}`);
    }
}
