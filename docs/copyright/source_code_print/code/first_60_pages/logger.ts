/**
 * JsonSageAI - 智能JSON Schema生成与验证工具
 * 版权所有 (c) 2025 张宏平
 */

/**
 * 日志级别枚举
 */
export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

/**
 * 日志记录器类
 */
export class Logger {
    private static instance: Logger;
    private logLevel: LogLevel;

    private constructor() {
        this.logLevel = LogLevel.INFO;
    }

    /**
     * 获取Logger实例
     */
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * 设置日志级别
     * @param level - 日志级别
     */
    setLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    /**
     * 记录调试信息
     * @param message - 日志消息
     * @param context - 上下文信息
     */
    debug(message: string, context?: any): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message), context);
        }
    }

    /**
     * 记录普通信息
     * @param message - 日志消息
     * @param context - 上下文信息
     */
    info(message: string, context?: any): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage(LogLevel.INFO, message), context);
        }
    }

    /**
     * 记录警告信息
     * @param message - 日志消息
     * @param context - 上下文信息
     */
    warn(message: string, context?: any): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, message), context);
        }
    }

    /**
     * 记录错误信息
     * @param message - 日志消息
     * @param context - 上下文信息
     */
    error(message: string, context?: any): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage(LogLevel.ERROR, message), context);
        }
    }

    /**
     * 格式化日志消息
     * @param level - 日志级别
     * @param message - 日志消息
     * @returns 格式化后的消息
     */
    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    /**
     * 判断是否应该记录日志
     * @param level - 日志级别
     * @returns 是否记录
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = Object.values(LogLevel);
        const currentIndex = levels.indexOf(this.logLevel);
        const targetIndex = levels.indexOf(level);
        return targetIndex >= currentIndex;
    }
}
