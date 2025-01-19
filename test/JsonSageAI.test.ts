import { JsonSageAI } from '../src';

// Mock json-sage-workflow
jest.mock('@zhanghongping/json-sage-workflow', () => ({
    json: {
        createWorkflow: jest.fn().mockReturnValue({
            generateSchema: jest.fn().mockResolvedValue({
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
            }),
            deepseek: {
                generateFieldDescriptions: jest.fn().mockResolvedValue({
                    'user.name': '用户姓名',
                    'user.age': '用户年龄'
                }),
                generateExamples: jest.fn().mockResolvedValue({
                    user: {
                        name: '李四',
                        age: 30
                    }
                })
            }
        })
    }
}));

describe('JsonSageAI Unit Tests', () => {
    let ai: JsonSageAI;

    beforeAll(() => {
        ai = JsonSageAI.create({
            deepseekApiKey: 'test-api-key',
            model: 'deepseek-chat',
            temperature: 0.7
        });
    });

    describe('Schema Generation Workflow', () => {
        const testData = {
            user: {
                name: "张三",
                age: 25
            }
        };

        it('should generate schema with mock data', async () => {
            const task = {
                jsonData: testData,
                options: {
                    format: 'draft-07',
                    includeExamples: true,
                    includeDescriptions: true
                }
            };

            const result = await ai.generateSchema(task);

            // 验证结果结构
            expect(result).toHaveProperty('schema');
            expect(result).toHaveProperty('descriptions');
            expect(result).toHaveProperty('examples');
            expect(result).toHaveProperty('metadata');

            // 验证schema
            expect(result.schema).toHaveProperty('type', 'object');
            expect(result.schema.properties).toHaveProperty('user');

            // 验证描述
            expect(result.descriptions).toHaveProperty('user.name', '用户姓名');
            expect(result.descriptions).toHaveProperty('user.age', '用户年龄');

            // 验证示例
            expect(result.examples).toHaveProperty('user');
            expect(result.examples.user).toHaveProperty('name');
            expect(result.examples.user).toHaveProperty('age');

            // 验证元数据
            expect(result.metadata).toHaveProperty('executionTime');
            expect(result.metadata).toHaveProperty('steps');
            expect(result.metadata.steps).toContain('Generating Schema');
        });
    });
});
