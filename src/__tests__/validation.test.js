const { JsonSage } = require('../index');
const { HealthChecker } = require('../utils/healthCheck');
const fs = require('fs');
const path = require('path');

describe('Validation and Error Handling', () => {
    const testDir = path.join(__dirname, 'test-files');
    const testFile = path.join(testDir, 'test.json');

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    afterEach(() => {
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
    });

    describe('Configuration Validation', () => {
        it('should validate watchPath configuration', () => {
            const instance = new JsonSage({
                watch: true,
                watchPath: null
            });

            expect(instance.options.watchPath).toBe(process.cwd());
        });

        it('should validate schema configuration', () => {
            const instance = new JsonSage({
                validation: true,
                schema: 'invalid'
            });

            expect(instance.options.validation).toBe(false);
        });

        it('should validate caching configuration', () => {
            const instance = new JsonSage({
                caching: true,
                cacheSize: -1
            });

            expect(instance.options.cacheSize).toBeGreaterThan(0);
        });

        it('should validate compression configuration', () => {
            const instance = new JsonSage({
                compression: true,
                compressionLevel: 10 // 超出范围
            });

            expect(instance.options.compressionLevel).toBeLessThanOrEqual(9);
        });

        it('should validate memory limit configuration', () => {
            const instance = new JsonSage({
                memoryLimit: '1GB' // 无效格式
            });

            expect(typeof instance.options.memoryLimit).toBe('number');
        });
    });

    describe('Error Handling', () => {
        it('should handle initialization errors', () => {
            const instance = new JsonSage({
                watch: true,
                watchPath: '/nonexistent/path'
            });

            expect(instance.isWatching()).toBe(false);
        });

        it('should handle file system errors', async () => {
            const instance = new JsonSage({ watch: true });

            // 创建一个无效的文件描述符
            fs.writeFileSync(testFile, 'invalid json');
            const fd = fs.openSync(testFile, 'r');
            fs.closeSync(fd); // 关闭文件描述符

            try {
                // 尝试读取已关闭的文件描述符
                await fs.promises.readFile(fd);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        it('should handle JSON parsing errors', async () => {
            const instance = new JsonSage({ watch: true });

            fs.writeFileSync(testFile, '{invalid:json}');
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.errorCount).toBeGreaterThan(0);
        });

        it('should handle schema validation errors', async () => {
            const instance = new JsonSage({
                watch: true,
                validation: true,
                schema: {
                    type: 'object',
                    required: ['required_field']
                }
            });

            fs.writeFileSync(testFile, JSON.stringify({ optional_field: 'value' }));
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.errorCount).toBeGreaterThan(0);
        });
    });

    describe('Health Check Error Handling', () => {
        let healthChecker;

        beforeEach(() => {
            healthChecker = new HealthChecker();
        });

        it('should handle synchronous check errors', () => {
            healthChecker.registerComponent('sync', () => {
                throw new Error('Sync error');
            });

            const status = healthChecker.check();
            expect(status.healthy).toBe(false);
            expect(status.components.sync.error).toBeDefined();
        });

        it('should handle asynchronous check errors', async () => {
            healthChecker.registerComponent('async', async () => {
                throw new Error('Async error');
            });

            const status = await healthChecker.checkAsync();
            expect(status.healthy).toBe(false);
            expect(status.components.async.error).toBeDefined();
        });

        it('should handle timeout errors', async () => {
            healthChecker.registerComponent('timeout', async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return true;
            });

            const status = await healthChecker.checkAsync(100);
            expect(status.healthy).toBe(false);
            expect(status.components.timeout.error).toMatch(/timeout/i);
        });

        it('should handle multiple component failures', () => {
            healthChecker.registerComponent('comp1', () => {
                throw new Error('Error 1');
            });
            healthChecker.registerComponent('comp2', () => {
                throw new Error('Error 2');
            });

            const status = healthChecker.check();
            expect(status.healthy).toBe(false);
            expect(Object.keys(status.components).length).toBe(2);
            expect(status.components.comp1.error).toBeDefined();
            expect(status.components.comp2.error).toBeDefined();
        });
    });

    describe('Resource Management', () => {
        it('should handle file descriptor limits', async () => {
            const instance = new JsonSage({ watch: true });
            const files = [];

            try {
                // 尝试打开大量文件
                for (let i = 0; i < 1000; i++) {
                    const file = path.join(testDir, `test${i}.json`);
                    fs.writeFileSync(file, JSON.stringify({ test: i }));
                    files.push(file);
                }

                await new Promise(resolve => setTimeout(resolve, 100));

                const stats = instance.getStats();
                expect(stats.metrics.processedCount).toBeGreaterThan(0);
            } finally {
                // 清理文件
                files.forEach(file => {
                    if (fs.existsSync(file)) {
                        fs.unlinkSync(file);
                    }
                });
            }
        });

        it('should handle memory pressure', async () => {
            const instance = new JsonSage({
                watch: true,
                caching: true,
                cacheSize: 1024 // 1KB
            });

            // 创建一个接近缓存大小限制的对象
            const largeObject = {
                data: 'x'.repeat(900) // ~900 bytes
            };

            fs.writeFileSync(testFile, JSON.stringify(largeObject));
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.cache.utilization).toBeGreaterThan(0);
        });

        it('should handle rapid file operations', async () => {
            const instance = new JsonSage({ watch: true });
            const operations = [];

            // 快速执行多个文件操作
            for (let i = 0; i < 100; i++) {
                operations.push(
                    new Promise(resolve => {
                        fs.writeFileSync(testFile, JSON.stringify({ test: i }));
                        setTimeout(resolve, Math.random() * 10);
                    })
                );
            }

            await Promise.all(operations);
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.processedCount).toBeGreaterThan(0);
        });
    });
});
