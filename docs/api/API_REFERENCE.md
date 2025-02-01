# JsonSageAI API 参考文档

## 1. 核心类

### 1.1 JsonSageAI

主要的 Agent 类，用于处理 JSON Schema 生成。

```typescript
class JsonSageAI {
    constructor(config: AgentConfig);
    
    async generateSchema(task: SchemaGenerationTask): Promise<AgentResult>;
    async generateSchemas(tasks: SchemaGenerationTask[]): Promise<AgentResult[]>;
    async validateSchema(schema: any): Promise<ValidationResult>;
}
```

### 1.2 NLUParser

自然语言理解解析器。

```typescript
class NLUParser {
    constructor(apiKey: string);
    
    async parse(input: string): Promise<NLUResult>;
}
```

### 1.3 SchemaGenerator

Schema 生成器。

```typescript
class SchemaGenerator {
    async generate(nluResult: NLUResult): Promise<JSONSchema>;
}
```

## 2. 配置接口

### 2.1 AgentConfig

```typescript
interface AgentConfig {
    deepseekApiKey: string;     // DeepSeek API 密钥
    model?: string;             // 模型名称
    maxTokens?: number;         // 最大 token 数
    temperature?: number;       // 生成温度
    caching?: boolean;         // 是否启用缓存
}
```

### 2.2 SchemaGenerationOptions

```typescript
interface SchemaGenerationOptions {
    includeDescriptions?: boolean;  // 是否包含字段描述
    includeExamples?: boolean;      // 是否包含示例值
    required?: string[];            // 必需字段列表
}
```

## 3. 结果接口

### 3.1 AgentResult

```typescript
interface AgentResult {
    schema: any;               // 生成的 Schema
    descriptions?: Record<string, string>;  // 字段描述
    examples?: any;            // 示例数据
    metadata: {
        executionTime: number; // 执行时间
        steps: string[];       // 执行步骤
        insights: string[];    // 分析洞察
        errors?: string[];     // 错误信息
    };
}
```

### 3.2 ValidationResult

```typescript
interface ValidationResult {
    valid: boolean;           // 是否有效
    errors?: string[];        // 错误信息
}
```

## 4. 错误类型

### 4.1 ValidationError

```typescript
class ValidationError extends Error {
    constructor(message: string, details?: any);
}
```

### 4.2 APIError

```typescript
class APIError extends Error {
    constructor(message: string, statusCode?: number);
}
```

## 5. 工具类

### 5.1 JsonAnalyzer

```typescript
class JsonAnalyzer {
    async analyze(data: any): Promise<{
        insights: string[];
        metrics: JsonMetrics;
        fields: FieldInfo[];
    }>;
}
```

### 5.2 ConfigManager

```typescript
class ConfigManager {
    constructor(config: AgentConfig);
    
    validateConfig(): void;
    updateConfig(updates: Partial<AgentConfig>): void;
}
```

## 6. 常量和枚举

### 6.1 ErrorCodes

```typescript
enum ErrorCodes {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    API_ERROR = 'API_ERROR',
    SCHEMA_GENERATION_ERROR = 'SCHEMA_GENERATION_ERROR',
    CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}
```

### 6.2 ModelTypes

```typescript
enum ModelTypes {
    DEEPSEEK_CHAT = 'deepseek-chat',
    DEEPSEEK_CODE = 'deepseek-code'
}
```

## 7. 事件

### 7.1 事件类型

```typescript
type EventType = 
    | 'schema:start'
    | 'schema:complete'
    | 'schema:error'
    | 'api:request'
    | 'api:response'
    | 'validation:complete';
```

### 7.2 事件监听

```typescript
agent.on('schema:complete', (result: AgentResult) => {
    console.log('Schema generation completed:', result);
});
```

## 8. 中间件

### 8.1 使用中间件

```typescript
agent.use(async (ctx, next) => {
    console.log('Before processing:', ctx);
    await next();
    console.log('After processing:', ctx);
});
```

## 9. 实用工具

### 9.1 类型检查

```typescript
function isValidSchema(schema: any): boolean;
function isValidConfig(config: any): boolean;
```

### 9.2 格式化

```typescript
function formatSchema(schema: any): string;
function formatError(error: Error): string;
```
