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
exports.ConfigManager = void 0;
var ConfigManager = /** @class */ (function () {
    function ConfigManager(config) {
        this.lastAdaptation = 0;
        this.adaptationHistory = [];
        this.config = this.validateAndNormalizeConfig(__assign(__assign({}, ConfigManager.DEFAULT_CONFIG), config));
    }
    /**
     * 根据JSON数据特征自适应调整配置
     */
    ConfigManager.prototype.adaptConfig = function (metrics) {
        this.metrics = metrics;
        var now = Date.now();
        // 避免过于频繁的适配
        if (now - this.lastAdaptation < 5000) {
            return;
        }
        var changes = {};
        var reasons = [];
        // 1. 根据数据复杂度调整模型参数
        var complexityChanges = this.adaptToComplexity(metrics);
        Object.assign(changes, complexityChanges.changes);
        reasons.push(complexityChanges.reason);
        // 2. 根据数据大小调整token限制
        var tokenChanges = this.adaptTokenLimit(metrics);
        Object.assign(changes, tokenChanges.changes);
        reasons.push(tokenChanges.reason);
        // 3. 根据数据质量调整temperature
        var temperatureChanges = this.adaptTemperature(metrics);
        Object.assign(changes, temperatureChanges.changes);
        reasons.push(temperatureChanges.reason);
        // 4. 根据数据特征调整缓存策略
        var cacheChanges = this.adaptCacheStrategy(metrics);
        Object.assign(changes, cacheChanges.changes);
        reasons.push(cacheChanges.reason);
        // 应用更改
        if (Object.keys(changes).length > 0) {
            this.config = this.validateAndNormalizeConfig(__assign(__assign({}, this.config), changes));
            this.adaptationHistory.push({
                timestamp: now,
                changes: changes,
                reason: reasons.filter(Boolean).join('; ')
            });
            this.lastAdaptation = now;
        }
    };
    /**
     * 根据数据复杂度调整配置
     */
    ConfigManager.prototype.adaptToComplexity = function (metrics) {
        var changes = {};
        var reason = '';
        // 复杂度评分 (0-1)
        var complexityScore = this.calculateComplexityScore(metrics);
        if (complexityScore > 0.8) {
            // 高复杂度：使用更保守的配置
            changes.temperature = Math.max(0.3, (this.config.temperature || 0.7) - 0.2);
            reason = '数据结构复杂，降低temperature以提高准确性';
        }
        else if (complexityScore < 0.3) {
            // 低复杂度：可以使用更灵活的配置
            changes.temperature = Math.min(0.9, (this.config.temperature || 0.7) + 0.1);
            reason = '数据结构简单，提高temperature以增加多样性';
        }
        return { changes: changes, reason: reason };
    };
    /**
     * 根据数据大小调整token限制
     */
    ConfigManager.prototype.adaptTokenLimit = function (metrics) {
        var changes = {};
        var reason = '';
        // 估算所需token数量
        var estimatedTokens = this.estimateRequiredTokens(metrics);
        var currentLimit = this.config.maxTokens || 2000;
        if (estimatedTokens > currentLimit * 0.8) {
            changes.maxTokens = Math.min(this.getModelConfig().maxTokens.max, Math.ceil(currentLimit * 1.5));
            reason = '数据量较大，增加token限制';
        }
        else if (estimatedTokens < currentLimit * 0.3) {
            changes.maxTokens = Math.max(this.getModelConfig().maxTokens.min, Math.ceil(currentLimit * 0.7));
            reason = '数据量较小，减少token限制以优化性能';
        }
        return { changes: changes, reason: reason };
    };
    /**
     * 根据数据质量调整temperature
     */
    ConfigManager.prototype.adaptTemperature = function (metrics) {
        var changes = {};
        var reason = '';
        // 数据质量评分 (0-1)
        var qualityScore = this.calculateQualityScore(metrics);
        if (qualityScore < 0.5) {
            // 低质量数据：使用更保守的配置
            changes.temperature = Math.max(0.2, (this.config.temperature || 0.7) - 0.3);
            reason = '数据质量较低，降低temperature以提高可靠性';
        }
        else if (qualityScore > 0.8) {
            // 高质量数据：可以使用更灵活的配置
            changes.temperature = Math.min(0.8, (this.config.temperature || 0.7) + 0.1);
            reason = '数据质量良好，适当提高temperature';
        }
        return { changes: changes, reason: reason };
    };
    /**
     * 根据数据特征调整缓存策略
     */
    ConfigManager.prototype.adaptCacheStrategy = function (metrics) {
        var changes = {};
        var reason = '';
        // 评估是否适合缓存
        var shouldCache = this.evaluateCacheability(metrics);
        if (shouldCache && !this.config.caching) {
            changes.caching = true;
            reason = '数据特征适合缓存，启用缓存以提高性能';
        }
        else if (!shouldCache && this.config.caching) {
            changes.caching = false;
            reason = '数据变化频繁，禁用缓存以保持准确性';
        }
        return { changes: changes, reason: reason };
    };
    /**
     * 计算数据复杂度评分
     */
    ConfigManager.prototype.calculateComplexityScore = function (metrics) {
        var depthScore = Math.min(metrics.depth / 10, 1);
        var arrayDepthScore = Math.min(metrics.arrayDepth / 5, 1);
        var fieldCountScore = Math.min(metrics.fieldCount / 100, 1);
        return (depthScore + arrayDepthScore + fieldCountScore) / 3;
    };
    /**
     * 估算所需的token数量
     */
    ConfigManager.prototype.estimateRequiredTokens = function (metrics) {
        // 粗略估算：每个字段平均4个token，嵌套层级每层翻倍
        var baseTokens = metrics.fieldCount * 4;
        var depthMultiplier = Math.pow(2, metrics.depth - 1);
        return baseTokens * depthMultiplier;
    };
    /**
     * 计算数据质量评分
     */
    ConfigManager.prototype.calculateQualityScore = function (metrics) {
        var nullRatio = metrics.nullCount / metrics.fieldCount;
        var mixedTypeRatio = metrics.mixedTypes.length / metrics.fieldCount;
        var nullScore = 1 - Math.min(nullRatio, 1);
        var typeScore = 1 - Math.min(mixedTypeRatio, 1);
        return (nullScore + typeScore) / 2;
    };
    /**
     * 评估数据是否适合缓存
     */
    ConfigManager.prototype.evaluateCacheability = function (metrics) {
        // 简单的数据更适合缓存
        var isSimple = this.calculateComplexityScore(metrics) < 0.5;
        // 高质量的数据更适合缓存
        var isHighQuality = this.calculateQualityScore(metrics) > 0.7;
        return isSimple && isHighQuality;
    };
    /**
     * 获取当前模型的配置限制
     */
    ConfigManager.prototype.getModelConfig = function () {
        return (ConfigManager.MODEL_CONFIGS[this.config.model || 'deepseek-chat'] ||
            ConfigManager.MODEL_CONFIGS['deepseek-chat']);
    };
    /**
     * 验证并规范化配置
     */
    ConfigManager.prototype.validateAndNormalizeConfig = function (config) {
        var modelConfig = this.getModelConfig();
        return __assign(__assign({}, config), { temperature: this.clamp(config.temperature || modelConfig.temperature.default, modelConfig.temperature.min, modelConfig.temperature.max), maxTokens: this.clamp(config.maxTokens || modelConfig.maxTokens.default, modelConfig.maxTokens.min, modelConfig.maxTokens.max) });
    };
    /**
     * 限制数值在指定范围内
     */
    ConfigManager.prototype.clamp = function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    };
    /**
     * 获取当前配置
     */
    ConfigManager.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * 获取配置调整历史
     */
    ConfigManager.prototype.getAdaptationHistory = function () {
        return __spreadArray([], this.adaptationHistory, true);
    };
    /**
     * 重置配置到默认值
     */
    ConfigManager.prototype.resetConfig = function () {
        this.config = this.validateAndNormalizeConfig(__assign(__assign({}, ConfigManager.DEFAULT_CONFIG), { deepseekApiKey: this.config.deepseekApiKey }));
        this.adaptationHistory = [];
        this.lastAdaptation = 0;
    };
    ConfigManager.DEFAULT_CONFIG = {
        model: 'deepseek-chat',
        maxTokens: 2000,
        temperature: 0.7,
        caching: true
    };
    ConfigManager.MODEL_CONFIGS = {
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
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
