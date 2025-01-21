"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = validateSchema;
const core_1 = require("@json-sage-ai/core");
const generate_1 = require("./generate");
const error_handler_1 = require("../utils/error-handler");
async function validateSchema(filePath) {
    const agent = new core_1.JsonSageAI({
        deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
        maxTokens: 2048
    });
    try {
        const schema = await (0, generate_1.loadSchema)(filePath);
        const result = await (0, error_handler_1.withRetry)(async () => {
            try {
                return await agent.validateSchema(schema);
            }
            catch (error) {
                return (0, error_handler_1.handleApiError)(error);
            }
        }, {
            maxRetries: 3,
            initialDelay: 1000,
            maxDelay: 10000
        });
        return {
            valid: result.valid,
            errors: result.errors || []
        };
    }
    catch (error) {
        throw new Error(`Failed to validate schema: ${error.message}`);
    }
}
