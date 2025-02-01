import { JsonSageAI } from '@json-sage-ai/core';
import { withRetry } from '../utils/errorHandler';

export class SchemaValidator {
    constructor(private agent: JsonSageAI) {}

    async validate(schema: string) {
        return await withRetry(async () => {
            try {
                const parsedSchema = JSON.parse(schema);
                const result = await this.agent.validateSchema(parsedSchema);
                return {
                    valid: result.valid,
                    errors: result.errors || []
                };
            } catch (error) {
                if (error instanceof SyntaxError) {
                    return {
                        valid: false,
                        errors: ['Invalid JSON format: ' + error.message]
                    };
                }
                throw error;
            }
        });
    }

    async validateJson(json: string, schema: string) {
        return await withRetry(async () => {
            try {
                const parsedJson = JSON.parse(json);
                const parsedSchema = JSON.parse(schema);
                const result = await this.agent.validateJsonAgainstSchema(parsedJson, parsedSchema);
                return {
                    valid: result.valid,
                    errors: result.errors || []
                };
            } catch (error) {
                if (error instanceof SyntaxError) {
                    return {
                        valid: false,
                        errors: ['Invalid JSON format: ' + error.message]
                    };
                }
                throw error;
            }
        });
    }
}
