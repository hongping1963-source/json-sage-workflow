/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { JsonSchema, ConversionOptions, ValidationResult, JsonSageAIConfig } from './types';
import Ajv from 'ajv';

/**
 * 验证JSON Schema的有效性
 * @param schema - 要验证的Schema字符串
 * @returns ValidationResult - 验证结果
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
 * @param json - JSON数据
 * @param options - 转换选项
 * @returns JsonSchema - 生成的Schema
 */
export function generateSchemaFromJson(json: any, options: ConversionOptions = {}): JsonSchema {
    const schema: JsonSchema = {
        type: 'object',
        properties: {}
    };

    if (typeof json !== 'object' || json === null) {
        throw new Error('Input must be a valid JSON object');
    }

    // 遍历JSON对象的所有属性
    for (const [key, value] of Object.entries(json)) {
        schema.properties[key] = inferType(value, options);
    }

    return schema;
}

/**
 * 推断JSON值的类型
 * @param value - 要推断类型的值
 * @param options - 转换选项
 * @returns 推断出的类型定义
 */
function inferType(value: any, options: ConversionOptions): any {
    if (value === null) {
        return { type: 'null' };
    }

    switch (typeof value) {
        case 'string':
            return { 
                type: 'string',
                ...(options.includeExamples ? { examples: [value] } : {})
            };
        case 'number':
            return { 
                type: 'number',
                ...(options.includeExamples ? { examples: [value] } : {})
            };
        case 'boolean':
            return { 
                type: 'boolean',
                ...(options.includeExamples ? { examples: [value] } : {})
            };
        case 'object':
            if (Array.isArray(value)) {
                return {
                    type: 'array',
                    items: value.length > 0 ? inferType(value[0], options) : {},
                    ...(options.includeExamples ? { examples: [value] } : {})
                };
            }
            const properties = {};
            for (const [k, v] of Object.entries(value)) {
                properties[k] = inferType(v, options);
            }
            return {
                type: 'object',
                properties,
                ...(options.includeExamples ? { examples: [value] } : {})
            };
        default:
            return { type: 'string' };
    }
}

/**
 * 使用AI增强Schema
 * @param schema - 原始Schema
 * @param description - 描述文本
 * @param config - AI配置
 * @returns Promise<JsonSchema> - 增强后的Schema
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
