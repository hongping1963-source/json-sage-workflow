import { SchemaService } from '../../core/deepseek/SchemaService';
import { DeepSeekClient } from '../../core/deepseek/DeepSeekClient';

jest.mock('../../core/deepseek/DeepSeekClient');

describe('SchemaService', () => {
    const mockConfig = {
        apiKey: 'test-api-key',
        model: 'test-model'
    };

    const mockJsonData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
    };

    const mockSchemaResponse = {
        id: 'test-id',
        choices: [{
            message: {
                content: JSON.stringify({
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'integer' },
                        email: { type: 'string', format: 'email' }
                    }
                })
            }
        }]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (DeepSeekClient as jest.Mock).mockClear();
    });

    describe('generateSchema', () => {
        it('should generate schema successfully', async () => {
            const mockCreateChatCompletion = jest.fn().mockResolvedValue(mockSchemaResponse);
            (DeepSeekClient as jest.Mock).mockImplementation(() => ({
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new SchemaService(mockConfig);
            const schema = await service.generateSchema(mockJsonData);

            expect(schema).toBeDefined();
            const parsedSchema = JSON.parse(schema);
            expect(parsedSchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
            expect(parsedSchema.properties).toBeDefined();
            expect(mockCreateChatCompletion).toHaveBeenCalled();
        });

        it('should handle invalid JSON response', async () => {
            const mockCreateChatCompletion = jest.fn().mockResolvedValue({
                choices: [{
                    message: {
                        content: 'invalid json'
                    }
                }]
            });
            (DeepSeekClient as jest.Mock).mockImplementation(() => ({
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new SchemaService(mockConfig);
            await expect(service.generateSchema(mockJsonData))
                .rejects.toThrow('Generated schema is not valid JSON');
        });

        it('should handle empty response', async () => {
            const mockCreateChatCompletion = jest.fn().mockResolvedValue({
                choices: []
            });
            (DeepSeekClient as jest.Mock).mockImplementation(() => ({
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new SchemaService(mockConfig);
            await expect(service.generateSchema(mockJsonData))
                .rejects.toThrow('Failed to generate schema: Empty response from API');
        });

        it('should pass correct options to API', async () => {
            const mockCreateChatCompletion = jest.fn().mockResolvedValue(mockSchemaResponse);
            (DeepSeekClient as jest.Mock).mockImplementation(() => ({
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new SchemaService(mockConfig);
            await service.generateSchema(mockJsonData, {
                format: 'draft-07',
                temperature: 0.5,
                maxTokens: 1000
            });

            expect(mockCreateChatCompletion).toHaveBeenCalledWith(
                expect.objectContaining({
                    temperature: 0.5,
                    max_tokens: 1000
                })
            );
        });
    });

    describe('generateFieldDescriptions', () => {
        const mockDescriptionsResponse = {
            choices: [{
                message: {
                    content: JSON.stringify({
                        name: 'Full name of the user',
                        age: 'Age in years',
                        email: 'Email address for contact'
                    })
                }
            }]
        };

        it('should generate field descriptions successfully', async () => {
            const mockCreateChatCompletion = jest.fn().mockResolvedValue(mockDescriptionsResponse);
            (DeepSeekClient as jest.Mock).mockImplementation(() => ({
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new SchemaService(mockConfig);
            const descriptions = await service.generateFieldDescriptions(mockJsonData);

            expect(descriptions).toBeDefined();
            expect(descriptions.name).toBe('Full name of the user');
            expect(descriptions.age).toBe('Age in years');
            expect(descriptions.email).toBe('Email address for contact');
        });

        it('should handle invalid descriptions response', async () => {
            const mockCreateChatCompletion = jest.fn().mockResolvedValue({
                choices: [{
                    message: {
                        content: 'invalid json'
                    }
                }]
            });
            (DeepSeekClient as jest.Mock).mockImplementation(() => ({
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new SchemaService(mockConfig);
            await expect(service.generateFieldDescriptions(mockJsonData))
                .rejects.toThrow('Generated descriptions are not valid JSON');
        });
    });

    describe('generateExamples', () => {
        const mockSchema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                age: { type: 'integer' },
                email: { type: 'string', format: 'email' }
            }
        };

        const mockExamplesResponse = {
            choices: [{
                message: {
                    content: JSON.stringify({
                        name: 'Jane Smith',
                        age: 25,
                        email: 'jane@example.com'
                    })
                }
            }]
        };

        it('should generate examples successfully', async () => {
            const mockCreateChatCompletion = jest.fn().mockResolvedValue(mockExamplesResponse);
            (DeepSeekClient as jest.Mock).mockImplementation(() => ({
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new SchemaService(mockConfig);
            const examples = await service.generateExamples(mockSchema);

            expect(examples).toBeDefined();
            expect(examples.name).toBe('Jane Smith');
            expect(examples.age).toBe(25);
            expect(examples.email).toBe('jane@example.com');
        });

        it('should handle invalid examples response', async () => {
            const mockCreateChatCompletion = jest.fn().mockResolvedValue({
                choices: [{
                    message: {
                        content: 'invalid json'
                    }
                }]
            });
            (DeepSeekClient as jest.Mock).mockImplementation(() => ({
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new SchemaService(mockConfig);
            await expect(service.generateExamples(mockSchema))
                .rejects.toThrow('Generated examples are not valid JSON');
        });
    });
});
