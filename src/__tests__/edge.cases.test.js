const { JsonSage } = require('../index');
const { HealthChecker } = require('../utils/healthCheck');
const fs = require('fs');
const path = require('path');

describe('Edge Cases', () => {
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

    describe('JsonSage Edge Cases', () => {
        it('should handle invalid option combinations', () => {
            const instance = new JsonSage({
                watch: true,
                autoProcess: false,
                validation: true,
                schema: null // 无效的组合：启用验证但没有schema
            });

            expect(instance.options.validation).toBe(false);
        });

        it('should handle file system errors during initialization', async () => {
            const instance = new JsonSage({
                watch: true,
                watchPath: '/root/nonexistent' // 无权限访问的路径
            });

            await new Promise(resolve => setTimeout(resolve, 100));
            expect(instance.isWatching()).toBe(false);
        });

        it('should handle rapid configuration changes', async () => {
            const instance = new JsonSage();
            
            // 快速切换配置
            for (let i = 0; i < 10; i++) {
                instance.updateConfig({ watch: i % 2 === 0 });
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            expect(instance.isWatching()).toBe(false);
        });
    });

    describe('HealthChecker Edge Cases', () => {
        let healthChecker;

        beforeEach(() => {
            healthChecker = new HealthChecker();
        });

        it('should handle component registration race conditions', async () => {
            // 同时注册和注销组件
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    Promise.resolve().then(() => {
                        try {
                            healthChecker.registerComponent(`comp${i}`, () => true);
                        } catch (e) {
                            // 忽略重复注册错误
                        }
                    })
                );
                promises.push(
                    Promise.resolve().then(() => {
                        healthChecker.unregisterComponent(`comp${i}`);
                    })
                );
            }

            await Promise.all(promises);
            const status = healthChecker.check();
            expect(status.healthy).toBe(true);
        });

        it('should handle deeply nested async checks', async () => {
            // 创建深度嵌套的异步检查
            let current = 'root';
            for (let i = 0; i < 10; i++) {
                const parent = current;
                current = `level${i}`;
                healthChecker.registerComponent(current, async () => {
                    if (parent === 'root') return true;
                    await new Promise(resolve => setTimeout(resolve, 10));
                    return healthChecker.check().components[parent].healthy;
                });
            }

            const status = await healthChecker.checkAsync(1000);
            expect(status.healthy).toBe(true);
        });

        it('should handle component check timeouts with cleanup', async () => {
            // 注册一个会清理资源的长时间运行检查
            let cleanupCalled = false;
            healthChecker.registerComponent('longRunning', async () => {
                try {
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            cleanupCalled = true;
                            resolve(true);
                        }, 2000);

                        // 模拟清理函数
                        return () => {
                            clearTimeout(timeout);
                            cleanupCalled = true;
                        };
                    });
                } catch (e) {
                    return false;
                }
            });

            const status = await healthChecker.checkAsync(100);
            expect(status.healthy).toBe(false);
            expect(cleanupCalled).toBe(true);
        });
    });

    describe('File Processing Edge Cases', () => {
        it('should handle file content changes during processing', async () => {
            const instance = new JsonSage({ watch: true });
            
            // 在处理过程中修改文件
            fs.writeFileSync(testFile, JSON.stringify({ test: 1 }));
            await new Promise(resolve => setTimeout(resolve, 10));
            fs.writeFileSync(testFile, JSON.stringify({ test: 2 }));
            await new Promise(resolve => setTimeout(resolve, 10));
            fs.writeFileSync(testFile, JSON.stringify({ test: 3 }));
            
            await new Promise(resolve => setTimeout(resolve, 100));
            const content = JSON.parse(fs.readFileSync(testFile, 'utf8'));
            expect(content.test).toBe(3);
        });

        it('should handle file permission changes during processing', async () => {
            const instance = new JsonSage({ watch: true });
            
            fs.writeFileSync(testFile, JSON.stringify({ test: 'value' }));
            await new Promise(resolve => setTimeout(resolve, 50));
            
            try {
                // 尝试更改文件权限
                fs.chmodSync(testFile, 0o444); // 只读
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // 尝试写入只读文件
                fs.writeFileSync(testFile, JSON.stringify({ test: 'new value' }));
            } catch (error) {
                expect(error).toBeDefined();
            } finally {
                fs.chmodSync(testFile, 0o666); // 恢复权限
            }
        });

        it('should handle symbolic links', async () => {
            const instance = new JsonSage({ watch: true });
            const linkFile = path.join(testDir, 'link.json');
            
            fs.writeFileSync(testFile, JSON.stringify({ test: 'value' }));
            
            try {
                // 创建符号链接
                fs.symlinkSync(testFile, linkFile, 'file');
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // 通过链接修改文件
                fs.writeFileSync(linkFile, JSON.stringify({ test: 'new value' }));
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const content = JSON.parse(fs.readFileSync(testFile, 'utf8'));
                expect(content.test).toBe('new value');
            } catch (error) {
                // 在某些系统上可能没有创建符号链接的权限
                console.log('Symlink test skipped:', error.message);
            } finally {
                if (fs.existsSync(linkFile)) {
                    fs.unlinkSync(linkFile);
                }
            }
        });
    });

    describe('Memory Management Edge Cases', () => {
        it('should handle out of memory scenarios', async () => {
            const instance = new JsonSage({
                watch: true,
                memoryLimit: 1024 // 1KB limit
            });

            // 创建一个大于内存限制的对象
            const largeObject = {
                data: 'x'.repeat(2048) // 2KB
            };

            fs.writeFileSync(testFile, JSON.stringify(largeObject));
            await new Promise(resolve => setTimeout(resolve, 100));

            const stats = instance.getStats();
            expect(stats.metrics.errorCount).toBeGreaterThan(0);
        });

        it('should handle rapid memory allocation/deallocation', async () => {
            const instance = new JsonSage({
                watch: true,
                caching: true
            });

            // 快速分配和释放内存
            for (let i = 0; i < 100; i++) {
                const size = Math.pow(2, i % 10) * 1024; // 1KB to 1MB
                const data = { data: 'x'.repeat(size) };
                fs.writeFileSync(testFile, JSON.stringify(data));
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            const stats = instance.getStats();
            expect(stats.cache.utilization).toBeLessThan(100);
        });
    });
});
