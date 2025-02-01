# JsonSage AI Agent 开发指南

## 开发环境设置

### 系统要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- TypeScript >= 5.0.0

### 环境准备

1. **克隆代码库**
```bash
git clone [repository-url]
cd json-sage-ai-agent
```

2. **安装依赖**
```bash
cd versions/simple
npm install
```

3. **配置开发环境**
```bash
# 创建环境配置文件
cp .env.example .env
# 编辑.env文件，填入必要的配置信息
```

## 项目结构

```
simple/
├── src/                    # 源代码目录
│   ├── ai/                # AI相关实现
│   │   ├── providers/     # AI提供者
│   │   └── vision/        # 视觉处理
│   ├── core/              # 核心功能
│   ├── utils/             # 工具类
│   └── types/             # 类型定义
├── tests/                 # 测试文件
├── docs/                  # 文档
└── examples/              # 示例代码
```

## 开发工作流

### 1. 分支管理

- `main`: 主分支，保持稳定
- `develop`: 开发分支
- `feature/*`: 功能分支
- `bugfix/*`: 修复分支
- `release/*`: 发布分支

### 2. 提交规范

使用约定式提交规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型（type）：
- feat: 新功能
- fix: 修复
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

### 3. 代码规范

- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循TypeScript最佳实践

## 开发流程

### 1. 功能开发

1. 创建功能分支
```bash
git checkout -b feature/new-feature
```

2. 开发新功能
```bash
# 启动开发服务
npm run dev

# 运行测试
npm test

# 代码格式化
npm run format
```

3. 提交代码
```bash
git add .
git commit -m "feat: add new feature"
```

### 2. 测试

1. 单元测试
```bash
npm run test:unit
```

2. 集成测试
```bash
npm run test:integration
```

3. 覆盖率报告
```bash
npm run test:coverage
```

### 3. 文档

1. 更新API文档
2. 添加/更新示例代码
3. 更新开发文档

### 4. 代码审查

1. 创建Pull Request
2. 等待代码审查
3. 处理反馈意见
4. 合并代码

## 发布流程

### 1. 版本管理

使用语义化版本：

- 主版本号：不兼容的API修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

### 2. 发布步骤

1. 更新版本号
```bash
npm version [major|minor|patch]
```

2. 生成更新日志
3. 创建发布标签
4. 发布到npm

## 调试指南

### 1. 本地调试

```typescript
// 启用详细日志
const agent = new JsonSageAgent({
  ...config,
  enableLogging: true
});

// 使用性能监控
const metrics = agent.getPerformanceMetrics();
```

### 2. 错误处理

```typescript
try {
  const result = await agent.processJson(data);
} catch (error) {
  if (error instanceof JsonSageError) {
    // 处理特定错误
  }
}
```

### 3. 性能优化

- 使用性能监控工具
- 注意内存使用
- 优化图像处理

## 常见问题

### 1. 环境配置

Q: 如何配置API密钥？
A: 在.env文件中设置API_KEY环境变量。

### 2. 开发问题

Q: 如何添加新的AI提供者？
A: 实现AIProvider接口，并在providers目录下添加新的提供者类。

### 3. 部署问题

Q: 如何在生产环境中部署？
A: 确保设置了所有必要的环境变量，并使用生产级别的配置。

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 资源链接

- [TypeScript文档](https://www.typescriptlang.org/docs/)
- [SmolVLM文档](https://huggingface.co/docs/smolvlm)
- [Jest测试框架](https://jestjs.io/docs/getting-started)
- [ESLint文档](https://eslint.org/docs/user-guide/getting-started)
