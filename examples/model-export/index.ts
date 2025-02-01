import { ModelExporter, ExportFormat, ExportConfig } from '../../src/core/export/exporter';
import { VersionManager } from '../../src/core/versioning/manager';
import { Logger } from '../../src/core/utils/logger';
import * as path from 'path';

async function main() {
  // 初始化日志
  const logger = Logger.getInstance({
    level: 'info',
    filename: 'export-example.log',
    console: true
  });

  try {
    // 初始化版本管理器
    const versionManager = new VersionManager({
      storageDir: path.join(__dirname, 'versions')
    });
    await versionManager.initialize();

    // 初始化导出器
    const exporter = new ModelExporter();

    // 示例1：基本导出
    logger.info('Example 1: Basic Export');
    const basicConfig: ExportConfig = {
      format: ExportFormat.TF,
      optimize: true,
      metadata: {
        description: 'Basic export example'
      }
    };

    const basicResult = await exporter.exportModel(
      path.join(__dirname, 'models/model.onnx'),
      path.join(__dirname, 'output/basic'),
      basicConfig
    );
    logger.info('Basic export completed', { result: basicResult });

    // 示例2：带版本控制的导出
    logger.info('Example 2: Versioned Export');
    const version = await versionManager.createVersion(
      path.join(__dirname, 'models/model.onnx'),
      '1.0.0',
      { format: ExportFormat.TF }
    );

    const versionedConfig: ExportConfig = {
      format: ExportFormat.TF,
      optimize: true,
      quantize: true,
      metadata: {
        version: '1.0.0',
        description: 'Production model with version tracking'
      }
    };

    const versionedResult = await exporter.exportModel(
      path.join(__dirname, 'models/model.onnx'),
      path.join(__dirname, 'output/versioned'),
      versionedConfig,
      version
    );
    logger.info('Versioned export completed', { result: versionedResult });

    // 示例3：批量导出
    logger.info('Example 3: Batch Export');
    const models = [
      {
        path: path.join(__dirname, 'models/model1.onnx'),
        config: {
          format: ExportFormat.TF,
          optimize: true
        }
      },
      {
        path: path.join(__dirname, 'models/model2.onnx'),
        config: {
          format: ExportFormat.TFLITE,
          quantize: true
        }
      },
      {
        path: path.join(__dirname, 'models/model3.onnx'),
        config: {
          format: ExportFormat.TORCHSCRIPT,
          compress: true
        }
      }
    ];

    const batchResults = await exporter.batchExport(
      models,
      path.join(__dirname, 'output/batch')
    );
    logger.info('Batch export completed', { results: batchResults });

    // 示例4：版本比较
    logger.info('Example 4: Version Comparison');
    const newVersion = await versionManager.createVersion(
      path.join(__dirname, 'models/model.onnx'),
      '1.1.0',
      { format: ExportFormat.TF }
    );

    const comparison = await versionManager.compareVersions('1.0.0', '1.1.0');
    logger.info('Version comparison results', { comparison });

    // 示例5：错误处理
    logger.info('Example 5: Error Handling');
    try {
      await exporter.exportModel(
        'invalid/path/model.onnx',
        'output/error',
        { format: ExportFormat.TF }
      );
    } catch (error) {
      logger.error('Export failed', { error });
    }

  } catch (error) {
    logger.error('Example execution failed', { error });
    process.exit(1);
  }
}

// 运行示例
main().catch(console.error);
