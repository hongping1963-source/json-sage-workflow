import sharp from 'sharp';
import { VisionProcessOptions, VisionProcessResult, JsonSageError } from '../../types';
import { SmolVLMProvider } from '../providers/smolvlm';

export class VisionProcessor {
  private provider: SmolVLMProvider;
  private maxResolution: number;

  constructor(provider: SmolVLMProvider, maxResolution: number = 512) {
    this.provider = provider;
    this.maxResolution = maxResolution;
  }

  async processImage(options: VisionProcessOptions): Promise<VisionProcessResult> {
    try {
      // Prepare the image
      const processedImage = await this.prepareImage(options.image);
      
      // Update the options with processed image
      const updatedOptions = {
        ...options,
        image: processedImage,
      };

      // Process with the AI provider
      return await this.provider.processVision(updatedOptions);
    } catch (error) {
      throw new JsonSageError(
        'Failed to process image',
        'VISION_PROCESS_ERROR',
        { originalError: error }
      );
    }
  }

  private async prepareImage(image: Buffer | string): Promise<Buffer> {
    try {
      let imageBuffer: Buffer;

      // Convert string input (URL or base64) to buffer if needed
      if (typeof image === 'string') {
        if (image.startsWith('data:image')) {
          // Handle base64
          imageBuffer = Buffer.from(image.split(',')[1], 'base64');
        } else {
          // Handle URL - in a real implementation, you'd want to fetch the image
          throw new Error('URL handling not implemented');
        }
      } else {
        imageBuffer = image;
      }

      // Process the image with sharp
      const processedImage = await sharp(imageBuffer)
        .resize(this.maxResolution, this.maxResolution, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat('jpeg', { quality: 90 })
        .toBuffer();

      return processedImage;
    } catch (error) {
      throw new JsonSageError(
        'Failed to prepare image',
        'IMAGE_PREPARATION_ERROR',
        { originalError: error }
      );
    }
  }
}
