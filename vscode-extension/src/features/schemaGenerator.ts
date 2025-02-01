import { JsonSageAI } from '@json-sage-ai/core';
import { withRetry } from '../utils/errorHandler';

export class SchemaGenerator {
    constructor(private agent: JsonSageAI) {}

    async generate(description: string) {
        return await withRetry(async () => {
            const result = await this.agent.generateSchema({
                jsonData: description,
                options: {
                    includeDescriptions: true,
                    includeExamples: true
                }
            });
            return result.schema;
        });
    }

    async generateFromJson(json: string) {
        return await withRetry(async () => {
            const result = await this.agent.generateSchemaFromJson({
                jsonData: json,
                options: {
                    includeDescriptions: true,
                    includeExamples: true
                }
            });
            return result.schema;
        });
    }
}
