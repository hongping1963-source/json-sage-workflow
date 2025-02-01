# JsonSage AI Agent - 第一阶段开发文档

## 概述

第一阶段开发主要聚焦于核心功能的实现，包括基础JSON处理能力和SmolVLM视觉处理集成。

## 主要功能

### 1. JSON处理
- 基础JSON解析和验证
- AI驱动的类型推断
- 模式生成
- 错误处理

### 2. SmolVLM集成
- 支持256M和500M两种模型
- 图像处理和分析
- JSON-视觉关联分析

### 3. 性能监控
- 处理时间跟踪
- 内存使用监控
- 错误统计

## 技术架构

### 目录结构
```
simple/
├── src/
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── deepseek.ts
│   │   │   └── smolvlm.ts
│   │   └── vision/
│   │       ├── processor.ts
│   │       └── types.ts
│   ├── core/
│   │   ├── processor.ts
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   └── validation.ts
│   └── utils/
│       ├── logger.ts
│       └── performance.ts
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
└── examples/
```

### 核心组件

1. **SmolVLM Provider**
   - 负责与SmolVLM模型交互
   - 处理图像和文本输入
   - 生成分析结果

2. **Vision Processor**
   - 图像预处理
   - 分辨率调整
   - 格式转换

3. **JSON Processor**
   - JSON解析和验证
   - 类型推断
   - 错误处理

4. **Performance Monitor**
   - 性能指标收集
   - 统计分析
   - 报告生成

## API设计

### 1. 主要接口
```typescript
class JsonSageAgent {
  constructor(config: Config);
  processJson(json: object): Promise<JsonProcessResult>;
  processVision(options: VisionProcessOptions): Promise<VisionProcessResult>;
  getPerformanceMetrics(): PerformanceMetrics[];
}
```

### 2. 配置选项
```typescript
interface Config {
  aiProvider: 'smolvlm';
  apiKey: string;
  enableLogging?: boolean;
  visionOptions?: {
    modelSize: '256M' | '500M';
    maxResolution: number;
  };
}
```

## 开发进度

- [x] 环境配置
- [x] 基础架构搭建
- [x] SmolVLM集成
- [x] JSON处理实现
- [x] 视觉处理实现
- [x] 性能监控
- [ ] 单元测试
- [ ] 集成测试
- [ ] API文档
- [ ] 示例项目

## 下一步计划

1. 完善测试用例
2. 编写详细文档
3. 创建示例项目
4. 性能优化
5. 准备开源

## 技术栈

- TypeScript
- Node.js
- SmolVLM
- Jest
- Sharp
- Zod
- Hugging Face Inference

## 注意事项

1. API密钥管理
2. 错误处理
3. 性能优化
4. 代码质量
5. 文档维护
