import { json } from '../../index';
import { SchemaGenerator } from '../../core/SchemaGenerator';
import { DeepSeekService } from '../../core/DeepSeekService';

describe('DeepSeek AI Edge Cases', () => {
    const mockConfig = {
        apiKey: process.env.JSONSAGE_DEEPSEEK_API_KEY || 'test-api-key'
    };

    describe('Special Data Types', () => {
        let generator: SchemaGenerator;

        beforeEach(() => {
            generator = json.createSchemaGenerator({
                useAI: true,
                deepseek: mockConfig
            });
        });

        it('should handle empty objects and arrays', async () => {
            const testData = {
                emptyObject: {},
                emptyArray: [],
                nullValue: null,
                undefinedValue: undefined
            };

            const schema = await generator.generateSchema(testData);
            const parsedSchema = JSON.parse(schema);

            expect(parsedSchema.properties.emptyObject.type).toBe('object');
            expect(parsedSchema.properties.emptyArray.type).toBe('array');
            expect(parsedSchema.properties.nullValue.type).toBe('null');
            expect(parsedSchema.properties.undefinedValue).toBeUndefined();
        });

        it('should handle special characters in field names', async () => {
            const testData = {
                '@special': 'value',
                'field.with.dots': 123,
                'field-with-dashes': true,
                'field with spaces': 'test',
                '123numeric': 456,
                '$special&chars#': 'test'
            };

            const schema = await generator.generateSchema(testData);
            const parsedSchema = JSON.parse(schema);

            Object.keys(testData).forEach(key => {
                expect(parsedSchema.properties[key]).toBeDefined();
            });
        });

        it('should handle circular references', async () => {
            const circular: any = {
                name: 'test'
            };
            circular.self = circular;

            await expect(generator.generateSchema(circular))
                .rejects.toThrow(/circular/i);
        });

        it('should handle very long field names and values', async () => {
            const longString = 'a'.repeat(1000);
            const testData = {
                [longString]: longString,
                normalField: 'value'
            };

            const schema = await generator.generateSchema(testData);
            const parsedSchema = JSON.parse(schema);

            expect(parsedSchema.properties[longString]).toBeDefined();
            expect(parsedSchema.properties[longString].type).toBe('string');
        });
    });

    describe('Data Format Edge Cases', () => {
        let service: DeepSeekService;

        beforeEach(() => {
            service = new DeepSeekService(mockConfig);
        });

        it('should handle various date formats', async () => {
            const testData = {
                iso: '2025-01-16T14:36:07+08:00',
                shortDate: '2025-01-16',
                timestamp: 1705387767000,
                invalidDate: 'not-a-date'
            };

            const schema = await service.generateSchema(testData);
            const parsedSchema = JSON.parse(schema);

            expect(parsedSchema.properties.iso.format).toBe('date-time');
            expect(parsedSchema.properties.shortDate.format).toBe('date');
            expect(parsedSchema.properties.timestamp.type).toBe('integer');
            expect(parsedSchema.properties.invalidDate.type).toBe('string');
        });

        it('should handle various number formats', async () => {
            const testData = {
                integer: 42,
                float: 3.14,
                scientific: 1.23e-4,
                infinity: Infinity,
                nan: NaN,
                negZero: -0
            };

            const schema = await service.generateSchema(testData);
            const parsedSchema = JSON.parse(schema);

            expect(parsedSchema.properties.integer.type).toBe('integer');
            expect(parsedSchema.properties.float.type).toBe('number');
            expect(parsedSchema.properties.scientific.type).toBe('number');
        });

        it('should handle binary and buffer data', async () => {
            const testData = {
                buffer: Buffer.from('test'),
                base64: 'SGVsbG8gV29ybGQ=',
                binary: '0b1010'
            };

            const schema = await service.generateSchema(testData);
            const parsedSchema = JSON.parse(schema);

            expect(parsedSchema.properties.buffer).toBeDefined();
            expect(parsedSchema.properties.base64.format).toBe('byte');
            expect(parsedSchema.properties.binary.type).toBe('string');
        });
    });

    describe('Error Handling Edge Cases', () => {
        let service: DeepSeekService;

        beforeEach(() => {
            service = new DeepSeekService(mockConfig);
        });

        it('should handle malformed JSON input', async () => {
            const malformedJson = '{name: "test",}';  // 无效的 JSON
            await expect(service.generateSchema(malformedJson))
                .rejects.toThrow(/invalid json/i);
        });

        it('should handle extremely nested structures', async () => {
            let deeplyNested: any = { value: 1 };
            for (let i = 0; i < 100; i++) {
                deeplyNested = { nested: deeplyNested };
            }

            await expect(service.generateSchema(deeplyNested))
                .rejects.toThrow(/maximum depth exceeded/i);
        });

        it('should handle invalid API responses', async () => {
            // 模拟 API 返回无效响应
            const mockData = {
                test: 'data'
            };

            // 注入错误响应
            jest.spyOn(service as any, 'client').mockImplementationOnce(() => ({
                createChatCompletion: async () => ({
                    choices: [{
                        message: {
                            content: 'not a valid schema'
                        }
                    }]
                })
            }));

            await expect(service.generateSchema(mockData))
                .rejects.toThrow(/invalid schema/i);
        });
    });

    describe('Schema Validation Edge Cases', () => {
        let generator: SchemaGenerator;

        beforeEach(() => {
            generator = json.createSchemaGenerator({
                useAI: true,
                deepseek: mockConfig
            });
        });

        it('should handle custom formats', async () => {
            const testData = {
                email: 'test@example.com',
                uri: 'https://example.com',
                uuid: '123e4567-e89b-12d3-a456-426614174000',
                hostname: 'example.com'
            };

            const schema = await generator.generateSchema(testData);
            const parsedSchema = JSON.parse(schema);

            expect(parsedSchema.properties.email.format).toBe('email');
            expect(parsedSchema.properties.uri.format).toBe('uri');
            expect(parsedSchema.properties.uuid.format).toBe('uuid');
            expect(parsedSchema.properties.hostname.format).toBe('hostname');
        });

        it('should handle regex patterns', async () => {
            const testData = {
                phone: '123-456-7890',
                zipCode: '12345',
                custom: 'ABC123'
            };

            const schema = await generator.generateSchema(testData, {
                patterns: {
                    phone: '^\\d{3}-\\d{3}-\\d{4}$',
                    zipCode: '^\\d{5}$',
                    custom: '^[A-Z]{3}\\d{3}$'
                }
            });

            const parsedSchema = JSON.parse(schema);
            expect(parsedSchema.properties.phone.pattern).toBeDefined();
            expect(parsedSchema.properties.zipCode.pattern).toBeDefined();
            expect(parsedSchema.properties.custom.pattern).toBeDefined();
        });
    });
});
