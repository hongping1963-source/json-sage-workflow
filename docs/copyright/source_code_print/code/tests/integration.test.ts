/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { JsonSageAI } from '../packages/core/src/JsonSageAI';
import { SchemaGenerationOptions, ValidationResult } from '../packages/core/src/types';

describe('JsonSageAI Integration Tests', () => {
    let jsonSage: JsonSageAI;

    beforeAll(() => {
        // 初始化JsonSageAI实例
        jsonSage = new JsonSageAI({
            deepseekApiKey: process.env.DEEPSEEK_API_KEY || 'test-key',
            model: 'test-model',
            maxTokens: 1000,
            temperature: 0.7
        });
    });

    describe('Schema Generation', () => {
        it('should generate schema from natural language description', async () => {
            const description = '创建一个用户对象，包含用户名、年龄和邮箱地址';
            const options: SchemaGenerationOptions = {
                title: '用户Schema',
                required: true
            };

            const schema = await jsonSage.generateSchema(description, options);

            expect(schema).toBeDefined();
            expect(schema.title).toBe('用户Schema');
            expect(schema.type).toBe('object');
            expect(schema.properties).toBeDefined();
            expect(schema.properties.username).toBeDefined();
            expect(schema.properties.age).toBeDefined();
            expect(schema.properties.email).toBeDefined();
        });

        it('should handle complex nested objects', async () => {
            const description = '创建一个订单对象，包含订单ID、用户信息（用户名和地址）、商品列表（每个商品有名称和价格）';
            
            const schema = await jsonSage.generateSchema(description);

            expect(schema).toBeDefined();
            expect(schema.type).toBe('object');
            expect(schema.properties.orderId).toBeDefined();
            expect(schema.properties.user).toBeDefined();
            expect(schema.properties.user.type).toBe('object');
            expect(schema.properties.items).toBeDefined();
            expect(schema.properties.items.type).toBe('array');
        });
    });

    describe('Schema Validation', () => {
        it('should validate valid JSON data', async () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                },
                required: ['name']
            };

            const validData = {
                name: '张三',
                age: 25
            };

            const result: ValidationResult = await jsonSage.validateJson(
                JSON.stringify(validData),
                schema
            );

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid JSON data', async () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                },
                required: ['name', 'age']
            };

            const invalidData = {
                name: '张三'
                // 缺少必需的age字段
            };

            const result: ValidationResult = await jsonSage.validateJson(
                JSON.stringify(invalidData),
                schema
            );

            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain('age');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid JSON input', async () => {
            const invalidJson = '{ "name": "张三", }'; // 无效的JSON格式

            await expect(jsonSage.validateJson(invalidJson, {}))
                .rejects
                .toThrow('Invalid JSON');
        });

        it('should handle API errors gracefully', async () => {
            const jsonSageWithInvalidKey = new JsonSageAI({
                deepseekApiKey: 'invalid-key'
            });

            await expect(jsonSageWithInvalidKey.generateSchema('test'))
                .rejects
                .toThrow('API authentication failed');
        });
    });
});
