# Model API Reference

## SmolVLM Class

The main class for loading and running SmolVLM models in Node.js.

### Constructor

```typescript
constructor(config: ModelConfig)
```

#### Parameters

- `config: ModelConfig` - Configuration object with the following properties:
  - `modelPath: string` - Path to the ONNX model file
  - `deviceType: 'cpu' | 'gpu'` - Device to run inference on
  - `quantization: 'none' | 'int8' | 'float16'` - Quantization mode
  - `memoryLimit?: number` - Optional memory limit in bytes

### Methods

#### load()

```typescript
async load(): Promise<void>
```

Loads the model into memory and prepares it for inference.

#### predict()

```typescript
async predict(input: Buffer | string): Promise<Array<{label: string, confidence: number}>>
```

Runs inference on the input image.

- `input`: Either a Buffer containing image data or a path to an image file
- Returns an array of predictions with labels and confidence scores

#### dispose()

```typescript
async dispose(): Promise<void>
```

Releases all resources used by the model.

#### optimize()

```typescript
async optimize(): Promise<void>
```

Applies optimization techniques to improve model performance.

### Metrics

The model provides performance metrics through the `getMetrics()` method:

```typescript
interface Metrics {
  memoryUsage: number;      // Current memory usage in bytes
  inferenceTime: number;    // Last inference time in milliseconds
  deviceUtilization: {
    cpu: number;           // CPU utilization percentage
    gpu?: number;         // GPU utilization percentage (if applicable)
  }
}
```

## Examples

```typescript
// Initialize model with quantization
const model = new SmolVLM({
  modelPath: 'model.onnx',
  deviceType: 'cpu',
  quantization: 'int8',
  memoryLimit: 256 * 1024 * 1024
});

// Load and optimize
await model.load();
await model.optimize();

// Run inference
const image = await fs.readFile('image.jpg');
const predictions = await model.predict(image);
console.log('Predictions:', predictions);

// Monitor performance
const metrics = model.getMetrics();
console.log('Memory usage:', metrics.memoryUsage);
console.log('Inference time:', metrics.inferenceTime);

// Clean up
await model.dispose();
```
