import LRU from 'lru-cache';
import * as crypto from 'crypto';

interface CacheConfig {
  maxSize: number;        // 最大缓存大小（字节）
  maxAge: number;         // 缓存项最大年龄（毫秒）
  updateAgeOnGet: boolean;// 访问时是否更新年龄
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memory: number;
}

export class CacheManager {
  private modelCache: LRU<string, Buffer>;
  private inferenceCache: LRU<string, any>;
  private stats: CacheStats;

  constructor(config: CacheConfig = {
    maxSize: 1024 * 1024 * 1024, // 1GB
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    updateAgeOnGet: true
  }) {
    this.modelCache = new LRU({
      maxSize: config.maxSize,
      maxAge: config.maxAge,
      updateAgeOnGet: config.updateAgeOnGet,
      sizeCalculation: (value) => value.length
    });

    this.inferenceCache = new LRU({
      maxSize: config.maxSize / 2, // 推理缓存使用一半空间
      maxAge: config.maxAge,
      updateAgeOnGet: config.updateAgeOnGet,
      sizeCalculation: (value) => JSON.stringify(value).length
    });

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memory: 0
    };
  }

  // 模型缓存方法
  async cacheModel(modelPath: string, modelData: Buffer): Promise<void> {
    const key = await this.getModelCacheKey(modelPath);
    this.modelCache.set(key, modelData);
    this.updateStats();
  }

  async getCachedModel(modelPath: string): Promise<Buffer | null> {
    const key = await this.getModelCacheKey(modelPath);
    const cached = this.modelCache.get(key);
    
    if (cached) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    
    this.updateStats();
    return cached || null;
  }

  private async getModelCacheKey(modelPath: string): Promise<string> {
    const stats = await fs.stat(modelPath);
    return crypto.createHash('md5')
      .update(`${modelPath}:${stats.size}:${stats.mtime.getTime()}`)
      .digest('hex');
  }

  // 推理结果缓存方法
  cacheInferenceResult(input: any, result: any): void {
    const key = this.getInferenceCacheKey(input);
    this.inferenceCache.set(key, result);
    this.updateStats();
  }

  getCachedInferenceResult(input: any): any | null {
    const key = this.getInferenceCacheKey(input);
    const cached = this.inferenceCache.get(key);
    
    if (cached) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    
    this.updateStats();
    return cached || null;
  }

  private getInferenceCacheKey(input: any): string {
    return crypto.createHash('md5')
      .update(JSON.stringify(input))
      .digest('hex');
  }

  // 缓存管理方法
  clear(): void {
    this.modelCache.clear();
    this.inferenceCache.clear();
    this.resetStats();
  }

  prune(): void {
    this.modelCache.purgeStale();
    this.inferenceCache.purgeStale();
    this.updateStats();
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateStats(): void {
    this.stats.size = this.modelCache.size + this.inferenceCache.size;
    this.stats.memory = 
      Array.from(this.modelCache.values()).reduce((sum, item) => sum + item.length, 0) +
      Array.from(this.inferenceCache.values()).reduce((sum, item) => sum + JSON.stringify(item).length, 0);
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memory: 0
    };
  }
}
