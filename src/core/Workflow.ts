import { JsonSageAutoDetector } from './AutoDetector';
import { ProjectAnalyzer } from './ProjectAnalyzer';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { JsonCompressor } from './compression';
import { JsonValidator } from './validator';
import { SmartCache } from './cache';
import { DeepSeekService, DeepSeekConfig, SchemaGenerationOptions } from './DeepSeekService';
import { DependencyUtils } from '../utils/NodeUtils';
import { WorkflowError } from './errors/WorkflowError';
import { BaseNode } from './BaseNode';
import { WorkflowContext } from './WorkflowContext';

interface WorkflowOptions {
    watch: boolean;
    autoProcess: boolean;
    generateTypes: boolean;
    autoOptimize: boolean;
    compression?: boolean;
    validation?: boolean;
    caching?: boolean;
    deepseek?: DeepSeekConfig;
    /**
     * Maximum execution time for the workflow in milliseconds
     */
    timeout?: number;
    /**
     * Maximum number of retries for failed nodes
     */
    maxRetries?: number;
    /**
     * Delay between retries in milliseconds
     */
    retryDelay?: number;
}

/**
 * Represents a JSON processing workflow with advanced features
 */
export class JsonSageWorkflow {
    private detector: JsonSageAutoDetector;
    private analyzer: ProjectAnalyzer;
    private optimizer: PerformanceOptimizer;
    private compressor: JsonCompressor;
    private validator: JsonValidator;
    private cache: SmartCache<any>;
    private deepseek?: DeepSeekService;
    
    // Node management
    private nodes: Map<string, BaseNode> = new Map();
    private edges: Map<string, string[]> = new Map();
    private nodeConfigs: Map<string, any> = new Map();
    
    // Error handling
    private errorHandlers: Array<(error: Error, context: WorkflowContext) => Promise<void>> = [];

    constructor(private options: WorkflowOptions = {
        watch: true,
        autoProcess: true,
        generateTypes: true,
        autoOptimize: true,
        compression: true,
        validation: true,
        caching: true,
        timeout: 30000,
        maxRetries: 3,
        retryDelay: 1000
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

    /**
     * Adds a single node to the workflow
     * @param id - Node identifier
     * @param node - Node instance
     * @param config - Node configuration
     */
    use(id: string, node: BaseNode, config?: any): this {
        if (this.nodes.has(id)) {
            throw new WorkflowError(`Node with ID '${id}' already exists`);
        }
        
        node.setId(id);
        if (config) {
            node.setConfig(config);
        }
        
        this.nodes.set(id, node);
        this.nodeConfigs.set(id, config);
        
        return this;
    }

    /**
     * Adds multiple nodes to the workflow
     * @param nodes - Array of node configurations
     */
    useMany(nodes: Array<{ id: string; node: BaseNode; config?: any }>): this {
        for (const { id, node, config } of nodes) {
            this.use(id, node, config);
        }
        return this;
    }

    /**
     * Adds a connection between nodes
     * @param from - Source node ID
     * @param to - Target node ID
     */
    connect(from: string, to: string): this {
        if (!this.nodes.has(from)) {
            throw new WorkflowError(`Source node '${from}' not found`);
        }
        if (!this.nodes.has(to)) {
            throw new WorkflowError(`Target node '${to}' not found`);
        }
        
        const edges = this.edges.get(from) || [];
        edges.push(to);
        this.edges.set(from, edges);
        
        // Check for circular dependencies
        const cycles = DependencyUtils.detectCircularDependencies(Object.fromEntries(this.edges));
        if (cycles.length > 0) {
            throw new WorkflowError(`Circular dependency detected: ${cycles[0].join(' -> ')}`);
        }
        
        return this;
    }

    /**
     * Adds a global error handler
     * @param handler - Error handler function
     */
    onError(handler: (error: Error, context: WorkflowContext) => Promise<void>): this {
        this.errorHandlers.push(handler);
        return this;
    }

    /**
     * Executes the workflow
     * @param input - Input data
     * @returns Processing result
     */
    async execute(input: any): Promise<any> {
        const context = new WorkflowContext();
        context.setData('input', input);
        
        try {
            // Validate workflow structure
            this.validateWorkflow();
            
            // Get execution order
            const executionOrder = DependencyUtils.topologicalSort(
                Object.fromEntries(this.edges)
            );
            
            // Execute nodes in order
            for (const nodeId of executionOrder) {
                const node = this.nodes.get(nodeId);
                if (!node) continue;
                
                try {
                    await node.execute(context);
                } catch (error) {
                    await this.handleNodeError(error as Error, nodeId, context);
                }
            }
            
            return context.getData('output');
        } catch (error) {
            await this.handleWorkflowError(error as Error, context);
            throw error;
        }
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
            throw new WorkflowError('Failed to initialize workflow', { cause: error });
        }
    }

    /**
     * Validates workflow configuration
     * @throws {WorkflowError} If validation fails
     */
    private validateWorkflow(): void {
        // Check for isolated nodes
        for (const [nodeId] of this.nodes) {
            const hasIncoming = Array.from(this.edges.values()).some(
                targets => targets.includes(nodeId)
            );
            const hasOutgoing = this.edges.has(nodeId);
            
            if (!hasIncoming && !hasOutgoing) {
                throw new WorkflowError(`Node '${nodeId}' is isolated (no connections)`);
            }
        }
        
        // Check for missing nodes in edges
        for (const [from, targets] of this.edges) {
            if (!this.nodes.has(from)) {
                throw new WorkflowError(`Edge references non-existent source node '${from}'`);
            }
            
            for (const to of targets) {
                if (!this.nodes.has(to)) {
                    throw new WorkflowError(`Edge references non-existent target node '${to}'`);
                }
            }
        }
    }

    /**
     * Handles node execution errors
     * @param error - Error that occurred
     * @param nodeId - ID of the failed node
     * @param context - Workflow context
     */
    private async handleNodeError(
        error: Error,
        nodeId: string,
        context: WorkflowContext
    ): Promise<void> {
        context.log.error(`Error in node '${nodeId}':`, error);
        
        // Try node-specific error handler
        const node = this.nodes.get(nodeId);
        if (node) {
            try {
                await node.handleError(error, context);
                return;
            } catch (handlerError) {
                // Node error handler failed, continue with global handlers
                context.log.error(
                    `Node '${nodeId}' error handler failed:`,
                    handlerError
                );
            }
        }
        
        // Try global error handlers
        for (const handler of this.errorHandlers) {
            try {
                await handler(error, context);
                return;
            } catch (handlerError) {
                context.log.error('Global error handler failed:', handlerError);
            }
        }
        
        // If all handlers fail, throw the error
        throw new WorkflowError(`Node '${nodeId}' execution failed`, {
            cause: error,
            nodeId
        });
    }

    /**
     * Handles workflow-level errors
     * @param error - Error that occurred
     * @param context - Workflow context
     */
    private async handleWorkflowError(
        error: Error,
        context: WorkflowContext
    ): Promise<void> {
        context.log.error('Workflow error:', error);
        
        // Try global error handlers
        for (const handler of this.errorHandlers) {
            try {
                await handler(error, context);
                return;
            } catch (handlerError) {
                context.log.error('Global error handler failed:', handlerError);
            }
        }
        
        // If all handlers fail, throw the error
        throw new WorkflowError('Workflow execution failed', { cause: error });
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
