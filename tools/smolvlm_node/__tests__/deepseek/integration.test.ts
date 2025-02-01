import { json } from '../../index';
import { SchemaGenerator } from '../../core/SchemaGenerator';
import { DeepSeekService } from '../../core/DeepSeekService';

describe('DeepSeek AI Integration', () => {
    const mockConfig = {
        apiKey: process.env.JSONSAGE_DEEPSEEK_API_KEY || 'test-api-key'
    };

    const mockJsonData = {
        user: {
            name: 'John Doe',
            age: 30,
            email: 'john@example.com',
            preferences: {
                theme: 'dark',
                notifications: true
            }
        },
        settings: {
            language: 'en',
            timezone: 'UTC-5'
        }
    };

    describe('End-to-End Schema Generation', () => {
        it('should generate schema with AI when enabled', async () => {
            const workflow = json.createWorkflow({
                schema: {
                    useAI: true,
                    deepseek: mockConfig
                }
            });

            const schema = await workflow.generateSchema(mockJsonData, {
                format: 'draft-07',
                includeExamples: true,
                includeDescriptions: true
            });

            expect(schema).toBeDefined();
            const parsedSchema = JSON.parse(schema);
            expect(parsedSchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
            expect(parsedSchema.properties).toBeDefined();
            expect(parsedSchema.properties.user).toBeDefined();
            expect(parsedSchema.properties.settings).toBeDefined();
        });

        it('should fall back to traditional generation when AI is disabled', async () => {
            const workflow = json.createWorkflow({
                schema: {
                    useAI: false
                }
            });

            const schema = await workflow.generateSchema(mockJsonData);
            
            expect(schema).toBeDefined();
            const parsedSchema = JSON.parse(schema);
            expect(parsedSchema.type).toBe('object');
            expect(parsedSchema.properties).toBeDefined();
        });
    });

    describe('Schema Generator Features', () => {
        let generator: SchemaGenerator;

        beforeEach(() => {
            generator = json.createSchemaGenerator({
                useAI: true,
                deepseek: mockConfig
            });
        });

        it('should generate schema with examples', async () => {
            const schema = await generator.generateSchema(mockJsonData, {
                includeExamples: true
            });

            const parsedSchema = JSON.parse(schema);
            expect(parsedSchema.examples).toBeDefined();
            // 验证示例值的结构
            if (parsedSchema.examples && parsedSchema.examples.length > 0) {
                const example = parsedSchema.examples[0];
                expect(example.user).toBeDefined();
                expect(example.settings).toBeDefined();
            }
        });

        it('should generate schema with descriptions', async () => {
            const schema = await generator.generateSchema(mockJsonData, {
                includeDescriptions: true
            });

            const parsedSchema = JSON.parse(schema);
            // 验证描述字段
            expect(parsedSchema.properties.user.description).toBeDefined();
            expect(parsedSchema.properties.settings.description).toBeDefined();
        });

        it('should handle complex nested objects', async () => {
            const complexData = {
                data: {
                    items: [
                        { id: 1, value: 'test' },
                        { id: 2, value: 'test2' }
                    ],
                    metadata: {
                        created: '2025-01-16T14:34:08+08:00',
                        tags: ['tag1', 'tag2']
                    }
                }
            };

            const schema = await generator.generateSchema(complexData);
            const parsedSchema = JSON.parse(schema);
            
            expect(parsedSchema.properties.data).toBeDefined();
            expect(parsedSchema.properties.data.properties.items).toBeDefined();
            expect(parsedSchema.properties.data.properties.metadata).toBeDefined();
        });
    });

    describe('DeepSeek Service Integration', () => {
        let service: DeepSeekService;

        beforeEach(() => {
            service = new DeepSeekService(mockConfig);
        });

        it('should generate field descriptions', async () => {
            const descriptions = await service.generateFieldDescriptions(mockJsonData);
            expect(descriptions).toBeDefined();
            expect(descriptions['user.name']).toBeDefined();
            expect(descriptions['user.email']).toBeDefined();
        });

        it('should generate examples', async () => {
            const schema = await service.generateSchema(mockJsonData);
            const examples = await service.generateExamples(schema);
            
            expect(examples).toBeDefined();
            expect(examples.user).toBeDefined();
            expect(examples.settings).toBeDefined();
        });

        it('should handle errors gracefully', async () => {
            const invalidJson = '{invalid json}';
            await expect(service.generateSchema(invalidJson))
                .rejects.toThrow();
        });
    });

    describe('Caching Behavior', () => {
        it('should cache schema generation results', async () => {
            const generator = json.createSchemaGenerator({
                useAI: true,
                deepseek: mockConfig,
                caching: true
            });

            // 第一次生成
            const schema1 = await generator.generateSchema(mockJsonData);
            
            // 第二次生成（应该使用缓存）
            const schema2 = await generator.generateSchema(mockJsonData);

            expect(schema1).toBe(schema2);
        });

        it('should respect cache settings', async () => {
            const generator = json.createSchemaGenerator({
                useAI: true,
                deepseek: mockConfig,
                caching: false
            });

            // 禁用缓存时，每次生成的 Schema 可能略有不同
            const schema1 = await generator.generateSchema(mockJsonData);
            const schema2 = await generator.generateSchema(mockJsonData);

            // 由于 AI 生成的内容可能略有差异，我们只比较基本结构
            const parsed1 = JSON.parse(schema1);
            const parsed2 = JSON.parse(schema2);
            expect(parsed1.$schema).toBe(parsed2.$schema);
            expect(Object.keys(parsed1.properties)).toEqual(
                Object.keys(parsed2.properties)
            );
        });
    });
});
