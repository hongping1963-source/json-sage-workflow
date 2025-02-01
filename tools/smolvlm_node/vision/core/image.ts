import sharp from 'sharp';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  normalize?: boolean;
  channels?: number;
}

export class ImageProcessor {
  static async preprocessImage(
    imageData: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<Float32Array> {
    const {
      width = 224,
      height = 224,
      normalize = true,
      channels = 3
    } = options;

    try {
      // 1. 调整图像大小并转换为RGB格式
      const processedImage = await sharp(imageData)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .toColorspace('srgb')
        .raw()
        .toBuffer();

      // 2. 转换为Float32Array
      const pixelCount = width * height * channels;
      const float32Data = new Float32Array(pixelCount);

      // 3. 标准化像素值
      for (let i = 0; i < pixelCount; i++) {
        const pixelValue = processedImage[i];
        float32Data[i] = normalize ? pixelValue / 255.0 : pixelValue;
      }

      return float32Data;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw error;
    }
  }

  static async validateImage(imageData: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(imageData).metadata();
      return !!(metadata.width && metadata.height);
    } catch (error) {
      console.error('Error validating image:', error);
      return false;
    }
  }

  static async getImageMetadata(imageData: Buffer): Promise<sharp.Metadata> {
    try {
      return await sharp(imageData).metadata();
    } catch (error) {
      console.error('Error getting image metadata:', error);
      throw error;
    }
  }

  static async extractDominantColors(
    imageData: Buffer,
    colorCount: number = 5
  ): Promise<string[]> {
    try {
      // 将图像调整为较小的尺寸以加快处理速度
      const processedImage = await sharp(imageData)
        .resize(100, 100, { fit: 'cover' })
        .raw()
        .toBuffer();

      // 实现k-means聚类来提取主要颜色
      // 这里使用一个简化的实现，实际项目中可能需要更复杂的算法
      const colors: string[] = [];
      const step = Math.floor(processedImage.length / (3 * colorCount));
      
      for (let i = 0; i < colorCount; i++) {
        const pos = i * step * 3;
        const r = processedImage[pos];
        const g = processedImage[pos + 1];
        const b = processedImage[pos + 2];
        colors.push(`rgb(${r},${g},${b})`);
      }

      return colors;
    } catch (error) {
      console.error('Error extracting dominant colors:', error);
      throw error;
    }
  }
}
