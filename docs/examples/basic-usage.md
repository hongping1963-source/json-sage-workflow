# JsonSage AI Agent 基础使用示例

本文档提供了JsonSage AI Agent的基础使用示例，帮助您快速上手。

## 1. 基础JSON处理

### 初始化和配置

```typescript
import { JsonSageAgent } from 'jsonsage-simple';

// 创建agent实例
const agent = new JsonSageAgent({
  aiProvider: 'smolvlm',
  apiKey: 'your-api-key',
  enableLogging: true,
  visionOptions: {
    modelSize: '256M',
    maxResolution: 512,
  },
});
```

### 处理JSON数据

```typescript
// 示例JSON数据
const jsonData = {
  name: "产品目录",
  items: [
    {
      id: 1,
      name: "智能手机",
      price: 2999.99,
      specs: {
        screen: "6.7英寸",
        storage: "256GB",
        color: "深空黑"
      }
    },
    {
      id: 2,
      name: "笔记本电脑",
      price: 6999.99,
      specs: {
        screen: "14英寸",
        processor: "Intel i7",
        memory: "16GB"
      }
    }
  ]
};

// 处理JSON
try {
  const result = await agent.processJson(jsonData);
  console.log('Schema:', result.schema);
  console.log('分析结果:', result.analysis);
  console.log('验证结果:', result.validation);
} catch (error) {
  console.error('处理出错:', error);
}
```

## 2. 视觉处理示例

### 处理图片数据

```typescript
import { readFileSync } from 'fs';

// 读取图片
const imageBuffer = readFileSync('product-image.jpg');

// 处理视觉数据
try {
  const result = await agent.processVision({
    json: jsonData,
    image: imageBuffer,
    query: "分析产品图片与JSON数据的关联"
  });

  console.log('描述:', result.description);
  console.log('分析:', result.analysis);
  console.log('JSON映射:', result.jsonMapping);
} catch (error) {
  console.error('视觉处理出错:', error);
}
```

### 使用Base64图片

```typescript
// Base64图片数据
const base64Image = 'data:image/jpeg;base64,...';

const result = await agent.processVision({
  json: jsonData,
  image: base64Image,
  query: "分析图片内容"
});
```

## 3. 性能监控示例

### 跟踪处理性能

```typescript
// 执行处理
await agent.processJson(jsonData);

// 获取性能指标
const metrics = agent.getPerformanceMetrics();

// 分析性能数据
metrics.forEach(metric => {
  console.log(`操作: ${metric.operation}`);
  console.log(`耗时: ${metric.duration}ms`);
  console.log(`状态: ${metric.success ? '成功' : '失败'}`);
  if (metric.error) {
    console.log(`错误: ${metric.error}`);
  }
});
```

## 4. 错误处理示例

### 完整的错误处理

```typescript
import { JsonSageError } from 'jsonsage-simple';

async function processWithErrorHandling() {
  try {
    const result = await agent.processJson(invalidJson);
    return result;
  } catch (error) {
    if (error instanceof JsonSageError) {
      switch (error.code) {
        case 'INVALID_INPUT':
          console.error('输入数据无效:', error.message);
          break;
        case 'SMOLVLM_PROCESS_ERROR':
          console.error('AI处理错误:', error.message);
          break;
        case 'SMOLVLM_VISION_ERROR':
          console.error('视觉处理错误:', error.message);
          break;
        default:
          console.error('未知错误:', error.message);
      }
      console.debug('错误详情:', error.details);
    } else {
      console.error('系统错误:', error);
    }
    throw error;
  }
}
```

## 5. 批量处理示例

### 处理多个JSON文件

```typescript
async function batchProcess(jsonFiles: string[]) {
  const results = [];
  const errors = [];

  for (const file of jsonFiles) {
    try {
      const jsonData = JSON.parse(readFileSync(file, 'utf8'));
      const result = await agent.processJson(jsonData);
      results.push({ file, result });
    } catch (error) {
      errors.push({ file, error });
    }
  }

  return { results, errors };
}
```

## 6. 集成示例

### 在Express应用中使用

```typescript
import express from 'express';
import { JsonSageAgent } from 'jsonsage-simple';

const app = express();
const agent = new JsonSageAgent({
  aiProvider: 'smolvlm',
  apiKey: process.env.API_KEY,
  enableLogging: true
});

app.post('/process-json', async (req, res) => {
  try {
    const result = await agent.processJson(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: error instanceof JsonSageError ? error.code : 'UNKNOWN_ERROR'
    });
  }
});

app.post('/process-vision', async (req, res) => {
  try {
    const result = await agent.processVision({
      json: req.body.json,
      image: req.body.image,
      query: req.body.query
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: error instanceof JsonSageError ? error.code : 'UNKNOWN_ERROR'
    });
  }
});
```

## 注意事项

1. 始终妥善保管API密钥
2. 处理大型JSON时注意性能
3. 图片处理前进行适当的预处理
4. 实现完整的错误处理
5. 监控性能指标
