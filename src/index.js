const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { JsonCompressor } = require('./core/compression');
const { JsonValidator } = require('./core/validator');
const { SmartCache } = require('./core/cache');
const { Logger } = require('./utils/logger');
const { HealthChecker } = require('./utils/healthCheck');
const { MetricsCollector } = require('./utils/metrics');

class JsonSage {
    constructor(options = {}) {
        this.options = this.validateOptions(options);
        this.logger = new Logger();
        this.healthChecker = new HealthChecker();
        this.metricsCollector = new MetricsCollector();
        this.cache = new SmartCache();
        this.watcher = null;
        this.isActive = false;

        if (this.options.watch) {
            this.start();
        }
    }

    validateOptions(options) {
        return {
            watch: Boolean(options.watch),
            autoProcess: Boolean(options.autoProcess),
            generateTypes: Boolean(options.generateTypes),
            autoOptimize: Boolean(options.autoOptimize),
            compression: Boolean(options.compression),
            validation: Boolean(options.validation),
            caching: Boolean(options.caching),
            watchPath: options.watchPath || process.cwd(),
            filePattern: options.filePattern || '**/*.json',
            schema: options.schema || null,
            memoryLimit: options.memoryLimit || 1024 * 1024 // 1MB default
        };
    }

    async start() {
        if (this.isActive) return;

        try {
            this.watcher = chokidar.watch(this.options.filePattern, {
                cwd: this.options.watchPath,
                persistent: true
            });

            this.watcher
                .on('add', this.handleFileChange.bind(this))
                .on('change', this.handleFileChange.bind(this))
                .on('unlink', this.handleFileRemove.bind(this))
                .on('error', this.handleError.bind(this));

            this.isActive = true;
            this.logger.info('JSON Agent workflow started');
            
            // 注册健康检查组件
            this.healthChecker.registerComponent('fileWatcher', () => this.isActive);
            this.healthChecker.registerComponent('cache', () => this.cache.getStats().healthy);
        } catch (error) {
            this.logger.error('Failed to start workflow', error);
            throw error;
        }
    }

    async stop() {
        if (!this.isActive) return;

        try {
            if (this.watcher) {
                await this.watcher.close();
            }
            this.isActive = false;
            this.logger.info('Workflow stopped');
        } catch (error) {
            this.logger.error('Failed to stop workflow', error);
            throw error;
        }
    }

    async handleFileChange(filePath) {
        this.logger.info(`Processing file: ${filePath}`);
        this.metricsCollector.recordProcessing();

        try {
            const fullPath = path.join(this.options.watchPath, filePath);
            const content = fs.readFileSync(fullPath, 'utf8');

            // 验证JSON
            let data = JSON.parse(content);

            if (this.options.validation && this.options.schema) {
                const validator = new JsonValidator();
                const result = validator.validate(data, this.options.schema);
                if (!result.valid) {
                    throw new Error('JSON validation failed: ' + JSON.stringify(result.errors));
                }
                data = result.data;
            }

            // 压缩处理
            if (this.options.compression) {
                const compressor = new JsonCompressor();
                data = compressor.compress(data);
            }

            // 缓存处理
            if (this.options.caching) {
                this.cache.set(filePath, data);
            }

            this.logger.info(`File processing completed: ${filePath}`);
        } catch (error) {
            this.metricsCollector.recordError();
            this.logger.error('Processing error', error);
            throw new Error(`Invalid JSON: ${error.message}`);
        }
    }

    handleFileRemove(filePath) {
        this.logger.info(`File removed: ${filePath}`);
        if (this.options.caching) {
            this.cache.delete(filePath);
        }
    }

    handleError(error) {
        this.logger.error('Watcher error', error);
        this.metricsCollector.recordError();
    }

    isWatching() {
        return this.isActive;
    }

    updateConfig(newOptions) {
        const oldOptions = this.options;
        this.options = this.validateOptions({ ...oldOptions, ...newOptions });

        if (this.isActive && !this.options.watch) {
            this.stop();
        } else if (!this.isActive && this.options.watch) {
            this.start();
        }
    }

    getStats() {
        return {
            isActive: this.isActive,
            health: this.healthChecker.check(),
            metrics: this.metricsCollector.getMetrics(),
            cache: this.cache.getStats()
        };
    }
}

module.exports = { JsonSage };
