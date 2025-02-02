# Optimization API Reference

SmolVLM provides various optimization techniques to improve model performance and reduce resource usage.

## Quantization

### Supported Quantization Types

- `none`: No quantization, uses full precision
- `int8`: 8-bit integer quantization
- `float16`: 16-bit floating point quantization

### Quantization API

```typescript
class Quantizer {
  async quantize(
    session: ort.InferenceSession,
    type: 'int8' | 'float16'
  ): Promise<ort.InferenceSession>
}
```

## Memory Management

### MemoryManager Class

```typescript
class MemoryManager {
  constructor(memoryLimit?: number)
  
  async optimize(): Promise<void>
  getCurrentUsage(): number
  async releaseAll(): Promise<void>
}
```

### Memory Optimization Strategies

1. **Automatic Garbage Collection**
   ```typescript
   const manager = new MemoryManager(512 * 1024 * 1024);
   await manager.optimize();
   ```

2. **Manual Resource Management**
   ```typescript
   // Release resources when done
   await manager.releaseAll();
   ```

## Performance Optimization

### Model Warmup

```typescript
private async warmup(): Promise<void>
```

Runs a dummy inference to initialize and optimize the model.

### Parallel Processing

```typescript
interface ExecutionConfig {
  executionMode: 'sequential' | 'parallel';
  numThreads?: number;
}
```

### GPU Acceleration

When using GPU:
```typescript
const config: ModelConfig = {
  deviceType: 'gpu',
  executionProviders: ['webgl']
};
```

## Best Practices

1. **Memory Management**
   - Set appropriate memory limits
   - Monitor memory usage
   - Release resources when done

2. **Quantization**
   - Use int8 for edge devices
   - Use float16 for balanced performance
   - Test accuracy impact

3. **Performance Tuning**
   - Enable parallel execution when possible
   - Use GPU acceleration when available
   - Monitor and optimize batch sizes
