class HealthChecker {
    constructor() {
        this.components = new Map();
        this.history = [];
        this.maxHistorySize = 10;
    }

    registerComponent(name, checkFn) {
        if (typeof checkFn !== 'function') {
            throw new Error('Check function must be a function');
        }

        if (this.components.has(name)) {
            throw new Error(`Component ${name} is already registered`);
        }

        this.components.set(name, checkFn);
    }

    unregisterComponent(name) {
        this.components.delete(name);
    }

    hasComponent(name) {
        return this.components.has(name);
    }

    check() {
        const status = {
            healthy: true,
            components: {},
            lastCheck: new Date().toISOString()
        };

        for (const [name, checkFn] of this.components) {
            try {
                const isHealthy = checkFn();
                status.components[name] = {
                    healthy: isHealthy
                };
                if (!isHealthy) {
                    status.healthy = false;
                }
            } catch (error) {
                status.components[name] = {
                    healthy: false,
                    error: error.message
                };
                status.healthy = false;
            }
        }

        this.addToHistory(status);
        return status;
    }

    async checkAsync(timeout = 5000) {
        const status = {
            healthy: true,
            components: {},
            lastCheck: new Date().toISOString()
        };

        const checks = Array.from(this.components.entries()).map(async ([name, checkFn]) => {
            try {
                const checkPromise = Promise.resolve(checkFn());
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Check timed out')), timeout)
                );

                const isHealthy = await Promise.race([checkPromise, timeoutPromise]);
                status.components[name] = {
                    healthy: isHealthy
                };
                if (!isHealthy) {
                    status.healthy = false;
                }
            } catch (error) {
                status.components[name] = {
                    healthy: false,
                    error: error.message
                };
                status.healthy = false;
            }
        });

        await Promise.all(checks);
        this.addToHistory(status);
        return status;
    }

    addToHistory(status) {
        this.history.push({
            timestamp: new Date().toISOString(),
            status
        });

        // 保持历史记录在限制范围内
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
    }

    isHealthy() {
        return this.check().healthy;
    }

    getStatus() {
        return this.check();
    }
}

module.exports = { HealthChecker };
