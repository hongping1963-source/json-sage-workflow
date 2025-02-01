import { VisionProcessor } from '../../src/vision/smolvlm';
import { SchemaDefinition, MappingRule } from '../../src/vision/types';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

// 定义输出Schema
const outputSchema: SchemaDefinition = {
  type: 'object',
  properties: {
    content: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        summary: { type: 'string' },
        tags: {
          type: 'array',
          items: { type: 'string' }
        },
        metadata: {
          type: 'object',
          properties: {
            dimensions: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' }
              },
              required: ['width', 'height']
            },
            format: { type: 'string' },
            colors: {
              type: 'array',
              items: { type: 'string' }
            },
            quality: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                issues: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          },
          required: ['dimensions', 'format']
        }
      },
      required: ['description', 'metadata']
    },
    processing: {
      type: 'object',
      properties: {
        timestamp: { type: 'string' },
        duration: { type: 'number' },
        model: { type: 'string' },
        version: { type: 'string' }
      },
      required: ['timestamp', 'model', 'version']
    }
  },
  required: ['content', 'processing']
};

// 定义映射规则
const mappingRules: MappingRule[] = [
  // 基本字段映射
  {
    source: 'description',
    target: 'content.description'
  },
  {
    source: 'description',
    target: 'content.summary',
    transform: [
      {
        type: 'custom',
        customFunction: (text: string) => {
          const sentences = text.split('.');
          return sentences[0].trim() + '.';
        }
      }
    ]
  },
  // 对象标签处理
  {
    source: 'objects',
    target: 'content.tags',
    transform: [
      {
        type: 'filter',
        params: {
          predicate: (item: string) => item.length > 3
        }
      },
      {
        type: 'custom',
        customFunction: (items: string[]) => {
          return [...new Set(items)].map(item => `#${item.toLowerCase()}`);
        }
      }
    ]
  },
  // 元数据处理
  {
    source: 'attributes',
    target: 'content.metadata',
    transform: [
      {
        type: 'custom',
        customFunction: (attrs: any) => ({
          dimensions: attrs.dimensions,
          format: attrs.format,
          colors: attrs.dominantColors,
          quality: {
            score: calculateQualityScore(attrs),
            issues: detectQualityIssues(attrs)
          }
        })
      }
    ]
  }
];

// 辅助函数
function calculateQualityScore(attributes: any): number {
  let score = 1.0;
  
  // 基于分辨率的评分
  const { width, height } = attributes.dimensions;
  const resolution = width * height;
  if (resolution < 1000000) score *= 0.8; // 小于1MP
  if (resolution < 500000) score *= 0.7; // 小于0.5MP

  // 基于格式的评分
  if (attributes.format === 'jpeg') score *= 0.9;
  if (attributes.hasAlpha) score *= 1.1;

  // 限制分数范围
  return Math.min(Math.max(score, 0), 1);
}

function detectQualityIssues(attributes: any): string[] {
  const issues: string[] = [];
  
  // 检查分辨率
  const { width, height } = attributes.dimensions;
  if (width * height < 500000) {
    issues.push('low_resolution');
  }

  // 检查宽高比
  const aspectRatio = width / height;
  if (aspectRatio > 2 || aspectRatio < 0.5) {
    issues.push('unusual_aspect_ratio');
  }

  // 检查格式
  if (attributes.format !== 'png' && attributes.format !== 'jpeg') {
    issues.push('non_standard_format');
  }

  return issues;
}

async function processImage(
  processor: VisionProcessor,
  imagePath: string
): Promise<Record<string, any>> {
  console.log(`Processing ${imagePath}...`);
  const startTime = Date.now();

  try {
    // 读取并分析图像
    const imageData = readFileSync(imagePath);
    const analysis = await processor.analyzeImage(imageData);

    // 生成映射
    const result = await processor.generateJsonMapping(
      analysis,
      outputSchema,
      mappingRules
    );

    // 添加处理信息
    result.processing = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      model: 'SmolVLM',
      version: '1.0.0'
    };

    return result;
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error);
    throw error;
  }
}

async function processBatch(
  inputDir: string,
  outputDir: string,
  batchSize: number = 5
) {
  try {
    // 初始化处理器
    const processor = new VisionProcessor({
      modelPath: join(__dirname, '../../models/smolvlm-v1'),
      deviceType: 'cpu',
      maxTokens: 512
    });

    console.log('Initializing VisionProcessor...');
    await processor.initialize();

    // 获取所有图像文件
    const imageFiles = readdirSync(inputDir)
      .filter(file => ['.jpg', '.jpeg', '.png'].includes(extname(file).toLowerCase()));

    console.log(`Found ${imageFiles.length} images to process`);

    // 批量处理
    for (let i = 0; i < imageFiles.length; i += batchSize) {
      const batch = imageFiles.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}...`);

      const results = await Promise.all(
        batch.map(async file => {
          const imagePath = join(inputDir, file);
          const result = await processImage(processor, imagePath);
          
          // 保存结果
          const outputPath = join(outputDir, `${file}.json`);
          writeFileSync(outputPath, JSON.stringify(result, null, 2));
          
          return {
            file,
            success: true,
            outputPath
          };
        }).map(p => p.catch(error => ({
          file: batch[batch.indexOf(p as any)],
          success: false,
          error: error.message
        })))
      );

      // 打印批处理结果
      results.forEach(result => {
        if (result.success) {
          console.log(`✓ ${result.file} -> ${result.outputPath}`);
        } else {
          console.error(`✗ ${result.file} - ${result.error}`);
        }
      });
    }

    console.log('\nBatch processing complete!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// 运行示例
const inputDir = join(__dirname, '../fixtures/images');
const outputDir = join(__dirname, 'output');
processBatch(inputDir, outputDir, 3);
