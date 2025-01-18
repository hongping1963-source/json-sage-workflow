const { JsonSage } = require('../index');
const { HealthChecker } = require('../utils/healthCheck');
const fs = require('fs');
const path = require('path');

describe('Asynchronous Operations', () => {
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

    describe('Concurrent File Operations', () => {
        it('should handle concurrent file writes', async () => {
            const instance = new JsonSage({ watch: true });
            const writeOperations = [];

            // 同时写入多个文件
            for (let i = 0; i < 10; i++) {
                const file = path.join(testDir, `test${i}.json`);
                writeOperations.push(
                    fs.promises.writeFile(file, JSON.stringify({ test: i }))
                );
            }

            await Promise.all(writeOperations);
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.processedCount).toBeGreaterThan(0);

            // 清理文件
            for (let i = 0; i < 10; i++) {
                const file = path.join(testDir, `test${i}.json`);
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            }
        });

        it('should handle concurrent file reads', async () => {
            const instance = new JsonSage({ watch: true });
            const files = [];

            // 创建多个文件
            for (let i = 0; i < 10; i++) {
                const file = path.join(testDir, `test${i}.json`);
                fs.writeFileSync(file, JSON.stringify({ test: i }));
                files.push(file);
            }

            // 同时读取所有文件
            const readOperations = files.map(file => fs.promises.readFile(file, 'utf8'));
            const contents = await Promise.all(readOperations);

            contents.forEach((content, index) => {
                const data = JSON.parse(content);
                expect(data.test).toBe(index);
            });

            // 清理文件
            files.forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            });
        });

        it('should handle concurrent file modifications', async () => {
            const instance = new JsonSage({ watch: true });
            const modifyOperations = [];

            // 创建初始文件
            fs.writeFileSync(testFile, JSON.stringify({ counter: 0 }));

            // 同时修改文件
            for (let i = 0; i < 10; i++) {
                modifyOperations.push(
                    (async () => {
                        const content = await fs.promises.readFile(testFile, 'utf8');
                        const data = JSON.parse(content);
                        data.counter++;
                        await fs.promises.writeFile(testFile, JSON.stringify(data));
                    })()
                );
            }

            await Promise.all(modifyOperations);
            await new Promise(resolve => setTimeout(resolve, 100));

            const finalContent = JSON.parse(fs.readFileSync(testFile, 'utf8'));
            expect(finalContent.counter).toBe(10);
        });
    });

    describe('Async Health Checks', () => {
        let healthChecker;

        beforeEach(() => {
            healthChecker = new HealthChecker();
        });

        it('should handle concurrent health checks', async () => {
            healthChecker.registerComponent('async1', async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
                return true;
            });

            healthChecker.registerComponent('async2', async () => {
                await new Promise(resolve => setTimeout(resolve, 30));
                return true;
            });

            const checks = Array(5).fill(0).map(() => healthChecker.checkAsync());
            const results = await Promise.all(checks);

            results.forEach(result => {
                expect(result.healthy).toBe(true);
                expect(result.components.async1.healthy).toBe(true);
                expect(result.components.async2.healthy).toBe(true);
            });
        });

        it('should handle mixed sync/async health checks', async () => {
            healthChecker.registerComponent('sync', () => true);
            healthChecker.registerComponent('async', async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
                return true;
            });

            const status = await healthChecker.checkAsync();
            expect(status.healthy).toBe(true);
            expect(status.components.sync.healthy).toBe(true);
            expect(status.components.async.healthy).toBe(true);
        });

        it('should handle async check timeouts', async () => {
            healthChecker.registerComponent('timeout1', async () => {
                await new Promise(resolve => setTimeout(resolve, 200));
                return true;
            });

            healthChecker.registerComponent('timeout2', async () => {
                await new Promise(resolve => setTimeout(resolve, 300));
                return true;
            });

            const status = await healthChecker.checkAsync(100);
            expect(status.healthy).toBe(false);
            expect(status.components.timeout1.healthy).toBe(false);
            expect(status.components.timeout2.healthy).toBe(false);
        });
    });

    describe('Async File Processing', () => {
        it('should handle large file processing', async () => {
            const instance = new JsonSage({ watch: true });
            const largeData = {
                array: Array(10000).fill('test'),
                nested: Array(1000).fill({ test: 'value' })
            };

            await fs.promises.writeFile(testFile, JSON.stringify(largeData));
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.processedCount).toBe(1);
        });

        it('should handle rapid file updates', async () => {
            const instance = new JsonSage({ watch: true });
            const updates = [];

            for (let i = 0; i < 100; i++) {
                updates.push(
                    (async () => {
                        await fs.promises.writeFile(
                            testFile,
                            JSON.stringify({ value: i })
                        );
                        await new Promise(resolve => setTimeout(resolve, 10));
                    })()
                );
            }

            await Promise.all(updates);
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.processedCount).toBeGreaterThan(0);
        });

        it('should handle file system events queuing', async () => {
            const instance = new JsonSage({ watch: true });
            const operations = [];

            // 快速创建和删除文件
            for (let i = 0; i < 50; i++) {
                operations.push(
                    (async () => {
                        const file = path.join(testDir, `test${i}.json`);
                        await fs.promises.writeFile(file, JSON.stringify({ test: i }));
                        await new Promise(resolve => setTimeout(resolve, 10));
                        await fs.promises.unlink(file);
                    })()
                );
            }

            await Promise.all(operations);
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.processedCount).toBeGreaterThan(0);
        });
    });

    describe('Async Resource Management', () => {
        it('should handle async cache operations', async () => {
            const instance = new JsonSage({
                watch: true,
                caching: true
            });

            const cacheOperations = [];
            for (let i = 0; i < 50; i++) {
                cacheOperations.push(
                    (async () => {
                        await fs.promises.writeFile(
                            path.join(testDir, `cache${i}.json`),
                            JSON.stringify({ data: 'x'.repeat(100) })
                        );
                    })()
                );
            }

            await Promise.all(cacheOperations);
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.cache.itemCount).toBeGreaterThan(0);

            // 清理文件
            for (let i = 0; i < 50; i++) {
                const file = path.join(testDir, `cache${i}.json`);
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            }
        });

        it('should handle async compression operations', async () => {
            const instance = new JsonSage({
                watch: true,
                compression: true
            });

            const compressionOperations = [];
            for (let i = 0; i < 10; i++) {
                compressionOperations.push(
                    (async () => {
                        await fs.promises.writeFile(
                            path.join(testDir, `comp${i}.json`),
                            JSON.stringify({ data: 'x'.repeat(1000) })
                        );
                    })()
                );
            }

            await Promise.all(compressionOperations);
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.processedCount).toBeGreaterThan(0);

            // 清理文件
            for (let i = 0; i < 10; i++) {
                const file = path.join(testDir, `comp${i}.json`);
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            }
        });
    });
});
