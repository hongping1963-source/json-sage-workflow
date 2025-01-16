import { JsonSageWorkflow } from '../core/Workflow';

describe('DeepSeek Integration', () => {
    const mockApiKey = 'test_api_key';
    const mockJson = `{
        "name": "张三",
        "age": 25,
        "email": "zhangsan@example.com"
    }`;

    beforeEach(() => {
        process.env.DEEPSEEK_API_KEY = mockApiKey;
    });

    afterEach(() => {
        delete process.env.DEEPSEEK_API_KEY;
        jest.resetAllMocks();
    });

    it('should throw error when DeepSeek is not configured', async () => {
        const workflow = new JsonSageWorkflow();
        await expect(workflow.generateSchema(mockJson))
            .rejects
            .toThrow('DeepSeek service is not configured');
    });

    it('should generate schema with DeepSeek configuration', async () => {
        const workflow = new JsonSageWorkflow({
            deepseek: { apiKey: mockApiKey }
        });

        // Mock the fetch call
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{
                        message: {
                            content: JSON.stringify({
                                $schema: "http://json-schema.org/draft-07/schema#",
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    age: { type: "integer" },
                                    email: { type: "string", format: "email" }
                                },
                                required: ["name", "age", "email"]
                            })
                        }
                    }]
                })
            })
        );

        const schema = await workflow.generateSchema(mockJson, {
            includeDescriptions: true,
            includeExamples: true
        });

        expect(JSON.parse(schema)).toMatchObject({
            $schema: expect.any(String),
            type: "object",
            properties: expect.any(Object),
            required: expect.any(Array)
        });
    });

    it('should use cache when enabled', async () => {
        const workflow = new JsonSageWorkflow({
            deepseek: { apiKey: mockApiKey },
            caching: true
        });

        // Mock the fetch call
        const mockFetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{
                        message: {
                            content: JSON.stringify({ test: true })
                        }
                    }]
                })
            })
        );
        global.fetch = mockFetch;

        // First call should use the API
        await workflow.generateSchema(mockJson);
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Second call should use cache
        await workflow.generateSchema(mockJson);
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
        const workflow = new JsonSageWorkflow({
            deepseek: { apiKey: mockApiKey }
        });

        // Mock API error
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({
                    error: {
                        message: "API rate limit exceeded"
                    }
                })
            })
        );

        await expect(workflow.generateSchema(mockJson))
            .rejects
            .toThrow('API rate limit exceeded');
    });
});
