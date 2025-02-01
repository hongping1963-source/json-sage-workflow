import { VisionProcessor } from '../../src/vision/smolvlm';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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
    const imagePath = join(__dirname, '../fixtures/example.jpg');
    console.log(`Reading image from ${imagePath}`);
    const imageData = readFileSync(imagePath);

    // 分析图像
    console.log('Analyzing image...');
    const analysis = await processor.analyzeImage(imageData);
    console.log('\nImage Analysis Result:');
    console.log(JSON.stringify(analysis, null, 2));

    // 生成基本JSON映射
    console.log('\nGenerating basic JSON mapping...');
    const basicMapping = await processor.generateJsonMapping(analysis);
    console.log('\nBasic JSON Mapping:');
    console.log(JSON.stringify(basicMapping, null, 2));

    // 使用自定义规则
    console.log('\nGenerating custom JSON mapping...');
    const customRules = [
      {
        source: 'description',
        target: 'content.summary',
        transform: [
          {
            type: 'custom',
            customFunction: (text: string) => {
              return text.split('.')[0] + '.'; // 只保留第一句
            }
          }
        ]
      },
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
              return items.map(item => `#${item}`);
            }
          }
        ]
      },
      {
        source: 'attributes.dominantColors',
        target: 'content.colors',
        condition: {
          type: 'custom',
          customFunction: (colors: string[]) => colors.length > 0
        }
      }
    ];

    const customMapping = await processor.generateJsonMapping(analysis, undefined, customRules);
    console.log('\nCustom JSON Mapping:');
    console.log(JSON.stringify(customMapping, null, 2));

    // 保存结果
    const outputPath = join(__dirname, 'output');
    writeFileSync(join(outputPath, 'analysis.json'), JSON.stringify(analysis, null, 2));
    writeFileSync(join(outputPath, 'basic_mapping.json'), JSON.stringify(basicMapping, null, 2));
    writeFileSync(join(outputPath, 'custom_mapping.json'), JSON.stringify(customMapping, null, 2));
    console.log('\nResults saved to output directory');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
