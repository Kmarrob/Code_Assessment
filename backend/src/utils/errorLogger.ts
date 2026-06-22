// backend/src/utils/errorLogger.ts
import { logger } from './logger.js';
import { SecurityLogger } from './securityLogger.js';
import { config } from '../config/env.js';

export interface ErrorLogContext {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  body?: any;
  query?: any;
  params?: any;
  statusCode?: number;
  duration?: number;
}

export class ErrorLogger {
  static logError(
    error: Error,
    context: ErrorLogContext = {},
    isOperational: boolean = true
  ): void {
    const logData = {
      message: error.message,
      stack: config.NODE_ENV !== 'production' ? error.stack : undefined,
      name: error.name,
      ...context,
      timestamp: new Date().toISOString(),
    };

    if (isOperational) {
      logger.warn(`[OPERATIONAL ERROR] ${error.message}`, logData);
    } else {
      logger.error(`[CRITICAL ERROR] ${error.message}`, logData);
    }

    if (!isOperational || context.statusCode === 401 || context.statusCode === 403) {
      SecurityLogger.log({
        eventType: context.statusCode === 401 ? 'LOGIN_FAILED' as any : 'ACCESS_DENIED' as any,
        timestamp: new Date(),
        userId: context.userId,
        email: context.email,
        ip: context.ip,
        userAgent: context.userAgent,
        success: false,
        message: error.message,
        details: {
          statusCode: context.statusCode,
          path: context.path,
          method: context.method,
        },
      });
    }
  }

  static logDatabaseError(error: Error, context: ErrorLogContext = {}): void {
    this.logError(error, {
      ...context,
      statusCode: 500,
    }, true);
  }

  static logValidationError(error: Error, context: ErrorLogContext = {}): void {
    this.logError(error, {
      ...context,
      statusCode: 400,
    }, true);
  }

  static logAuthError(error: Error, context: ErrorLogContext = {}): void {
    this.logError(error, {
      ...context,
      statusCode: 401,
    }, true);
  }

  static logAuthzError(error: Error, context: ErrorLogContext = {}): void {
    this.logError(error, {
      ...context,
      statusCode: 403,
    }, true);
  }

  static logTimeoutError(error: Error, context: ErrorLogContext = {}): void {
    this.logError(error, {
      ...context,
      statusCode: 408,
    }, true);
  }

  static logServiceUnavailableError(error: Error, context: ErrorLogContext = {}): void {
    this.logError(error, {
      ...context,
      statusCode: 503,
    }, true);
  }
}