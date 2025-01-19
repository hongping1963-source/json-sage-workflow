const pako = require('pako');

class JsonCompressor {
    constructor(options = {}) {
        this.threshold = options.threshold || 1024; // 默认1KB
        this.level = options.level || 6; // 默认压缩级别
        this.memoryLimit = options.memoryLimit || 1024 * 1024; // 默认1MB
    }

    compress(data) {
        const jsonString = JSON.stringify(data);
        
        // 如果数据小于阈值，直接返回JSON字符串
        if (jsonString.length < this.threshold) {
            return jsonString;
        }

        try {
            // 检查内存使用
            if (jsonString.length > this.memoryLimit) {
                throw new Error('Data size exceeds memory limit');
            }

            // 压缩数据
            const compressed = pako.deflate(jsonString, {
                level: this.level
            });

            return compressed;
        } catch (error) {
            console.error('Compression error:', error);
            // 如果压缩失败，返回原始JSON字符串
            return jsonString;
        }
    }

    decompress(data) {
        try {
            // 如果是字符串，尝试直接解析
            if (typeof data === 'string') {
                return JSON.parse(data);
            }

            // 解压缩数据
            const decompressed = pako.inflate(data, { to: 'string' });
            return JSON.parse(decompressed);
        } catch (error) {
            throw new Error('Decompression failed: ' + error.message);
        }
    }

    analyzeCompression(data) {
        const originalString = JSON.stringify(data);
        const originalSize = originalString.length;
        
        const compressed = this.compress(data);
        const compressedSize = compressed instanceof Uint8Array ? 
            compressed.length : compressed.length;
        
        const compressionRatio = compressedSize / originalSize;
        const compressionSavings = ((1 - compressionRatio) * 100).toFixed(2);

        return {
            originalSize,
            compressedSize,
            compressionRatio,
            compressionSavings: parseFloat(compressionSavings),
            level: this.level
        };
    }
}

module.exports = { JsonCompressor };
