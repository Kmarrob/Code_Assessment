"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
// backend/src/services/AuditService.ts
const securityLogger_js_1 = require("../utils/securityLogger.js");
class AuditService {
    static logAdminAction(userId, email, action, ip, userAgent, success, details) {
        securityLogger_js_1.SecurityLogger.log({
            eventType: securityLogger_js_1.SecurityEventType.USER_UPDATED,
            timestamp: new Date(),
            userId,
            email,
            ip,
            userAgent,
            success,
            message: `Ação administrativa: ${action}`,
            details,
        });
    }
    static logUserCreation(adminId, adminEmail, targetUserId, targetEmail, role, ip, userAgent, success) {
        securityLogger_js_1.SecurityLogger.log({
            eventType: securityLogger_js_1.SecurityEventType.USER_CREATED,
            timestamp: new Date(),
            userId: targetUserId,
            email: targetEmail,
            ip,
            userAgent,
            success,
            message: `Usuário criado por ${adminEmail} com papel: ${role}`,
            details: {
                adminId,
                adminEmail,
                role,
            },
        });
    }
    static logUserUpdate(adminId, adminEmail, targetUserId, targetEmail, changes, ip, userAgent, success) {
        securityLogger_js_1.SecurityLogger.log({
            eventType: securityLogger_js_1.SecurityEventType.USER_UPDATED,
            timestamp: new Date(),
            userId: targetUserId,
            email: targetEmail,
            ip,
            userAgent,
            success,
            message: `Usuário atualizado por ${adminEmail}`,
            details: {
                adminId,
                adminEmail,
                changes,
            },
        });
    }
    static logUserDeactivation(adminId, adminEmail, targetUserId, targetEmail, ip, userAgent, success) {
        securityLogger_js_1.SecurityLogger.log({
            eventType: securityLogger_js_1.SecurityEventType.USER_DELETED,
            timestamp: new Date(),
            userId: targetUserId,
            email: targetEmail,
            ip,
            userAgent,
            success,
            message: `Usuário desativado por ${adminEmail}`,
            details: {
                adminId,
                adminEmail,
            },
        });
    }
    static logUserReactivation(adminId, adminEmail, targetUserId, targetEmail, ip, userAgent, success) {
        securityLogger_js_1.SecurityLogger.log({
            eventType: securityLogger_js_1.SecurityEventType.USER_UPDATED,
            timestamp: new Date(),
            userId: targetUserId,
            email: targetEmail,
            ip,
            userAgent,
            success,
            message: `Usuário reativado por ${adminEmail}`,
            details: {
                adminId,
                adminEmail,
            },
        });
    }
    static logPasswordReset(adminId, adminEmail, targetUserId, targetEmail, ip, userAgent, success) {
        securityLogger_js_1.SecurityLogger.log({
            eventType: securityLogger_js_1.SecurityEventType.PASSWORD_CHANGE,
            timestamp: new Date(),
            userId: targetUserId,
            email: targetEmail,
            ip,
            userAgent,
            success,
            message: `Senha resetada por ${adminEmail}`,
            details: {
                adminId,
                adminEmail,
            },
        });
    }
    static logAccessDenied(userId, email, action, ip, userAgent, reason) {
        securityLogger_js_1.SecurityLogger.log({
            eventType: securityLogger_js_1.SecurityEventType.ACCESS_DENIED,
            timestamp: new Date(),
            userId,
            email,
            ip,
            userAgent,
            success: false,
            message: `Acesso negado: ${action}`,
            details: { reason },
        });
    }
    static async getAuditLogs(_filter, _page = 1, _limit = 50) {
        // Em produção, isso seria uma consulta ao banco de dados
        return {
            logs: [],
            total: 0,
        };
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=AuditService.js.map