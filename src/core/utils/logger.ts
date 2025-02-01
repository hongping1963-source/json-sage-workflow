import { createLogger, format, transports } from 'winston';
import * as path from 'path';

/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * 日志配置
 */
export interface LoggerConfig {
  level: LogLevel;
  filename?: string;
  maxSize?: number;
  maxFiles?: number;
  console?: boolean;
}

/**
 * 日志管理器
 */
export class Logger {
  private static instance: Logger;
  private logger: any;

  private constructor(config: LoggerConfig) {
    const logFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    );

    const transportOptions = [];

    // 添加文件传输
    if (config.filename) {
      transportOptions.push(
        new transports.File({
          filename: path.join(process.cwd(), 'logs', config.filename),
          maxsize: config.maxSize || 5242880, // 5MB
          maxFiles: config.maxFiles || 5,
          format: logFormat
        })
      );
    }

    // 添加控制台传输
    if (config.console) {
      transportOptions.push(
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        })
      );
    }

    this.logger = createLogger({
      level: config.level,
      format: logFormat,
      transports: transportOptions
    });
  }

  /**
   * 获取日志实例
   */
  static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config || {
        level: LogLevel.INFO,
        filename: 'smolvlm.log',
        console: true
      });
    }
    return Logger.instance;
  }

  /**
   * 记录错误日志
   */
  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * 记录警告日志
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * 记录信息日志
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * 记录调试日志
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * 记录性能指标
   */
  metric(name: string, value: number, tags?: Record<string, string>): void {
    this.logger.info('Performance Metric', {
      metric: name,
      value,
      tags,
      timestamp: new Date().toISOString()
    });
  }
}
