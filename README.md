# JsonSage

JsonSage is an intelligent JSON processing library that automatically optimizes performance and generates TypeScript types. It's designed to work out of the box with zero configuration required.

## Features

- 🚀 **Zero Configuration**: Works automatically after installation
- 📝 **Automatic Type Generation**: Generates TypeScript types from your JSON data
- 🔍 **Project Analysis**: Detects your project type and framework
- ⚡ **Performance Optimization**: Automatically optimizes JSON parsing based on your usage patterns
- 🔄 **File Watching**: Monitors JSON files and updates types automatically
- 📊 **Performance Monitoring**: Tracks performance metrics and provides insights

## Installation

```bash
npm install jsonsage
```

## Quick Start

```typescript
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
