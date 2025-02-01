import { JsonSageAI } from '@json-sage-ai/core';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { SchemaOptions } from '../types';
import { withRetry, handleApiError } from '../utils/error-handler';

export async function generateSchema(description: string, options?: SchemaOptions) {
    const agent = new JsonSageAI({
        deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
        maxTokens: 2048
    });

    try {
        const result = await withRetry(
            async () => {
                try {
                    return await agent.generateSchema({
                        jsonData: description,
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
                initialDelay: 1000,
                maxDelay: 10000
            }
        );

        return result.schema;
    } catch (error) {
        throw new Error(`Failed to generate schema: ${error.message}`);
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
