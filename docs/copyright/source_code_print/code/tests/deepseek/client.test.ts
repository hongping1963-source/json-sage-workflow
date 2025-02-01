/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { DeepSeekChat } from 'deepseek-chat';
import { enhanceSchemaWithAI } from '../../packages/core/src/utils';
import { JsonSchema, JsonSageAIConfig } from '../../packages/core/src/types';

jest.mock('deepseek-chat');

describe('DeepSeek Client Tests', () => {
    let mockDeepSeekChat: jest.Mocked<typeof DeepSeekChat>;
    
    beforeEach(() => {
        mockDeepSeekChat = DeepSeekChat as jest.Mocked<typeof DeepSeekChat>;
        jest.clearAllMocks();
    });

    describe('Schema Enhancement', () => {
        it('should enhance schema with AI suggestions', async () => {
            const mockResponse = {
                choices: [{
                    text: JSON.stringify({
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'User full name',
                                minLength: 2
                            }
                        }
                    })
                }]
            };

            mockDeepSeekChat.prototype.complete.mockResolvedValue(mockResponse);

            const originalSchema: JsonSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                }
            };

            const config: JsonSageAIConfig = {
                deepseekApiKey: 'test-key',
                model: 'test-model'
            };

            const enhancedSchema = await enhanceSchemaWithAI(
                originalSchema,
                'A user object with name',
                config
            );

            expect(enhancedSchema.properties.name.description).toBe('User full name');
            expect(enhancedSchema.properties.name.minLength).toBe(2);
        });

        it('should handle API errors gracefully', async () => {
            mockDeepSeekChat.prototype.complete.mockRejectedValue(
                new Error('API Error')
            );

            const schema: JsonSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                }
            };

            const config: JsonSageAIConfig = {
                deepseekApiKey: 'invalid-key'
            };

            const result = await enhanceSchemaWithAI(schema, 'test', config);
            expect(result).toEqual(schema); // 应返回原始schema
        });
    });

    describe('Response Processing', () => {
        it('should handle invalid AI responses', async () => {
            const mockResponse = {
                choices: [{
                    text: 'Invalid JSON'
                }]
            };

            mockDeepSeekChat.prototype.complete.mockResolvedValue(mockResponse);

            const schema: JsonSchema = {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                }
            };

            const config: JsonSageAIConfig = {
                deepseekApiKey: 'test-key'
            };

            const result = await enhanceSchemaWithAI(schema, 'test', config);
            expect(result).toEqual(schema); // 应返回原始schema
        });

        it('should respect rate limits', async () => {
            const mockComplete = jest.fn()
                .mockRejectedValueOnce(new Error('Rate limit exceeded'))
                .mockResolvedValueOnce({
                    choices: [{
                        text: JSON.stringify({ type: 'object' })
                    }]
                });

            mockDeepSeekChat.prototype.complete = mockComplete;

            const schema: JsonSchema = {
                type: 'object',
                properties: {}
            };

            const config: JsonSageAIConfig = {
                deepseekApiKey: 'test-key'
            };

            const result = await enhanceSchemaWithAI(schema, 'test', config);
            expect(mockComplete).toHaveBeenCalledTimes(2);
            expect(result).toBeDefined();
        });
    });

    describe('Error Recovery', () => {
        it('should retry on network errors', async () => {
            const mockComplete = jest.fn()
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    choices: [{
                        text: JSON.stringify({ type: 'object' })
                    }]
                });

            mockDeepSeekChat.prototype.complete = mockComplete;

            const schema: JsonSchema = {
                type: 'object',
                properties: {}
            };

            const config: JsonSageAIConfig = {
                deepseekApiKey: 'test-key'
            };

            const result = await enhanceSchemaWithAI(schema, 'test', config);
            expect(mockComplete).toHaveBeenCalledTimes(2);
            expect(result).toBeDefined();
        });
    });
});
