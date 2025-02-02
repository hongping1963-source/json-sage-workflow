import sharp from 'sharp';
import { createHash } from 'crypto';

/**
 * 图像预处理配置
 */
export interface ImageProcessConfig {
  width: number;
  height: number;
  channels: number;
  normalize?: boolean;
  mean?: number[];
  std?: number[];
}

/**
 * 输入/输出处理器
 * 负责模型输入的预处理和输出的后处理
 */
export class ModelProcessor {
  private readonly imageConfig: ImageProcessConfig;
  private readonly cache: Map<string, Float32Array>;

  constructor(imageConfig?: Partial<ImageProcessConfig>) {
    this.imageConfig = {
      width: 224,
      height: 224,
      channels: 3,
      normalize: true,
      mean: [0.485, 0.456, 0.406],
      std: [0.229, 0.224, 0.225],
      ...imageConfig
    };
    this.cache = new Map();
  }

  /**
   * 预处理输入
   */
  async preprocess(input: Buffer | Uint8Array | string): Promise<Float32Array> {
    try {
      // 1. 计算输入hash用于缓存
      const inputHash = this.hashInput(input);
      
      // 2. 检查缓存
      const cached = this.cache.get(inputHash);
      if (cached) {
        return cached;
      }

      // 3. 处理图像
      const processed = await this.processImage(input);
      
      // 4. 缓存结果
      this.cache.set(inputHash, processed);
      
      return processed;
    } catch (error) {
      throw new Error(`Preprocessing failed: ${error.message}`);
    }
  }

  /**
   * 后处理输出
   */
  async postprocess(output: Float32Array): Promise<any> {
    try {
      // 1. 获取前k个预测结果
      const topK = 5;
      const predictions = this.getTopKPredictions(output, topK);
      
      // 2. 格式化结果
      return predictions.map(pred => ({
        label: pred.index,
        confidence: pred.probability
      }));
    } catch (error) {
      throw new Error(`Postprocessing failed: ${error.message}`);
    }
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  // 私有辅助方法
  private async processImage(input: Buffer | Uint8Array | string): Promise<Float32Array> {
    // 1. 加载图像
    const image = sharp(input);

    // 2. 调整大小和格式
    const { data, info } = await image
      .resize(this.imageConfig.width, this.imageConfig.height, {
        fit: 'cover',
        position: 'center'
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 3. 转换为Float32Array
    const pixelCount = this.imageConfig.width * this.imageConfig.height;
    const float32Data = new Float32Array(pixelCount * this.imageConfig.channels);

    // 4. 归一化和标准化
    for (let i = 0; i < pixelCount; i++) {
      for (let c = 0; c < this.imageConfig.channels; c++) {
        const value = data[i * this.imageConfig.channels + c] / 255.0;
        
        if (this.imageConfig.normalize) {
          float32Data[c * pixelCount + i] = 
            (value - (this.imageConfig.mean?.[c] || 0)) / 
            (this.imageConfig.std?.[c] || 1);
        } else {
          float32Data[c * pixelCount + i] = value;
        }
      }
    }

    return float32Data;
  }

  private getTopKPredictions(output: Float32Array, k: number): Array<{index: number; probability: number}> {
    // 1. 创建索引数组
    const indices = Array.from(output.keys());
    
    // 2. 按概率排序
    indices.sort((a, b) => output[b] - output[a]);
    
    // 3. 获取前k个结果
    return indices
      .slice(0, k)
      .map(index => ({
        index,
        probability: output[index]
      }));
  }

  private hashInput(input: Buffer | Uint8Array | string): string {
    const data = Buffer.isBuffer(input) ? input :
                input instanceof Uint8Array ? Buffer.from(input) :
                Buffer.from(input);
    return createHash('md5').update(data).digest('hex');
  }
}
