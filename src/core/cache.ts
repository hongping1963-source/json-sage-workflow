interface CacheOptions {
    maxSize?: number;        // 最大缓存条目数
    ttl?: number;           // 缓存生存时间（毫秒）
    smartPruning?: boolean; // 是否启用智能清理
}

interface CacheEntry<T> {
    value: T;
    timestamp: number;
    accessCount: number;
    lastAccess: number;
    size: number;
}

export class SmartCache<T> {
    private cache: Map<string, CacheEntry<T>> = new Map();
    private options: Required<CacheOptions>;
    private totalSize: number = 0;

    constructor(options: CacheOptions = {}) {
        this.options = {
            maxSize: 1000,
            ttl: 3600000, // 1小时
            smartPruning: true,
            ...options
        };
    }

    set(key: string, value: T): void {
        const size = this.calculateSize(value);
        
        // 如果新项目太大，直接返回
        if (size > this.options.maxSize) {
            console.warn(`Cache item too large: ${size} bytes`);
            return;
        }

        // 确保有足够空间
        this.ensureCapacity(size);

        const entry: CacheEntry<T> = {
            value,
            timestamp: Date.now(),
            accessCount: 0,
            lastAccess: Date.now(),
            size
        };

        this.cache.set(key, entry);
        this.totalSize += size;
    }

    get(key: string): T | undefined {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return undefined;
        }

        // 检查是否过期
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.totalSize -= entry.size;
            return undefined;
        }

        // 更新访问统计
        entry.accessCount++;
        entry.lastAccess = Date.now();

        return entry.value;
    }

    private calculateSize(value: T): number {
        try {
            const str = JSON.stringify(value);
            return str.length * 2; // 假设每个字符占用2字节
        } catch {
            return 0;
        }
    }

    private isExpired(entry: CacheEntry<T>): boolean {
        return Date.now() - entry.timestamp > this.options.ttl;
    }

    private ensureCapacity(requiredSize: number): void {
        if (this.totalSize + requiredSize <= this.options.maxSize) {
            return;
        }

        if (this.options.smartPruning) {
            this.smartPrune(requiredSize);
        } else {
            this.simplePrune(requiredSize);
        }
    }

    private smartPrune(requiredSize: number): void {
        // 计算每个条目的分数
        const scores = new Map<string, number>();
        
        for (const [key, entry] of this.cache.entries()) {
            // 分数计算考虑：
            // 1. 访问频率
            // 2. 最后访问时间
            // 3. 条目大小
            const timeFactor = (Date.now() - entry.lastAccess) / this.options.ttl;
            const accessFactor = Math.log(entry.accessCount + 1);
            const sizeFactor = entry.size / this.options.maxSize;

            const score = (accessFactor / timeFactor) * (1 / sizeFactor);
            scores.set(key, score);
        }

        // 按分数排序并删除低分条目
        const sortedEntries = Array.from(scores.entries())
            .sort((a, b) => a[1] - b[1]);

        let freedSpace = 0;
        for (const [key] of sortedEntries) {
            const entry = this.cache.get(key)!;
            this.cache.delete(key);
            freedSpace += entry.size;
            this.totalSize -= entry.size;

            if (this.totalSize + requiredSize <= this.options.maxSize) {
                break;
            }
        }
    }

    private simplePrune(requiredSize: number): void {
        // 简单地删除最旧的条目
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

        for (const [key, entry] of entries) {
            this.cache.delete(key);
            this.totalSize -= entry.size;

            if (this.totalSize + requiredSize <= this.options.maxSize) {
                break;
            }
        }
    }

    // 获取缓存统计信息
    getStats() {
        return {
            totalSize: this.totalSize,
            itemCount: this.cache.size,
            maxSize: this.options.maxSize,
            utilization: this.totalSize / this.options.maxSize,
            averageAccessCount: this.calculateAverageAccessCount()
        };
    }

    private calculateAverageAccessCount(): number {
        if (this.cache.size === 0) return 0;
        
        let total = 0;
        for (const entry of this.cache.values()) {
            total += entry.accessCount;
        }
        return total / this.cache.size;
    }
}
