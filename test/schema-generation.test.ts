import { JsonSageAI } from '../src/agent/JsonSageAI';
import { NLUParser } from '../src/agent/NLUParser';
import { SchemaGenerator } from '../src/agent/SchemaGenerator';
import { AgentConfig, SchemaGenerationTask, NLUResult } from '../src/types';

describe('Product Schema Generation', () => {
    let agent: JsonSageAI;
    let nluParser: NLUParser;
    let schemaGenerator: SchemaGenerator;

    beforeEach(() => {
        const config: AgentConfig = {
            deepseekApiKey: 'test-key',
            model: 'test-model',
            maxTokens: 2000,
            temperature: 0.7
        };
        agent = new JsonSageAI(config);
        nluParser = new NLUParser();
        schemaGenerator = new SchemaGenerator();
    });

    test('should generate product schema with name, price, and description', async () => {
        // 1. 测试用户输入
        const userInput = "为一个产品对象生成JSON Schema，包括名称、价格和描述。";

        // 2. 测试NLU解析
        const startTime = performance.now();
        const nluResult = await nluParser.parse(userInput);
        const nluTime = performance.now() - startTime;

        // 验证NLU解析结果
        expect(nluResult).toEqual({
            intent: "generate_schema",
            entity: "product",
            fields: [
                {
                    name: "名称",
                    type: "string"
                },
                {
                    name: "价格",
                    type: "number"
                },
                {
                    name: "描述",
                    type: "string"
                }
            ]
        } as NLUResult);

        // 验证NLU解析时间
        expect(nluTime).toBeLessThan(200); // 应小于200ms

        // 3. 测试Schema生成
        const task: SchemaGenerationTask = {
            jsonData: {
                name: "智能手表",
                price: 1299.99,
                description: "一款功能强大的智能手表，支持心率监测和运动追踪"
            },
            options: {
                includeDescriptions: true,
                includeExamples: true
            }
        };

        const schemaStartTime = performance.now();
        const result = await agent.generateSchema(task);
        const schemaTime = performance.now() - schemaStartTime;

        // 验证生成的Schema
        expect(result.schema).toEqual({
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            title: "产品对象",
            description: "描述产品的基本信息",
            properties: {
                name: {
                    type: "string",
                    description: "产品名称",
                    minLength: 1
                },
                price: {
                    type: "number",
                    description: "产品价格",
                    minimum: 0
                },
                description: {
                    type: "string",
                    description: "产品描述",
                    minLength: 1
                }
            },
            required: ["name", "price", "description"]
        });

        // 验证Schema生成时间
        expect(schemaTime).toBeLessThan(400); // 应小于400ms

        // 验证生成的描述
        expect(result.descriptions).toBeDefined();
        expect(Object.keys(result.descriptions!)).toHaveLength(3);

        // 验证生成的示例
        expect(result.examples).toBeDefined();
        expect(result.examples).toHaveProperty('name');
        expect(result.examples).toHaveProperty('price');
        expect(result.examples).toHaveProperty('description');

        // 验证元数据
        expect(result.metadata.steps).toContain('分析数据结构并生成Schema');
        expect(result.metadata.insights).toContain('Schema生成成功，结构完整');
        expect(result.metadata.executionTime).toBeLessThan(1000);
    });

    test('should handle schema generation errors', async () => {
        const testData = { test: 'data' };
        const errorMessage = 'Schema生成失败';

        mockWorkflow.generateSchema.mockRejectedValueOnce(new Error(errorMessage));

        await expect(
            agent.generateSchema({
                jsonData: testData,
                options: {}
            })
        ).rejects.toThrow(`Schema生成失败: ${errorMessage}`);
    });

    test('should handle description generation errors', async () => {
        const testData = { test: 'data' };
        const mockSchema = {
            type: 'object',
            properties: {
                test: { type: 'string' }
            }
        };
        const errorMessage = '描述生成失败';

        mockWorkflow.generateSchema.mockResolvedValueOnce(mockSchema);
        mockWorkflow.deepseek.generateFieldDescriptions.mockRejectedValueOnce(
            new Error(errorMessage)
        );

        const result = await agent.generateSchema({
            jsonData: testData,
            options: {
                includeDescriptions: true,
                includeExamples: false
            }
        });

        expect(result.schema).toEqual(mockSchema);
        expect(result.descriptions).toBeUndefined();
        expect(result.metadata.errors).toContain(`描述生成失败: ${errorMessage}`);
        expect(result.metadata.insights).toContain('字段描述生成过程中遇到问题，建议检查数据结构');
    });

    test('should validate product data correctly', () => {
        const schema = {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            properties: {
                name: {
                    type: "string",
                    minLength: 1
                },
                price: {
                    type: "number",
                    minimum: 0
                },
                description: {
                    type: "string",
                    minLength: 1
                }
            },
            required: ["name", "price", "description"]
        };

        // 测试有效数据
        const validProduct = {
            name: "智能手表",
            price: 1299.99,
            description: "一款功能强大的智能手表"
        };
        expect(agent.validateSchema(schema, validProduct).valid).toBe(true);

        // 测试无效价格
        const invalidPrice = {
            name: "智能手表",
            price: -1,
            description: "一款功能强大的智能手表"
        };
        expect(agent.validateSchema(schema, invalidPrice).valid).toBe(false);

        // 测试空名称
        const emptyName = {
            name: "",
            price: 1299.99,
            description: "一款功能强大的智能手表"
        };
        expect(agent.validateSchema(schema, emptyName).valid).toBe(false);
    });

    test('should handle error cases gracefully', async () => {
        // 测试空输入
        await expect(nluParser.parse("")).rejects.toThrow();

        // 测试无效输入
        await expect(nluParser.parse("这是一个无效的输入")).rejects.toThrow();

        // 测试缺失字段
        const task: SchemaGenerationTask = {
            jsonData: {
                name: "智能手表"
                // 缺少价格和描述
            },
            options: {}
        };
        const result = await agent.generateSchema(task);
        expect(result.success).toBe(false);
    });
});
