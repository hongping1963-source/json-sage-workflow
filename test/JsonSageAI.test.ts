import { JsonSageAI } from '../src/agent/JsonSageAI';
import type { Workflow } from '@zhanghongping/json-sage-workflow';
import { json } from '@zhanghongping/json-sage-workflow';

jest.mock('@zhanghongping/json-sage-workflow');

describe('JsonSageAI Integration Tests', () => {
  let ai: JsonSageAI;
  let mockWorkflow: jest.Mocked<Workflow>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock workflow
    mockWorkflow = {
      generateSchema: jest.fn(),
      deepseek: {
        generateFieldDescriptions: jest.fn(),
        generateExamples: jest.fn()
      }
    } as unknown as jest.Mocked<Workflow>;

    (json.createWorkflow as jest.Mock).mockReturnValue(mockWorkflow);

    // Create new instance
    ai = new JsonSageAI({
      deepseekApiKey: 'test-api-key',
      model: 'test-model',
      temperature: 0.7
    });
  });

  describe('generateSchema', () => {
    it('应该生成完整的schema，包含描述和示例', async () => {
      const testData = {
        user: {
          name: "张三",
          age: 25,
          email: "zhangsan@example.com"
        }
      };

      const mockSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
              email: { type: 'string', format: 'email' }
            },
            required: ['name', 'email']
          }
        }
      };

      const mockDescriptions = {
        'user.name': '用户的姓名',
        'user.age': '用户的年龄',
        'user.email': '用户的电子邮件地址'
      };

      const mockExamples = {
        user: {
          name: "李四",
          age: 30,
          email: "lisi@example.com"
        }
      };

      mockWorkflow.generateSchema.mockResolvedValueOnce(mockSchema);
      mockWorkflow.deepseek.generateFieldDescriptions.mockResolvedValueOnce(mockDescriptions);
      mockWorkflow.deepseek.generateExamples.mockResolvedValueOnce(mockExamples);

      const result = await ai.generateSchema({
        jsonData: testData,
        options: {
          includeDescriptions: true,
          includeExamples: true,
          required: true
        }
      });

      expect(result.schema).toEqual(mockSchema);
      expect(result.descriptions).toEqual(mockDescriptions);
      expect(result.examples).toEqual(mockExamples);
      expect(result.metadata.steps).toContain('分析数据结构并生成Schema');
      expect(result.metadata.insights).toHaveLength(3); // 至少应该有3条洞察
    });

    it('当不需要时应该跳过描述生成', async () => {
      const testData = { test: 'data' };
      const mockSchema = {
        type: 'object',
        properties: {
          test: { type: 'string' }
        }
      };

      mockWorkflow.generateSchema.mockResolvedValueOnce(mockSchema);

      const result = await ai.generateSchema({
        jsonData: testData,
        options: {
          includeDescriptions: false,
          includeExamples: false
        }
      });

      expect(result.schema).toEqual(mockSchema);
      expect(result.descriptions).toBeUndefined();
      expect(result.examples).toBeUndefined();
      expect(mockWorkflow.deepseek.generateFieldDescriptions).not.toHaveBeenCalled();
      expect(mockWorkflow.deepseek.generateExamples).not.toHaveBeenCalled();
      expect(result.metadata.insights).toBeDefined();
    });

    it('应该正确处理复杂的嵌套对象', async () => {
      const testData = {
        order: {
          id: "ORD001",
          customer: {
            id: "CUST001",
            details: {
              name: "张三",
              contact: {
                email: "zhangsan@example.com",
                phone: "13800138000"
              }
            }
          },
          items: [
            {
              id: "ITEM001",
              name: "商品1",
              price: 99.99
            }
          ]
        }
      };

      const mockSchema = {
        type: 'object',
        properties: {
          order: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              customer: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  details: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      contact: {
                        type: 'object',
                        properties: {
                          email: { type: 'string', format: 'email' },
                          phone: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    price: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      };

      mockWorkflow.generateSchema.mockResolvedValueOnce(mockSchema);

      const result = await ai.generateSchema({
        jsonData: testData,
        options: {}
      });

      expect(result.schema).toEqual(mockSchema);
      expect(mockWorkflow.generateSchema).toHaveBeenCalledWith(
        testData,
        expect.any(Object)
      );
      expect(result.metadata.insights).toContain('检测到复杂的数据结构，已优化处理策略');
    });

    it('应该正确处理schema生成错误', async () => {
      const testData = { test: 'data' };
      const errorMessage = 'Schema生成失败';

      mockWorkflow.generateSchema.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        ai.generateSchema({
          jsonData: testData,
          options: {}
        })
      ).rejects.toThrow(`Schema生成失败: ${errorMessage}`);
    });

    it('应该正确处理描述生成错误', async () => {
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

      const result = await ai.generateSchema({
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
  });
});
