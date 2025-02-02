import { AgentError, ValidationError, SchemaGenerationError, APIError, ConfigurationError } from './AgentError';
import { ErrorContext, ErrorResponse, ErrorMetadata } from '../types';

export class ErrorHandler {
    private static readonly ERROR_MESSAGES = {
        VALIDATION_ERROR: '输入验证失败',
        SCHEMA_GENERATION_ERROR: 'Schema生成失败',
        API_ERROR: 'API调用失败',
        CONFIGURATION_ERROR: '配置错误',
        UNKNOWN_ERROR: '未知错误'
    };

    /**
     * 处理错误并生成友好的错误响应
     */
    static handle(error: Error | any, context?: ErrorContext): ErrorResponse {
        const agentError = this.normalizeError(error);
        const metadata = this.generateErrorMetadata(agentError, context);

        return {
            success: false,
            error: {
                message: this.formatErrorMessage(agentError),
                code: agentError.code,
                details: agentError.details,
                suggestions: agentError.suggestions || [],
                metadata
            }
        };
    }

    /**
     * 将任意错误转换为AgentError
     */
    private static normalizeError(error: Error | any): AgentError {
        if (error instanceof AgentError) {
            return error;
        }

        // 处理常见的错误类型
        if (error instanceof SyntaxError) {
            return new ValidationError(error.message, {
                originalError: error
            });
        }

        if (error instanceof TypeError) {
            return new ValidationError(error.message, {
                originalError: error
            });
        }

        if (error.response) { // Axios等HTTP客户端错误
            return new APIError(error.message, {
                status: error.response.status,
                data: error.response.data
            });
        }

        // 其他未知错误
        return AgentError.fromError(error);
    }

    /**
     * 生成错误元数据
     */
    private static generateErrorMetadata(error: AgentError, context?: ErrorContext): ErrorMetadata {
        const metadata: ErrorMetadata = {
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
    }

    /**
     * 格式化错误消息
     */
    private static formatErrorMessage(error: AgentError): string {
        const baseMessage = this.ERROR_MESSAGES[error.code as keyof typeof this.ERROR_MESSAGES] || error.message;
        const details = error.details ? `: ${JSON.stringify(error.details)}` : '';
        return `${baseMessage}${details}`;
    }

    /**
     * 生成唯一的错误ID
     */
    private static generateErrorId(): string {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 总结输入数据
     */
    private static summarizeInput(input: any): any {
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
        } catch (error) {
            return {
                type: 'unknown',
                error: 'Failed to summarize input'
            };
        }
    }

    /**
     * 总结状态信息
     */
    private static summarizeState(state: any): any {
        try {
            return {
                timestamp: new Date().toISOString(),
                summary: JSON.stringify(state).slice(0, 200)
            };
        } catch (error) {
            return {
                error: 'Failed to summarize state'
            };
        }
    }

    /**
     * 检查错误是否可恢复
     */
    static isRecoverable(error: Error): boolean {
        if (error instanceof AgentError) {
            return error.recoverable;
        }
        return true; // 默认认为错误是可恢复的
    }

    /**
     * 获取错误恢复建议
     */
    static getRecoverySuggestions(error: Error): string[] {
        if (error instanceof AgentError && error.suggestions) {
            return error.suggestions;
        }
        return ['请检查输入并重试', '如果问题持续存在，请联系支持团队'];
    }
}
