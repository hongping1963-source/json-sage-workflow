# SmolVLM Node.js Toolchain

A comprehensive Node.js toolchain for SmolVLM, providing tools for model loading, optimization, and deployment in Node.js environments.

## Features

- Model loading and management
- Multiple format support (ONNX, TensorFlow, TFLite, TorchScript)
- Optimization tools (quantization, pruning, knowledge distillation)
- Version management
- Edge deployment optimizations

## Installation

```bash
cd tools/smolvlm_node
npm install
```

## Usage

```typescript
import { SmolVLM } from './core/model/smolvlm';

// Initialize model
const model = new SmolVLM({
  modelPath: 'path/to/model.onnx',
  deviceType: 'cpu'
});

// Load and run inference
await model.load();
const result = await model.predict(imageData);
```

## Documentation

See the [docs](../../docs/tools/smolvlm_node) directory for detailed documentation.

## Testing

```bash
npm test
```

## Building

```bash
npm run build
```

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.
