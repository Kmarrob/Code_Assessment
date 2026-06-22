"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLogger = void 0;
// backend/src/utils/adminLogger.ts
const logger_js_1 = require("./logger.js");
const securityLogger_js_1 = require("./securityLogger.js");
class AdminLogger {
    static logAdminAction(context) {
        const logData = {
            eventType: securityLogger_js_1.SecurityEventType.USER_UPDATED,
            timestamp: new Date(),
            userId: context.userId,
            email: context.email,
            ip: context.ip,
            userAgent: context.userAgent,
            success: context.success,
            message: `Ação administrativa: ${context.action}`,
            details: {
                action: context.action,
                targetUserId: context.targetUserId,
                targetEmail: context.targetEmail,
                ...context.details,
            },
        };
        if (context.success) {
            logger_js_1.logger.info(`[ADMIN] ${context.action}`, logData);
        }
        else {
            logger_js_1.logger.warn(`[ADMIN] ${context.action} - FALHOU`, logData);
        }
        securityLogger_js_1.SecurityLogger.log(logData);
    }
    static logUserCreation(adminId, adminEmail, targetUserId, targetEmail, role, ip, userAgent, success, error) {
        this.logAdminAction({
            userId: adminId,
            email: adminEmail,
            ip,
            userAgent,
            action: 'CREATE_USER',
            targetUserId,
            targetEmail,
            details: { role, error: error || undefined },
            success,
        });
    }
    static logUserUpdate(adminId, adminEmail, targetUserId, targetEmail, changes, ip, userAgent, success, error) {
        this.logAdminAction({
            userId: adminId,
            email: adminEmail,
            ip,
            userAgent,
            action: 'UPDATE_USER',
            targetUserId,
            targetEmail,
            details: { changes, error: error || undefined },
            success,
        });
    }
    static logUserDeactivation(adminId, adminEmail, targetUserId, targetEmail, ip, userAgent, success, error) {
        this.logAdminAction({
            userId: adminId,
            email: adminEmail,
            ip,
            userAgent,
            action: 'DEACTIVATE_USER',
            targetUserId,
            targetEmail,
            details: { error: error || undefined },
            success,
        });
    }
    static logUserReactivation(adminId, adminEmail, targetUserId, targetEmail, ip, userAgent, success, error) {
        this.logAdminAction({
            userId: adminId,
            email: adminEmail,
            ip,
            userAgent,
            action: 'REACTIVATE_USER',
            targetUserId,
            targetEmail,
            details: { error: error || undefined },
            success,
        });
    }
    static logPasswordReset(adminId, adminEmail, targetUserId, targetEmail, ip, userAgent, success, error) {
        this.logAdminAction({
            userId: adminId,
            email: adminEmail,
            ip,
            userAgent,
            action: 'RESET_PASSWORD',
            targetUserId,
            targetEmail,
            details: { error: error || undefined },
            success,
        });
    }
    static logAccessDenied(userId, email, action, ip, userAgent, reason) {
        this.logAdminAction({
            userId,
            email,
            ip,
            userAgent,
            action: `ACCESS_DENIED: ${action}`,
            details: { reason },
            success: false,
        });
    }
}
exports.AdminLogger = AdminLogger;
//# sourceMappingURL=adminLogger.js.map