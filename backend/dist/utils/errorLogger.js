"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogger = void 0;
// backend/src/utils/errorLogger.ts
const logger_js_1 = require("./logger.js");
const securityLogger_js_1 = require("./securityLogger.js");
const env_js_1 = require("../config/env.js");
class ErrorLogger {
    static logError(error, context = {}, isOperational = true) {
        const logData = {
            message: error.message,
            stack: env_js_1.config.NODE_ENV !== 'production' ? error.stack : undefined,
            name: error.name,
            ...context,
            timestamp: new Date().toISOString(),
        };
        if (isOperational) {
            logger_js_1.logger.warn(`[OPERATIONAL ERROR] ${error.message}`, logData);
        }
        else {
            logger_js_1.logger.error(`[CRITICAL ERROR] ${error.message}`, logData);
        }
        if (!isOperational || context.statusCode === 401 || context.statusCode === 403) {
            securityLogger_js_1.SecurityLogger.log({
                eventType: context.statusCode === 401 ? 'LOGIN_FAILED' : 'ACCESS_DENIED',
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
    static logDatabaseError(error, context = {}) {
        this.logError(error, {
            ...context,
            statusCode: 500,
        }, true);
    }
    static logValidationError(error, context = {}) {
        this.logError(error, {
            ...context,
            statusCode: 400,
        }, true);
    }
    static logAuthError(error, context = {}) {
        this.logError(error, {
            ...context,
            statusCode: 401,
        }, true);
    }
    static logAuthzError(error, context = {}) {
        this.logError(error, {
            ...context,
            statusCode: 403,
        }, true);
    }
    static logTimeoutError(error, context = {}) {
        this.logError(error, {
            ...context,
            statusCode: 408,
        }, true);
    }
    static logServiceUnavailableError(error, context = {}) {
        this.logError(error, {
            ...context,
            statusCode: 503,
        }, true);
    }
}
exports.ErrorLogger = ErrorLogger;
//# sourceMappingURL=errorLogger.js.map