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
exports.BaseAgent = void 0;
var BaseAgent = /** @class */ (function () {
    function BaseAgent(config) {
        this.validateConfig(config);
        this.config = this.normalizeConfig(config);
    }
    BaseAgent.prototype.validateConfig = function (config) {
        if (!config.deepseekApiKey) {
            throw new Error('DeepSeek API key is required');
        }
    };
    BaseAgent.prototype.normalizeConfig = function (config) {
        return __assign(__assign({}, config), { model: config.model || 'deepseek-chat', maxTokens: config.maxTokens || 2000, temperature: config.temperature || 0.7, caching: config.caching !== false });
    };
    BaseAgent.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    return BaseAgent;
}());
exports.BaseAgent = BaseAgent;
