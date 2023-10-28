import { createLogger, format, Logger, transports } from 'winston';
import { Injectable, Scope } from '@nestjs/common';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private _idempotencyKey: string;
  private _contextName = 'Default';
  private readonly logger: Logger = createLogger();

  constructor() {
    this.logger.configure({
      transports: [this.logTransportConsole()],
      exitOnError: false,
    });
  }

  set idempotencyKey(idempotencyKey: string) {
    this._idempotencyKey = idempotencyKey;
  }

  get idempotencyKey(): string {
    return this._idempotencyKey;
  }

  set contextName(contextName: string) {
    this._contextName = contextName;
  }

  get contextName(): string {
    return this._contextName;
  }

  error(message: string, stackTrace?: any): void {
    this.logger.log({
      level: LogLevel.ERROR,
      message: message,
      meta: {
        context: this.contextName,
        stackTrace,
        idempotency: this._idempotencyKey,
      },
    });
  }

  warn(message: string): void {
    this.logger.log({
      level: LogLevel.WARN,
      message: message,
      meta: { context: this.contextName, idempotency: this._idempotencyKey },
    });
  }

  info(message: string): void {
    this.logger.log({
      level: LogLevel.INFO,
      message: message,
      meta: { context: this.contextName, idempotency: this._idempotencyKey },
    });
  }

  private logTransportConsole() {
    let levelColor: string;
    const resetText = '\x1b[0m';
    const contextColor = '\x1b[35m';
    const emphasize = '\x1b[97m';

    return new transports.Console({
      handleExceptions: true,
      format: format.combine(
        format.timestamp(),
        format.printf((info) => {
          switch (info.level.toLocaleUpperCase()) {
            case 'INFO':
              levelColor = '\x1b[32m';
              break;
            case 'ERROR':
              levelColor = '\x1b[31m';
              break;
            case 'WARM':
              levelColor = '\x1b[33m';
              break;
          }
          const time = `${this.dateFormat(info?.timestamp)}`;
          const level = `${levelColor}${info.level.toLocaleUpperCase()}${resetText}`;
          const context = `${contextColor}${info?.meta?.context ?? ''}${resetText}`;
          const fullTimestamp = `${emphasize}full-timestamp:${resetText} ${info?.timestamp}`;

          return (
            `${time} ${level} ${context} ➔` +
            ` ${info?.message} ${JSON.stringify(info?.meta)} ${fullTimestamp}`
          );
        })
      ),
    });
  }

  private dateFormat(timestamp: Date | string): any {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `[${hours}:${minutes}:${seconds}.${milliseconds}]`;
  }
}
