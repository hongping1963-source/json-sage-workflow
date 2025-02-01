import { AgentConfig, JsonMetrics, ModelConfig, CacheConfig } from '../types';

export class ConfigManager {
    private static readonly DEFAULT_CONFIG: Partial<AgentConfig> = {
        model: 'deepseek-chat',
        maxTokens: 2000,
        temperature: 0.7,
        caching: true
    };

    private static readonly MODEL_CONFIGS: Record<string, ModelConfig> = {
        'deepseek-chat': {
            maxTokens: {
                min: 1000,
                max: 4000,
                default: 2000
            },
            temperature: {
                min: 0.1,
                max: 1.0,
                default: 0.7
            }
        }
    };

    private config: AgentConfig;
    private metrics?: JsonMetrics;
    private lastAdaptation: number = 0;
    private adaptationHistory: Array<{
        timestamp: number;
        changes: Partial<AgentConfig>;
        reason: string;
    }> = [];

    constructor(config: AgentConfig) {
        this.config = this.validateAndNormalizeConfig({
            ...ConfigManager.DEFAULT_CONFIG,
            ...config
        });
    }

    /**
     * 根据JSON数据特征自适应调整配置
     */
    adaptConfig(metrics: JsonMetrics): void {
        this.metrics = metrics;
        const now = Date.now();

        // 避免过于频繁的适配
        if (now - this.lastAdaptation < 5000) {
            return;
        }

        const changes: Partial<AgentConfig> = {};
        const reasons: string[] = [];

        // 1. 根据数据复杂度调整模型参数
        const complexityChanges = this.adaptToComplexity(metrics);
        Object.assign(changes, complexityChanges.changes);
        reasons.push(complexityChanges.reason);

        // 2. 根据数据大小调整token限制
        const tokenChanges = this.adaptTokenLimit(metrics);
        Object.assign(changes, tokenChanges.changes);
        reasons.push(tokenChanges.reason);

        // 3. 根据数据质量调整temperature
        const temperatureChanges = this.adaptTemperature(metrics);
        Object.assign(changes, temperatureChanges.changes);
        reasons.push(temperatureChanges.reason);

        // 4. 根据数据特征调整缓存策略
        const cacheChanges = this.adaptCacheStrategy(metrics);
        Object.assign(changes, cacheChanges.changes);
        reasons.push(cacheChanges.reason);

        // 应用更改
        if (Object.keys(changes).length > 0) {
            this.config = this.validateAndNormalizeConfig({
                ...this.config,
                ...changes
            });

            this.adaptationHistory.push({
                timestamp: now,
                changes,
                reason: reasons.filter(Boolean).join('; ')
            });

            this.lastAdaptation = now;
        }
    }

    /**
     * 根据数据复杂度调整配置
     */
    private adaptToComplexity(metrics: JsonMetrics): {
        changes: Partial<AgentConfig>;
        reason: string;
    } {
        const changes: Partial<AgentConfig> = {};
        let reason = '';

        // 复杂度评分 (0-1)
        const complexityScore = this.calculateComplexityScore(metrics);

        if (complexityScore > 0.8) {
            // 高复杂度：使用更保守的配置
            changes.temperature = Math.max(0.3, (this.config.temperature || 0.7) - 0.2);
            reason = '数据结构复杂，降低temperature以提高准确性';
        } else if (complexityScore < 0.3) {
            // 低复杂度：可以使用更灵活的配置
            changes.temperature = Math.min(0.9, (this.config.temperature || 0.7) + 0.1);
            reason = '数据结构简单，提高temperature以增加多样性';
        }

        return { changes, reason };
    }

    /**
     * 根据数据大小调整token限制
     */
    private adaptTokenLimit(metrics: JsonMetrics): {
        changes: Partial<AgentConfig>;
        reason: string;
    } {
        const changes: Partial<AgentConfig> = {};
        let reason = '';

        // 估算所需token数量
        const estimatedTokens = this.estimateRequiredTokens(metrics);
        const currentLimit = this.config.maxTokens || 2000;

        if (estimatedTokens > currentLimit * 0.8) {
            changes.maxTokens = Math.min(
                this.getModelConfig().maxTokens.max,
                Math.ceil(currentLimit * 1.5)
            );
            reason = '数据量较大，增加token限制';
        } else if (estimatedTokens < currentLimit * 0.3) {
            changes.maxTokens = Math.max(
                this.getModelConfig().maxTokens.min,
                Math.ceil(currentLimit * 0.7)
            );
            reason = '数据量较小，减少token限制以优化性能';
        }

        return { changes, reason };
    }

    /**
     * 根据数据质量调整temperature
     */
    private adaptTemperature(metrics: JsonMetrics): {
        changes: Partial<AgentConfig>;
        reason: string;
    } {
        const changes: Partial<AgentConfig> = {};
        let reason = '';

        // 数据质量评分 (0-1)
        const qualityScore = this.calculateQualityScore(metrics);

        if (qualityScore < 0.5) {
            // 低质量数据：使用更保守的配置
            changes.temperature = Math.max(0.2, (this.config.temperature || 0.7) - 0.3);
            reason = '数据质量较低，降低temperature以提高可靠性';
        } else if (qualityScore > 0.8) {
            // 高质量数据：可以使用更灵活的配置
            changes.temperature = Math.min(0.8, (this.config.temperature || 0.7) + 0.1);
            reason = '数据质量良好，适当提高temperature';
        }

        return { changes, reason };
    }

    /**
     * 根据数据特征调整缓存策略
     */
    private adaptCacheStrategy(metrics: JsonMetrics): {
        changes: Partial<AgentConfig>;
        reason: string;
    } {
        const changes: Partial<AgentConfig> = {};
        let reason = '';

        // 评估是否适合缓存
        const shouldCache = this.evaluateCacheability(metrics);

        if (shouldCache && !this.config.caching) {
            changes.caching = true;
            reason = '数据特征适合缓存，启用缓存以提高性能';
        } else if (!shouldCache && this.config.caching) {
            changes.caching = false;
            reason = '数据变化频繁，禁用缓存以保持准确性';
        }

        return { changes, reason };
    }

    /**
     * 计算数据复杂度评分
     */
    private calculateComplexityScore(metrics: JsonMetrics): number {
        const depthScore = Math.min(metrics.depth / 10, 1);
        const arrayDepthScore = Math.min(metrics.arrayDepth / 5, 1);
        const fieldCountScore = Math.min(metrics.fieldCount / 100, 1);

        return (depthScore + arrayDepthScore + fieldCountScore) / 3;
    }

    /**
     * 估算所需的token数量
     */
    private estimateRequiredTokens(metrics: JsonMetrics): number {
        // 粗略估算：每个字段平均4个token，嵌套层级每层翻倍
        const baseTokens = metrics.fieldCount * 4;
        const depthMultiplier = Math.pow(2, metrics.depth - 1);
        return baseTokens * depthMultiplier;
    }

    /**
     * 计算数据质量评分
     */
    private calculateQualityScore(metrics: JsonMetrics): number {
        const nullRatio = metrics.nullCount / metrics.fieldCount;
        const mixedTypeRatio = metrics.mixedTypes.length / metrics.fieldCount;
        
        const nullScore = 1 - Math.min(nullRatio, 1);
        const typeScore = 1 - Math.min(mixedTypeRatio, 1);

        return (nullScore + typeScore) / 2;
    }

    /**
     * 评估数据是否适合缓存
     */
    private evaluateCacheability(metrics: JsonMetrics): boolean {
        // 简单的数据更适合缓存
        const isSimple = this.calculateComplexityScore(metrics) < 0.5;
        // 高质量的数据更适合缓存
        const isHighQuality = this.calculateQualityScore(metrics) > 0.7;
        
        return isSimple && isHighQuality;
    }

    /**
     * 获取当前模型的配置限制
     */
    private getModelConfig(): ModelConfig {
        return (
            ConfigManager.MODEL_CONFIGS[this.config.model || 'deepseek-chat'] ||
            ConfigManager.MODEL_CONFIGS['deepseek-chat']
        );
    }

    /**
     * 验证并规范化配置
     */
    private validateAndNormalizeConfig(config: AgentConfig): AgentConfig {
        const modelConfig = this.getModelConfig();

        return {
            ...config,
            temperature: this.clamp(
                config.temperature || modelConfig.temperature.default,
                modelConfig.temperature.min,
                modelConfig.temperature.max
            ),
            maxTokens: this.clamp(
                config.maxTokens || modelConfig.maxTokens.default,
                modelConfig.maxTokens.min,
                modelConfig.maxTokens.max
            )
        };
    }

    /**
     * 限制数值在指定范围内
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * 获取当前配置
     */
    getConfig(): AgentConfig {
        return { ...this.config };
    }

    /**
     * 获取配置调整历史
     */
    getAdaptationHistory(): Array<{
        timestamp: number;
        changes: Partial<AgentConfig>;
        reason: string;
    }> {
        return [...this.adaptationHistory];
    }

    /**
     * 重置配置到默认值
     */
    resetConfig(): void {
        this.config = this.validateAndNormalizeConfig({
            ...ConfigManager.DEFAULT_CONFIG,
            deepseekApiKey: this.config.deepseekApiKey
        });
        this.adaptationHistory = [];
        this.lastAdaptation = 0;
    }
}
