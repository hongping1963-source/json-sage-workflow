import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';

interface ModelLoadOptions {
  path: string;
  verify?: boolean;
  onProgress?: (progress: number) => void;
  useCache?: boolean;
}

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
  private static readonly CACHE_DIR = path.join(os.tmpdir(), 'smolvlm-cache');
  private modelCache: Map<string, Buffer> = new Map();
  private readonly defaultCacheDir: string;

  constructor() {
    this.defaultCacheDir = path.join(process.cwd(), '.cache', 'models');
    this.ensureCacheDirectory();
  }

  private async ensureCacheDirectory() {
    try {
      await fs.mkdir(this.CACHE_DIR, { recursive: true });
    } catch (error) {
      console.warn(`Failed to create cache directory: ${error.message}`);
    }
  }

  private async getCacheKey(modelPath: string): Promise<string> {
    const stats = await fs.stat(modelPath);
    const hash = crypto.createHash('md5')
      .update(`${modelPath}:${stats.size}:${stats.mtime.getTime()}`)
      .digest('hex');
    return hash;
  }

  private getCachePath(cacheKey: string): string {
    return path.join(this.CACHE_DIR, `${cacheKey}.cache`);
  }

  private async loadFromCache(cacheKey: string): Promise<Buffer | null> {
    try {
      const cachePath = this.getCachePath(cacheKey);
      const cached = this.modelCache.get(cacheKey);
      if (cached) {
        return cached;
      }
      const data = await fs.readFile(cachePath);
      this.modelCache.set(cacheKey, data);
      return data;
    } catch {
      return null;
    }
  }

  private async saveToCache(cacheKey: string, data: Buffer): Promise<void> {
    try {
      const cachePath = this.getCachePath(cacheKey);
      await fs.writeFile(cachePath, data);
      this.modelCache.set(cacheKey, data);
    } catch (error) {
      console.warn(`Failed to cache model: ${error.message}`);
    }
  }

  async loadModel(config: ModelLoadConfig): Promise<Buffer> {
    const { path: modelPath, verify = true, onProgress, useCache = true, cacheDir, expectedHash } = config;

    try {
      // 1. 规范化配置
      const finalConfig = this.normalizeConfig(config);

      // 2. 尝试从缓存加载
      if (useCache) {
        const cacheKey = await this.getCacheKey(modelPath);
        const cached = await this.loadFromCache(cacheKey);
        if (cached) {
          onProgress?.(100);
          return cached;
        }
      }

      // 3. 确保缓存目录存在
      await this.ensureCacheDir(finalConfig.cacheDir!);

      // 4. 获取模型数据
      const modelData = await this.getModelData(finalConfig);

      // 5. 验证模型完整性
      if (finalConfig.verify && finalConfig.expectedHash) {
        await this.verifyModel(modelData, finalConfig.expectedHash);
      }

      // 6. 缓存模型
      if (useCache) {
        const cacheKey = await this.getCacheKey(modelPath);
        await this.saveToCache(cacheKey, modelData);
      }

      return modelData;
    } catch (error) {
      throw new Error(`Failed to load model: ${error.message}`);
    }
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
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const ext = path.extname(url) || '.onnx';
    return `model-${hash}${ext}`;
  }

  private async verifyModel(data: Buffer, expectedHash: string): Promise<void> {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    if (hash !== expectedHash) {
      throw new Error('Model verification failed: hash mismatch');
    }
  }

  private normalizeConfig(config: ModelLoadConfig): ModelLoadConfig {
    return {
      ...config,
      cacheDir: config.cacheDir || this.defaultCacheDir,
      verify: config.verify !== false
    };
  }

  async preloadModel(modelPath: string): Promise<void> {
    try {
      await this.loadModel({
        path: modelPath,
        verify: true,
        useCache: true
      });
    } catch (error) {
      console.warn(`Failed to preload model: ${error.message}`);
    }
  }

  clearCache(): void {
    this.modelCache.clear();
  }
}
