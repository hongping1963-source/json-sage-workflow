# Advanced Usage Examples

## Custom Optimization

```typescript
import { SmolVLM, Quantizer, MemoryManager } from 'smolvlm-node';

async function optimizedModel() {
  const model = new SmolVLM({
    modelPath: 'path/to/model.onnx',
    deviceType: 'cpu',
    quantization: 'int8'
  });

  // Load model
  await model.load();

  // Apply custom optimizations
  await model.optimize();

  // Monitor performance
  const metrics = model.getMetrics();
  console.log('Memory usage:', metrics.memoryUsage);
  console.log('Inference time:', metrics.inferenceTime);

  return model;
}
```

## GPU Acceleration

```typescript
async function gpuAcceleratedModel() {
  const model = new SmolVLM({
    modelPath: 'path/to/model.onnx',
    deviceType: 'gpu',
    executionProviders: ['webgl']
  });

  await model.load();

  // Monitor GPU utilization
  setInterval(() => {
    const metrics = model.getMetrics();
    console.log('GPU usage:', metrics.deviceUtilization.gpu);
  }, 1000);

  return model;
}
```

## Custom Pre/Post Processing

```typescript
import { ModelProcessor } from 'smolvlm-node';

class CustomProcessor extends ModelProcessor {
  async preprocess(input: any): Promise<Float32Array> {
    // Custom preprocessing logic
    const processed = await super.preprocess(input);
    // Additional processing steps
    return processed;
  }

  async postprocess(output: any): Promise<any> {
    // Custom postprocessing logic
    const processed = await super.postprocess(output);
    // Additional processing steps
    return processed;
  }
}

// Use custom processor
const model = new SmolVLM({
  modelPath: 'path/to/model.onnx',
  processor: new CustomProcessor()
});
```

## Performance Monitoring

```typescript
async function monitoredInference(model: SmolVLM, imagePath: string) {
  const startTime = performance.now();
  const baselineMemory = process.memoryUsage().heapUsed;

  try {
    const imageData = await fs.readFile(imagePath);
    const result = await model.predict(imageData);

    // Calculate metrics
    const inferenceTime = performance.now() - startTime;
    const memoryUsed = process.memoryUsage().heapUsed - baselineMemory;
    const modelMetrics = model.getMetrics();

    console.log({
      inferenceTime,
      memoryUsed,
      modelMetrics,
      result
    });

    return result;
  } catch (error) {
    console.error('Inference failed:', error);
    throw error;
  }
}
```
