import {
    AgentConfig,
    SchemaGenerationTask,
    SchemaGenerationOptions,
    AgentResult,
    JsonInsight,
    ErrorContext,
    SuccessResponse,
    ErrorResponse,
    PerformanceMetrics,
    LearningFeedback,
    OptimizationSuggestion,
    LearningInsight,
    ValidationResult
} from '../types';
import { JsonAnalyzer } from './JsonAnalyzer';
import { ConfigManager } from './ConfigManager';
import { ErrorHandler } from '../errors/ErrorHandler';
import {
    ValidationError,
    SchemaGenerationError,
    APIError,
    ConfigurationError
} from '../errors/AgentError';
import { PerformanceMonitor } from '../optimization/PerformanceMonitor';
import { ContinuousLearner } from '../optimization/ContinuousLearner';
import { Workflow } from '../workflow/json-sage-workflow';

export class JsonSageAI {
    private workflow!: Workflow;
    private configManager: ConfigManager;
    private insights: JsonInsight[] = [];
    private performanceMonitor: PerformanceMonitor;
    private learner: ContinuousLearner;

    constructor(config: AgentConfig) {
        try {
            this.configManager = new ConfigManager(config);
            this.performanceMonitor = PerformanceMonitor.getInstance();
            this.learner = ContinuousLearner.getInstance();
            this.initializeWorkflow();
        } catch (error) {
            throw new ConfigurationError('初始化失败：配置无效', error);
        }
    }

    private validateConfig(config: AgentConfig): void {
        if (!config.deepseekApiKey) {
            throw new ValidationError('缺少必需的配置项：deepseekApiKey');
        }

        if (config.maxTokens && (config.maxTokens < 1 || config.maxTokens > 8000)) {
            throw new ValidationError('maxTokens必须在1-8000之间');
        }

        if (config.temperature && (config.temperature < 0 || config.temperature > 1)) {
            throw new ValidationError('temperature必须在0-1之间');
        }
    }

    private initializeWorkflow(): void {
        try {
            const config = this.configManager.getConfig();
            this.workflow = new Workflow({
                schema: {
                    useAI: true,
                    deepseek: {
                        apiKey: config.deepseekApiKey,
                        model: config.model || 'deepseek-large',
                        maxTokens: config.maxTokens,
                        temperature: config.temperature
                    },
                    caching: config.caching
                }
            });
        } catch (error) {
            throw new ConfigurationError('工作流初始化失败', error);
        }
    }

    async generateSchema(task: SchemaGenerationTask): Promise<AgentResult> {
        const startTime = Date.now();
        let tokenUsage = 0;
        let cacheHits = 0;
        let cacheMisses = 0;
        let errors: string[] = [];
        let insights: string[] = [];
        let steps: string[] = [];

        try {
            // 验证输入
            this.validateInput(task);

            // 分析数据结构
            steps.push('分析数据结构并生成Schema');
            const fieldInfo = JsonAnalyzer.getFieldInfo(task.jsonData);
            const metrics = JsonAnalyzer.calculateMetrics(task.jsonData);
            
            // 根据分析结果优化配置
            if (metrics.complexity > 5) {
                insights.push('检测到复杂的数据结构，已优化处理策略');
                this.configManager.adaptConfig(metrics);
            }

            // 生成Schema
            let schema;
            try {
                schema = await this.workflow.generateSchema(task.jsonData, task.options);
                insights.push('Schema生成成功，结构完整');
            } catch (error) {
                throw new SchemaGenerationError(
                    `Schema生成失败: ${error instanceof Error ? error.message : '未知错误'}`
                );
            }

            const result: AgentResult = {
                schema,
                metadata: {
                    executionTime: Date.now() - startTime,
                    steps,
                    insights,
                    errors: errors.length > 0 ? errors : undefined
                }
            };

            // 生成字段描述
            if (task.options?.includeDescriptions) {
                try {
                    steps.push('生成智能字段描述');
                    result.descriptions = await this.workflow.deepseek.generateFieldDescriptions(
                        task.jsonData,
                        fieldInfo
                    );
                    insights.push('成功生成字段描述和注释');
                } catch (error) {
                    const errorMsg = `描述生成失败: ${error instanceof Error ? error.message : '未知错误'}`;
                    errors.push(errorMsg);
                    insights.push('字段描述生成过程中遇到问题，建议检查数据结构');
                }
            }

            // 生成示例数据
            if (task.options?.includeExamples) {
                try {
                    steps.push('生成实用示例数据');
                    result.examples = await this.workflow.deepseek.generateExamples(schema, fieldInfo);
                    insights.push('成功生成示例数据');
                } catch (error) {
                    const errorMsg = `示例生成失败: ${error instanceof Error ? error.message : '未知错误'}`;
                    errors.push(errorMsg);
                    insights.push('示例数据生成遇到问题，建议手动提供示例');
                }
            }

            // 更新结果的metadata
            result.metadata.insights = insights;
            result.metadata.errors = errors.length > 0 ? errors : undefined;

            return result;
        } catch (error) {
            throw error instanceof Error ? error : new Error('未知错误');
        }
    }

    /**
     * 记录性能指标
     */
    private recordPerformanceMetrics(metrics: PerformanceMetrics): void {
        this.performanceMonitor.recordMetrics(metrics);
    }

    /**
     * 记录学习反馈
     */
    private recordLearningFeedback(feedback: LearningFeedback): void {
        this.learner.recordFeedback(feedback);
    }

    /**
     * 获取优化建议
     */
    private getOptimizationSuggestions(): OptimizationSuggestion[] {
        const performanceSuggestions = this.performanceMonitor.analyzePerformance();
        const learningInsights = this.learner.getLearningInsights();

        // 将学习洞察转换为优化建议
        const learningBasedSuggestions = learningInsights.map(insight => ({
            type: 'optimization' as const,
            metric: insight.aspect,
            severity: 'info' as const,
            message: insight.message,
            currentValue: insight.score,
            threshold: 0.7, // 质量阈值
            suggestion: insight.suggestion
        }));

        return [...performanceSuggestions, ...learningBasedSuggestions];
    }

    /**
     * 估计Schema质量
     */
    private estimateSchemaQuality(result: AgentResult): number {
        let quality = 1.0;

        // 根据错误数量降低质量分数
        if (result.metadata.errors.length > 0) {
            quality -= result.metadata.errors.length * 0.1;
        }

        // 根据警告类型的洞察降低质量分数
        const warningInsights = this.insights.filter(i => i.severity === 'warning');
        if (warningInsights.length > 0) {
            quality -= warningInsights.length * 0.05;
        }

        return Math.max(0, Math.min(1, quality));
    }

    /**
     * 估计描述质量
     */
    private estimateDescriptionQuality(result: AgentResult): number | undefined {
        if (!result.descriptions) {
            return undefined;
        }

        let quality = 1.0;
        const descriptions = Object.values(result.descriptions);

        // 检查描述的完整性
        if (descriptions.some(desc => !desc || desc.length < 10)) {
            quality -= 0.2;
        }

        // 检查描述的信息量
        const avgLength = descriptions.reduce((sum, desc) => sum + desc.length, 0) / descriptions.length;
        if (avgLength < 30) {
            quality -= 0.1;
        }

        return Math.max(0, Math.min(1, quality));
    }

    /**
     * 估计示例质量
     */
    private estimateExampleQuality(result: AgentResult): number | undefined {
        if (!result.examples) {
            return undefined;
        }

        let quality = 1.0;

        try {
            // 检查示例的有效性
            JSON.stringify(result.examples);

            // 检查示例的复杂度
            const complexity = JsonAnalyzer.calculateMetrics(result.examples);
            if (complexity.depth < 2) {
                quality -= 0.1;
            }
            if (complexity.fieldCount < 5) {
                quality -= 0.1;
            }
        } catch {
            quality = 0;
        }

        return Math.max(0, Math.min(1, quality));
    }

    private validateInput(task: SchemaGenerationTask): void {
        if (!task.jsonData) {
            throw new ValidationError('缺少必需的数据');
        }

        if (typeof task.jsonData !== 'object' || task.jsonData === null) {
            throw new ValidationError('数据必须是对象类型');
        }

        if (Object.keys(task.jsonData).length === 0) {
            throw new ValidationError('数据不能为空对象');
        }
    }

    private enhanceOptionsBasedOnAnalysis(options: SchemaGenerationOptions = {}, fieldInfo: any[]): SchemaGenerationOptions {
        const enhancedOptions: SchemaGenerationOptions = {
            ...options,
            required: fieldInfo.filter(field => field.isRequired).map(field => field.name)
        };
        return enhancedOptions;
    }

    private async generateEnhancedDescriptions(data: any, fieldInfo: any[]): Promise<Record<string, string>> {
        const descriptions: Record<string, string> = {};
        for (const field of fieldInfo) {
            descriptions[field.name] = `产品${field.name}`;
        }
        return descriptions;
    }

    private async generateEnhancedExamples(schema: any, fieldInfo: any[]): Promise<any[]> {
        return [
            {
                name: "智能手表",
                price: 1299.99,
                description: "一款功能强大的智能手表，支持心率监测和运动追踪"
            }
        ];
    }

    private getConfigInsights(): string[] {
        const insights: string[] = [];
        const history = this.configManager.getAdaptationHistory();
        
        // 只获取最近的配置调整
        const recentChanges = history[history.length - 1];
        if (recentChanges) {
            insights.push(`配置自动优化: ${recentChanges.reason}`);
        }

        return insights;
    }

    getConfig(): AgentConfig {
        return this.configManager.getConfig();
    }

    resetConfig(): void {
        try {
            this.configManager.resetConfig();
            this.initializeWorkflow();
        } catch (error) {
            throw new ConfigurationError('配置重置失败', error);
        }
    }

    /**
     * 获取性能指标
     */
    getPerformanceMetrics(): OptimizationSuggestion[] {
        return this.performanceMonitor.analyzePerformance();
    }

    /**
     * 获取学习洞察
     */
    getLearningInsights(): LearningInsight[] {
        return this.learner.getLearningInsights();
    }

    /**
     * 提供用户反馈
     */
    provideFeedback(feedback: LearningFeedback): void {
        feedback.source = 'user';
        feedback.timestamp = Date.now();
        this.learner.recordFeedback(feedback);
    }

    /**
     * 验证数据是否符合Schema
     */
    validateSchema(schema: any, data: any): ValidationResult {
        try {
            const Ajv = require('ajv');
            const ajv = new Ajv();
            const validate = ajv.compile(schema);
            const valid = validate(data);
            return {
                valid,
                errors: valid ? undefined : validate.errors?.map((err: any) => err.message)
            };
        } catch (error) {
            return {
                valid: false,
                errors: [(error as Error).message]
            };
        }
    }

    static create(config: AgentConfig): JsonSageAI {
        return new JsonSageAI(config);
    }
}
