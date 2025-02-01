# JsonSage AI Agent - Simple Version

这是JsonSage AI Agent的简化版本实现，包含核心功能和基本特性。

## 功能特点

- 基础JSON处理
- AI驱动的类型推断
- 简单的性能监控
- 基础错误处理
- JSON优化功能

## 目录结构

```
simple/
├── src/
│   ├── ai/
│   │   └── providers/
│   ├── core/
│   │   ├── processor.ts
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   └── validation.ts
│   └── utils/
│       ├── logger.ts
│       └── performance.ts
├── package.json
└── README.md
```

## 快速开始

```typescript
import { JsonSageAgent } from './src/agent';

const agent = new JsonSageAgent({
    aiProvider: 'deepseek',
    apiKey: 'your-api-key',
    enableLogging: true
});

const result = await agent.processJson(jsonData);
```
