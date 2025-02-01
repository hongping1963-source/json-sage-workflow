# JsonSageAI Technical Specification

## 1. Overview

JsonSageAI 是一个智能 JSON Schema 生成工具，它利用 DeepSeek AI 的自然语言处理能力来理解用户需求，并生成符合规范的 JSON Schema。该工具支持中文输入，可以自动识别字段类型、添加验证规则，并提供数据质量分析。

### 1.1 主要特性

- 自然语言理解：支持中文输入，自动识别字段名称和类型
- 智能类型推断：根据字段名称和示例值推断合适的数据类型
- 验证规则生成：自动为常见字段（如邮箱、日期等）添加验证规则
- 数据质量分析：提供数据结构复杂度、命名规范等分析
- 完整的类型定义：使用 TypeScript 确保类型安全

### 1.2 技术栈

- TypeScript 4.x+
- DeepSeek AI API
- JSON Schema Draft-07
- Axios HTTP 客户端

## 2. 系统架构

### 2.1 核心组件

```
json-sage-agent/
├── src/
│   ├── agent/
│   │   ├── JsonSageAI.ts     # 主入口类
│   │   ├── NLUParser.ts      # 自然语言理解
│   │   ├── SchemaAgent.ts    # Schema 生成协调器
│   │   ├── SchemaGenerator.ts # Schema 生成器
│   │   └── JsonAnalyzer.ts   # JSON 分析器
│   ├── core/
│   │   └── DeepSeekAPI.ts    # DeepSeek API 客户端
│   └── types/
│       └── index.ts          # 类型定义
```

### 2.2 数据流

1. 用户输入 → NLUParser（自然语言理解）
2. NLU 结果 → SchemaGenerator（Schema 生成）
3. 原始数据 → JsonAnalyzer（数据分析）
4. 最终处理 → SchemaAgent（结果整合）

## 3. 组件详解

### 3.1 NLUParser

NLUParser 负责理解用户的自然语言输入，使用 DeepSeek AI 进行处理。

```typescript
export class NLUParser {
    private deepseekApi: DeepSeekAPI;

    constructor(apiKey: string) {
        this.deepseekApi = new DeepSeekAPI(apiKey);
    }

    async parse(input: string): Promise<NLUResult> {
        // ... 参见 NLUParser.ts 完整实现
    }
}
```

### 3.2 DeepSeekAPI

DeepSeekAPI 处理与 DeepSeek AI 服务的通信。

```typescript
export class DeepSeekAPI {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.deepseek.com/v1';

    constructor(apiKey: string, config: Partial<DeepSeekConfig> = {}) {
        this.apiKey = apiKey;
        // ... 参见 DeepSeekAPI.ts 完整实现
    }

    async complete(prompt: string): Promise<string> {
        // ... 参见 DeepSeekAPI.ts 完整实现
    }
}
```

### 3.3 SchemaGenerator

SchemaGenerator 负责生成符合 JSON Schema 规范的模式定义。

```typescript
export class SchemaGenerator {
    private readonly commonPatterns = {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        // ... 更多模式定义
    };

    async generate(nluResult: NLUResult): Promise<JSONSchema> {
        // ... 参见 SchemaGenerator.ts 完整实现
    }
}
```

### 3.4 JsonAnalyzer

JsonAnalyzer 提供数据质量分析和洞察。

```typescript
export class JsonAnalyzer {
    async analyze(data: any): Promise<{
        insights: string[];
        metrics: JsonMetrics;
        fields: FieldInfo[];
    }> {
        // ... 参见 JsonAnalyzer.ts 完整实现
    }
}
```

## 4. 使用示例

### 4.1 基本使用

```typescript
import { JsonSageAI } from '@zhanghongping/json-sage-workflow';

const agent = new JsonSageAI({
    deepseekApiKey: 'your-api-key'
});

// 生成 Schema
const result = await agent.generateSchema({
    jsonData: "我需要一个用户对象的JSON Schema，包括姓名、年龄、邮箱和电话",
    options: {
        includeDescriptions: true,
        includeExamples: true
    }
});
```

### 4.2 生成结果示例

```json
{
    "schema": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "title": "用户对象 Schema",
        "description": "用户信息的数据结构定义",
        "properties": {
            "name": {
                "type": "string",
                "description": "用户姓名",
                "minLength": 1
            },
            "age": {
                "type": "integer",
                "description": "用户年龄",
                "minimum": 0,
                "maximum": 150
            },
            "email": {
                "type": "string",
                "description": "用户邮箱",
                "format": "email",
                "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            },
            "phone": {
                "type": "string",
                "description": "用户电话",
                "pattern": "^\\+?[1-9]\\d{1,14}$"
            }
        },
        "required": ["name", "age", "email", "phone"],
        "additionalProperties": false
    },
    "metadata": {
        "executionTime": 234,
        "steps": [
            "Analyzing input data",
            "Processing natural language understanding",
            "Generating JSON Schema",
            "Applying customizations",
            "Validating schema"
        ],
        "insights": [
            "所有必需字段都已定义",
            "字段命名符合规范",
            "已添加适当的数据验证规则"
        ]
    }
}
```

## 5. 配置选项

### 5.1 AgentConfig

```typescript
interface AgentConfig {
    deepseekApiKey: string;     // DeepSeek API 密钥
    model?: string;             // 模型名称
    maxTokens?: number;         // 最大 token 数
    temperature?: number;       // 生成温度
    caching?: boolean;         // 是否启用缓存
}
```

### 5.2 SchemaGenerationOptions

```typescript
interface SchemaGenerationOptions {
    includeDescriptions?: boolean;  // 是否包含字段描述
    includeExamples?: boolean;      // 是否包含示例值
    required?: string[];            // 必需字段列表
    format?: string;                // Schema 格式版本
}
```

## 6. 最佳实践

### 6.1 API 密钥管理

建议使用环境变量管理 API 密钥：

```typescript
const agent = new JsonSageAI({
    deepseekApiKey: process.env.DEEPSEEK_API_KEY
});
```

### 6.2 错误处理

```typescript
try {
    const result = await agent.generateSchema({
        jsonData: userInput,
        options: {
            includeDescriptions: true
        }
    });
} catch (error) {
    console.error('Schema generation failed:', error.message);
    // 处理错误...
}
```

### 6.3 性能优化

- 使用缓存减少 API 调用
- 限制输入数据大小
- 设置合理的 maxTokens 值

## 7. 注意事项

1. DeepSeek API 密钥必须妥善保管
2. 大型数据集可能需要更长处理时间
3. 自定义验证规则应谨慎使用
4. 定期检查和更新依赖包

## 8. 未来规划

1. 支持更多 JSON Schema 版本
2. 添加批量处理能力
3. 改进字段关系识别
4. 支持更多数据格式验证
5. 添加模式版本控制

## 9. 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## 10. 许可证

MIT License

## 多产品支持

### 产品类型系统
JsonSageAI 实现了一个灵活的产品类型系统，支持多种产品类型的并行处理：

1. **类型定义**
   - 使用 `oneOf` 实现产品类型的多态
   - 每种类型有独立的验证规则和必填字段
   - 支持自定义新产品类型

2. **ID 系统**
   - 使用前缀区分产品类型（如 EL、BK、DG）
   - 统一的 ID 格式验证
   - 支持产品间的引用关系

3. **属性管理**
   - 通用属性：ID、名称、价格
   - 类型特有属性：如电子产品的规格、书籍的 ISBN
   - 可扩展的属性系统

### 库存管理
1. **库存跟踪**
   - 精确的库存水平记录
   - 支持预留库存
   - 自动补货提醒

2. **多仓库支持**
   - 灵活的仓库定义
   - 库存分配策略
   - 仓库间调配

### 数据分析
1. **统计功能**
   - 产品类型分布
   - 价格区间分析
   - 库存状态统计

2. **性能优化**
   - 缓存策略
   - 批量处理
   - 增量更新
