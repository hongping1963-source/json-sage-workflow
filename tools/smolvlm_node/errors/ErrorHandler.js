"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
var AgentError_1 = require("./AgentError");
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
    }
    /**
     * 处理错误并生成友好的错误响应
     */
    ErrorHandler.handle = function (error, context) {
        var agentError = this.normalizeError(error);
        var metadata = this.generateErrorMetadata(agentError, context);
        return {
            success: false,
            error: {
                message: this.formatErrorMessage(agentError),
                code: agentError.code,
                details: agentError.details,
                suggestions: agentError.suggestions || [],
                metadata: metadata
            }
        };
    };
    /**
     * 将任意错误转换为AgentError
     */
    ErrorHandler.normalizeError = function (error) {
        if (error instanceof AgentError_1.AgentError) {
            return error;
        }
        // 处理常见的错误类型
        if (error instanceof SyntaxError) {
            return new AgentError_1.ValidationError(error.message, {
                originalError: error
            });
        }
        if (error instanceof TypeError) {
            return new AgentError_1.ValidationError(error.message, {
                originalError: error
            });
        }
        if (error.response) { // Axios等HTTP客户端错误
            return new AgentError_1.APIError(error.message, {
                status: error.response.status,
                data: error.response.data
            });
        }
        // 其他未知错误
        return AgentError_1.AgentError.fromError(error);
    };
    /**
     * 生成错误元数据
     */
    ErrorHandler.generateErrorMetadata = function (error, context) {
        var metadata = {
            timestamp: new Date().toISOString(),
            errorId: this.generateErrorId(),
            recoverable: error.recoverable,
            contextual: {}
        };
        if (context) {
            if (context.operation) {
                metadata.contextual.operation = context.operation;
            }
            if (context.input) {
                metadata.contextual.inputSummary = this.summarizeInput(context.input);
            }
            if (context.state) {
                metadata.contextual.stateSummary = this.summarizeState(context.state);
            }
        }
        return metadata;
    };
    /**
     * 格式化错误消息
     */
    ErrorHandler.formatErrorMessage = function (error) {
        var baseMessage = this.ERROR_MESSAGES[error.code] || error.message;
        var details = error.details ? ": ".concat(JSON.stringify(error.details)) : '';
        return "".concat(baseMessage).concat(details);
    };
    /**
     * 生成唯一的错误ID
     */
    ErrorHandler.generateErrorId = function () {
        return "err_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    /**
     * 总结输入数据
     */
    ErrorHandler.summarizeInput = function (input) {
        try {
            if (typeof input === 'object') {
                return {
                    type: Array.isArray(input) ? 'array' : 'object',
                    size: JSON.stringify(input).length,
                    preview: JSON.stringify(input).slice(0, 100) + '...'
                };
            }
            return {
                type: typeof input,
                value: String(input).slice(0, 100)
            };
        }
        catch (error) {
            return {
                type: 'unknown',
                error: 'Failed to summarize input'
            };
        }
    };
    /**
     * 总结状态信息
     */
    ErrorHandler.summarizeState = function (state) {
        try {
            return {
                timestamp: new Date().toISOString(),
                summary: JSON.stringify(state).slice(0, 200)
            };
        }
        catch (error) {
            return {
                error: 'Failed to summarize state'
            };
        }
    };
    /**
     * 检查错误是否可恢复
     */
    ErrorHandler.isRecoverable = function (error) {
        if (error instanceof AgentError_1.AgentError) {
            return error.recoverable;
        }
        return true; // 默认认为错误是可恢复的
    };
    /**
     * 获取错误恢复建议
     */
    ErrorHandler.getRecoverySuggestions = function (error) {
        if (error instanceof AgentError_1.AgentError && error.suggestions) {
            return error.suggestions;
        }
        return ['请检查输入并重试', '如果问题持续存在，请联系支持团队'];
    };
    ErrorHandler.ERROR_MESSAGES = {
        VALIDATION_ERROR: '输入验证失败',
        SCHEMA_GENERATION_ERROR: 'Schema生成失败',
        API_ERROR: 'API调用失败',
        CONFIGURATION_ERROR: '配置错误',
        UNKNOWN_ERROR: '未知错误'
    };
    return ErrorHandler;
}());
exports.ErrorHandler = ErrorHandler;
