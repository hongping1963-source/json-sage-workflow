# Basic Usage Examples

## Simple Image Classification

```typescript
import { SmolVLM } from 'smolvlm-node';
import * as fs from 'fs/promises';

async function classifyImage(imagePath: string) {
  // Initialize model
  const model = new SmolVLM({
    modelPath: 'path/to/model.onnx',
    deviceType: 'cpu'
  });

  try {
    // Load model
    await model.load();

    // Read and process image
    const imageData = await fs.readFile(imagePath);
    const predictions = await model.predict(imageData);

    // Print results
    console.log('Predictions:', predictions);
  } finally {
    // Clean up
    await model.dispose();
  }
}

// Use the function
classifyImage('test.jpg').catch(console.error);
```

## Batch Processing

```typescript
async function processBatch(imagePaths: string[]) {
  const model = new SmolVLM({
    modelPath: 'path/to/model.onnx',
    deviceType: 'cpu',
    memoryLimit: 1024 * 1024 * 1024 // 1GB
  });

  await model.load();

  try {
    const results = [];
    for (const path of imagePaths) {
      const imageData = await fs.readFile(path);
      const prediction = await model.predict(imageData);
      results.push({ path, prediction });
    }
    return results;
  } finally {
    await model.dispose();
  }
}
```

## Error Handling

```typescript
async function robustImageProcessing(imagePath: string) {
  const model = new SmolVLM({
    modelPath: 'path/to/model.onnx',
    deviceType: 'cpu'
  });

  try {
    await model.load();
  } catch (error) {
    console.error('Failed to load model:', error);
    throw error;
  }

  try {
    const imageData = await fs.readFile(imagePath);
    const predictions = await model.predict(imageData);
    return predictions;
  } catch (error) {
    console.error('Failed to process image:', error);
    throw error;
  } finally {
    try {
      await model.dispose();
    } catch (error) {
      console.error('Failed to dispose model:', error);
    }
  }
}
```
