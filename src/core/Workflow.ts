import { JsonSageAutoDetector } from './AutoDetector';
import { ProjectAnalyzer } from './ProjectAnalyzer';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { JsonCompressor } from './compression';
import { JsonValidator } from './validator';
import { SmartCache } from './cache';
import { DeepSeekService, DeepSeekConfig, SchemaGenerationOptions } from './DeepSeekService';

interface WorkflowOptions {
    watch: boolean;
    autoProcess: boolean;
    generateTypes: boolean;
    autoOptimize: boolean;
    compression?: boolean;
    validation?: boolean;
    caching?: boolean;
    deepseek?: DeepSeekConfig;
}

export class JsonSageWorkflow {
    private detector: JsonSageAutoDetector;
    private analyzer: ProjectAnalyzer;
    private optimizer: PerformanceOptimizer;
    private compressor: JsonCompressor;
    private validator: JsonValidator;
    private cache: SmartCache<any>;
    private deepseek?: DeepSeekService;

    constructor(private options: WorkflowOptions = {
        watch: true,
        autoProcess: true,
        generateTypes: true,
        autoOptimize: true,
        compression: true,
        validation: true,
        caching: true
    }) {
        this.detector = new JsonSageAutoDetector({ generateTypes: options.generateTypes });
        this.analyzer = new ProjectAnalyzer();
        this.optimizer = new PerformanceOptimizer();
        this.compressor = new JsonCompressor();
        this.validator = new JsonValidator({ autoRepair: true });
        this.cache = new SmartCache();
        
        if (options.deepseek) {
            this.deepseek = new DeepSeekService(options.deepseek);
        }
        
        this.initialize();
    }

    private async initialize() {
        try {
            // 分析项目结构
            const projectInfo = await this.analyzer.analyzeProject();
            
            // 设置自动监控
            if (this.options.watch) {
                this.detector.watchDirectories(projectInfo.jsonDirectories);
            }

            // 性能优化
            if (this.options.autoOptimize) {
                await this.optimizer.optimize(projectInfo);
            }

            console.log('JsonSage initialized with advanced features:');
            console.log('- Compression:', this.options.compression ? 'enabled' : 'disabled');
            console.log('- Validation:', this.options.validation ? 'enabled' : 'disabled');
            console.log('- Caching:', this.options.caching ? 'enabled' : 'disabled');
        } catch (error) {
            console.error('Error initializing JsonSage:', error);
        }
    }

    parse(data: string) {
        // 检查缓存
        if (this.options.caching) {
            const cached = this.cache.get(data);
            if (cached) return cached;
        }

        let result;
        
        // 解压缩（如果需要）
        if (this.options.compression) {
            result = this.compressor.decompress(data);
        } else {
            result = JSON.parse(data);
        }

        // 验证数据
        if (this.options.validation) {
            const schema = this.detector.getTypeDefinition(data) || {};
            const validationResult = this.validator.validate(result, schema);
            
            if (!validationResult.valid && validationResult.repairedData) {
                result = validationResult.repairedData;
            }
        }

        // 优化处理
        result = this.optimizer.optimizedParse(result);

        // 缓存结果
        if (this.options.caching) {
            this.cache.set(data, result);
        }

        return result;
    }

    stringify(data: any) {
        // 检查缓存
        if (this.options.caching) {
            const cacheKey = JSON.stringify(data);
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;
        }

        let result = this.optimizer.optimizedStringify(data);

        // 压缩（如果需要）
        if (this.options.compression) {
            result = this.compressor.compress(data);
        }

        // 缓存结果
        if (this.options.caching) {
            const cacheKey = JSON.stringify(data);
            this.cache.set(cacheKey, result);
        }

        return result;
    }

    // 获取性能报告
    async getPerformanceReport() {
        const optimizerReport = await this.optimizer.generateReport();
        const cacheStats = this.cache.getStats();
        
        return {
            ...optimizerReport,
            cache: cacheStats,
            compression: this.options.compression ? {
                enabled: true,
                analysis: this.compressor.analyzeCompression(optimizerReport)
            } : { enabled: false }
        };
    }

    // 新增：使用 DeepSeek AI 生成 JSON Schema
    async generateSchema(json: string, options: SchemaGenerationOptions = {}): Promise<string> {
        if (!this.deepseek) {
            throw new Error('DeepSeek service is not configured. Please provide DeepSeek configuration in the constructor.');
        }

        try {
            // 检查缓存
            if (this.options.caching) {
                const cacheKey = `schema:${json}`;
                const cached = this.cache.get(cacheKey);
                if (cached) return cached;
            }

            const schema = await this.deepseek.generateSchema(json, options);

            // 缓存结果
            if (this.options.caching) {
                const cacheKey = `schema:${json}`;
                this.cache.set(cacheKey, schema);
            }

            return schema;
        } catch (error) {
            throw new Error(`Failed to generate schema: ${error.message}`);
        }
    }
}
