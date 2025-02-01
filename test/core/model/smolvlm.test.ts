import { SmolVLM } from '../../../src/core/model/smolvlm';
import { ModelConfig } from '../../../src/core/model/base';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('SmolVLM', () => {
  let model: SmolVLM;
  const testModelPath = path.join(__dirname, '../../fixtures/test-model.onnx');
  const testImagePath = path.join(__dirname, '../../fixtures/test-image.jpg');

  beforeAll(async () => {
    // 创建测试目录
    await fs.mkdir(path.join(__dirname, '../../fixtures'), { recursive: true });
  });

  beforeEach(() => {
    const config: ModelConfig = {
      modelPath: testModelPath,
      deviceType: 'cpu',
      quantization: 'none',
      memoryLimit: 512 * 1024 * 1024 // 512MB
    };
    model = new SmolVLM(config);
  });

  afterEach(async () => {
    await model.dispose();
  });

  describe('Model Loading', () => {
    it('should load model successfully', async () => {
      // 准备测试模型文件
      const dummyModel = Buffer.from([0x00, 0x01, 0x02, 0x03]);
      await fs.writeFile(testModelPath, dummyModel);

      await expect(model.load()).resolves.not.toThrow();
    });

    it('should throw error when model file not found', async () => {
      const invalidConfig: ModelConfig = {
        modelPath: 'invalid/path/model.onnx',
        deviceType: 'cpu'
      };
      const invalidModel = new SmolVLM(invalidConfig);

      await expect(invalidModel.load()).rejects.toThrow();
    });
  });

  describe('Inference', () => {
    beforeEach(async () => {
      // 准备测试模型和图像
      const dummyModel = Buffer.from([0x00, 0x01, 0x02, 0x03]);
      await fs.writeFile(testModelPath, dummyModel);
      
      const dummyImage = Buffer.from([0xFF, 0xFF, 0xFF]); // 白色像素
      await fs.writeFile(testImagePath, dummyImage);

      await model.load();
    });

    it('should process image input correctly', async () => {
      const imageData = await fs.readFile(testImagePath);
      await expect(model.predict(imageData)).resolves.not.toThrow();
    });

    it('should handle invalid input', async () => {
      const invalidInput = 'not an image';
      await expect(model.predict(invalidInput)).rejects.toThrow();
    });

    it('should return valid predictions', async () => {
      const imageData = await fs.readFile(testImagePath);
      const result = await model.predict(imageData);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('label');
      expect(result[0]).toHaveProperty('confidence');
    });
  });

  describe('Performance Metrics', () => {
    it('should track memory usage', async () => {
      await model.load();
      const metrics = model.getMetrics();

      expect(metrics.memoryUsage).toBeDefined();
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it('should track inference time', async () => {
      await model.load();
      const dummyImage = Buffer.from([0xFF, 0xFF, 0xFF]);
      await model.predict(dummyImage);
      
      const metrics = model.getMetrics();
      expect(metrics.inferenceTime).toBeDefined();
      expect(typeof metrics.inferenceTime).toBe('number');
      expect(metrics.inferenceTime).toBeGreaterThan(0);
    });
  });

  describe('Optimization', () => {
    it('should apply quantization', async () => {
      const quantizedConfig: ModelConfig = {
        modelPath: testModelPath,
        deviceType: 'cpu',
        quantization: 'int8'
      };
      const quantizedModel = new SmolVLM(quantizedConfig);

      await quantizedModel.load();
      const metrics = quantizedModel.getMetrics();

      expect(metrics.memoryUsage).toBeLessThan(model.getMetrics().memoryUsage);
    });

    it('should handle optimization errors gracefully', async () => {
      const invalidConfig: ModelConfig = {
        modelPath: testModelPath,
        deviceType: 'cpu',
        quantization: 'invalid' as any
      };
      const invalidModel = new SmolVLM(invalidConfig);

      await expect(invalidModel.optimize()).rejects.toThrow();
    });
  });
});
