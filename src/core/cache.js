class SmartCache {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 1024 * 1024; // 默认1MB
        this.ttl = options.ttl || 3600000; // 默认1小时
        this.smartPruning = options.smartPruning || false;
        
        this.cache = new Map();
        this.metadata = new Map();
        this.totalSize = 0;
    }

    set(key, value) {
        const size = this.calculateSize(value);
        
        // 检查单个项目大小
        if (size > this.maxSize) {
            return false;
        }

        // 如果需要，清理空间
        this.ensureSpace(size);

        // 存储数据和元数据
        this.cache.set(key, value);
        this.metadata.set(key, {
            size,
            accessCount: 0,
            lastAccessed: Date.now(),
            expires: Date.now() + this.ttl
        });

        this.totalSize += size;
        return true;
    }

    get(key) {
        // 检查是否存在
        if (!this.cache.has(key)) {
            return undefined;
        }

        const metadata = this.metadata.get(key);
        
        // 检查是否过期
        if (Date.now() > metadata.expires) {
            this.delete(key);
            return undefined;
        }

        // 更新访问统计
        metadata.accessCount++;
        metadata.lastAccessed = Date.now();
        metadata.expires = Date.now() + this.ttl;

        return this.cache.get(key);
    }

    delete(key) {
        if (this.cache.has(key)) {
            const metadata = this.metadata.get(key);
            this.totalSize -= metadata.size;
            this.cache.delete(key);
            this.metadata.delete(key);
            return true;
        }
        return false;
    }

    clear() {
        this.cache.clear();
        this.metadata.clear();
        this.totalSize = 0;
    }

    calculateSize(value) {
        try {
            const str = JSON.stringify(value);
            return str.length * 2; // 假设每个字符占用2字节
        } catch (e) {
            // 如果无法序列化（例如循环引用），返回保守估计
            return 1024;
        }
    }

    ensureSpace(requiredSize) {
        if (this.totalSize + requiredSize <= this.maxSize) {
            return;
        }

        // 获取所有项目的评分
        const scores = Array.from(this.metadata.entries()).map(([key, meta]) => ({
            key,
            score: this.calculateScore(meta)
        }));

        // 按分数排序（分数低的先删除）
        scores.sort((a, b) => a.score - b.score);

        // 删除项目直到有足够空间
        for (const item of scores) {
            if (this.totalSize + requiredSize <= this.maxSize) {
                break;
            }
            this.delete(item.key);
        }
    }

    calculateScore(metadata) {
        if (!this.smartPruning) {
            return metadata.lastAccessed; // 简单的LRU
        }

        // 考虑多个因素的智能评分
        const age = Date.now() - metadata.lastAccessed;
        const accessFrequency = metadata.accessCount / age;
        const sizeScore = 1 / metadata.size;

        return (
            accessFrequency * 0.5 + // 访问频率权重
            sizeScore * 0.3 + // 大小权重
            (1 / age) * 0.2 // 年龄权重
        );
    }

    getStats() {
        let totalAccessCount = 0;
        let oldestAccess = Date.now();
        let newestAccess = 0;

        this.metadata.forEach(meta => {
            totalAccessCount += meta.accessCount;
            oldestAccess = Math.min(oldestAccess, meta.lastAccessed);
            newestAccess = Math.max(newestAccess, meta.lastAccessed);
        });

        return {
            totalSize: this.totalSize,
            itemCount: this.cache.size,
            utilization: (this.totalSize / this.maxSize) * 100,
            averageAccessCount: this.cache.size ? totalAccessCount / this.cache.size : 0,
            oldestAccess: new Date(oldestAccess).toISOString(),
            newestAccess: new Date(newestAccess).toISOString()
        };
    }
}

module.exports = { SmartCache };
