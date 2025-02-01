/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

import { JsonSchema } from './types';

/**
 * 缓存项接口
 */
interface CacheItem<T> {
    value: T;
    timestamp: number;
}

/**
 * 缓存配置接口
 */
interface CacheConfig {
    maxSize: number;
    ttl: number;  // 过期时间（毫秒）
}

/**
 * Schema缓存类
 */
export class SchemaCache {
    private cache: Map<string, CacheItem<JsonSchema>>;
    private config: CacheConfig;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            maxSize: 1000,
            ttl: 24 * 60 * 60 * 1000, // 默认24小时
            ...config
        };
        this.cache = new Map();
    }

    /**
     * 设置缓存项
     * @param key - 缓存键
     * @param value - 缓存值
     */
    set(key: string, value: JsonSchema): void {
        // 检查缓存大小
        if (this.cache.size >= this.config.maxSize) {
            this.evictOldest();
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    /**
     * 获取缓存项
     * @param key - 缓存键
     * @returns 缓存值或undefined
     */
    get(key: string): JsonSchema | undefined {
        const item = this.cache.get(key);
        if (!item) return undefined;

        // 检查是否过期
        if (Date.now() - item.timestamp > this.config.ttl) {
            this.cache.delete(key);
            return undefined;
        }

        return item.value;
    }

    /**
     * 清除过期项
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > this.config.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * 移除最旧的缓存项
     */
    private evictOldest(): void {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const [key, item] of this.cache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
}
