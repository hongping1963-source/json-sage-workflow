import { SmolVLM } from '../../../src/vision/core/smolvlm';
import { VisionConfig } from '../../../src/vision/types';
import * as fs from 'fs';
import * as path from 'path';

describe('SmolVLM', () => {
  let model: SmolVLM;
  const testImagePath = path.join(__dirname, '../../fixtures/test-image.jpg');

  beforeEach(() => {
    const config: VisionConfig = {
      modelPath: 'models/smolvlm-v1',
      deviceType: 'cpu',
      maxTokens: 512
    };
    model = new SmolVLM(config);
  });

  describe('Model Loading', () => {
    it('should load model successfully', async () => {
      await expect(model.load()).resolves.not.toThrow();
    });
  });

  describe('Image Analysis', () => {
    it('should analyze image and return valid results', async () => {
      // 加载测试图像
      const imageData = fs.readFileSync(testImagePath);
      
      // 分析图像
      const result = await model.analyze(imageData);

      // 验证结果结构
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('objects');
      expect(result).toHaveProperty('attributes');

      // 验证结果内容
      expect(typeof result.description).toBe('string');
      expect(Array.isArray(result.objects)).toBe(true);
      expect(typeof result.attributes).toBe('object');
    });

    it('should throw error for invalid image data', async () => {
      const invalidImageData = Buffer.from('invalid data');
      await expect(model.analyze(invalidImageData)).rejects.toThrow();
    });
  });

  describe('Embedding Generation', () => {
    it('should generate embeddings for valid image', async () => {
      const imageData = fs.readFileSync(testImagePath);
      const embeddings = await model.generateEmbeddings(imageData);
      
      expect(embeddings).toBeInstanceOf(Float32Array);
      expect(embeddings.length).toBeGreaterThan(0);
    });
  });
});
