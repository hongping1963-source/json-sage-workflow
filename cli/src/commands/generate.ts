import { JsonSageWorkflow } from '../../..';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { SchemaOptions } from '../types';
import { withRetry, handleApiError } from '../utils/error-handler';

export async function generateSchema(description: string, options?: SchemaOptions) {
    const workflow = new JsonSageWorkflow({
        apiKey: process.env.API_KEY || '',
        model: 'gpt-4',
        maxTokens: 2048
    });

    try {
        const result = await withRetry(
            async () => {
                try {
                    return await workflow.generateSchema({
                        input: description,
                        options: {
                            includeDescriptions: true,
                            includeExamples: true,
                            ...options
                        }
                    });
                } catch (error) {
                    return handleApiError(error);
                }
            },
            {
                maxRetries: 3,
                retryDelay: 1000,
                onRetry: (error, attempt) => {
                    console.warn(`Retry attempt ${attempt} due to error: ${error.message}`);
                }
            }
        );

        if (options?.outputFile) {
            const outputPath = resolve(process.cwd(), options.outputFile);
            writeFileSync(outputPath, JSON.stringify(result, null, 2));
            console.log(`Schema saved to ${outputPath}`);
        }

        return result;
    } catch (error) {
        console.error('Failed to generate schema:', error);
        throw error;
    }
}

export async function saveSchema(schema: any, filePath: string, format: boolean = true) {
    try {
        const absolutePath = resolve(filePath);
        const content = JSON.stringify(schema, null, format ? 2 : 0);
        writeFileSync(absolutePath, content, 'utf8');
    } catch (error) {
        throw new Error(`Failed to save schema: ${error.message}`);
    }
}

export async function loadSchema(filePath: string) {
    try {
        const absolutePath = resolve(filePath);
        const content = readFileSync(absolutePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to load schema: ${error.message}`);
    }
}
