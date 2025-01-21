import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { SchemaOptions } from '../types';
import { DEFAULT_CONFIG } from '../../config/defaults';
import { safeJsonParse, safeExecute, retryWithBackoff } from '../../utils/ErrorHandler';

export async function generateSchema(description: string, options?: SchemaOptions) {
    try {
        const result = await retryWithBackoff(
            async () => {
                const parseResult = safeJsonParse(description);
                if (!parseResult.success) {
                    throw parseResult.error;
                }

                return await safeExecute(async () => {
                    // TODO: Implement schema generation logic
                    return {
                        schema: {
                            type: "object",
                            properties: {}
                        }
                    };
                });
            },
            DEFAULT_CONFIG.retry
        );

        return result.schema;
    } catch (error) {
        throw new Error(`Failed to generate schema: ${(error as Error).message}`);
    }
}

export async function saveSchema(schema: any, filePath: string, format: boolean = true) {
    try {
        const absolutePath = resolve(filePath);
        const content = JSON.stringify(schema, null, format ? 2 : 0);
        await safeExecute(async () => {
            writeFileSync(absolutePath, content, 'utf8');
        }, DEFAULT_CONFIG.errorMessages.fileNotFound);
    } catch (error) {
        throw new Error(`Failed to save schema: ${(error as Error).message}`);
    }
}

export async function loadSchema(filePath: string) {
    try {
        const absolutePath = resolve(filePath);
        const content = await safeExecute(
            async () => readFileSync(absolutePath, 'utf8'),
            DEFAULT_CONFIG.errorMessages.fileNotFound
        );

        if (!content.success || !content.data) {
            throw new Error(DEFAULT_CONFIG.errorMessages.fileNotFound);
        }

        const parseResult = safeJsonParse(content.data);
        if (!parseResult.success) {
            throw parseResult.error;
        }

        return parseResult.data;
    } catch (error) {
        throw new Error(`Failed to load schema: ${(error as Error).message}`);
    }
}
