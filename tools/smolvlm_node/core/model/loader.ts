import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
import { createHash } from 'crypto';

/**
 * 模型加载配置
 */
export interface ModelLoadConfig {
  // 本地模型路径或远程URL
  path: string;
  // 模型缓存目录
  cacheDir?: string;
  // 是否验证模型完整性
  verify?: boolean;
  // 模型hash（用于验证）
  expectedHash?: string;
  // 进度回调
  onProgress?: (progress: number) => void;
}

/**
 * 模型加载器
 * 负责模型文件的加载、缓存和验证
 */
export class ModelLoader {
  private readonly defaultCacheDir: string;

  constructor() {
    this.defaultCacheDir = path.join(process.cwd(), '.cache', 'models');
  }

  /**
   * 加载模型文件
   */
  async loadModel(config: ModelLoadConfig): Promise<Buffer> {
    try {
      // 1. 规范化配置
      const finalConfig = this.normalizeConfig(config);

      // 2. 确保缓存目录存在
      await this.ensureCacheDir(finalConfig.cacheDir!);

      // 3. 获取模型数据
      const modelData = await this.getModelData(finalConfig);

      // 4. 验证模型完整性
      if (finalConfig.verify && finalConfig.expectedHash) {
        await this.verifyModel(modelData, finalConfig.expectedHash);
      }

      return modelData;
    } catch (error) {
      throw new Error(`Failed to load model: ${error.message}`);
    }
  }

  /**
   * 清理缓存
   */
  async clearCache(cacheDir?: string): Promise<void> {
    const dir = cacheDir || this.defaultCacheDir;
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      throw new Error(`Failed to clear cache: ${error.message}`);
    }
  }

  // 私有辅助方法
  private normalizeConfig(config: ModelLoadConfig): ModelLoadConfig {
    return {
      ...config,
      cacheDir: config.cacheDir || this.defaultCacheDir,
      verify: config.verify !== false
    };
  }

  private async ensureCacheDir(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create cache directory: ${error.message}`);
    }
  }

  private async getModelData(config: ModelLoadConfig): Promise<Buffer> {
    const isUrl = config.path.startsWith('http://') || config.path.startsWith('https://');
    
    if (isUrl) {
      return await this.downloadModel(config);
    } else {
      return await this.loadLocalModel(config.path);
    }
  }

  private async downloadModel(config: ModelLoadConfig): Promise<Buffer> {
    const cacheFile = path.join(config.cacheDir!, this.getModelFileName(config.path));

    try {
      // 检查缓存
      if (await this.checkCache(cacheFile)) {
        return await fs.readFile(cacheFile);
      }

      // 下载模型
      const response = await axios({
        method: 'get',
        url: config.path,
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          if (config.onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            config.onProgress(progress);
          }
        }
      });

      const modelData = Buffer.from(response.data);

      // 保存到缓存
      await fs.writeFile(cacheFile, modelData);

      return modelData;
    } catch (error) {
      throw new Error(`Failed to download model: ${error.message}`);
    }
  }

  private async loadLocalModel(filepath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filepath);
    } catch (error) {
      throw new Error(`Failed to load local model: ${error.message}`);
    }
  }

  private async checkCache(cacheFile: string): Promise<boolean> {
    try {
      await fs.access(cacheFile);
      return true;
    } catch {
      return false;
    }
  }

  private getModelFileName(url: string): string {
    const hash = createHash('md5').update(url).digest('hex');
    const ext = path.extname(url) || '.onnx';
    return `model-${hash}${ext}`;
  }

  private async verifyModel(data: Buffer, expectedHash: string): Promise<void> {
    const hash = createHash('sha256').update(data).digest('hex');
    if (hash !== expectedHash) {
      throw new Error('Model verification failed: hash mismatch');
    }
  }
}
