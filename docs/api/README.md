# SmolVLM Node.js API Documentation

This documentation provides comprehensive information about the SmolVLM Node.js implementation.

## Table of Contents

- [Model API](model.md)
  - Model loading and initialization
  - Inference
  - Resource management

- [Optimization API](optimization.md)
  - Quantization
  - Memory optimization
  - Performance tuning

- [Examples](examples/)
  - [Basic Usage](examples/basic.md)
  - [Advanced Features](examples/advanced.md)
  - [Edge Deployment](examples/edge.md)

## Quick Start

```typescript
import { SmolVLM } from 'smolvlm-node';

// Initialize model
const model = new SmolVLM({
  modelPath: 'path/to/model.onnx',
  deviceType: 'cpu',
  quantization: 'none',
  memoryLimit: 512 * 1024 * 1024 // 512MB
});

// Load model
await model.load();

// Run inference
const image = await fs.readFile('image.jpg');
const result = await model.predict(image);

// Clean up
await model.dispose();
```

For more detailed information, please refer to the specific sections in the documentation.
