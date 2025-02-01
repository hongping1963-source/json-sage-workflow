import { JsonSchema, ConversionOptions, ValidationResult, JsonSageAIConfig } from './types';
import Ajv from 'ajv';

/**
 * 验证JSON Schema的有效性
 */
export function validateSchema(schema: string): ValidationResult {
    try {
        const parsedSchema = JSON.parse(schema);
        const ajv = new Ajv();

        // 验证schema本身是否有效
        const validate = ajv.compile({
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            required: ["type"]
        });

        const valid = validate(parsedSchema);

        return {
            valid: valid,
            errors: valid ? [] : validate.errors.map(err => err.message)
        };
    } catch (error) {
        return {
            valid: false,
            errors: [error.message]
        };
    }
}

/**
 * 从JSON数据生成Schema
 */
export function generateSchemaFromJson(json: any, options: ConversionOptions = {}): JsonSchema {
    const schema: JsonSchema = {
        type: 'object',
        properties: {}
    };

    if (typeof json !== 'object' || json === null) {
        throw new Error('Input must be a valid JSON object');
    }

    for (const [key, value] of Object.entries(json)) {
        schema.properties[key] = inferType(value, options);
    }

    return schema;
}

/**
 * 推断JSON值的类型
 */
function inferType(value: any, options: ConversionOptions): any {
    if (value === null) {
        return { type: 'null' };
    }

    switch (typeof value) {
        case 'string':
            return { type: 'string' };
        case 'number':
            return { type: 'number' };
        case 'boolean':
            return { type: 'boolean' };
        case 'object':
            if (Array.isArray(value)) {
                return {
                    type: 'array',
                    items: value.length > 0 ? inferType(value[0], options) : {}
                };
            }
            const properties = {};
            for (const [k, v] of Object.entries(value)) {
                properties[k] = inferType(v, options);
            }
            return {
                type: 'object',
                properties
            };
        default:
            return { type: 'string' };
    }
}

/**
 * 使用AI增强Schema
 */
export async function enhanceSchemaWithAI(
    schema: JsonSchema,
    description: string,
    config: JsonSageAIConfig
): Promise<JsonSchema> {
    try {
        const deepseek = require('deepseek-chat');
        const client = new deepseek.DeepSeekChat({
            apiKey: config.deepseekApiKey
        });

        // 构建提示
        const prompt = `Enhance this JSON Schema with descriptions and validations:
        Original Description: ${description}
        Schema: ${JSON.stringify(schema, null, 2)}`;

        const response = await client.complete({
            prompt,
            model: config.model,
            maxTokens: config.maxTokens,
            temperature: config.temperature
        });

        const enhancedSchema = JSON.parse(response.choices[0].text);
        return enhancedSchema;
    } catch (error) {
        console.error('Failed to enhance schema:', error);
        return schema; // 如果增强失败，返回原始schema
    }
}
