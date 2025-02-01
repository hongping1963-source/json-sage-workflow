import { ImageProcessor } from '../../../src/vision/core/image';
import * as fs from 'fs';
import * as path from 'path';

describe('ImageProcessor', () => {
  const testImagePath = path.join(__dirname, '../../fixtures/test-image.jpg');
  let imageData: Buffer;

  beforeAll(() => {
    imageData = fs.readFileSync(testImagePath);
  });

  describe('Image Validation', () => {
    it('should validate valid image', async () => {
      const isValid = await ImageProcessor.validateImage(imageData);
      expect(isValid).toBe(true);
    });

    it('should reject invalid image data', async () => {
      const invalidData = Buffer.from('invalid data');
      const isValid = await ImageProcessor.validateImage(invalidData);
      expect(isValid).toBe(false);
    });
  });

  describe('Image Preprocessing', () => {
    it('should preprocess image to correct dimensions', async () => {
      const width = 224;
      const height = 224;
      const channels = 3;

      const preprocessed = await ImageProcessor.preprocessImage(imageData, {
        width,
        height,
        channels,
        normalize: true
      });

      expect(preprocessed).toBeInstanceOf(Float32Array);
      expect(preprocessed.length).toBe(width * height * channels);
      
      // 验证标准化
      const allNormalized = Array.from(preprocessed).every(value => value >= 0 && value <= 1);
      expect(allNormalized).toBe(true);
    });

    it('should handle custom dimensions', async () => {
      const width = 128;
      const height = 128;
      const channels = 3;

      const preprocessed = await ImageProcessor.preprocessImage(imageData, {
        width,
        height,
        channels,
        normalize: false
      });

      expect(preprocessed.length).toBe(width * height * channels);
    });
  });

  describe('Image Metadata', () => {
    it('should extract image metadata', async () => {
      const metadata = await ImageProcessor.getImageMetadata(imageData);

      expect(metadata).toBeDefined();
      expect(metadata.width).toBeGreaterThan(0);
      expect(metadata.height).toBeGreaterThan(0);
      expect(metadata.format).toBeDefined();
    });
  });

  describe('Color Analysis', () => {
    it('should extract dominant colors', async () => {
      const colorCount = 5;
      const colors = await ImageProcessor.extractDominantColors(imageData, colorCount);

      expect(colors).toHaveLength(colorCount);
      expect(colors[0]).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
    });

    it('should handle different color counts', async () => {
      const colorCount = 3;
      const colors = await ImageProcessor.extractDominantColors(imageData, colorCount);

      expect(colors).toHaveLength(colorCount);
    });
  });
});
