"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
// backend/src/services/AuditService.ts
const logger_js_1 = require("../utils/logger.js");
class AuditService {
    static async log(entry) {
        try {
            logger_js_1.logger.info(`[AUDIT] Action: ${entry.action} | User: ${entry.userEmail} | Resource: ${entry.resource} | Success: ${entry.success}`);
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao gravar log de auditoria:', error);
        }
    }
    static async logUserCreation(userId, userEmail, targetUserId, targetUserEmail, targetRole, ip, userAgent, success) {
        const entry = {
            userId,
            userEmail,
            action: 'USER_CREATED',
            resource: 'User',
            resourceId: targetUserId,
            details: { targetUserEmail, targetRole },
            ip,
            userAgent,
            success,
            timestamp: new Date(),
        };
        await this.log(entry);
    }
    static async logUserUpdate(userId, userEmail, targetUserId, targetUserEmail, changes, ip, userAgent, success) {
        const entry = {
            userId,
            userEmail,
            action: 'USER_UPDATED',
            resource: 'User',
            resourceId: targetUserId,
            details: { targetUserEmail, changes },
            ip,
            userAgent,
            success,
            timestamp: new Date(),
        };
        await this.log(entry);
    }
    static async logUserDeactivation(userId, userEmail, targetUserId, targetUserEmail, ip, userAgent, success) {
        const entry = {
            userId,
            userEmail,
            action: 'USER_DEACTIVATED',
            resource: 'User',
            resourceId: targetUserId,
            details: { targetUserEmail },
            ip,
            userAgent,
            success,
            timestamp: new Date(),
        };
        await this.log(entry);
    }
    static async logUserReactivation(userId, userEmail, targetUserId, targetUserEmail, ip, userAgent, success) {
        const entry = {
            userId,
            userEmail,
            action: 'USER_REACTIVATED',
            resource: 'User',
            resourceId: targetUserId,
            details: { targetUserEmail },
            ip,
            userAgent,
            success,
            timestamp: new Date(),
        };
        await this.log(entry);
    }
    static async logPasswordReset(userId, userEmail, targetUserId, targetUserEmail, ip, userAgent, success) {
        const entry = {
            userId,
            userEmail,
            action: 'PASSWORD_RESET',
            resource: 'User',
            resourceId: targetUserId,
            details: { targetUserEmail },
            ip,
            userAgent,
            success,
            timestamp: new Date(),
        };
        await this.log(entry);
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=AuditService.js.map