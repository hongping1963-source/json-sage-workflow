import { JsonSageAI } from '@json-sage-ai/core';
import { withRetry } from '../utils/errorHandler';

export class JsonConverter {
    constructor(private agent: JsonSageAI) {}

    async convert(json: string) {
        return await withRetry(async () => {
            try {
                const parsedJson = JSON.parse(json);
                const result = await this.agent.generateSchemaFromJson({
                    jsonData: parsedJson,
                    options: {
                        includeDescriptions: true,
                        includeExamples: true,
                        inferTypes: true
                    }
                });
                return result.schema;
            } catch (error) {
                if (error instanceof SyntaxError) {
                    throw new Error('Invalid JSON format: ' + error.message);
                }
                throw error;
            }
        });
    }

    async convertWithDescription(json: string, description: string) {
        return await withRetry(async () => {
            try {
                const parsedJson = JSON.parse(json);
                const result = await this.agent.generateSchemaFromJson({
                    jsonData: parsedJson,
                    description: description,
                    options: {
                        includeDescriptions: true,
                        includeExamples: true,
                        inferTypes: true
                    }
                });
                return result.schema;
            } catch (error) {
                if (error instanceof SyntaxError) {
                    throw new Error('Invalid JSON format: ' + error.message);
                }
                throw error;
            }
        });
    }
}
