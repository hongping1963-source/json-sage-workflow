import { MappingProcessor } from './mapping';
import { VisionConfig, ImageAnalysisResult, SchemaDefinition, MappingRule, MappingContext } from './types';
import { SmolVLM } from './core/smolvlm';

export class VisionProcessor {
  private config: VisionConfig;
  private mappingProcessor: MappingProcessor;
  private model: SmolVLM;

  constructor(config: VisionConfig = {}) {
    this.config = {
      modelPath: config.modelPath || 'models/smolvlm-v1',
      deviceType: config.deviceType || 'cpu',
      maxTokens: config.maxTokens || 512
    };
    this.mappingProcessor = new MappingProcessor();
    this.model = new SmolVLM(this.config);
  }

  async initialize(): Promise<void> {
    try {
      await this.model.load();
      console.log('VisionProcessor initialized successfully');
    } catch (error) {
      console.error('Error initializing VisionProcessor:', error);
      throw error;
    }
  }

  async analyzeImage(imageData: Buffer): Promise<ImageAnalysisResult> {
    try {
      // 验证图像数据
      if (!this.isValidImageBuffer(imageData)) {
        throw new Error('Invalid image data');
      }

      // 使用SmolVLM模型分析图像
      const analysis = await this.model.analyze(imageData);
      
      return {
        description: analysis.description,
        objects: analysis.objects,
        attributes: analysis.attributes,
        confidence: 0.95 // TODO: 从模型获取实际的置信度
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  private isValidImageBuffer(buffer: Buffer): boolean {
    // 简单的JPG文件头验证
    if (buffer.length < 2) return false;
    return buffer[0] === 0xFF && buffer[1] === 0xD8;
  }

  async generateJsonMapping(
    imageAnalysis: ImageAnalysisResult,
    schema?: SchemaDefinition,
    customRules?: MappingRule[]
  ): Promise<Record<string, any>> {
    // 默认映射规则
    const defaultRules: MappingRule[] = [
      {
        source: 'description',
        target: 'imageContent.description'
      },
      {
        source: 'objects',
        target: 'imageContent.detectedObjects',
        transform: [
          {
            type: 'filter',
            params: {
              predicate: (item: string) => item.length > 0
            }
          }
        ]
      },
      {
        source: 'attributes',
        target: 'imageContent.attributes'
      }
    ];

    // 合并自定义规则
    const rules = [...defaultRules, ...(customRules || [])];

    // 创建映射上下文
    const context: MappingContext = {
      sourceData: imageAnalysis,
      targetSchema: schema,
      rules,
      options: {
        strictMapping: true,
        validateSchema: true,
        preserveNull: false
      }
    };

    // 使用映射处理器生成结果
    const mappedData = this.mappingProcessor.process(context);

    // 添加元数据
    return {
      ...mappedData,
      metadata: {
        timestamp: new Date().toISOString(),
        confidence: imageAnalysis.confidence || 0.95,
        processingDetails: {
          model: 'SmolVLM',
          version: '1.0.0'
        }
      }
    };
  }
}
