# Vision Module 部署指南

## 目录
- [系统要求](#系统要求)
- [安装步骤](#安装步骤)
- [配置说明](#配置说明)
- [性能优化](#性能优化)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 系统要求

### 硬件要求
- CPU: 4核或以上
- 内存: 8GB或以上
- 存储: 1GB可用空间
- GPU: 可选，支持CUDA的NVIDIA GPU

### 软件要求
- Node.js 18.x或更高版本
- pnpm 8.x或更高版本
- Python 3.8或更高版本（用于模型转换）
- CUDA Toolkit 11.x（如果使用GPU）

### 操作系统支持
- Windows 10/11
- Ubuntu 20.04/22.04
- macOS 12或更高版本

## 安装步骤

### 1. 准备环境

```bash
# 安装Node.js
winget install OpenJS.NodeJS.LTS

# 安装pnpm
npm install -g pnpm

# 安装Python（如果需要）
winget install Python.Python.3.8
```

### 2. 安装依赖

```bash
# 克隆仓库
git clone https://github.com/your-org/json-sage-ai-agent.git
cd json-sage-ai-agent

# 安装依赖
pnpm install
```

### 3. 下载模型

```bash
# 运行模型下载脚本
pnpm run download-models
```

### 4. 配置环境变量

```bash
# Windows PowerShell
$env:VISION_MODEL_PATH = "models/smolvlm-v1"
$env:VISION_DEVICE_TYPE = "cpu"  # 或 "cuda"
$env:VISION_MAX_TOKENS = "512"
```

### 5. 运行测试

```bash
# 运行单元测试
pnpm test

# 运行集成测试
pnpm test:integration
```

## 配置说明

### 基本配置

```typescript
// config/vision.config.ts
export default {
  model: {
    path: process.env.VISION_MODEL_PATH || 'models/smolvlm-v1',
    deviceType: process.env.VISION_DEVICE_TYPE || 'cpu',
    maxTokens: parseInt(process.env.VISION_MAX_TOKENS || '512')
  },
  processing: {
    batchSize: 5,
    concurrency: 2,
    timeout: 30000
  },
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 3600
  }
}
```

### 性能配置

```typescript
// config/performance.config.ts
export default {
  memory: {
    maxHeapSize: '4GB',
    gcInterval: 1000
  },
  batch: {
    maxSize: 10,
    timeout: 5000
  },
  worker: {
    maxWorkers: 4,
    taskTimeout: 30000
  }
}
```

## 性能优化

### 1. 内存管理

```typescript
// 启用垃圾回收
import v8 from 'v8';
v8.setFlagsFromString('--max-old-space-size=4096');

// 使用流处理大文件
import { createReadStream } from 'fs';
const stream = createReadStream('large-image.jpg');
```

### 2. 批处理优化

```typescript
// 使用批处理器
const batchProcessor = new BatchProcessor({
  maxBatchSize: 10,
  maxWaitTime: 100,
  processFunction: async (batch) => {
    // 处理批次
  }
});
```

### 3. 缓存策略

```typescript
// 配置缓存
const cache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1小时
  updateAgeOnGet: true
});
```

## 监控和维护

### 1. 健康检查

```typescript
// health.ts
async function checkHealth(): Promise<HealthStatus> {
  return {
    status: 'healthy',
    checks: {
      model: await checkModel(),
      memory: checkMemory(),
      cache: checkCache()
    }
  };
}
```

### 2. 性能指标

```typescript
// metrics.ts
interface Metrics {
  requestCount: number;
  processingTime: number;
  errorRate: number;
  memoryUsage: number;
  cacheHitRate: number;
}

function collectMetrics(): Metrics {
  // 收集指标
}
```

### 3. 日志记录

```typescript
// logger.ts
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 故障排除

### 常见问题

1. 模型加载失败
```typescript
try {
  await model.load();
} catch (error) {
  if (error.code === 'MODEL_NOT_FOUND') {
    // 检查模型路径
  } else if (error.code === 'CUDA_ERROR') {
    // 检查GPU配置
  }
}
```

2. 内存溢出
```typescript
if (process.memoryUsage().heapUsed > threshold) {
  // 触发GC
  global.gc();
  // 降低批处理大小
  batchProcessor.reduceBatchSize();
}
```

3. 性能问题
```typescript
// 性能监控
const monitor = new PerformanceMonitor({
  sampleInterval: 1000,
  threshold: {
    cpu: 80,
    memory: 90,
    latency: 1000
  }
});
```

### 诊断工具

1. 内存泄漏检测
```typescript
const heapDump = require('heapdump');
heapDump.writeSnapshot('heap-' + Date.now() + '.heapsnapshot');
```

2. 性能分析
```typescript
const profiler = require('v8-profiler-node8');
profiler.startProfiling('CPU Profile');
setTimeout(() => {
  const profile = profiler.stopProfiling();
  profile.export().pipe(createWriteStream('profile.cpuprofile'));
}, 30000);
```

### 恢复策略

1. 自动重试
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}
```

2. 降级服务
```typescript
class FallbackService {
  async process(image: Buffer): Promise<Result> {
    try {
      return await this.primaryService.process(image);
    } catch (error) {
      logger.warn('Falling back to backup service');
      return await this.backupService.process(image);
    }
  }
}
```

3. 资源清理
```typescript
process.on('SIGTERM', async () => {
  // 停止接受新请求
  server.close();
  
  // 等待当前请求完成
  await activeRequests.waitForCompletion();
  
  // 清理资源
  await cleanup();
  
  process.exit(0);
});
```

## 部署检查清单

### 前期准备
- [ ] 确认系统要求
- [ ] 准备环境变量
- [ ] 下载模型文件

### 安装配置
- [ ] 安装依赖
- [ ] 配置环境
- [ ] 运行测试

### 性能优化
- [ ] 配置内存限制
- [ ] 设置批处理参数
- [ ] 启用缓存

### 监控设置
- [ ] 配置日志
- [ ] 设置告警
- [ ] 启用指标收集

### 维护计划
- [ ] 备份策略
- [ ] 更新计划
- [ ] 应急预案
