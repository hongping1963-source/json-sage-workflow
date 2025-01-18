import { deflate, inflate } from 'pako';

interface CompressionOptions {
    threshold?: number;  // 触发压缩的大小阈值（字节）
    level?: number;     // 压缩级别 (1-9)
    memoryLimit?: number; // 内存使用限制（MB）
}

export class JsonCompressor {
    private options: CompressionOptions;

    constructor(options: CompressionOptions = {}) {
        this.options = {
            threshold: 1024,  // 1KB
            level: 6,
            memoryLimit: 100, // 100MB
            ...options
        };
    }

    compress(data: any): string | Uint8Array {
        const jsonString = JSON.stringify(data);
        
        // 如果数据小于阈值，直接返回
        if (jsonString.length < this.options.threshold!) {
            return jsonString;
        }

        try {
            // 压缩数据
            const compressed = deflate(jsonString, {
                level: this.options.level,
                memLevel: this.calculateMemLevel()
            });

            // 如果压缩后更大，返回原始数据
            return compressed.length < jsonString.length ? compressed : jsonString;
        } catch (error) {
            console.warn('Compression failed, returning original data:', error);
            return jsonString;
        }
    }

    decompress(data: string | Uint8Array): any {
        try {
            // 如果是字符串且看起来不像压缩数据，直接解析
            if (typeof data === 'string') {
                return JSON.parse(data);
            }

            // 解压数据
            const decompressed = inflate(data, { to: 'string' });
            return JSON.parse(decompressed);
        } catch (error) {
            console.error('Decompression failed:', error);
            throw error;
        }
    }

    private calculateMemLevel(): number {
        const totalMemory = process.memoryUsage().heapTotal;
        const memoryLimitBytes = this.options.memoryLimit! * 1024 * 1024;
        
        // 根据可用内存动态调整压缩级别
        if (totalMemory < memoryLimitBytes) {
            return 9; // 最高压缩级别
        } else if (totalMemory < memoryLimitBytes * 2) {
            return 7;
        } else {
            return 4; // 节省内存
        }
    }

    // 分析压缩效果
    analyzeCompression(data: any): CompressionAnalysis {
        const originalString = JSON.stringify(data);
        const compressed = this.compress(data);
        
        return {
            originalSize: originalString.length,
            compressedSize: compressed.length,
            compressionRatio: compressed.length / originalString.length,
            compressionSavings: 1 - (compressed.length / originalString.length)
        };
    }
}

export interface CompressionAnalysis {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    compressionSavings: number;
}
