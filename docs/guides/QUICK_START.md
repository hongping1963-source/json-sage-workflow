# JsonSageAI 快速开始指南

## 1. 安装

使用 npm 安装：
```bash
npm install @zhanghongping/json-sage-ai
```

或使用 pnpm：
```bash
pnpm add @zhanghongping/json-sage-ai
```

## 2. 基本使用

### 2.1 初始化

```typescript
import { JsonSageAI } from '@zhanghongping/json-sage-ai';

const agent = new JsonSageAI({
    deepseekApiKey: 'your-api-key',
    model: 'deepseek-chat',
    maxTokens: 2048,
    temperature: 0.7
});
```

### 2.2 生成简单的 JSON Schema

```typescript
// 生成一个简单的产品对象 Schema
const result = await agent.generateSchema({
    jsonData: '创建一个产品对象，包含名称、价格和描述',
    options: {
        includeDescriptions: true,
        includeExamples: true
    }
});

console.log(JSON.stringify(result.schema, null, 2));
```

### 2.3 处理生成结果

```typescript
// 查看生成的 Schema
console.log('Schema:', result.schema);

// 查看示例数据
console.log('Examples:', result.examples);

// 查看执行信息
console.log('执行时间:', result.metadata.executionTime);
console.log('执行步骤:', result.metadata.steps);
console.log('分析洞察:', result.metadata.insights);
```

## 3. 高级功能

### 3.1 自定义验证规则

```typescript
const result = await agent.generateSchema({
    jsonData: {
        description: '创建用户对象，包含邮箱和年龄',
        required: ['email', 'age']
    },
    options: {
        includeValidations: true
    }
});
```

### 3.2 批量处理

```typescript
const results = await agent.generateSchemas([
    { description: '产品对象' },
    { description: '用户对象' },
    { description: '订单对象' }
]);
```

## 4. 错误处理

```typescript
try {
    const result = await agent.generateSchema({
        jsonData: '创建产品对象'
    });
} catch (error) {
    if (error instanceof ValidationError) {
        console.error('验证错误:', error.message);
    } else if (error instanceof APIError) {
        console.error('API错误:', error.message);
    } else {
        console.error('未知错误:', error);
    }
}
```

## 5. 最佳实践

1. **API 密钥管理**
   - 使用环境变量存储 API 密钥
   - 不要在代码中硬编码密钥

2. **性能优化**
   - 启用缓存减少 API 调用
   - 合理设置 maxTokens 值

3. **错误处理**
   - 始终使用 try-catch 捕获错误
   - 针对不同类型的错误进行处理

4. **类型安全**
   - 使用 TypeScript 类型定义
   - 验证输入数据

## 6. 常见问题

### 6.1 如何处理复杂对象？

对于复杂对象，建议：
1. 分解为小的子对象
2. 使用清晰的字段描述
3. 指定必需字段

### 6.2 如何优化生成质量？

1. 提供详细的字段描述
2. 设置合适的模型参数
3. 使用验证规则
4. 分析生成的洞察

## 7. 下一步

- 查看[高级特性](./ADVANCED_FEATURES.md)文档
- 了解[API 参考](../api/API_REFERENCE.md)
- 阅读[最佳实践](../TECHNICAL_SPEC.md#最佳实践)
