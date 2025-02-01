/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { validateSchema } from '../packages/core/src/utils';
import { ValidationResult } from '../packages/core/src/types';

describe('Schema Validator Tests', () => {
    describe('Basic Schema Validation', () => {
        it('should validate a simple schema', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                }
            };

            const result: ValidationResult = validateSchema(JSON.stringify(schema));
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject invalid schema', () => {
            const invalidSchema = {
                type: 'invalid-type',
                properties: {
                    name: { type: 'string' }
                }
            };

            const result: ValidationResult = validateSchema(JSON.stringify(invalidSchema));
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
        });
    });

    describe('Complex Schema Validation', () => {
        it('should validate nested objects', () => {
            const schema = {
                type: 'object',
                properties: {
                    user: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            address: {
                                type: 'object',
                                properties: {
                                    street: { type: 'string' },
                                    city: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            };

            const result: ValidationResult = validateSchema(JSON.stringify(schema));
            expect(result.valid).toBe(true);
        });

        it('should validate array definitions', () => {
            const schema = {
                type: 'object',
                properties: {
                    tags: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                }
            };

            const result: ValidationResult = validateSchema(JSON.stringify(schema));
            expect(result.valid).toBe(true);
        });
    });

    describe('Error Cases', () => {
        it('should handle malformed JSON', () => {
            const malformedJson = '{ "type": "object", }';
            const result: ValidationResult = validateSchema(malformedJson);
            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('JSON');
        });

        it('should detect missing required fields', () => {
            const schema = {
                type: 'object',
                required: ['name'],
                properties: {}  // 缺少必需的name属性定义
            };

            const result: ValidationResult = validateSchema(JSON.stringify(schema));
            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('required');
        });
    });

    describe('Performance Tests', () => {
        it('should handle large schemas efficiently', () => {
            const largeSchema = {
                type: 'object',
                properties: {}
            };

            // 生成一个包含100个属性的大型schema
            for (let i = 0; i < 100; i++) {
                largeSchema.properties[`field${i}`] = {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        value: { type: 'number' }
                    }
                };
            }

            const startTime = Date.now();
            const result: ValidationResult = validateSchema(JSON.stringify(largeSchema));
            const endTime = Date.now();

            expect(result.valid).toBe(true);
            expect(endTime - startTime).toBeLessThan(1000); // 验证应在1秒内完成
        });
    });
});
