import { SchemaAgent } from '../src/agent/SchemaAgent';

const mockGenerateSchema = jest.fn().mockResolvedValue({
    type: 'object',
    properties: {
        user: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                age: { type: 'number' }
            }
        }
    }
});

jest.mock('@zhanghongping/json-sage-workflow', () => ({
    json: {
        createWorkflow: () => ({
            generateSchema: mockGenerateSchema
        })
    }
}));

describe('SchemaAgent', () => {
    let agent: SchemaAgent;

    beforeEach(() => {
        agent = new SchemaAgent({
            deepseekApiKey: 'test-key',
            model: 'test-model'
        });
        mockGenerateSchema.mockClear();
    });

    it('should generate schema successfully', async () => {
        const testData = {
            user: {
                name: '张三',
                age: 25
            }
        };

        const result = await agent.generateSchema({
            jsonData: testData,
            options: {}
        });

        expect(mockGenerateSchema).toHaveBeenCalledWith(
            testData,
            expect.any(Object)
        );

        expect(result.schema).toEqual({
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'number' }
                    }
                }
            }
        });
    });

    it('should handle errors', async () => {
        mockGenerateSchema.mockRejectedValueOnce(new Error('Test error'));

        await expect(
            agent.generateSchema({
                jsonData: {},
                options: {}
            })
        ).rejects.toThrow('Schema generation failed: Test error');
    });
});
