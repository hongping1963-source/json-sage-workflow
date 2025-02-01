import { ModelVersion } from './manager';

/**
 * 模型注册表接口
 */
export interface ModelRegistry {
  /**
   * 注册模型版本
   */
  register(version: ModelVersion): Promise<void>;

  /**
   * 获取模型版本信息
   */
  getVersion(version: string): Promise<ModelVersion | null>;

  /**
   * 获取所有版本
   */
  getAllVersions(): Promise<ModelVersion[]>;

  /**
   * 更新版本信息
   */
  updateVersion(version: string, updates: Partial<ModelVersion>): Promise<void>;

  /**
   * 删除版本
   */
  deleteVersion(version: string): Promise<void>;
}

/**
 * 本地文件系统注册表
 */
export class LocalRegistry implements ModelRegistry {
  private versions: Map<string, ModelVersion>;

  constructor() {
    this.versions = new Map();
  }

  async register(version: ModelVersion): Promise<void> {
    this.versions.set(version.version, version);
  }

  async getVersion(version: string): Promise<ModelVersion | null> {
    return this.versions.get(version) || null;
  }

  async getAllVersions(): Promise<ModelVersion[]> {
    return Array.from(this.versions.values());
  }

  async updateVersion(
    version: string,
    updates: Partial<ModelVersion>
  ): Promise<void> {
    const existing = this.versions.get(version);
    if (!existing) {
      throw new Error(`Version ${version} not found`);
    }
    this.versions.set(version, { ...existing, ...updates });
  }

  async deleteVersion(version: string): Promise<void> {
    this.versions.delete(version);
  }
}

/**
 * 远程HTTP注册表
 */
export class RemoteRegistry implements ModelRegistry {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async register(version: ModelVersion): Promise<void> {
    const response = await fetch(`${this.baseUrl}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(version)
    });

    if (!response.ok) {
      throw new Error(`Failed to register version: ${response.statusText}`);
    }
  }

  async getVersion(version: string): Promise<ModelVersion | null> {
    const response = await fetch(`${this.baseUrl}/versions/${version}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get version: ${response.statusText}`);
    }
    return await response.json();
  }

  async getAllVersions(): Promise<ModelVersion[]> {
    const response = await fetch(`${this.baseUrl}/versions`);
    if (!response.ok) {
      throw new Error(`Failed to get versions: ${response.statusText}`);
    }
    return await response.json();
  }

  async updateVersion(
    version: string,
    updates: Partial<ModelVersion>
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/versions/${version}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update version: ${response.statusText}`);
    }
  }

  async deleteVersion(version: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/versions/${version}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete version: ${response.statusText}`);
    }
  }
}

/**
 * 复合注册表（支持多个注册表）
 */
export class CompositeRegistry implements ModelRegistry {
  private registries: ModelRegistry[];

  constructor(registries: ModelRegistry[]) {
    this.registries = registries;
  }

  async register(version: ModelVersion): Promise<void> {
    await Promise.all(
      this.registries.map(registry => registry.register(version))
    );
  }

  async getVersion(version: string): Promise<ModelVersion | null> {
    for (const registry of this.registries) {
      const result = await registry.getVersion(version);
      if (result) {
        return result;
      }
    }
    return null;
  }

  async getAllVersions(): Promise<ModelVersion[]> {
    const allVersions = await Promise.all(
      this.registries.map(registry => registry.getAllVersions())
    );
    
    // 合并并去重
    const versions = new Map<string, ModelVersion>();
    allVersions.flat().forEach(version => {
      versions.set(version.version, version);
    });
    
    return Array.from(versions.values());
  }

  async updateVersion(
    version: string,
    updates: Partial<ModelVersion>
  ): Promise<void> {
    await Promise.all(
      this.registries.map(registry => registry.updateVersion(version, updates))
    );
  }

  async deleteVersion(version: string): Promise<void> {
    await Promise.all(
      this.registries.map(registry => registry.deleteVersion(version))
    );
  }
}
