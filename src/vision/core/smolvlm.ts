import * as ort from 'onnxruntime-node';
import * as path from 'path';
import { VisionConfig } from '../types';
import { ImageProcessor } from './image';
import { Tokenizer } from './tokenizer';

export class SmolVLM {
  private session: ort.InferenceSession | null = null;
  private tokenizer: Tokenizer | null = null;
  private config: Required<VisionConfig>;

  constructor(config: VisionConfig) {
    this.config = {
      modelPath: config.modelPath || 'models/smolvlm-v1',
      deviceType: config.deviceType || 'cpu',
      maxTokens: config.maxTokens || 512
    };
  }

  async load(): Promise<void> {
    try {
      // 加载ONNX模型
      this.session = await ort.InferenceSession.create(
        path.join(this.config.modelPath, 'model.onnx'),
        { executionProviders: [this.config.deviceType === 'cuda' ? 'cuda' : 'cpu'] }
      );

      // 加载tokenizer
      this.tokenizer = new Tokenizer({
        modelPath: path.join(this.config.modelPath, 'tokenizer.model'),
        maxLength: this.config.maxTokens
      });
      await this.tokenizer.load();
      
      console.log('SmolVLM model and tokenizer loaded successfully');
    } catch (error) {
      console.error('Error loading SmolVLM:', error);
      throw error;
    }
  }

  async tokenize(text: string): Promise<number[]> {
    if (!this.tokenizer) {
      throw new Error('Tokenizer not loaded');
    }
    return this.tokenizer.encode(text);
  }

  async generateEmbeddings(imageData: Buffer): Promise<Float32Array> {
    if (!this.session) {
      throw new Error('Model not loaded');
    }

    try {
      // 1. 验证图像
      if (!await ImageProcessor.validateImage(imageData)) {
        throw new Error('Invalid image data');
      }

      // 2. 预处理图像
      const preprocessedImage = await ImageProcessor.preprocessImage(imageData, {
        width: 224,
        height: 224,
        normalize: true,
        channels: 3
      });

      // 3. 创建输入tensor
      const inputTensor = new ort.Tensor('float32', preprocessedImage, [1, 3, 224, 224]);

      // 4. 运行模型
      const outputMap = await this.session.run({
        'input_ids': inputTensor
      });

      // 5. 获取输出
      const embeddings = outputMap['embeddings'].data as Float32Array;
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  async analyze(imageData: Buffer): Promise<{
    description: string;
    objects: string[];
    attributes: Record<string, any>;
  }> {
    try {
      // 1. 验证图像
      if (!await ImageProcessor.validateImage(imageData)) {
        throw new Error('Invalid image data');
      }

      // 2. 生成图像嵌入
      const embeddings = await this.generateEmbeddings(imageData);

      // 3. 获取图像元数据
      const metadata = await ImageProcessor.getImageMetadata(imageData);

      // 4. 提取主要颜色
      const dominantColors = await ImageProcessor.extractDominantColors(imageData);

      // 5. 生成描述
      const description = await this.generateDescription(embeddings);

      // 6. 检测对象
      const objects = await this.detectObjects(embeddings);

      // 7. 整合所有属性
      const attributes = {
        dimensions: {
          width: metadata.width,
          height: metadata.height
        },
        format: metadata.format,
        colorSpace: metadata.space,
        dominantColors,
        hasAlpha: metadata.hasAlpha,
        isAnimated: metadata.pages && metadata.pages > 1
      };

      return {
        description,
        objects,
        attributes
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  private async generateDescription(embeddings: Float32Array): Promise<string> {
    if (!this.session || !this.tokenizer) {
      throw new Error('Model or tokenizer not loaded');
    }

    try {
      // 1. 准备输入
      const embeddingTensor = new ort.Tensor('float32', embeddings, [1, embeddings.length]);
      const startToken = this.tokenizer.getBosTokenId();
      const inputIds = new ort.Tensor('int64', [startToken], [1, 1]);

      // 2. 生成描述
      let currentIds = [startToken];
      for (let i = 0; i < this.config.maxTokens; i++) {
        // 运行模型
        const outputs = await this.session.run({
          'input_embeddings': embeddingTensor,
          'input_ids': new ort.Tensor('int64', currentIds, [1, currentIds.length])
        });

        // 获取下一个token
        const logits = outputs['logits'].data as Float32Array;
        const nextToken = this.sampleNextToken(logits);

        // 如果是结束token，停止生成
        if (nextToken === this.tokenizer.getEosTokenId()) {
          break;
        }

        currentIds.push(nextToken);
      }

      // 3. 解码生成的token
      return this.tokenizer.decode(currentIds);
    } catch (error) {
      console.error('Error generating description:', error);
      return 'Failed to generate description';
    }
  }

  private async detectObjects(embeddings: Float32Array): Promise<string[]> {
    if (!this.session || !this.tokenizer) {
      throw new Error('Model or tokenizer not loaded');
    }

    try {
      // 1. 准备输入
      const embeddingTensor = new ort.Tensor('float32', embeddings, [1, embeddings.length]);
      
      // 2. 运行对象检测
      const outputs = await this.session.run({
        'input_embeddings': embeddingTensor
      });

      // 3. 处理检测结果
      const objectLogits = outputs['object_logits'].data as Float32Array;
      const objectLabels = this.decodeObjectLabels(objectLogits);

      return objectLabels;
    } catch (error) {
      console.error('Error detecting objects:', error);
      return ['Failed to detect objects'];
    }
  }

  private sampleNextToken(logits: Float32Array): number {
    // 实现简单的贪婪采样
    let maxIndex = 0;
    let maxValue = logits[0];

    for (let i = 1; i < logits.length; i++) {
      if (logits[i] > maxValue) {
        maxValue = logits[i];
        maxIndex = i;
      }
    }

    return maxIndex;
  }

  private decodeObjectLabels(logits: Float32Array): string[] {
    // 实现对象标签解码
    // 这里使用一个简单的阈值来过滤对象
    const threshold = 0.5;
    const objects: string[] = [];

    for (let i = 0; i < logits.length; i++) {
      if (logits[i] > threshold) {
        objects.push(`object_${i}`);
      }
    }

    return objects;
  }
}
