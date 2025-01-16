const { HealthChecker } = require('../utils/healthCheck');

describe('HealthChecker Advanced Tests', () => {
    let healthChecker;

    beforeEach(() => {
        healthChecker = new HealthChecker();
    });

    describe('Advanced Component Management', () => {
        it('should handle complex component dependencies', () => {
            // 注册相互依赖的组件
            healthChecker.registerComponent('database', () => true);
            healthChecker.registerComponent('cache', () => {
                return healthChecker.hasComponent('database') && 
                       healthChecker.check().components.database.healthy;
            });
            healthChecker.registerComponent('api', () => {
                return healthChecker.hasComponent('cache') && 
                       healthChecker.check().components.cache.healthy;
            });

            const status = healthChecker.check();
            expect(status.healthy).toBe(true);
            expect(status.components.database.healthy).toBe(true);
            expect(status.components.cache.healthy).toBe(true);
            expect(status.components.api.healthy).toBe(true);
        });

        it('should handle circular dependencies', () => {
            healthChecker.registerComponent('comp1', () => {
                return healthChecker.hasComponent('comp2') && 
                       healthChecker.check().components.comp2.healthy;
            });
            healthChecker.registerComponent('comp2', () => {
                return healthChecker.hasComponent('comp1') && 
                       healthChecker.check().components.comp1.healthy;
            });

            const status = healthChecker.check();
            expect(status.healthy).toBe(false);
        });
    });

    describe('Advanced Async Checks', () => {
        it('should handle mixed sync and async checks with dependencies', async () => {
            healthChecker.registerComponent('sync', () => true);
            healthChecker.registerComponent('async1', async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return healthChecker.check().components.sync.healthy;
            });
            healthChecker.registerComponent('async2', async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
                return healthChecker.check().components.async1.healthy;
            });

            const status = await healthChecker.checkAsync();
            expect(status.healthy).toBe(true);
            expect(status.components.sync.healthy).toBe(true);
            expect(status.components.async1.healthy).toBe(true);
            expect(status.components.async2.healthy).toBe(true);
        });

        it('should handle async check failures gracefully', async () => {
            healthChecker.registerComponent('failingAsync', async () => {
                throw new Error('Async operation failed');
            });

            const status = await healthChecker.checkAsync();
            expect(status.healthy).toBe(false);
            expect(status.components.failingAsync.healthy).toBe(false);
            expect(status.components.failingAsync.error).toBeDefined();
        });

        it('should handle multiple timeouts', async () => {
            for (let i = 0; i < 3; i++) {
                healthChecker.registerComponent(`timeout${i}`, async () => {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return true;
                });
            }

            const status = await healthChecker.checkAsync(1000);
            expect(status.healthy).toBe(false);
            expect(Object.keys(status.components).length).toBe(3);
            Object.values(status.components).forEach(comp => {
                expect(comp.healthy).toBe(false);
                expect(comp.error).toMatch(/timeout/i);
            });
        });
    });

    describe('History Management', () => {
        it('should handle rapid health checks', async () => {
            healthChecker.registerComponent('test', () => true);
            
            // 快速执行多次健康检查
            const promises = Array(20).fill(0).map(() => healthChecker.checkAsync());
            await Promise.all(promises);
            
            const history = healthChecker.getHistory();
            expect(history.length).toBeLessThanOrEqual(10); // 最大历史记录限制
        });

        it('should maintain accurate timestamps', async () => {
            healthChecker.registerComponent('test', () => true);
            
            // 执行多次检查，每次间隔100ms
            for (let i = 0; i < 5; i++) {
                await healthChecker.checkAsync();
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const history = healthChecker.getHistory();
            for (let i = 1; i < history.length; i++) {
                const timeDiff = new Date(history[i].timestamp) - new Date(history[i-1].timestamp);
                expect(timeDiff).toBeGreaterThanOrEqual(90); // 允许10ms的误差
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle component registration errors', () => {
            // 测试无效的检查函数
            expect(() => {
                healthChecker.registerComponent('invalid', null);
            }).toThrow();

            expect(() => {
                healthChecker.registerComponent('invalid', 123);
            }).toThrow();

            expect(() => {
                healthChecker.registerComponent('invalid', {});
            }).toThrow();
        });

        it('should handle component check errors with detailed information', () => {
            healthChecker.registerComponent('error1', () => {
                throw new Error('Test error');
            });
            healthChecker.registerComponent('error2', () => {
                throw new TypeError('Type error');
            });

            const status = healthChecker.check();
            expect(status.healthy).toBe(false);
            expect(status.components.error1.error).toMatch(/Test error/);
            expect(status.components.error2.error).toMatch(/Type error/);
        });

        it('should handle edge cases in component management', () => {
            // 测试重复注册
            healthChecker.registerComponent('test', () => true);
            expect(() => {
                healthChecker.registerComponent('test', () => false);
            }).toThrow();

            // 测试注销未注册的组件
            healthChecker.unregisterComponent('nonexistent');
            expect(healthChecker.hasComponent('nonexistent')).toBe(false);

            // 测试注销后重新注册
            healthChecker.unregisterComponent('test');
            healthChecker.registerComponent('test', () => false);
            expect(healthChecker.hasComponent('test')).toBe(true);
        });
    });
});
