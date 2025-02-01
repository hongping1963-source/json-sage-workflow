import { ModelProcessor, ImageProcessConfig } from '../../../src/core/model/processor';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

describe('ModelProcessor', () => {
  let processor: ModelProcessor;
  const testImagePath = path.join(__dirname, '../../fixtures/test-image.jpg');

  beforeAll(async () => {
    // 创建测试目录和测试图像
    await fs.mkdir(path.join(__dirname, '../../fixtures'), { recursive: true });
    
    // 创建一个简单的测试图像
    const image = sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    });
    await image.toFile(testImagePath);
  });

  beforeEach(() => {
    const config: ImageProcessConfig = {
      width: 224,
      height: 224,
      channels: 3,
      normalize: true
    };
    processor = new ModelProcessor(config);
  });

  describe('Image Preprocessing', () => {
    it('should process image buffer correctly', async () => {
      const imageData = await fs.readFile(testImagePath);
      const processed = await processor.preprocess(imageData);

      expect(processed).toBeInstanceOf(Float32Array);
      expect(processed.length).toBe(224 * 224 * 3);
      expect(Math.min(...processed)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...processed)).toBeLessThanOrEqual(1);
    });

    it('should handle different image sizes', async () => {
      // 创建不同尺寸的图像
      const sizes = [
        { width: 50, height: 50 },
        { width: 300, height: 200 },
        { width: 1000, height: 1000 }
      ];

      for (const size of sizes) {
        const image = sharp({
          create: {
            width: size.width,
            height: size.height,
            channels: 3,
            background: { r: 255, g: 0, b: 0 }
          }
        });
        const buffer = await image.toBuffer();
        
        const processed = await processor.preprocess(buffer);
        expect(processed.length).toBe(224 * 224 * 3);
      }
    });

    it('should cache processed results', async () => {
      const imageData = await fs.readFile(testImagePath);
      
      // 第一次处理
      const firstResult = await processor.preprocess(imageData);
      
      // 第二次处理（应该使用缓存）
      const start = performance.now();
      const secondResult = await processor.preprocess(imageData);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(5); // 缓存应该非常快
      expect(secondResult).toEqual(firstResult);
    });

    it('should handle invalid input', async () => {
      const invalidInput = 'not an image';
      await expect(processor.preprocess(invalidInput)).rejects.toThrow();
    });
  });

  describe('Output Postprocessing', () => {
    it('should return top-k predictions', async () => {
      const mockOutput = new Float32Array([0.1, 0.5, 0.3, 0.8, 0.2]);
      const result = await processor.postprocess(mockOutput);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
      expect(result[0].confidence).toBeGreaterThan(result[1].confidence);
    });

    it('should handle empty output', async () => {
      const emptyOutput = new Float32Array();
      const result = await processor.postprocess(emptyOutput);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should respect custom configuration', async () => {
      const customConfig: ImageProcessConfig = {
        width: 128,
        height: 128,
        channels: 3,
        normalize: false
      };
      const customProcessor = new ModelProcessor(customConfig);

      const imageData = await fs.readFile(testImagePath);
      const processed = await customProcessor.preprocess(imageData);

      expect(processed.length).toBe(128 * 128 * 3);
    });

    it('should apply normalization correctly', async () => {
      const config: ImageProcessConfig = {
        width: 224,
        height: 224,
        channels: 3,
        normalize: true,
        mean: [0.5, 0.5, 0.5],
        std: [0.5, 0.5, 0.5]
      };
      const normalizedProcessor = new ModelProcessor(config);

      const imageData = await fs.readFile(testImagePath);
      const processed = await normalizedProcessor.preprocess(imageData);

      // 检查值是否在正确范围内（通常在[-1, 1]之间）
      expect(Math.min(...processed)).toBeGreaterThanOrEqual(-1);
      expect(Math.max(...processed)).toBeLessThanOrEqual(1);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache successfully', async () => {
      const imageData = await fs.readFile(testImagePath);
      
      // 首次处理并缓存
      await processor.preprocess(imageData);
      
      // 清理缓存
      processor.clearCache();
      
      // 再次处理（应该需要重新计算）
      const start = performance.now();
      await processor.preprocess(imageData);
      const duration = performance.now() - start;

      expect(duration).toBeGreaterThan(5); // 重新处理应该需要更多时间
    });
  });
});
