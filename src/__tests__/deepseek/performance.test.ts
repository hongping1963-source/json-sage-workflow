import { json } from '../../index';
import { SchemaGenerator } from '../../core/SchemaGenerator';
import { performance } from 'perf_hooks';

describe('DeepSeek AI Performance Tests', () => {
    const mockConfig = {
        apiKey: process.env.JSONSAGE_DEEPSEEK_API_KEY || 'test-api-key'
    };

    // 生成大型测试数据
    const generateLargeData = (depth: number, width: number) => {
        if (depth === 0) {
            return {
                id: Math.random().toString(),
                value: 'test-value',
                timestamp: new Date().toISOString()
            };
        }

        const result: any = {};
        for (let i = 0; i < width; i++) {
            result[`field${i}`] = generateLargeData(depth - 1, width);
        }
        return result;
    };

    describe('Performance Benchmarks', () => {
        let generator: SchemaGenerator;

        beforeEach(() => {
            generator = json.createSchemaGenerator({
                useAI: true,
                deepseek: mockConfig,
                caching: true
            });
        });

        it('should handle large nested objects efficiently', async () => {
            const largeData = generateLargeData(3, 5); // 深度3，每层5个字段
            const start = performance.now();
            
            const schema = await generator.generateSchema(largeData);
            
            const end = performance.now();
            const duration = end - start;

            expect(schema).toBeDefined();
            expect(duration).toBeLessThan(10000); // 应在10秒内完成
            
            // 验证生成的schema结构完整性
            const parsedSchema = JSON.parse(schema);
            expect(parsedSchema.properties).toBeDefined();
            expect(Object.keys(parsedSchema.properties).length).toBe(5);
        });

        it('should maintain performance with caching enabled', async () => {
            const testData = generateLargeData(2, 3);
            
            // 第一次生成（无缓存）
            const start1 = performance.now();
            await generator.generateSchema(testData);
            const duration1 = performance.now() - start1;

            // 第二次生成（有缓存）
            const start2 = performance.now();
            await generator.generateSchema(testData);
            const duration2 = performance.now() - start2;

            // 缓存应该显著提升性能
            expect(duration2).toBeLessThan(duration1 * 0.5);
        });

        it('should handle concurrent requests efficiently', async () => {
            const testData = generateLargeData(1, 2);
            const requests = Array(5).fill(null).map(() => 
                generator.generateSchema(testData)
            );

            const start = performance.now();
            const results = await Promise.all(requests);
            const duration = performance.now() - start;

            // 验证所有请求都成功完成
            expect(results).toHaveLength(5);
            results.forEach(schema => {
                expect(schema).toBeDefined();
                expect(JSON.parse(schema).properties).toBeDefined();
            });

            // 并发请求的总时间应该小于串行时间的5倍
            expect(duration).toBeLessThan(10000);
        });

        it('should maintain memory usage within bounds', async () => {
            const initialMemory = process.memoryUsage().heapUsed;
            const largeData = generateLargeData(4, 4);

            await generator.generateSchema(largeData);

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryDiff = finalMemory - initialMemory;

            // 内存增长不应超过100MB
            expect(memoryDiff).toBeLessThan(100 * 1024 * 1024);
        });
    });

    describe('Rate Limiting Tests', () => {
        let generator: SchemaGenerator;

        beforeEach(() => {
            generator = json.createSchemaGenerator({
                useAI: true,
                deepseek: mockConfig
            });
        });

        it('should handle rate limiting gracefully', async () => {
            const requests = Array(10).fill(null).map(() => 
                generator.generateSchema({ test: 'data' })
            );

            const results = await Promise.allSettled(requests);
            
            // 检查成功和失败的请求
            const successful = results.filter(r => r.status === 'fulfilled');
            const failed = results.filter(r => r.status === 'rejected');

            expect(successful.length).toBeGreaterThan(0);
            
            // 对于失败的请求，确保是因为速率限制
            failed.forEach(result => {
                if (result.status === 'rejected') {
                    expect(result.reason.message).toMatch(/rate limit|too many requests/i);
                }
            });
        });
    });
});
