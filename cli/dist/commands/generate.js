"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSchema = generateSchema;
exports.saveSchema = saveSchema;
exports.loadSchema = loadSchema;
const core_1 = require("@json-sage-ai/core");
const fs_1 = require("fs");
const path_1 = require("path");
const error_handler_1 = require("../utils/error-handler");
async function generateSchema(description, options) {
    const agent = new core_1.JsonSageAI({
        deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
        maxTokens: 2048
    });
    try {
        const result = await (0, error_handler_1.withRetry)(async () => {
            try {
                return await agent.generateSchema({
                    jsonData: description,
                    options: {
                        includeDescriptions: true,
                        includeExamples: true,
                        ...options
                    }
                });
            }
            catch (error) {
                return (0, error_handler_1.handleApiError)(error);
            }
        }, {
            maxRetries: 3,
            initialDelay: 1000,
            maxDelay: 10000
        });
        return result.schema;
    }
    catch (error) {
        throw new Error(`Failed to generate schema: ${error.message}`);
    }
}
async function saveSchema(schema, filePath, format = true) {
    try {
        const absolutePath = (0, path_1.resolve)(filePath);
        const content = JSON.stringify(schema, null, format ? 2 : 0);
        (0, fs_1.writeFileSync)(absolutePath, content, 'utf8');
    }
    catch (error) {
        throw new Error(`Failed to save schema: ${error.message}`);
    }
}
async function loadSchema(filePath) {
    try {
        const absolutePath = (0, path_1.resolve)(filePath);
        const content = (0, fs_1.readFileSync)(absolutePath, 'utf8');
        return JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to load schema: ${error.message}`);
    }
}
