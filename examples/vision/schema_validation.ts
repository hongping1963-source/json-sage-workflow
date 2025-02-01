import { VisionProcessor } from '../../src/vision/smolvlm';
import { SchemaDefinition } from '../../src/vision/types';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// 定义输出Schema
const productSchema: SchemaDefinition = {
  type: 'object',
  properties: {
    product: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        features: {
          type: 'array',
          items: { type: 'string' }
        },
        visualAttributes: {
          type: 'object',
          properties: {
            colors: {
              type: 'array',
              items: { type: 'string' }
            },
            dimensions: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' }
              }
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
          }
        },
        metadata: {
          type: 'object',
          properties: {
            format: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      },
      required: ['name', 'description', 'features', 'visualAttributes']
    }
  }
};

// 定义映射规则
const productMappingRules = [
  // 提取产品名称
  {
    source: 'description',
    target: 'product.name',
    transform: [
      {
        type: 'custom',
        customFunction: (text: string) => {
          // 从描述中提取第一个名词短语作为产品名称
          const match = text.match(/^(?:a |an |the )?([^.!?]+?)(?=\s+(?:is|are|was|were|has|have|in|on|at|with))/i);
          return match ? match[1].trim() : 'Unknown Product';
        }
      }
    ]
  },
  // 完整描述
  {
    source: 'description',
    target: 'product.description'
  },
  // 特征列表
  {
    source: 'objects',
    target: 'product.features',
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
          return items.map(item => `Has ${item}`);
        }
      }
    ]
  },
  // 视觉属性
  {
    source: 'attributes',
    target: 'product.visualAttributes',
    transform: [
      {
        type: 'custom',
        customFunction: (attrs: any) => ({
          colors: attrs.dominantColors,
          dimensions: attrs.dimensions,
          quality: {
            score: calculateQualityScore(attrs),
            issues: detectQualityIssues(attrs)
          }
        })
      }
    ]
  },
  // 元数据
  {
    source: 'attributes',
    target: 'product.metadata',
    transform: [
      {
        type: 'custom',
        customFunction: (attrs: any) => ({
          format: attrs.format,
          timestamp: new Date().toISOString()
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

async function main() {
  try {
    // 创建VisionProcessor实例
    const processor = new VisionProcessor({
      modelPath: join(__dirname, '../../models/smolvlm-v1'),
      deviceType: 'cpu',
      maxTokens: 512
    });

    // 初始化
    console.log('Initializing VisionProcessor...');
    await processor.initialize();
    console.log('Initialization complete');

    // 读取示例图像
    const imagePath = join(__dirname, '../fixtures/product.jpg');
    console.log(`Reading image from ${imagePath}`);
    const imageData = readFileSync(imagePath);

    // 分析图像
    console.log('Analyzing image...');
    const analysis = await processor.analyzeImage(imageData);
    console.log('\nImage Analysis Result:');
    console.log(JSON.stringify(analysis, null, 2));

    // 生成带Schema验证的JSON映射
    console.log('\nGenerating JSON mapping with schema validation...');
    const mapping = await processor.generateJsonMapping(
      analysis,
      productSchema,
      productMappingRules
    );
    console.log('\nValidated JSON Mapping:');
    console.log(JSON.stringify(mapping, null, 2));

    // 保存结果
    const outputPath = join(__dirname, 'output');
    writeFileSync(
      join(outputPath, 'product_mapping.json'),
      JSON.stringify(mapping, null, 2)
    );
    console.log('\nResults saved to output directory');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
