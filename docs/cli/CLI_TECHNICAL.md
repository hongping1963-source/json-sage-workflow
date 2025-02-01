# JsonSageAI CLI 技术文档

## 架构设计

### 1. 核心组件

#### 命令处理器
- Commander.js 框架
- 模块化命令结构
- 参数验证和处理

#### 交互式界面
- Inquirer.js
- 用户输入验证
- 动态提示

#### 错误处理
- 重试机制
- 错误分类
- 用户友好提示

### 2. 代码结构

```
cli/
├── src/
│   ├── commands/
│   │   ├── generate.ts
│   │   └── validate.ts
│   ├── utils/
│   │   ├── error-handler.ts
│   │   └── welcome.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 3. 主要类和接口

#### SchemaOptions 接口
```typescript
interface SchemaOptions {
    includeDescriptions?: boolean;
    includeExamples?: boolean;
    required?: string[];
    format?: boolean;
}
```

#### ApiError 类
```typescript
class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}
```

#### RetryableError 类
```typescript
class RetryableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RetryableError';
    }
}
```

## 实现细节

### 1. 重试机制

```typescript
async function withRetry<T>(
    operation: () => Promise<T>,
    options: {
        maxRetries?: number;
        initialDelay?: number;
        maxDelay?: number;
        shouldRetry?: (error: any) => boolean;
    } = {}
): Promise<T>
```

特点：
- 指数退避
- 可配置重试条件
- 错误类型判断

### 2. Schema 生成

```typescript
async function generateSchema(description: string, options?: SchemaOptions) {
    const agent = new JsonSageAI({
        deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
        maxTokens: 2048
    });

    // ... 实现细节
}
```

### 3. Schema 验证

```typescript
async function validateSchema(filePath: string) {
    const agent = new JsonSageAI({
        deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
        maxTokens: 2048
    });

    // ... 实现细节
}
```

## 依赖管理

### 1. 核心依赖

```json
{
    "commander": "^11.1.0",
    "inquirer": "^8.2.6",
    "chalk": "^4.1.2",
    "ora": "^5.4.1",
    "boxen": "^5.1.2",
    "dotenv": "^16.3.1"
}
```

### 2. 开发依赖

```json
{
    "@types/inquirer": "^8.2.10",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "jest": "^29.7.0"
}
```

## 错误处理流程

1. **API 错误**
   - 502/503/504: 自动重试
   - 401: API 密钥错误
   - 429: 限流处理

2. **文件操作错误**
   - 文件不存在
   - 权限问题
   - 格式错误

3. **用户输入错误**
   - 参数验证
   - 格式检查
   - 友好提示

## 性能优化

1. **并发处理**
   - Promise.all 并行处理
   - 异步文件操作
   - 流式处理

2. **内存管理**
   - 大文件分块处理
   - 垃圾回收优化
   - 内存泄漏防护

3. **缓存策略**
   - 本地缓存
   - 结果缓存
   - 配置缓存

## 安全考虑

1. **API 密钥管理**
   - 环境变量
   - 密钥轮换
   - 权限控制

2. **输入验证**
   - 参数清理
   - 类型检查
   - 长度限制

3. **文件操作**
   - 路径验证
   - 权限检查
   - 安全写入

## 测试策略

1. **单元测试**
   ```typescript
   describe('Schema Generation', () => {
       it('should generate valid schema', async () => {
           // 测试代码
       });
   });
   ```

2. **集成测试**
   ```typescript
   describe('CLI Integration', () => {
       it('should handle complete workflow', async () => {
           // 测试代码
       });
   });
   ```

3. **错误测试**
   ```typescript
   describe('Error Handling', () => {
       it('should retry on 502 error', async () => {
           // 测试代码
       });
   });
   ```

## 部署和发布

1. **打包**
   ```bash
   npm run build
   ```

2. **发布**
   ```bash
   npm publish
   ```

3. **版本管理**
   ```bash
   npm version patch|minor|major
   ```

## 监控和日志

1. **错误监控**
   - 错误类型统计
   - 重试次数统计
   - 成功率统计

2. **性能监控**
   - 响应时间
   - 内存使用
   - CPU 使用

3. **用户行为分析**
   - 命令使用频率
   - 错误触发点
   - 功能偏好

## 维护和更新

1. **版本更新**
   - 特性添加
   - 错误修复
   - 依赖更新

2. **文档更新**
   - API 文档
   - 使用指南
   - 示例更新

3. **兼容性维护**
   - 向后兼容
   - 版本迁移
   - 废弃通知
