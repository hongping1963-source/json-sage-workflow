const { JsonCompressor } = require('../core/compression');

describe('JsonCompressor', () => {
    let compressor;

    beforeEach(() => {
        compressor = new JsonCompressor({
            threshold: 100,  // 设置较小的阈值以便测试
            level: 6,
            memoryLimit: 100
        });
    });

    describe('Compression Tests', () => {
        it('should not compress small data below threshold', () => {
            const smallData = { test: 'small' };
            const result = compressor.compress(smallData);
            expect(typeof result).toBe('string');
            expect(JSON.parse(result)).toEqual(smallData);
        });

        it('should compress large data above threshold', () => {
            const largeData = {
                text: 'test'.repeat(100),
                array: Array(100).fill('test')
            };
            const result = compressor.compress(largeData);
            expect(result instanceof Uint8Array).toBe(true);
        });

        it('should handle special characters correctly', () => {
            const specialData = {
                unicode: '你好，世界！',
                symbols: '!@#$%^&*()',
                emoji: '😀🌍🌞'
            };
            const result = compressor.compress(specialData);
            const decompressed = compressor.decompress(result);
            expect(decompressed).toEqual(specialData);
        });

        it('should handle nested objects', () => {
            const nestedData = {
                level1: {
                    level2: {
                        level3: {
                            data: 'test'.repeat(50)
                        }
                    }
                }
            };
            const result = compressor.compress(nestedData);
            const decompressed = compressor.decompress(result);
            expect(decompressed).toEqual(nestedData);
        });
    });

    describe('Decompression Tests', () => {
        it('should decompress compressed data correctly', () => {
            const originalData = { test: 'data'.repeat(100) };
            const compressed = compressor.compress(originalData);
            const decompressed = compressor.decompress(compressed);
            expect(decompressed).toEqual(originalData);
        });

        it('should handle regular JSON strings', () => {
            const jsonString = '{"test":"value"}';
            const result = compressor.decompress(jsonString);
            expect(result).toEqual({ test: 'value' });
        });

        it('should throw error for invalid compressed data', () => {
            const invalidData = new Uint8Array([1, 2, 3]);
            expect(() => compressor.decompress(invalidData)).toThrow();
        });
    });

    describe('Performance Analysis', () => {
        it('should provide compression analysis', () => {
            const testData = {
                array: Array(1000).fill('test'),
                text: 'sample'.repeat(1000)
            };
            const analysis = compressor.analyzeCompression(testData);
            
            expect(analysis).toHaveProperty('originalSize');
            expect(analysis).toHaveProperty('compressedSize');
            expect(analysis).toHaveProperty('compressionRatio');
            expect(analysis).toHaveProperty('compressionSavings');
            expect(analysis.compressionSavings).toBeGreaterThan(0);
        });

        it('should handle different compression levels', () => {
            const testData = { text: 'test'.repeat(1000) };
            
            const lowCompressor = new JsonCompressor({ level: 1 });
            const highCompressor = new JsonCompressor({ level: 9 });
            
            const lowAnalysis = lowCompressor.analyzeCompression(testData);
            const highAnalysis = highCompressor.analyzeCompression(testData);
            
            // 高压缩级别应该产生更小的压缩大小
            expect(highAnalysis.compressedSize).toBeLessThanOrEqual(lowAnalysis.compressedSize);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty objects', () => {
            const emptyData = {};
            const result = compressor.compress(emptyData);
            const decompressed = compressor.decompress(result);
            expect(decompressed).toEqual(emptyData);
        });

        it('should handle null values', () => {
            const nullData = { test: null };
            const result = compressor.compress(nullData);
            const decompressed = compressor.decompress(result);
            expect(decompressed).toEqual(nullData);
        });

        it('should handle arrays with mixed types', () => {
            const mixedData = {
                array: [1, 'string', null, { nested: true }, [1, 2, 3]]
            };
            const result = compressor.compress(mixedData);
            const decompressed = compressor.decompress(result);
            expect(decompressed).toEqual(mixedData);
        });
    });
});
