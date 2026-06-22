"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityLogger = exports.SecurityEventType = void 0;
// backend/src/utils/securityLogger.ts
const logger_js_1 = require("./logger.js");
var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["LOGIN_ATTEMPT"] = "LOGIN_ATTEMPT";
    SecurityEventType["LOGIN_SUCCESS"] = "LOGIN_SUCCESS";
    SecurityEventType["LOGIN_FAILED"] = "LOGIN_FAILED";
    SecurityEventType["LOGOUT"] = "LOGOUT";
    SecurityEventType["REGISTER_ATTEMPT"] = "REGISTER_ATTEMPT";
    SecurityEventType["REGISTER_SUCCESS"] = "REGISTER_SUCCESS";
    SecurityEventType["REGISTER_FAILED"] = "REGISTER_FAILED";
    SecurityEventType["TOKEN_REFRESH"] = "TOKEN_REFRESH";
    SecurityEventType["TOKEN_REFRESH_FAILED"] = "TOKEN_REFRESH_FAILED";
    SecurityEventType["TOKEN_REVOKED"] = "TOKEN_REVOKED";
    SecurityEventType["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    SecurityEventType["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    SecurityEventType["PASSWORD_CHANGE_SUCCESS"] = "PASSWORD_CHANGE_SUCCESS";
    SecurityEventType["PASSWORD_CHANGE_FAILED"] = "PASSWORD_CHANGE_FAILED";
    SecurityEventType["PASSWORD_RESET"] = "PASSWORD_RESET";
    SecurityEventType["ACCESS_DENIED"] = "ACCESS_DENIED";
    SecurityEventType["ACCESS_GRANTED"] = "ACCESS_GRANTED";
    SecurityEventType["USER_CREATED"] = "USER_CREATED";
    SecurityEventType["USER_UPDATED"] = "USER_UPDATED";
    SecurityEventType["USER_DELETED"] = "USER_DELETED";
    SecurityEventType["USER_ROLE_CHANGED"] = "USER_ROLE_CHANGED";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    SecurityEventType["BRUTE_FORCE_DETECTED"] = "BRUTE_FORCE_DETECTED";
    SecurityEventType["SQL_INJECTION_DETECTED"] = "SQL_INJECTION_DETECTED";
    SecurityEventType["XSS_DETECTED"] = "XSS_DETECTED";
})(SecurityEventType || (exports.SecurityEventType = SecurityEventType = {}));
class SecurityLogger {
    static log(event) {
        const logData = {
            eventType: event.eventType,
            timestamp: event.timestamp || new Date(),
            userId: event.userId,
            email: event.email,
            role: event.role,
            ip: event.ip,
            userAgent: event.userAgent,
            success: event.success,
            message: event.message,
            details: event.details,
        };
        if (event.success) {
            logger_js_1.logger.info(`[SECURITY] ${event.eventType}`, logData);
        }
        else {
            logger_js_1.logger.warn(`[SECURITY] ${event.eventType} - FAILED`, logData);
        }
    }
    static loginAttempt(email, ip, userAgent, success, reason) {
        this.log({
            eventType: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILED,
            timestamp: new Date(),
            email,
            ip,
            userAgent,
            success,
            message: reason,
            details: { attemptType: 'login' },
        });
    }
    static registerAttempt(email, ip, userAgent, success, reason) {
        this.log({
            eventType: success ? SecurityEventType.REGISTER_SUCCESS : SecurityEventType.REGISTER_FAILED,
            timestamp: new Date(),
            email,
            ip,
            userAgent,
            success,
            message: reason,
            details: { attemptType: 'register' },
        });
    }
    static passwordChange(userId, email, ip, userAgent, success, reason) {
        this.log({
            eventType: success ? SecurityEventType.PASSWORD_CHANGE_SUCCESS : SecurityEventType.PASSWORD_CHANGE_FAILED,
            timestamp: new Date(),
            userId,
            email,
            ip,
            userAgent,
            success,
            message: reason,
            details: { operation: 'password_change' },
        });
    }
    static tokenRefresh(email, ip, userAgent, success, reason) {
        this.log({
            eventType: success ? SecurityEventType.TOKEN_REFRESH : SecurityEventType.TOKEN_REFRESH_FAILED,
            timestamp: new Date(),
            email,
            ip,
            userAgent,
            success,
            message: reason,
            details: { operation: 'token_refresh' },
        });
    }
    static accessDenied(userId, email, resource, ip, reason) {
        this.log({
            eventType: SecurityEventType.ACCESS_DENIED,
            timestamp: new Date(),
            userId,
            email,
            ip,
            success: false,
            message: `Acesso negado ao recurso: ${resource}`,
            details: { resource, reason },
        });
    }
    static suspiciousActivity(email, ip, userAgent, details) {
        this.log({
            eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
            timestamp: new Date(),
            email,
            ip,
            userAgent,
            success: false,
            message: 'Atividade suspeita detectada',
            details,
        });
    }
    static bruteForceDetected(ip, attempts, email) {
        this.log({
            eventType: SecurityEventType.BRUTE_FORCE_DETECTED,
            timestamp: new Date(),
            email,
            ip,
            success: false,
            message: `Ataque de força bruta detectado - ${attempts} tentativas`,
            details: { attempts, ip },
        });
    }
}
exports.SecurityLogger = SecurityLogger;
//# sourceMappingURL=securityLogger.js.map