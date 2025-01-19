# JSON Sage AI Agent

这是一个基于 [@zhanghongping/json-sage-workflow](https://www.npmjs.com/package/@zhanghongping/json-sage-workflow) 的AI代理框架，用于自动化执行JSON Schema生成、字段描述生成和示例值生成等任务。

## 特性

- 自动化执行完整的JSON Schema生成工作流
- 智能字段描述生成
- 自动生成示例值
- 可配置的AI参数（temperature、maxTokens等）
- 执行过程追踪和元数据收集
- 缓存支持

## 安装

```bash
npm install json-sage-ai-agent
```

## 快速开始

```typescript
import { JsonSageAgent } from 'json-sage-ai-agent';

// 创建agent实例
const agent = new JsonSageAgent({
    deepseekApiKey: 'your-api-key',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000,
    caching: true
});

// 准备任务
const task = {
    jsonData: {
        name: "John Doe",
        age: 30,
        email: "john@example.com"
    },
    options: {
        format: 'draft-07',
        includeExamples: true,
        includeDescriptions: true
    }
};

// 执行任务
const result = await agent.executeTask(task);
console.log(result);
```

## 配置选项

### AgentConfig

| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|---------|
| deepseekApiKey | string | DeepSeek API密钥 | 必填 |
| model | string | 使用的模型名称 | 'deepseek-chat' |
| maxTokens | number | 最大生成token数 | 2000 |
| temperature | number | AI创造性程度 (0-1) | 0.7 |
| caching | boolean | 是否启用缓存 | true |

### SchemaGenerationTask

| 参数 | 类型 | 描述 |
|------|------|------|
| jsonData | any | 输入的JSON数据 |
| options | object | 生成选项 |

#### options

| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|---------|
| format | string | Schema格式 | 'draft-07' |
| includeExamples | boolean | 是否包含示例值 | true |
| includeDescriptions | boolean | 是否包含字段描述 | true |
| temperature | number | 覆盖默认temperature | - |
| maxTokens | number | 覆盖默认maxTokens | - |

## 执行结果

执行任务后返回的结果包含以下内容：

```typescript
interface AgentResult {
    schema: any;              // 生成的JSON Schema
    descriptions?: Record<string, string>; // 字段描述
    examples?: any;           // 生成的示例值
    metadata?: {
        executionTime: number;  // 执行时间（毫秒）
        steps: string[];        // 执行步骤记录
    };
}
```

## 许可证

MIT
