const { JsonSage } = require('../index');
const { HealthChecker } = require('../utils/healthCheck');
const fs = require('fs');
const path = require('path');

describe('Lifecycle and Configuration', () => {
    const testDir = path.join(__dirname, 'test-files');
    const testFile = path.join(testDir, 'test.json');

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    afterEach(async () => {
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
    });

    describe('Initialization', () => {
        it('should initialize with default configuration', () => {
            const instance = new JsonSage();
            expect(instance.options).toBeDefined();
            expect(instance.isWatching()).toBe(false);
        });

        it('should initialize with custom configuration', () => {
            const instance = new JsonSage({
                watch: true,
                watchPath: testDir,
                validation: true,
                schema: { type: 'object' }
            });

            expect(instance.options.watch).toBe(true);
            expect(instance.options.watchPath).toBe(testDir);
            expect(instance.options.validation).toBe(true);
            expect(instance.options.schema).toBeDefined();
        });

        it('should validate configuration on initialization', () => {
            const instance = new JsonSage({
                watch: true,
                watchPath: null,
                validation: true,
                schema: 'invalid'
            });

            expect(instance.options.watchPath).toBe(process.cwd());
            expect(instance.options.validation).toBe(false);
        });
    });

    describe('Start/Stop Behavior', () => {
        it('should start and stop workflow', async () => {
            const instance = new JsonSage({ watch: true });

            await instance.start();
            expect(instance.isWatching()).toBe(true);

            await instance.stop();
            expect(instance.isWatching()).toBe(false);
        });

        it('should handle multiple start/stop cycles', async () => {
            const instance = new JsonSage({ watch: true });

            for (let i = 0; i < 5; i++) {
                await instance.start();
                expect(instance.isWatching()).toBe(true);

                await instance.stop();
                expect(instance.isWatching()).toBe(false);
            }
        });

        it('should handle rapid start/stop cycles', async () => {
            const instance = new JsonSage({ watch: true });
            const cycles = [];

            for (let i = 0; i < 10; i++) {
                cycles.push(
                    (async () => {
                        await instance.start();
                        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
                        await instance.stop();
                    })()
                );
            }

            await Promise.all(cycles);
            expect(instance.isWatching()).toBe(false);
        });
    });

    describe('Configuration Updates', () => {
        it('should update configuration during runtime', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            instance.updateConfig({
                validation: true,
                schema: { type: 'object' }
            });

            expect(instance.options.validation).toBe(true);
            expect(instance.options.schema).toBeDefined();

            await instance.stop();
        });

        it('should handle invalid configuration updates', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            instance.updateConfig({
                watchPath: '/invalid/path',
                validation: true,
                schema: null
            });

            expect(instance.options.watchPath).not.toBe('/invalid/path');
            expect(instance.options.validation).toBe(false);

            await instance.stop();
        });

        it('should handle configuration updates during file processing', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            // 写入文件并立即更新配置
            fs.writeFileSync(testFile, JSON.stringify({ test: 'value' }));
            instance.updateConfig({
                validation: true,
                schema: { type: 'object' }
            });

            await new Promise(resolve => setTimeout(resolve, 100));
            expect(instance.options.validation).toBe(true);

            await instance.stop();
        });
    });

    describe('Resource Cleanup', () => {
        it('should clean up resources on stop', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            // 创建一些资源
            fs.writeFileSync(testFile, JSON.stringify({ test: 'value' }));
            await new Promise(resolve => setTimeout(resolve, 100));

            await instance.stop();
            expect(instance.isWatching()).toBe(false);
            expect(instance.watcher).toBeNull();
        });

        it('should handle cleanup during file processing', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            // 在处理文件时停止
            fs.writeFileSync(testFile, JSON.stringify({ test: 'value' }));
            await instance.stop();

            expect(instance.isWatching()).toBe(false);
            expect(instance.watcher).toBeNull();
        });

        it('should clean up resources after errors', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            // 触发错误
            fs.writeFileSync(testFile, 'invalid json');
            await new Promise(resolve => setTimeout(resolve, 100));

            await instance.stop();
            expect(instance.isWatching()).toBe(false);
            expect(instance.watcher).toBeNull();
        });
    });

    describe('Error Recovery', () => {
        it('should recover from initialization errors', async () => {
            const instance = new JsonSage({
                watch: true,
                watchPath: '/invalid/path'
            });

            await instance.start();
            expect(instance.isWatching()).toBe(false);

            // 使用有效路径重试
            instance.updateConfig({ watchPath: testDir });
            await instance.start();
            expect(instance.isWatching()).toBe(true);

            await instance.stop();
        });

        it('should recover from runtime errors', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            // 触发运行时错误
            fs.writeFileSync(testFile, 'invalid json');
            await new Promise(resolve => setTimeout(resolve, 100));

            // 写入有效的 JSON
            fs.writeFileSync(testFile, JSON.stringify({ test: 'value' }));
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.errorCount).toBeGreaterThan(0);
            expect(stats.metrics.processedCount).toBeGreaterThan(0);

            await instance.stop();
        });

        it('should recover from multiple errors', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            // 触发多个错误
            for (let i = 0; i < 5; i++) {
                fs.writeFileSync(testFile, 'invalid json');
                await new Promise(resolve => setTimeout(resolve, 50));
                fs.writeFileSync(testFile, JSON.stringify({ test: i }));
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            const stats = instance.getStats();
            expect(stats.metrics.errorCount).toBeGreaterThan(0);
            expect(stats.metrics.processedCount).toBeGreaterThan(0);

            await instance.stop();
        });
    });
});
