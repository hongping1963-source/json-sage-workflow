import { LearningFeedback, ModelAdaptation, LearningInsight } from '../types';
import { JsonAnalyzer } from '../agent/JsonAnalyzer';

export class ContinuousLearner {
    private static instance: ContinuousLearner;
    private feedbackHistory: LearningFeedback[] = [];
    private adaptationHistory: ModelAdaptation[] = [];
    private readonly maxHistorySize = 1000;

    private constructor() {}

    static getInstance(): ContinuousLearner {
        if (!ContinuousLearner.instance) {
            ContinuousLearner.instance = new ContinuousLearner();
        }
        return ContinuousLearner.instance;
    }

    /**
     * 记录学习反馈
     */
    recordFeedback(feedback: LearningFeedback): void {
        this.feedbackHistory.push({
            ...feedback,
            timestamp: Date.now()
        });

        // 保持历史记录在限制范围内
        if (this.feedbackHistory.length > this.maxHistorySize) {
            this.feedbackHistory = this.feedbackHistory.slice(-this.maxHistorySize);
        }

        // 分析反馈并生成适应性建议
        this.analyzeAndAdapt(feedback);
    }

    /**
     * 分析反馈并生成适应性建议
     */
    private analyzeAndAdapt(feedback: LearningFeedback): void {
        const adaptation: ModelAdaptation = {
            timestamp: Date.now(),
            source: feedback.source,
            changes: {},
            reasoning: []
        };

        // 分析Schema质量反馈
        if (feedback.schemaQuality !== undefined) {
            if (feedback.schemaQuality < 0.7) {
                adaptation.changes.temperature = Math.max(0.2, feedback.currentConfig.temperature - 0.1);
                adaptation.reasoning.push('降低temperature以提高Schema准确性');
            } else if (feedback.schemaQuality > 0.9) {
                adaptation.changes.temperature = Math.min(0.8, feedback.currentConfig.temperature + 0.05);
                adaptation.reasoning.push('适当提高temperature以增加创造性');
            }
        }

        // 分析描述质量反馈
        if (feedback.descriptionQuality !== undefined) {
            if (feedback.descriptionQuality < 0.7) {
                adaptation.changes.maxTokens = Math.min(8000, feedback.currentConfig.maxTokens + 500);
                adaptation.reasoning.push('增加maxTokens以生成更详细的描述');
            }
        }

        // 分析示例质量反馈
        if (feedback.exampleQuality !== undefined) {
            if (feedback.exampleQuality < 0.7) {
                adaptation.changes.temperature = Math.max(0.3, feedback.currentConfig.temperature + 0.1);
                adaptation.reasoning.push('提高temperature以生成更多样的示例');
            }
        }

        // 记录适应性建议
        if (Object.keys(adaptation.changes).length > 0) {
            this.adaptationHistory.push(adaptation);
            if (this.adaptationHistory.length > this.maxHistorySize) {
                this.adaptationHistory = this.adaptationHistory.slice(-this.maxHistorySize);
            }
        }
    }

    /**
     * 获取学习洞察
     */
    getLearningInsights(): LearningInsight[] {
        const insights: LearningInsight[] = [];
        
        // 分析反馈趋势
        const recentFeedback = this.feedbackHistory.slice(-50);
        if (recentFeedback.length > 0) {
            const avgSchemaQuality = this.calculateAverageQuality(recentFeedback, 'schemaQuality');
            const avgDescriptionQuality = this.calculateAverageQuality(recentFeedback, 'descriptionQuality');
            const avgExampleQuality = this.calculateAverageQuality(recentFeedback, 'exampleQuality');

            if (avgSchemaQuality < 0.7) {
                insights.push({
                    type: 'quality',
                    aspect: 'schema',
                    message: 'Schema生成质量需要改进',
                    score: avgSchemaQuality,
                    suggestion: '考虑调整模型参数或优化提示词'
                });
            }

            if (avgDescriptionQuality < 0.7) {
                insights.push({
                    type: 'quality',
                    aspect: 'description',
                    message: '字段描述质量需要改进',
                    score: avgDescriptionQuality,
                    suggestion: '考虑增加上下文信息或优化描述生成策略'
                });
            }

            if (avgExampleQuality < 0.7) {
                insights.push({
                    type: 'quality',
                    aspect: 'example',
                    message: '示例数据质量需要改进',
                    score: avgExampleQuality,
                    suggestion: '考虑调整示例生成策略或增加数据多样性'
                });
            }
        }

        // 分析适应性效果
        const recentAdaptations = this.adaptationHistory.slice(-10);
        if (recentAdaptations.length > 0) {
            const adaptationEffects = this.analyzeAdaptationEffects(recentAdaptations);
            insights.push(...adaptationEffects);
        }

        return insights;
    }

    /**
     * 分析模型适应效果
     */
    private analyzeAdaptationEffects(adaptations: ModelAdaptation[]): LearningInsight[] {
        const insights: LearningInsight[] = [];
        
        // 分析temperature调整效果
        const temperatureChanges = adaptations.filter(a => 'temperature' in a.changes);
        if (temperatureChanges.length > 0) {
            const latestChange = temperatureChanges[temperatureChanges.length - 1];
            const subsequentFeedback = this.getFeedbackAfterTimestamp(latestChange.timestamp);
            
            if (subsequentFeedback.length > 0) {
                const avgQualityBefore = this.calculateAverageQuality(
                    this.getFeedbackBeforeTimestamp(latestChange.timestamp),
                    'schemaQuality'
                );
                const avgQualityAfter = this.calculateAverageQuality(subsequentFeedback, 'schemaQuality');

                if (avgQualityAfter < avgQualityBefore) {
                    insights.push({
                        type: 'adaptation',
                        aspect: 'temperature',
                        message: 'Temperature调整可能产生负面影响',
                        score: avgQualityAfter - avgQualityBefore,
                        suggestion: '考虑回滚temperature调整或尝试其他优化方向'
                    });
                }
            }
        }

        return insights;
    }

    /**
     * 获取指定时间戳之后的反馈
     */
    private getFeedbackAfterTimestamp(timestamp: number): LearningFeedback[] {
        return this.feedbackHistory.filter(f => f.timestamp > timestamp);
    }

    /**
     * 获取指定时间戳之前的反馈
     */
    private getFeedbackBeforeTimestamp(timestamp: number): LearningFeedback[] {
        return this.feedbackHistory.filter(f => f.timestamp < timestamp);
    }

    /**
     * 计算平均质量分数
     */
    private calculateAverageQuality(feedback: LearningFeedback[], aspect: keyof Pick<LearningFeedback, 'schemaQuality' | 'descriptionQuality' | 'exampleQuality'>): number {
        const validFeedback = feedback.filter(f => f[aspect] !== undefined);
        if (validFeedback.length === 0) {
            return 0;
        }
        return validFeedback.reduce((sum, f) => sum + (f[aspect] || 0), 0) / validFeedback.length;
    }

    /**
     * 获取适应性历史
     */
    getAdaptationHistory(): ModelAdaptation[] {
        return [...this.adaptationHistory];
    }

    /**
     * 清除历史数据
     */
    clearHistory(): void {
        this.feedbackHistory = [];
        this.adaptationHistory = [];
    }
}
