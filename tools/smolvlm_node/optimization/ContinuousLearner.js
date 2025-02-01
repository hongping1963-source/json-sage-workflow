"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContinuousLearner = void 0;
var ContinuousLearner = /** @class */ (function () {
    function ContinuousLearner() {
        this.feedbackHistory = [];
        this.adaptationHistory = [];
        this.maxHistorySize = 1000;
    }
    ContinuousLearner.getInstance = function () {
        if (!ContinuousLearner.instance) {
            ContinuousLearner.instance = new ContinuousLearner();
        }
        return ContinuousLearner.instance;
    };
    /**
     * 记录学习反馈
     */
    ContinuousLearner.prototype.recordFeedback = function (feedback) {
        this.feedbackHistory.push(__assign(__assign({}, feedback), { timestamp: Date.now() }));
        // 保持历史记录在限制范围内
        if (this.feedbackHistory.length > this.maxHistorySize) {
            this.feedbackHistory = this.feedbackHistory.slice(-this.maxHistorySize);
        }
        // 分析反馈并生成适应性建议
        this.analyzeAndAdapt(feedback);
    };
    /**
     * 分析反馈并生成适应性建议
     */
    ContinuousLearner.prototype.analyzeAndAdapt = function (feedback) {
        var adaptation = {
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
            }
            else if (feedback.schemaQuality > 0.9) {
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
    };
    /**
     * 获取学习洞察
     */
    ContinuousLearner.prototype.getLearningInsights = function () {
        var insights = [];
        // 分析反馈趋势
        var recentFeedback = this.feedbackHistory.slice(-50);
        if (recentFeedback.length > 0) {
            var avgSchemaQuality = this.calculateAverageQuality(recentFeedback, 'schemaQuality');
            var avgDescriptionQuality = this.calculateAverageQuality(recentFeedback, 'descriptionQuality');
            var avgExampleQuality = this.calculateAverageQuality(recentFeedback, 'exampleQuality');
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
        var recentAdaptations = this.adaptationHistory.slice(-10);
        if (recentAdaptations.length > 0) {
            var adaptationEffects = this.analyzeAdaptationEffects(recentAdaptations);
            insights.push.apply(insights, adaptationEffects);
        }
        return insights;
    };
    /**
     * 分析模型适应效果
     */
    ContinuousLearner.prototype.analyzeAdaptationEffects = function (adaptations) {
        var insights = [];
        // 分析temperature调整效果
        var temperatureChanges = adaptations.filter(function (a) { return 'temperature' in a.changes; });
        if (temperatureChanges.length > 0) {
            var latestChange = temperatureChanges[temperatureChanges.length - 1];
            var subsequentFeedback = this.getFeedbackAfterTimestamp(latestChange.timestamp);
            if (subsequentFeedback.length > 0) {
                var avgQualityBefore = this.calculateAverageQuality(this.getFeedbackBeforeTimestamp(latestChange.timestamp), 'schemaQuality');
                var avgQualityAfter = this.calculateAverageQuality(subsequentFeedback, 'schemaQuality');
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
    };
    /**
     * 获取指定时间戳之后的反馈
     */
    ContinuousLearner.prototype.getFeedbackAfterTimestamp = function (timestamp) {
        return this.feedbackHistory.filter(function (f) { return f.timestamp > timestamp; });
    };
    /**
     * 获取指定时间戳之前的反馈
     */
    ContinuousLearner.prototype.getFeedbackBeforeTimestamp = function (timestamp) {
        return this.feedbackHistory.filter(function (f) { return f.timestamp < timestamp; });
    };
    /**
     * 计算平均质量分数
     */
    ContinuousLearner.prototype.calculateAverageQuality = function (feedback, aspect) {
        var validFeedback = feedback.filter(function (f) { return f[aspect] !== undefined; });
        if (validFeedback.length === 0) {
            return 0;
        }
        return validFeedback.reduce(function (sum, f) { return sum + (f[aspect] || 0); }, 0) / validFeedback.length;
    };
    /**
     * 获取适应性历史
     */
    ContinuousLearner.prototype.getAdaptationHistory = function () {
        return __spreadArray([], this.adaptationHistory, true);
    };
    /**
     * 清除历史数据
     */
    ContinuousLearner.prototype.clearHistory = function () {
        this.feedbackHistory = [];
        this.adaptationHistory = [];
    };
    return ContinuousLearner;
}());
exports.ContinuousLearner = ContinuousLearner;
