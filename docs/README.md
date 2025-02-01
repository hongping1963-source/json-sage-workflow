# JsonSage AI Agent 文档中心

JsonSage AI Agent是一个强大的JSON处理工具，集成了SmolVLM视觉处理能力，可以智能处理JSON数据并分析相关的视觉内容。

## 文档导航

### 1. 开发阶段文档
- [第一阶段开发文档](./phases/phase1.md)
  - 核心功能实现
  - SmolVLM集成
  - 基础架构搭建

### 2. 系统架构
- [架构概览](./architecture/overview.md)
  - 系统组件
  - 数据流
  - 扩展性设计
  - 性能优化

### 3. API文档
- [API参考 v1](./api/v1.md)
  - 配置选项
  - 接口说明
  - 错误处理
  - 类型定义

### 4. 开发指南
- [开发指南](./guides/development.md)
  - 环境设置
  - 开发流程
  - 代码规范
  - 测试指南

### 5. 使用示例
- [基础使用示例](./examples/basic-usage.md)
  - JSON处理
  - 视觉处理
  - 错误处理
  - 性能监控

## 快速开始

1. **安装**
```bash
npm install jsonsage-simple
```

2. **基础使用**
```typescript
import { JsonSageAgent } from 'jsonsage-simple';

const agent = new JsonSageAgent({
  aiProvider: 'smolvlm',
  apiKey: 'your-api-key',
  enableLogging: true
});

// 处理JSON
const result = await agent.processJson(jsonData);
```

## 主要特性

- 智能JSON处理
- 视觉内容分析
- 性能监控
- 类型安全
- 详细日志
- 高性能

## 技术栈

- TypeScript
- Node.js
- SmolVLM
- Hugging Face
- Jest
- ESLint/Prettier

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 版本历史

- v1.0.0 - 初始版本
  - 基础JSON处理
  - SmolVLM集成
  - 性能监控

## 许可证

本项目采用 Apache 2.0 许可证。

## 联系方式

- GitHub Issues: [项目问题](https://github.com/hongping1963-source/issues)
- Email: [您的邮箱]

## 致谢

感谢所有贡献者的付出！
