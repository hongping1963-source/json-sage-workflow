import winston from 'winston';

export class Logger {
  private logger: winston.Logger;

  constructor(enabled: boolean = false) {
    this.logger = winston.createLogger({
      level: 'info',
      silent: !enabled,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: any): void {
    this.logger.error(message, { error });
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }
}
