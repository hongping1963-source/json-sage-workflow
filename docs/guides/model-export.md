# Model Export Guide

This guide explains how to use the model export functionality in the SmolVLM package.

## Overview

The SmolVLM package provides comprehensive model export capabilities, allowing you to:
- Convert models to different formats (ONNX, TensorFlow, TFLite, TorchScript)
- Optimize models for different deployment scenarios
- Track model versions and maintain metadata

## Basic Usage

```typescript
import { ModelExporter, ExportFormat } from '@smolvlm/core/export';

// Initialize exporter
const exporter = new ModelExporter();

// Configure export options
const config = {
  format: ExportFormat.TF,
  optimize: true,
  quantize: true,
  compress: true,
  metadata: {
    author: 'SmolVLM Team',
    purpose: 'Production deployment'
  }
};

// Export model
const result = await exporter.exportModel(
  'path/to/model.onnx',
  'output/model',
  config
);

console.log('Export completed:', result);
```

## Supported Formats

### ONNX
- Native format, no conversion needed
- Best for cross-platform compatibility

### TensorFlow
- Supports TensorFlow 2.x
- Enables integration with TensorFlow ecosystem

### TFLite
- Optimized for mobile and edge devices
- Supports quantization and optimization

### TorchScript
- Enables deployment in PyTorch production environments
- Supports JIT optimization

## Model Optimization

### Quantization
```typescript
const config = {
  format: ExportFormat.TFLITE,
  quantize: true,
  metadata: {
    quantizationType: 'int8',
    calibrationDataset: 'path/to/data'
  }
};
```

### Compression
```typescript
const config = {
  format: ExportFormat.TF,
  compress: true,
  metadata: {
    compressionMethod: 'gzip'
  }
};
```

## Version Management

### Creating Versions
```typescript
import { VersionManager } from '@smolvlm/core/versioning';

const versionManager = new VersionManager({
  storageDir: 'path/to/versions'
});

// Create version
const version = await versionManager.createVersion(
  'path/to/model.onnx',
  '1.0.0',
  { format: 'onnx' }
);

// Export with version tracking
const result = await exporter.exportModel(
  'path/to/model.onnx',
  'output/model',
  config,
  version
);
```

### Comparing Versions
```typescript
const comparison = await versionManager.compareVersions('1.0.0', '1.1.0');
console.log('Version differences:', comparison);
```

## Batch Export

```typescript
const models = [
  {
    path: 'model1.onnx',
    config: {
      format: ExportFormat.TF,
      optimize: true
    }
  },
  {
    path: 'model2.onnx',
    config: {
      format: ExportFormat.TFLITE,
      quantize: true
    }
  }
];

const results = await exporter.batchExport(models, 'output/directory');
```

## Best Practices

1. **Version Management**
   - Always use version control for your models
   - Include relevant metadata with each version
   - Maintain a clear versioning scheme

2. **Optimization**
   - Test different optimization strategies
   - Validate model accuracy after optimization
   - Monitor performance metrics

3. **Error Handling**
   - Implement proper error handling
   - Validate input models before export
   - Keep backup copies of original models

## Common Issues and Solutions

### Memory Management
- Use streaming for large models
- Implement cleanup after export
- Monitor memory usage

### Format Compatibility
- Verify format support
- Test conversion results
- Handle unsupported operations

### Performance
- Profile export operations
- Optimize batch processing
- Use appropriate hardware acceleration

## API Reference

### ModelExporter
```typescript
class ModelExporter {
  exportModel(
    modelPath: string,
    targetPath: string,
    config: ExportConfig,
    version?: ModelVersion
  ): Promise<ExportResult>;

  batchExport(
    models: Array<{
      path: string;
      config: ExportConfig;
      version?: ModelVersion;
    }>,
    outputDir: string
  ): Promise<ExportResult[]>;
}
```

### ExportConfig
```typescript
interface ExportConfig {
  format: ExportFormat;
  optimize?: boolean;
  quantize?: boolean;
  compress?: boolean;
  metadata?: Record<string, any>;
}
```

### ExportResult
```typescript
interface ExportResult {
  format: ExportFormat;
  path: string;
  size: number;
  hash: string;
  metadata: Record<string, any>;
  timestamp: string;
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../contributing.md) for details.
