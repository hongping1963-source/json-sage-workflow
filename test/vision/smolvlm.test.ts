import { VisionProcessor } from '../../src/vision/smolvlm';
import * as fs from 'fs/promises';
import * as path from 'path';

declare const testImagePath: string;

describe('VisionProcessor', () => {
  let processor: VisionProcessor;

  beforeAll(async () => {
    processor = new VisionProcessor({
      deviceType: 'cpu',
      maxTokens: 256
    });
    await processor.initialize();
  });

  describe('Image Analysis', () => {
    it('should analyze test image successfully', async () => {
      const imageBuffer = await fs.readFile(testImagePath);
      const result = await processor.analyzeImage(imageBuffer);

      expect(result).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.objects).toBeInstanceOf(Array);
      expect(result.attributes).toBeDefined();
    });

    it('should handle invalid image data', async () => {
      const invalidBuffer = Buffer.from('invalid image data');
      await expect(processor.analyzeImage(invalidBuffer)).rejects.toThrow();
    });
  });

  describe('JSON Mapping', () => {
    it('should generate basic JSON mapping', async () => {
      const mockAnalysis = {
        description: 'A test image',
        objects: ['object1', 'object2'],
        attributes: {
          colors: ['blue', 'red'],
          size: 'medium'
        }
      };

      const mapping = await processor.generateJsonMapping(mockAnalysis);

      expect(mapping).toHaveProperty('imageContent');
      expect(mapping).toHaveProperty('metadata');
      expect(mapping.imageContent.description).toBe('A test image');
      expect(mapping.imageContent.detectedObjects).toHaveLength(2);
      expect(mapping.metadata.confidence).toBeGreaterThan(0);
    });

    it('should map to provided schema', async () => {
      const mockAnalysis = {
        description: 'A test image',
        objects: ['object1'],
        attributes: { color: 'blue' }
      };

      const schema = {
        type: 'object',
        properties: {
          imageContent: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              detectedObjects: { type: 'array' }
            }
          }
        }
      };

      const mapping = await processor.generateJsonMapping(mockAnalysis, schema);

      expect(mapping).toHaveProperty('imageContent');
      expect(mapping.imageContent).toHaveProperty('description');
      expect(mapping.imageContent).toHaveProperty('detectedObjects');
    });
  });
});
