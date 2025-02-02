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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
var PerformanceMonitor = /** @class */ (function () {
    function PerformanceMonitor() {
        this.metrics = [];
        this.thresholds = {
            executionTime: 5000, // 5秒
            tokenUsage: 4000, // 4000 tokens
            errorRate: 0.1, // 10%
            cacheHitRate: 0.6 // 60%
        };
    }
    PerformanceMonitor.getInstance = function () {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    };
    /**
     * 记录性能指标
     */
    PerformanceMonitor.prototype.recordMetrics = function (metrics) {
        this.metrics.push(__assign(__assign({}, metrics), { timestamp: Date.now() }));
        // 保持最近1000条记录
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }
    };
    /**
     * 分析性能并生成优化建议
     */
    PerformanceMonitor.prototype.analyzePerformance = function () {
        var suggestions = [];
        if (this.metrics.length === 0) {
            return suggestions;
        }
        // 计算平均指标
        var avgMetrics = this.calculateAverageMetrics();
        // 检查执行时间
        if (avgMetrics.executionTime > this.thresholds.executionTime) {
            suggestions.push({
                type: 'performance',
                metric: 'executionTime',
                severity: 'warning',
                message: '平均执行时间过长',
                currentValue: avgMetrics.executionTime,
                threshold: this.thresholds.executionTime,
                suggestion: '考虑增加缓存或优化数据处理逻辑'
            });
        }
        // 检查Token使用量
        if (avgMetrics.tokenUsage > this.thresholds.tokenUsage) {
            suggestions.push({
                type: 'resource',
                metric: 'tokenUsage',
                severity: 'warning',
                message: 'Token使用量较高',
                currentValue: avgMetrics.tokenUsage,
                threshold: this.thresholds.tokenUsage,
                suggestion: '考虑优化提示词或减少输入数据大小'
            });
        }
        // 检查错误率
        var errorRate = this.calculateErrorRate();
        if (errorRate > this.thresholds.errorRate) {
            suggestions.push({
                type: 'reliability',
                metric: 'errorRate',
                severity: 'error',
                message: '错误率过高',
                currentValue: errorRate,
                threshold: this.thresholds.errorRate,
                suggestion: '检查错误模式并改进错误处理'
            });
        }
        // 检查缓存命中率
        var cacheHitRate = this.calculateCacheHitRate();
        if (cacheHitRate < this.thresholds.cacheHitRate) {
            suggestions.push({
                type: 'optimization',
                metric: 'cacheHitRate',
                severity: 'info',
                message: '缓存命中率较低',
                currentValue: cacheHitRate,
                threshold: this.thresholds.cacheHitRate,
                suggestion: '考虑调整缓存策略或增加缓存容量'
            });
        }
        return suggestions;
    };
    /**
     * 获取性能趋势分析
     */
    PerformanceMonitor.prototype.getPerformanceTrends = function () {
        var _this = this;
        var timeRanges = [
            { label: '最近1小时', duration: 60 * 60 * 1000 },
            { label: '最近24小时', duration: 24 * 60 * 60 * 1000 },
            { label: '最近7天', duration: 7 * 24 * 60 * 60 * 1000 }
        ];
        var now = Date.now();
        return timeRanges.map(function (range) {
            var rangeMetrics = _this.metrics.filter(function (m) {
                return now - m.timestamp < range.duration;
            });
            if (rangeMetrics.length === 0) {
                return {
                    timeRange: range.label,
                    metrics: null
                };
            }
            return {
                timeRange: range.label,
                metrics: _this.calculateAverageMetrics(rangeMetrics)
            };
        });
    };
    /**
     * 更新性能阈值
     */
    PerformanceMonitor.prototype.updateThresholds = function (newThresholds) {
        this.thresholds = __assign(__assign({}, this.thresholds), newThresholds);
    };
    /**
     * 获取当前阈值
     */
    PerformanceMonitor.prototype.getThresholds = function () {
        return __assign({}, this.thresholds);
    };
    /**
     * 计算平均指标
     */
    PerformanceMonitor.prototype.calculateAverageMetrics = function (metrics) {
        if (metrics === void 0) { metrics = this.metrics; }
        var sum = metrics.reduce(function (acc, curr) { return ({
            executionTime: acc.executionTime + curr.executionTime,
            tokenUsage: acc.tokenUsage + curr.tokenUsage,
            cacheHits: acc.cacheHits + curr.cacheHits,
            cacheMisses: acc.cacheMisses + curr.cacheMisses,
            successCount: acc.successCount + curr.successCount,
            errorCount: acc.errorCount + curr.errorCount,
            timestamp: 0
        }); });
        return {
            executionTime: sum.executionTime / metrics.length,
            tokenUsage: sum.tokenUsage / metrics.length,
            cacheHits: sum.cacheHits / metrics.length,
            cacheMisses: sum.cacheMisses / metrics.length,
            successCount: sum.successCount / metrics.length,
            errorCount: sum.errorCount / metrics.length,
            timestamp: Date.now()
        };
    };
    /**
     * 计算错误率
     */
    PerformanceMonitor.prototype.calculateErrorRate = function () {
        var totalRequests = this.metrics.reduce(function (sum, m) {
            return sum + m.successCount + m.errorCount;
        }, 0);
        if (totalRequests === 0) {
            return 0;
        }
        var totalErrors = this.metrics.reduce(function (sum, m) {
            return sum + m.errorCount;
        }, 0);
        return totalErrors / totalRequests;
    };
    /**
     * 计算缓存命中率
     */
    PerformanceMonitor.prototype.calculateCacheHitRate = function () {
        var totalCacheAccesses = this.metrics.reduce(function (sum, m) {
            return sum + m.cacheHits + m.cacheMisses;
        }, 0);
        if (totalCacheAccesses === 0) {
            return 0;
        }
        var totalHits = this.metrics.reduce(function (sum, m) {
            return sum + m.cacheHits;
        }, 0);
        return totalHits / totalCacheAccesses;
    };
    /**
     * 清除历史指标
     */
    PerformanceMonitor.prototype.clearMetrics = function () {
        this.metrics = [];
    };
    return PerformanceMonitor;
}());
exports.PerformanceMonitor = PerformanceMonitor;
