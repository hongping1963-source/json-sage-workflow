# Edge Deployment Examples

## Optimized Edge Model

```typescript
import { SmolVLM } from 'smolvlm-node';

async function createEdgeModel() {
  const model = new SmolVLM({
    modelPath: 'path/to/model.onnx',
    deviceType: 'cpu',
    quantization: 'int8',
    memoryLimit: 256 * 1024 * 1024 // 256MB
  });

  // Load and optimize
  await model.load();
  await model.optimize();

  return model;
}
```

## Resource-Constrained Environment

```typescript
async function resourceConstrainedInference(imagePath: string) {
  const model = new SmolVLM({
    modelPath: 'path/to/model.onnx',
    deviceType: 'cpu',
    quantization: 'int8',
    memoryLimit: 128 * 1024 * 1024 // 128MB
  });

  try {
    await model.load();

    // Monitor resource usage
    const initialMemory = process.memoryUsage().heapUsed;
    const startTime = process.hrtime();

    // Run inference
    const imageData = await fs.readFile(imagePath);
    const result = await model.predict(imageData);

    // Calculate resource usage
    const memoryUsed = process.memoryUsage().heapUsed - initialMemory;
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const inferenceTime = seconds * 1000 + nanoseconds / 1e6;

    console.log({
      memoryUsed: `${(memoryUsed / 1024 / 1024).toFixed(2)} MB`,
      inferenceTime: `${inferenceTime.toFixed(2)} ms`,
      result
    });

    return result;
  } finally {
    await model.dispose();
  }
}
```

## Batch Processing with Memory Management

```typescript
async function batchProcessWithMemoryLimit(
  imagePaths: string[],
  batchSize: number = 4
) {
  const model = new SmolVLM({
    modelPath: 'path/to/model.onnx',
    deviceType: 'cpu',
    quantization: 'int8',
    memoryLimit: 256 * 1024 * 1024
  });

  await model.load();

  try {
    const results = [];
    for (let i = 0; i < imagePaths.length; i += batchSize) {
      const batch = imagePaths.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (path) => {
          const imageData = await fs.readFile(path);
          return model.predict(imageData);
        })
      );
      results.push(...batchResults);

      // Force garbage collection after each batch
      if (global.gc) {
        global.gc();
      }

      // Optional: Add delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
  } finally {
    await model.dispose();
  }
}
```

## Performance Monitoring on Edge

```typescript
class EdgePerformanceMonitor {
  private startTime: number;
  private startMemory: number;
  private metrics: any[] = [];

  start() {
    this.startTime = performance.now();
    this.startMemory = process.memoryUsage().heapUsed;
  }

  record(event: string) {
    const currentTime = performance.now();
    const currentMemory = process.memoryUsage().heapUsed;

    this.metrics.push({
      event,
      timeFromStart: currentTime - this.startTime,
      memoryUsed: currentMemory - this.startMemory
    });
  }

  getReport() {
    return this.metrics;
  }
}

// Usage
async function monitoredEdgeInference(model: SmolVLM, imagePath: string) {
  const monitor = new EdgePerformanceMonitor();
  monitor.start();

  try {
    monitor.record('start');
    const imageData = await fs.readFile(imagePath);
    monitor.record('image_loaded');
    
    const result = await model.predict(imageData);
    monitor.record('inference_complete');

    const metrics = model.getMetrics();
    monitor.record('metrics_collected');

    return {
      result,
      metrics,
      performanceReport: monitor.getReport()
    };
  } catch (error) {
    monitor.record('error');
    throw error;
  }
}
```
