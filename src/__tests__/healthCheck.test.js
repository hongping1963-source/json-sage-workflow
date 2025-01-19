const { HealthChecker } = require('../utils/healthCheck');

describe('HealthChecker', () => {
    let healthChecker;

    beforeEach(() => {
        healthChecker = new HealthChecker();
    });

    describe('Basic Health Checks', () => {
        it('should initialize with healthy status', () => {
            expect(healthChecker.isHealthy()).toBe(true);
            expect(healthChecker.getStatus()).toEqual({
                healthy: true,
                components: {},
                lastCheck: expect.any(String)
            });
        });

        it('should perform health check', () => {
            const result = healthChecker.check();
            expect(result.healthy).toBe(true);
            expect(result.lastCheck).toBeDefined();
        });

        it('should handle component check failure', () => {
            healthChecker.registerComponent('test', () => false);
            const result = healthChecker.check();
            expect(result.healthy).toBe(false);
            expect(result.components.test.healthy).toBe(false);
        });
    });

    describe('Component Management', () => {
        it('should register and unregister components', () => {
            const checkFn = () => true;
            healthChecker.registerComponent('test', checkFn);
            expect(healthChecker.hasComponent('test')).toBe(true);

            healthChecker.unregisterComponent('test');
            expect(healthChecker.hasComponent('test')).toBe(false);
        });

        it('should handle multiple components', () => {
            healthChecker.registerComponent('comp1', () => true);
            healthChecker.registerComponent('comp2', () => true);
            healthChecker.registerComponent('comp3', () => false);

            const result = healthChecker.check();
            expect(result.healthy).toBe(false);
            expect(result.components.comp1.healthy).toBe(true);
            expect(result.components.comp2.healthy).toBe(true);
            expect(result.components.comp3.healthy).toBe(false);
        });

        it('should handle component check errors', () => {
            healthChecker.registerComponent('error', () => {
                throw new Error('Test error');
            });

            const result = healthChecker.check();
            expect(result.healthy).toBe(false);
            expect(result.components.error.healthy).toBe(false);
            expect(result.components.error.error).toBeDefined();
        });
    });

    describe('Advanced Health Checks', () => {
        it('should handle async component checks', async () => {
            healthChecker.registerComponent('async', async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return true;
            });

            const result = await healthChecker.checkAsync();
            expect(result.healthy).toBe(true);
            expect(result.components.async.healthy).toBe(true);
        });

        it('should handle mixed sync and async components', async () => {
            healthChecker.registerComponent('sync', () => true);
            healthChecker.registerComponent('async', async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return false;
            });

            const result = await healthChecker.checkAsync();
            expect(result.healthy).toBe(false);
            expect(result.components.sync.healthy).toBe(true);
            expect(result.components.async.healthy).toBe(false);
        });

        it('should handle timeout in async checks', async () => {
            healthChecker.registerComponent('timeout', async () => {
                await new Promise(resolve => setTimeout(resolve, 5000));
                return true;
            });

            const result = await healthChecker.checkAsync(1000);
            expect(result.healthy).toBe(false);
            expect(result.components.timeout.healthy).toBe(false);
            expect(result.components.timeout.error).toMatch(/timeout/i);
        });
    });

    describe('Error Handling', () => {
        it('should handle registration of invalid check functions', () => {
            expect(() => {
                healthChecker.registerComponent('invalid', 'not a function');
            }).toThrow();
        });

        it('should handle duplicate component registration', () => {
            healthChecker.registerComponent('duplicate', () => true);
            expect(() => {
                healthChecker.registerComponent('duplicate', () => false);
            }).toThrow();
        });

        it('should handle unregistering non-existent components', () => {
            expect(() => {
                healthChecker.unregisterComponent('nonexistent');
            }).not.toThrow();
        });
    });

    describe('Status History', () => {
        it('should maintain check history', () => {
            healthChecker.registerComponent('test', () => true);
            healthChecker.check();
            healthChecker.check();
            
            const history = healthChecker.getHistory();
            expect(history.length).toBeGreaterThan(0);
            expect(history[0]).toHaveProperty('timestamp');
            expect(history[0]).toHaveProperty('status');
        });

        it('should limit history size', () => {
            healthChecker.registerComponent('test', () => true);
            for (let i = 0; i < 20; i++) {
                healthChecker.check();
            }
            
            const history = healthChecker.getHistory();
            expect(history.length).toBeLessThanOrEqual(10);
        });

        it('should clear history', () => {
            healthChecker.registerComponent('test', () => true);
            healthChecker.check();
            healthChecker.clearHistory();
            
            const history = healthChecker.getHistory();
            expect(history.length).toBe(0);
        });
    });
});
