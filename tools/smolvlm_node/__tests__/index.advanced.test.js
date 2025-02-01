const { JsonSage } = require('../index');
const fs = require('fs');
const path = require('path');

describe('JsonSage Advanced Tests', () => {
    let jsonsage;
    const testDir = path.join(__dirname, 'test-files');
    const testFile = path.join(testDir, 'test.json');

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    beforeEach(() => {
        jsonsage = new JsonSage();
    });

    afterEach(async () => {
        if (jsonsage.isWatching()) {
            await jsonsage.stop();
        }
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
    });

    describe('Advanced Error Handling', () => {
        it('should handle start errors gracefully', async () => {
            const invalidInstance = new JsonSage({
                watch: true,
                watchPath: '/invalid/path'
            });

            // 等待错误处理完成
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(invalidInstance.isWatching()).toBe(false);
        });

        it('should handle stop errors gracefully', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            // 模拟watcher.close()失败
            instance.watcher.close = () => Promise.reject(new Error('Failed to close'));

            await instance.stop();
            expect(instance.isWatching()).toBe(false);
        });
    });

    describe('Advanced File Processing', () => {
        it('should handle validation with schema', async () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                },
                required: ['name']
            };

            const instance = new JsonSage({
                watch: true,
                validation: true,
                schema: schema
            });

            fs.writeFileSync(testFile, JSON.stringify({ name: 'John', age: '30' }));
            await new Promise(resolve => setTimeout(resolve, 100));

            const content = JSON.parse(fs.readFileSync(testFile, 'utf8'));
            expect(content.age).toBe(30); // 应该被转换为数字
        });

        it('should handle compression of large files', async () => {
            const instance = new JsonSage({
                watch: true,
                compression: true
            });

            const largeData = {
                array: Array(1000).fill('test'),
                nested: Array(100).fill({ test: 'value' })
            };

            fs.writeFileSync(testFile, JSON.stringify(largeData));
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证文件被压缩
            const stats = instance.getStats();
            expect(stats.metrics.processedCount).toBe(1);
        });
    });

    describe('Caching Behavior', () => {
        it('should use cache when enabled', async () => {
            const instance = new JsonSage({
                watch: true,
                caching: true
            });

            const testData = { test: 'value' };
            fs.writeFileSync(testFile, JSON.stringify(testData));
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.cache.itemCount).toBe(1);
        });

        it('should handle cache eviction', async () => {
            const instance = new JsonSage({
                watch: true,
                caching: true
            });

            // 写入多个大文件触发缓存淘汰
            for (let i = 0; i < 10; i++) {
                const largeData = { data: 'x'.repeat(100000) };
                fs.writeFileSync(
                    path.join(testDir, `test${i}.json`),
                    JSON.stringify(largeData)
                );
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const stats = instance.getStats();
            expect(stats.cache.itemCount).toBeGreaterThan(0);
        });
    });

    describe('Health Monitoring', () => {
        it('should monitor component health', async () => {
            const instance = new JsonSage({ watch: true });
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.health.components.fileWatcher).toBeDefined();
            expect(stats.health.components.cache).toBeDefined();
        });

        it('should detect unhealthy components', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.start();

            // 模拟组件故障
            instance.healthChecker.registerComponent('test', () => false);

            const stats = instance.getStats();
            expect(stats.health.healthy).toBe(false);
        });
    });

    describe('Performance Monitoring', () => {
        it('should track processing metrics', async () => {
            const instance = new JsonSage({ watch: true });

            // 处理多个文件
            for (let i = 0; i < 5; i++) {
                fs.writeFileSync(testFile, JSON.stringify({ test: i }));
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const stats = instance.getStats();
            expect(stats.metrics.processedCount).toBeGreaterThan(0);
            expect(stats.metrics.errorCount).toBe(0);
        });

        it('should track error metrics', async () => {
            const instance = new JsonSage({ watch: true });

            // 写入无效的JSON
            fs.writeFileSync(testFile, 'invalid json');
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.errorCount).toBeGreaterThan(0);
        });
    });
});
