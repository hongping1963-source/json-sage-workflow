# JsonSage

<<<<<<< HEAD
[![Build Status](https://img.shields.io/github/workflow/status/hongping1963-source/json-sage-workflow/CI)](https://github.com/hongping1963-source/json-sage-workflow/actions)
[![Test Coverage](https://img.shields.io/codecov/c/github/hongping1963-source/json-sage-workflow)](https://codecov.io/gh/hongping1963-source/json-sage-workflow)
[![npm](https://img.shields.io/npm/v/json-sage-workflow)](https://www.npmjs.com/package/json-sage-workflow)
[![License](https://img.shields.io/npm/l/json-sage-workflow)](https://github.com/hongping1963-source/json-sage-workflow/blob/main/LICENSE)

JsonSage is an intelligent JSON processing library that automatically optimizes performance and enhances developer productivity through AI-powered features.

## Features

- **Generates TypeScript types** from JSON data
- **Detects project type and framework**
- **Optimizes JSON parsing performance**
- **Watches JSON files and updates types**
- **Tracks performance and provides insights**
- **AI-Powered Type Inference**: Uses AI to intelligently infer data types and schema from natural language descriptions
=======
JsonSage is an intelligent JSON processing library that automatically optimizes performance and generates TypeScript types. It's designed to work out of the box with zero configuration required.

## Features

- 🚀 **Zero Configuration**: Works automatically after installation
- 📝 **Automatic Type Generation**: Generates TypeScript types from your JSON data
- 🔍 **Project Analysis**: Detects your project type and framework
- ⚡ **Performance Optimization**: Automatically optimizes JSON parsing based on your usage patterns
- 🔄 **File Watching**: Monitors JSON files and updates types automatically
- 📊 **Performance Monitoring**: Tracks performance metrics and provides insights
>>>>>>> 02c7019c5f97880f57706639272b6ab2052161f7

## Installation

```bash
<<<<<<< HEAD
npm install json-sage-workflow
=======
npm install jsonsage
>>>>>>> 02c7019c5f97880f57706639272b6ab2052161f7
```

## Quick Start

```typescript
<<<<<<< HEAD
import { JsonSage } from 'json-sage-workflow';

// Initialize JsonSage
const sage = new JsonSage();

// Process JSON data
const result = await sage.process(jsonData);
```

## Documentation

For detailed documentation, visit our [GitHub Wiki](https://github.com/hongping1963-source/json-sage-workflow/wiki).

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

MIT © hongping1963-source
=======
import { json } from 'jsonsage';

// Simple usage - everything is automatic!
const data = json.parse(rawJsonString);
const jsonString = json.stringify(data);

// Check performance
const report = await json.getPerformanceReport();
console.log(report);
```

## Advanced Usage

### Custom Workflow

```typescript
import { JsonSageWorkflow } from 'jsonsage';

const workflow = new JsonSageWorkflow({
    watch: true,
    autoProcess: true,
    generateTypes: true,
    autoOptimize: true
});

// Use the workflow instance
const data = workflow.parse(rawJsonString);
```

### Performance Monitoring

```typescript
// Get detailed performance metrics
const report = await json.getPerformanceReport();
console.log(report);
// Output:
// {
//   averageParseTime: 0.123,
//   averageStringifyTime: 0.456,
//   cacheHitRate: 0.789,
//   totalOperations: 1000
// }
```

## Features in Detail

### Automatic Type Generation

JsonSage automatically generates TypeScript types for your JSON data:

```typescript
// Original JSON
const data = {
    user: {
        name: "John",
        age: 30
    }
};

// Automatically generated type
interface GeneratedType {
    user: {
        name: string;
        age: number;
    };
}
```

### Project Analysis

JsonSage analyzes your project to provide optimal configurations:

- Detects project type (frontend/backend/fullstack)
- Identifies frameworks (React, Vue, Express, etc.)
- Configures optimal performance settings

### Performance Optimization

- Intelligent caching
- Automatic memory management
- Framework-specific optimizations

## DeepSeek AI 功能

JsonSage 现在集成了 DeepSeek AI 功能，可以智能地生成 JSON Schema。

### 基本用法

```typescript
import { json } from '@zhanghongping/json-sage-workflow';

// 设置 DeepSeek API 密钥（也可以通过环境变量 DEEPSEEK_API_KEY 设置）
process.env.DEEPSEEK_API_KEY = 'your_api_key';

// 生成 Schema
const myJson = `{
  "name": "张三",
  "age": 25,
  "email": "zhangsan@example.com"
}`;

const schema = await json.generateSchema(myJson, {
  includeDescriptions: true,
  includeExamples: true,
  format: 'json-schema-draft-07'
});

console.log(schema);
```

### 高级用法

```typescript
import { JsonSageWorkflow, DeepSeekConfig } from '@zhanghongping/json-sage-workflow';

// DeepSeek 配置
const deepseekConfig: DeepSeekConfig = {
  apiKey: 'your_api_key',
  apiBaseUrl: 'https://api.deepseek.com/v1', // 可选
  model: 'deepseek-chat',                    // 可选
  temperature: 0.3,                          // 可选
  maxTokens: 4000                            // 可选
};

// 创建工作流实例
const workflow = new JsonSageWorkflow({
  deepseek: deepseekConfig,
  caching: true,  // 启用缓存以提高性能
});

// 生成 Schema
const schema = await workflow.generateSchema(myJson, {
  includeDescriptions: true,
  includeExamples: true,
  format: 'json-schema-draft-07'
});
```

### Schema 生成选项

- `includeDescriptions`: 是否包含字段描述（默认：false）
- `includeExamples`: 是否包含示例值（默认：false）
- `format`: Schema 格式，支持 'json-schema-draft-07' 或 'json-schema-draft-04'（默认：'json-schema-draft-07'）

## Configuration

While JsonSage works out of the box, you can customize its behavior:

```typescript
import { JsonSageWorkflow } from 'jsonsage';

const workflow = new JsonSageWorkflow({
    watch: true, // Enable file watching
    autoProcess: true, // Enable automatic processing
    generateTypes: true, // Enable type generation
    autoOptimize: true // Enable performance optimization
});
```

## Performance

JsonSage includes several performance optimizations:

- Intelligent caching
- Memory optimization
- Framework-specific optimizations
- Automatic performance monitoring

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT

# JSON Sage Workflow

智能的 JSON 处理工作流系统，提供自动化监控、验证和转换功能。集成了 DeepSeek AI，支持智能 Schema 生成、字段描述和示例值生成。

## 特性

- 🤖 DeepSeek AI 驱动的智能功能
  - 自动生成精确的 JSON Schema
  - 智能生成字段描述
  - 生成符合规范的示例值
  - 支持多种 Schema 格式
- 🔄 自动监控 JSON 文件变化
- 📝 TypeScript 类型定义生成
- ⚡ 性能优化的缓存支持
- ⚙️ 灵活的配置选项

## 安装

```bash
npm install @zhanghongping/json-sage-workflow
```

## DeepSeek AI 功能

### 1. 配置 DeepSeek

在使用 AI 功能之前，需要配置 DeepSeek API 密钥。有多种配置方式：

#### 方式 1：环境变量

创建 `.env` 文件：

```env
JSONSAGE_DEEPSEEK_API_KEY=your-api-key-here
JSONSAGE_DEEPSEEK_MODEL=deepseek-chat
JSONSAGE_DEEPSEEK_MAX_TOKENS=2000
JSONSAGE_DEEPSEEK_TEMPERATURE=0.7
```

#### 方式 2：配置文件

创建 `jsonsage.config.json` 文件：

```json
{
    "deepseek": {
        "apiKey": "your-api-key-here",
        "model": "deepseek-chat",
        "maxTokens": 2000,
        "temperature": 0.7
    }
}
```

#### 方式 3：代码配置

```typescript
import { json } from '@zhanghongping/json-sage-workflow';

const workflow = json.createWorkflow({
    schema: {
        useAI: true,
        deepseek: {
            apiKey: 'your-api-key',
            model: 'deepseek-chat'
        }
    }
});
```

### 2. 使用 AI 生成 Schema

#### 基本使用

```typescript
import { json } from '@zhanghongping/json-sage-workflow';

const workflow = json.createWorkflow({
    schema: {
        useAI: true,
        deepseek: {
            apiKey: 'your-api-key'
        }
    }
});

const jsonData = {
    name: "John Doe",
    age: 30,
    email: "john@example.com"
};

const schema = await workflow.generateSchema(jsonData);
```

#### 高级选项

```typescript
const schema = await workflow.generateSchema(jsonData, {
    format: 'draft-07',        // Schema 格式
    includeExamples: true,     // 包含示例值
    includeDescriptions: true, // 包含字段描述
    temperature: 0.7,         // AI 创造性程度 (0-1)
    maxTokens: 2000           // 最大生成长度
});
```

### 3. 字段描述生成

```typescript
const generator = json.createSchemaGenerator({
    useAI: true,
    deepseek: {
        apiKey: 'your-api-key'
    }
});

// 生成字段描述
const descriptions = await generator.deepseek.generateFieldDescriptions(jsonData);
console.log(descriptions);
// 输出示例：
// {
//   "name": "用户的全名",
//   "age": "用户的年龄，以年为单位",
//   "email": "用户的电子邮件地址"
// }
```

### 4. 示例值生成

```typescript
// 基于现有 Schema 生成示例值
const examples = await generator.deepseek.generateExamples(schema);
console.log(examples);
// 输出示例：
// {
//   "name": "Jane Smith",
//   "age": 25,
//   "email": "jane.smith@example.com"
// }
```

### 5. 完整工作流示例

```typescript
import { json } from '@zhanghongping/json-sage-workflow';

async function processJSON() {
    // 创建工作流
    const workflow = json.createWorkflow({
        schema: {
            useAI: true,
            deepseek: {
                apiKey: process.env.JSONSAGE_DEEPSEEK_API_KEY,
                model: 'deepseek-chat'
            },
            caching: true // 启用缓存
        }
    });

    const jsonData = {
        user: {
            name: "John Doe",
            age: 30,
            email: "john@example.com",
            preferences: {
                theme: "dark",
                notifications: true
            }
        },
        settings: {
            language: "en",
            timezone: "UTC-5"
        }
    };

    try {
        // 1. 生成 Schema
        const schema = await workflow.generateSchema(jsonData, {
            format: 'draft-07',
            includeExamples: true,
            includeDescriptions: true
        });

        // 2. 生成字段描述
        const descriptions = await workflow.deepseek.generateFieldDescriptions(jsonData);

        // 3. 生成示例值
        const examples = await workflow.deepseek.generateExamples(schema);

        return {
            schema,
            descriptions,
            examples
        };
    } catch (error) {
        console.error('处理失败:', error.message);
    }
}
```

## API 文档

### SchemaGenerationOptions

生成 Schema 时的选项：

```typescript
interface SchemaGenerationOptions {
    format?: 'draft-07' | 'draft-06' | 'draft-04'; // Schema 格式
    includeExamples?: boolean;     // 是否包含示例值
    includeDescriptions?: boolean; // 是否包含字段描述
    temperature?: number;         // AI 温度 (0-1)
    maxTokens?: number;          // 最大生成长度
}
```

### DeepSeekConfig

DeepSeek AI 配置选项：

```typescript
interface DeepSeekConfig {
    apiKey?: string;        // API 密钥
    apiBaseUrl?: string;    // API 基础 URL
    model?: string;         // 模型名称
    maxTokens?: number;     // 默认最大生成长度
    temperature?: number;   // 默认温度值
}
```

## 最佳实践

1. **API 密钥安全**
   - 使用环境变量存储 API 密钥
   - 不要在代码中硬编码密钥
   - 将配置文件添加到 .gitignore

2. **性能优化**
   - 启用缓存减少 API 调用
   - 适当设置 maxTokens 值
   - 根据需要调整 temperature 值

3. **错误处理**
   - 始终使用 try-catch 包装 API 调用
   - 实现适当的重试机制
   - 记录详细的错误信息

## 常见问题

### Q: 如何选择合适的 temperature 值？
A: temperature 值控制 AI 输出的创造性：
- 0.0-0.3：更确定性的输出，适合严格的 Schema
- 0.4-0.7：平衡的输出，推荐用于大多数场景
- 0.8-1.0：更创造性的输出，适合生成示例值

### Q: 缓存如何工作？
A: 缓存基于输入 JSON 的哈希值，可以通过配置设置缓存时间（TTL）。启用缓存可以显著减少 API 调用次数。

### Q: 如何处理大型 JSON？
A: 对于大型 JSON：
1. 增加 maxTokens 值
2. 使用分段处理
3. 启用缓存减少重复处理

## 许可证

MIT
>>>>>>> 02c7019c5f97880f57706639272b6ab2052161f7
