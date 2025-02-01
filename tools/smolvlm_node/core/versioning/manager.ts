import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { Logger } from '../utils/logger';
import { SmolVLMError } from '../utils/error';

/**
 * 模型版本信息
 */
export interface ModelVersion {
  id: string;
  version: string;
  timestamp: string;
  hash: string;
  size: number;
  config: any;
  metrics?: {
    accuracy?: number;
    performance?: number;
    memoryUsage?: number;
  };
  metadata?: Record<string, any>;
}

/**
 * 版本管理器配置
 */
export interface VersionManagerConfig {
  storageDir: string;
  maxVersions?: number;
  autoCleanup?: boolean;
}

/**
 * 模型版本管理器
 */
export class VersionManager {
  private readonly config: VersionManagerConfig;
  private readonly logger: Logger;
  private versions: Map<string, ModelVersion>;

  constructor(config: VersionManagerConfig) {
    this.config = {
      maxVersions: 10,
      autoCleanup: true,
      ...config
    };
    this.logger = Logger.getInstance();
    this.versions = new Map();
  }

  /**
   * 初始化版本管理器
   */
  async initialize(): Promise<void> {
    try {
      // 1. 确保存储目录存在
      await fs.mkdir(this.config.storageDir, { recursive: true });

      // 2. 加载版本信息
      await this.loadVersions();

      this.logger.info('Version manager initialized', {
        storageDir: this.config.storageDir,
        versionsLoaded: this.versions.size
      });
    } catch (error) {
      throw new SmolVLMError(
        'SYSTEM_ERROR',
        `Failed to initialize version manager: ${error.message}`,
        error
      );
    }
  }

  /**
   * 创建新版本
   */
  async createVersion(
    modelPath: string,
    version: string,
    config: any,
    metadata?: Record<string, any>
  ): Promise<ModelVersion> {
    try {
      // 1. 验证版本号
      if (this.versions.has(version)) {
        throw new Error(`Version ${version} already exists`);
      }

      // 2. 计算模型hash
      const hash = await this.calculateFileHash(modelPath);
      const stats = await fs.stat(modelPath);

      // 3. 创建版本信息
      const versionInfo: ModelVersion = {
        id: createHash('md5').update(`${version}-${Date.now()}`).digest('hex'),
        version,
        timestamp: new Date().toISOString(),
        hash,
        size: stats.size,
        config,
        metadata
      };

      // 4. 保存模型文件
      const targetPath = path.join(this.config.storageDir, `${versionInfo.id}.onnx`);
      await fs.copyFile(modelPath, targetPath);

      // 5. 保存版本信息
      this.versions.set(version, versionInfo);
      await this.saveVersions();

      // 6. 自动清理旧版本
      if (this.config.autoCleanup) {
        await this.cleanup();
      }

      this.logger.info('Created new model version', { version: versionInfo });
      return versionInfo;
    } catch (error) {
      throw new SmolVLMError(
        'SYSTEM_ERROR',
        `Failed to create version: ${error.message}`,
        error
      );
    }
  }

  /**
   * 获取版本信息
   */
  getVersion(version: string): ModelVersion | undefined {
    return this.versions.get(version);
  }

  /**
   * 获取所有版本
   */
  getAllVersions(): ModelVersion[] {
    return Array.from(this.versions.values())
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /**
   * 更新版本信息
   */
  async updateVersion(
    version: string,
    updates: Partial<ModelVersion>
  ): Promise<ModelVersion> {
    const versionInfo = this.versions.get(version);
    if (!versionInfo) {
      throw new Error(`Version ${version} not found`);
    }

    // 更新版本信息
    const updatedVersion = {
      ...versionInfo,
      ...updates,
      timestamp: new Date().toISOString()
    };

    this.versions.set(version, updatedVersion);
    await this.saveVersions();

    this.logger.info('Updated version info', { version: updatedVersion });
    return updatedVersion;
  }

  /**
   * 删除版本
   */
  async deleteVersion(version: string): Promise<void> {
    const versionInfo = this.versions.get(version);
    if (!versionInfo) {
      throw new Error(`Version ${version} not found`);
    }

    try {
      // 1. 删除模型文件
      const modelPath = path.join(this.config.storageDir, `${versionInfo.id}.onnx`);
      await fs.unlink(modelPath);

      // 2. 删除版本信息
      this.versions.delete(version);
      await this.saveVersions();

      this.logger.info('Deleted version', { version: versionInfo });
    } catch (error) {
      throw new SmolVLMError(
        'SYSTEM_ERROR',
        `Failed to delete version: ${error.message}`,
        error
      );
    }
  }

  /**
   * 比较两个版本
   */
  async compareVersions(
    version1: string,
    version2: string
  ): Promise<Record<string, any>> {
    const v1 = this.versions.get(version1);
    const v2 = this.versions.get(version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    return {
      size: {
        difference: v2.size - v1.size,
        percentage: ((v2.size - v1.size) / v1.size) * 100
      },
      metrics: {
        accuracy: {
          difference: (v2.metrics?.accuracy || 0) - (v1.metrics?.accuracy || 0),
          percentage: (((v2.metrics?.accuracy || 0) - (v1.metrics?.accuracy || 0)) / (v1.metrics?.accuracy || 1)) * 100
        },
        performance: {
          difference: (v2.metrics?.performance || 0) - (v1.metrics?.performance || 0),
          percentage: (((v2.metrics?.performance || 0) - (v1.metrics?.performance || 0)) / (v1.metrics?.performance || 1)) * 100
        }
      },
      configChanges: this.compareConfigs(v1.config, v2.config)
    };
  }

  // 私有辅助方法
  private async loadVersions(): Promise<void> {
    try {
      const versionFile = path.join(this.config.storageDir, 'versions.json');
      const data = await fs.readFile(versionFile, 'utf-8');
      const versions = JSON.parse(data);
      
      this.versions = new Map(Object.entries(versions));
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        this.versions = new Map();
      } else {
        throw error;
      }
    }
  }

  private async saveVersions(): Promise<void> {
    const versionFile = path.join(this.config.storageDir, 'versions.json');
    const data = JSON.stringify(Object.fromEntries(this.versions), null, 2);
    await fs.writeFile(versionFile, data, 'utf-8');
  }

  private async calculateFileHash(filepath: string): Promise<string> {
    const content = await fs.readFile(filepath);
    return createHash('sha256').update(content).digest('hex');
  }

  private async cleanup(): Promise<void> {
    const versions = this.getAllVersions();
    if (versions.length <= this.config.maxVersions!) {
      return;
    }

    // 删除最旧的版本
    const versionsToDelete = versions.slice(this.config.maxVersions!);
    for (const version of versionsToDelete) {
      await this.deleteVersion(version.version);
    }
  }

  private compareConfigs(config1: any, config2: any): Record<string, any> {
    const changes: Record<string, any> = {};

    // 递归比较配置对象
    const compare = (obj1: any, obj2: any, path: string = '') => {
      for (const key in obj1) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in obj2)) {
          changes[currentPath] = { type: 'removed', oldValue: obj1[key] };
        } else if (typeof obj1[key] !== typeof obj2[key]) {
          changes[currentPath] = {
            type: 'type_changed',
            oldValue: obj1[key],
            newValue: obj2[key]
          };
        } else if (typeof obj1[key] === 'object') {
          compare(obj1[key], obj2[key], currentPath);
        } else if (obj1[key] !== obj2[key]) {
          changes[currentPath] = {
            type: 'value_changed',
            oldValue: obj1[key],
            newValue: obj2[key]
          };
        }
      }

      // 检查新增的配置项
      for (const key in obj2) {
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in obj1)) {
          changes[currentPath] = { type: 'added', newValue: obj2[key] };
        }
      }
    };

    compare(config1, config2);
    return changes;
  }
}
