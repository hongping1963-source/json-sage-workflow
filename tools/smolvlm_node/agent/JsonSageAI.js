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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.JsonSageAI = void 0;
var JsonAnalyzer_1 = require("./JsonAnalyzer");
var ConfigManager_1 = require("./ConfigManager");
var AgentError_1 = require("../errors/AgentError");
var PerformanceMonitor_1 = require("../optimization/PerformanceMonitor");
var ContinuousLearner_1 = require("../optimization/ContinuousLearner");
var json_sage_workflow_1 = require("../workflow/json-sage-workflow");
var JsonSageAI = /** @class */ (function () {
    function JsonSageAI(config) {
        this.insights = [];
        try {
            this.configManager = new ConfigManager_1.ConfigManager(config);
            this.performanceMonitor = PerformanceMonitor_1.PerformanceMonitor.getInstance();
            this.learner = ContinuousLearner_1.ContinuousLearner.getInstance();
            this.initializeWorkflow();
        }
        catch (error) {
            throw new AgentError_1.ConfigurationError('初始化失败：配置无效', error);
        }
    }
    JsonSageAI.prototype.validateConfig = function (config) {
        if (!config.deepseekApiKey) {
            throw new AgentError_1.ValidationError('缺少必需的配置项：deepseekApiKey');
        }
        if (config.maxTokens && (config.maxTokens < 1 || config.maxTokens > 8000)) {
            throw new AgentError_1.ValidationError('maxTokens必须在1-8000之间');
        }
        if (config.temperature && (config.temperature < 0 || config.temperature > 1)) {
            throw new AgentError_1.ValidationError('temperature必须在0-1之间');
        }
    };
    JsonSageAI.prototype.initializeWorkflow = function () {
        try {
            var config = this.configManager.getConfig();
            this.workflow = new json_sage_workflow_1.Workflow({
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
        }
        catch (error) {
            throw new AgentError_1.ConfigurationError('工作流初始化失败', error);
        }
    };
    JsonSageAI.prototype.generateSchema = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, tokenUsage, cacheHits, cacheMisses, errors, insights, steps, fieldInfo, metrics, schema, error_1, result, _a, error_2, errorMsg, _b, error_3, errorMsg, error_4;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        startTime = Date.now();
                        tokenUsage = 0;
                        cacheHits = 0;
                        cacheMisses = 0;
                        errors = [];
                        insights = [];
                        steps = [];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 14, , 15]);
                        // 验证输入
                        this.validateInput(task);
                        // 分析数据结构
                        steps.push('分析数据结构并生成Schema');
                        fieldInfo = JsonAnalyzer_1.JsonAnalyzer.getFieldInfo(task.jsonData);
                        metrics = JsonAnalyzer_1.JsonAnalyzer.calculateMetrics(task.jsonData);
                        // 根据分析结果优化配置
                        if (metrics.complexity > 5) {
                            insights.push('检测到复杂的数据结构，已优化处理策略');
                            this.configManager.adaptConfig(metrics);
                        }
                        schema = void 0;
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.workflow.generateSchema(task.jsonData, task.options)];
                    case 3:
                        schema = _e.sent();
                        insights.push('Schema生成成功，结构完整');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _e.sent();
                        throw new AgentError_1.SchemaGenerationError("Schema\u751F\u6210\u5931\u8D25: ".concat(error_1 instanceof Error ? error_1.message : '未知错误'));
                    case 5:
                        result = {
                            schema: schema,
                            metadata: {
                                executionTime: Date.now() - startTime,
                                steps: steps,
                                insights: insights,
                                errors: errors.length > 0 ? errors : undefined
                            }
                        };
                        if (!((_c = task.options) === null || _c === void 0 ? void 0 : _c.includeDescriptions)) return [3 /*break*/, 9];
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, 8, , 9]);
                        steps.push('生成智能字段描述');
                        _a = result;
                        return [4 /*yield*/, this.workflow.deepseek.generateFieldDescriptions(task.jsonData, fieldInfo)];
                    case 7:
                        _a.descriptions = _e.sent();
                        insights.push('成功生成字段描述和注释');
                        return [3 /*break*/, 9];
                    case 8:
                        error_2 = _e.sent();
                        errorMsg = "\u63CF\u8FF0\u751F\u6210\u5931\u8D25: ".concat(error_2 instanceof Error ? error_2.message : '未知错误');
                        errors.push(errorMsg);
                        insights.push('字段描述生成过程中遇到问题，建议检查数据结构');
                        return [3 /*break*/, 9];
                    case 9:
                        if (!((_d = task.options) === null || _d === void 0 ? void 0 : _d.includeExamples)) return [3 /*break*/, 13];
                        _e.label = 10;
                    case 10:
                        _e.trys.push([10, 12, , 13]);
                        steps.push('生成实用示例数据');
                        _b = result;
                        return [4 /*yield*/, this.workflow.deepseek.generateExamples(schema, fieldInfo)];
                    case 11:
                        _b.examples = _e.sent();
                        insights.push('成功生成示例数据');
                        return [3 /*break*/, 13];
                    case 12:
                        error_3 = _e.sent();
                        errorMsg = "\u793A\u4F8B\u751F\u6210\u5931\u8D25: ".concat(error_3 instanceof Error ? error_3.message : '未知错误');
                        errors.push(errorMsg);
                        insights.push('示例数据生成遇到问题，建议手动提供示例');
                        return [3 /*break*/, 13];
                    case 13:
                        // 更新结果的metadata
                        result.metadata.insights = insights;
                        result.metadata.errors = errors.length > 0 ? errors : undefined;
                        return [2 /*return*/, result];
                    case 14:
                        error_4 = _e.sent();
                        throw error_4 instanceof Error ? error_4 : new Error('未知错误');
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录性能指标
     */
    JsonSageAI.prototype.recordPerformanceMetrics = function (metrics) {
        this.performanceMonitor.recordMetrics(metrics);
    };
    /**
     * 记录学习反馈
     */
    JsonSageAI.prototype.recordLearningFeedback = function (feedback) {
        this.learner.recordFeedback(feedback);
    };
    /**
     * 获取优化建议
     */
    JsonSageAI.prototype.getOptimizationSuggestions = function () {
        var performanceSuggestions = this.performanceMonitor.analyzePerformance();
        var learningInsights = this.learner.getLearningInsights();
        // 将学习洞察转换为优化建议
        var learningBasedSuggestions = learningInsights.map(function (insight) { return ({
            type: 'optimization',
            metric: insight.aspect,
            severity: 'info',
            message: insight.message,
            currentValue: insight.score,
            threshold: 0.7, // 质量阈值
            suggestion: insight.suggestion
        }); });
        return __spreadArray(__spreadArray([], performanceSuggestions, true), learningBasedSuggestions, true);
    };
    /**
     * 估计Schema质量
     */
    JsonSageAI.prototype.estimateSchemaQuality = function (result) {
        var quality = 1.0;
        // 根据错误数量降低质量分数
        if (result.metadata.errors.length > 0) {
            quality -= result.metadata.errors.length * 0.1;
        }
        // 根据警告类型的洞察降低质量分数
        var warningInsights = this.insights.filter(function (i) { return i.severity === 'warning'; });
        if (warningInsights.length > 0) {
            quality -= warningInsights.length * 0.05;
        }
        return Math.max(0, Math.min(1, quality));
    };
    /**
     * 估计描述质量
     */
    JsonSageAI.prototype.estimateDescriptionQuality = function (result) {
        if (!result.descriptions) {
            return undefined;
        }
        var quality = 1.0;
        var descriptions = Object.values(result.descriptions);
        // 检查描述的完整性
        if (descriptions.some(function (desc) { return !desc || desc.length < 10; })) {
            quality -= 0.2;
        }
        // 检查描述的信息量
        var avgLength = descriptions.reduce(function (sum, desc) { return sum + desc.length; }, 0) / descriptions.length;
        if (avgLength < 30) {
            quality -= 0.1;
        }
        return Math.max(0, Math.min(1, quality));
    };
    /**
     * 估计示例质量
     */
    JsonSageAI.prototype.estimateExampleQuality = function (result) {
        if (!result.examples) {
            return undefined;
        }
        var quality = 1.0;
        try {
            // 检查示例的有效性
            JSON.stringify(result.examples);
            // 检查示例的复杂度
            var complexity = JsonAnalyzer_1.JsonAnalyzer.calculateMetrics(result.examples);
            if (complexity.depth < 2) {
                quality -= 0.1;
            }
            if (complexity.fieldCount < 5) {
                quality -= 0.1;
            }
        }
        catch (_a) {
            quality = 0;
        }
        return Math.max(0, Math.min(1, quality));
    };
    JsonSageAI.prototype.validateInput = function (task) {
        if (!task.jsonData) {
            throw new AgentError_1.ValidationError('缺少必需的数据');
        }
        if (typeof task.jsonData !== 'object' || task.jsonData === null) {
            throw new AgentError_1.ValidationError('数据必须是对象类型');
        }
        if (Object.keys(task.jsonData).length === 0) {
            throw new AgentError_1.ValidationError('数据不能为空对象');
        }
    };
    JsonSageAI.prototype.enhanceOptionsBasedOnAnalysis = function (options, fieldInfo) {
        if (options === void 0) { options = {}; }
        var enhancedOptions = __assign(__assign({}, options), { required: fieldInfo.filter(function (field) { return field.isRequired; }).map(function (field) { return field.name; }) });
        return enhancedOptions;
    };
    JsonSageAI.prototype.generateEnhancedDescriptions = function (data, fieldInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var descriptions, _i, fieldInfo_1, field;
            return __generator(this, function (_a) {
                descriptions = {};
                for (_i = 0, fieldInfo_1 = fieldInfo; _i < fieldInfo_1.length; _i++) {
                    field = fieldInfo_1[_i];
                    descriptions[field.name] = "\u4EA7\u54C1".concat(field.name);
                }
                return [2 /*return*/, descriptions];
            });
        });
    };
    JsonSageAI.prototype.generateEnhancedExamples = function (schema, fieldInfo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, [
                        {
                            name: "智能手表",
                            price: 1299.99,
                            description: "一款功能强大的智能手表，支持心率监测和运动追踪"
                        }
                    ]];
            });
        });
    };
    JsonSageAI.prototype.getConfigInsights = function () {
        var insights = [];
        var history = this.configManager.getAdaptationHistory();
        // 只获取最近的配置调整
        var recentChanges = history[history.length - 1];
        if (recentChanges) {
            insights.push("\u914D\u7F6E\u81EA\u52A8\u4F18\u5316: ".concat(recentChanges.reason));
        }
        return insights;
    };
    JsonSageAI.prototype.getConfig = function () {
        return this.configManager.getConfig();
    };
    JsonSageAI.prototype.resetConfig = function () {
        try {
            this.configManager.resetConfig();
            this.initializeWorkflow();
        }
        catch (error) {
            throw new AgentError_1.ConfigurationError('配置重置失败', error);
        }
    };
    /**
     * 获取性能指标
     */
    JsonSageAI.prototype.getPerformanceMetrics = function () {
        return this.performanceMonitor.analyzePerformance();
    };
    /**
     * 获取学习洞察
     */
    JsonSageAI.prototype.getLearningInsights = function () {
        return this.learner.getLearningInsights();
    };
    /**
     * 提供用户反馈
     */
    JsonSageAI.prototype.provideFeedback = function (feedback) {
        feedback.source = 'user';
        feedback.timestamp = Date.now();
        this.learner.recordFeedback(feedback);
    };
    /**
     * 验证数据是否符合Schema
     */
    JsonSageAI.prototype.validateSchema = function (schema, data) {
        var _a;
        try {
            var Ajv = require('ajv');
            var ajv = new Ajv();
            var validate = ajv.compile(schema);
            var valid = validate(data);
            return {
                valid: valid,
                errors: valid ? undefined : (_a = validate.errors) === null || _a === void 0 ? void 0 : _a.map(function (err) { return err.message; })
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [error.message]
            };
        }
    };
    JsonSageAI.create = function (config) {
        return new JsonSageAI(config);
    };
    return JsonSageAI;
}());
exports.JsonSageAI = JsonSageAI;
