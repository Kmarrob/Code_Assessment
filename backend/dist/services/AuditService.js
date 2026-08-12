"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
// backend/src/services/AuditService.ts
const logger_js_1 = require("../utils/logger.js");
const AuditLog_js_1 = require("../models/AuditLog.js");
class AuditService {
    /**
     * Criar um log de auditoria
     */
    static async log(entry) {
        try {
            const auditLog = new AuditLog_js_1.AuditLog({
                timestamp: new Date(),
                userId: entry.userId,
                userEmail: entry.userEmail,
                userName: entry.userName,
                userRole: entry.userRole,
                companyId: entry.companyId,
                companyName: entry.companyName,
                action: entry.action,
                category: entry.category,
                level: entry.level || 'info',
                resource: entry.resource,
                resourceId: entry.resourceId,
                resourceName: entry.resourceName,
                details: entry.details || {},
                success: entry.success !== undefined ? entry.success : true,
                errorMessage: entry.errorMessage,
                errorCode: entry.errorCode,
                duration: entry.duration,
                ip: entry.ip || '0.0.0.0',
                userAgent: entry.userAgent || 'unknown',
                origin: entry.origin,
                referer: entry.referer,
                method: entry.method,
                path: entry.path,
                query: entry.query,
                sessionId: entry.sessionId,
                requestId: entry.requestId,
                correlationId: entry.correlationId,
            });
            await auditLog.save();
            logger_js_1.logger.info(`[AUDIT] ${entry.action} | User: ${entry.userEmail || 'system'} | Resource: ${entry.resource} | Success: ${entry.success}`);
            return auditLog;
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao gravar log de auditoria:', error);
            return null;
        }
    }
    /**
     * Extrair informações da requisição para o log
     */
    static getRequestInfo(req) {
        return {
            ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown',
            origin: req.headers['origin'],
            referer: req.headers['referer'],
            method: req.method,
            path: req.path,
            query: req.query,
        };
    }
    /**
     * Extrair informações do usuário para o log
     */
    static getUserInfo(req) {
        const user = req.user;
        if (!user)
            return {};
        return {
            userId: user._id?.toString() || user.id,
            userEmail: user.email,
            userName: user.name,
            userRole: user.role,
            companyId: user.companyId?.toString(),
            companyName: user.company,
        };
    }
    // ============================================
    // 🆕 MÉTODOS LEGACY (para compatibilidade com AdminController)
    // ============================================
    /**
     * 🆕 Método legacy para criação de usuário (compatível com AdminController)
     */
    static async logUserCreationLegacy(actorId, actorEmail, targetUserId, targetUserEmail, targetRole, ip, userAgent, success, errorMessage) {
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            action: 'USER_CREATED',
            category: 'user',
            level: success ? 'info' : 'error',
            resource: 'User',
            resourceId: targetUserId,
            resourceName: targetUserEmail,
            details: { targetRole },
            ip: ip || '0.0.0.0',
            userAgent: userAgent || 'unknown',
            success,
            errorMessage,
        });
    }
    /**
     * 🆕 Método legacy para atualização de usuário (compatível com AdminController)
     */
    static async logUserUpdateLegacy(actorId, actorEmail, targetUserId, targetUserEmail, changes, ip, userAgent, success, errorMessage) {
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            action: 'USER_UPDATED',
            category: 'user',
            level: success ? 'info' : 'error',
            resource: 'User',
            resourceId: targetUserId,
            resourceName: targetUserEmail,
            details: { changes },
            ip: ip || '0.0.0.0',
            userAgent: userAgent || 'unknown',
            success,
            errorMessage,
        });
    }
    /**
     * 🆕 Método legacy para desativação de usuário (compatível com AdminController)
     */
    static async logUserDeactivationLegacy(actorId, actorEmail, targetUserId, targetUserEmail, ip, userAgent, success, errorMessage) {
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            action: 'USER_DEACTIVATED',
            category: 'user',
            level: success ? 'info' : 'error',
            resource: 'User',
            resourceId: targetUserId,
            resourceName: targetUserEmail,
            ip: ip || '0.0.0.0',
            userAgent: userAgent || 'unknown',
            success,
            errorMessage,
        });
    }
    /**
     * 🆕 Método legacy para reativação de usuário (compatível com AdminController)
     */
    static async logUserReactivationLegacy(actorId, actorEmail, targetUserId, targetUserEmail, ip, userAgent, success, errorMessage) {
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            action: 'USER_REACTIVATED',
            category: 'user',
            level: success ? 'info' : 'error',
            resource: 'User',
            resourceId: targetUserId,
            resourceName: targetUserEmail,
            ip: ip || '0.0.0.0',
            userAgent: userAgent || 'unknown',
            success,
            errorMessage,
        });
    }
    /**
     * 🆕 Método legacy para reset de senha (compatível com AdminController)
     */
    static async logPasswordResetLegacy(actorId, actorEmail, targetUserId, targetUserEmail, ip, userAgent, success, errorMessage) {
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            action: 'PASSWORD_RESET_CONFIRM',
            category: 'auth',
            level: success ? 'info' : 'warning',
            resource: 'User',
            resourceId: targetUserId,
            resourceName: targetUserEmail,
            ip: ip || '0.0.0.0',
            userAgent: userAgent || 'unknown',
            success,
            errorMessage,
        });
    }
    // ============================================
    // MÉTODOS AUXILIARES POR CATEGORIA
    // ============================================
    // 🔐 AUTENTICAÇÃO
    static async logLogin(userId, userEmail, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        const userInfo = this.getUserInfo(req);
        return this.log({
            ...userInfo,
            ...info,
            userId: userId || userInfo.userId, // 👈 Garante o userId explicitamente
            userEmail: userEmail || userInfo.userEmail, // 👈 Garante o userEmail explicitamente
            action: success ? 'LOGIN' : 'LOGIN_FAILED',
            category: 'auth',
            level: success ? 'info' : 'warning',
            resource: 'User',
            resourceId: userId,
            resourceName: userEmail,
            success,
            errorMessage,
        });
    }
    /**
     * 🔑 ALIAS DE COMPATIBILIDADE: logUserLogin -> chama logLogin
     */
    static async logUserLogin(userId, userEmail, thirdParam, fourthParam, fifthParam, sixthParam, seventhParam) {
        if (typeof thirdParam === 'object' && thirdParam !== null && 'headers' in thirdParam) {
            const req = thirdParam;
            const success = typeof fourthParam === 'boolean' ? fourthParam : true;
            const errorMessage = typeof fifthParam === 'string' ? fifthParam : undefined;
            return this.logLogin(userId, userEmail, req, success, errorMessage);
        }
        else {
            const ip = thirdParam;
            const userAgent = fourthParam || 'unknown';
            const success = typeof fifthParam === 'boolean' ? fifthParam : true;
            const errorMessage = seventhParam || (typeof sixthParam === 'string' ? sixthParam : undefined);
            return this.log({
                userId, // 👈 Garante o userId explicitamente no formato legacy
                userEmail, // 👈 Garante o userEmail explicitamente no formato legacy
                action: success ? 'LOGIN' : 'LOGIN_FAILED',
                category: 'auth',
                level: success ? 'info' : 'warning',
                resource: 'User',
                resourceId: userId,
                resourceName: userEmail,
                ip: ip || '0.0.0.0',
                userAgent: userAgent || 'unknown',
                success,
                errorMessage,
            });
        }
    }
    static async logLogout(userId, userEmail, req) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId,
            userEmail,
            ...info,
            action: 'LOGOUT',
            category: 'auth',
            level: 'info',
            resource: 'User',
            resourceId: userId,
            resourceName: userEmail,
            success: true,
        });
    }
    // 👤 USUÁRIOS - MÉTODOS FLEXÍVEIS (aceitam Request OU parâmetros individuais)
    /**
     * Criação de usuário - Aceita Request OU parâmetros individuais
     */
    static async logUserCreation(actorId, actorEmail, targetUserId, targetUserEmail, targetRole, sixthParam, seventhParam, eighthParam, ninthParam) {
        // Verificar se o sexto parâmetro é um Request
        if (typeof sixthParam === 'object' && sixthParam !== null && 'headers' in sixthParam) {
            // É um Request - usar o método com Request
            const req = sixthParam;
            const success = seventhParam;
            const errorMessage = eighthParam;
            const info = this.getRequestInfo(req);
            const userInfo = this.getUserInfo(req);
            return this.log({
                ...userInfo,
                ...info,
                userId: actorId,
                userEmail: actorEmail,
                action: 'USER_CREATED',
                category: 'user',
                level: success ? 'info' : 'error',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                details: { targetRole },
                success,
                errorMessage,
            });
        }
        else {
            // É o formato legacy (ip, userAgent, success)
            const ip = sixthParam;
            const userAgent = seventhParam;
            const success = eighthParam;
            const errorMessage = ninthParam;
            return this.log({
                userId: actorId,
                userEmail: actorEmail,
                action: 'USER_CREATED',
                category: 'user',
                level: success ? 'info' : 'error',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                details: { targetRole },
                ip: ip || '0.0.0.0',
                userAgent: userAgent || 'unknown',
                success,
                errorMessage,
            });
        }
    }
    /**
     * Atualização de usuário - Aceita Request OU parâmetros individuais
     */
    static async logUserUpdate(actorId, actorEmail, targetUserId, targetUserEmail, changes, sixthParam, seventhParam, eighthParam, ninthParam) {
        // Verificar se o sexto parâmetro é um Request
        if (typeof sixthParam === 'object' && sixthParam !== null && 'headers' in sixthParam) {
            // É um Request
            const req = sixthParam;
            const success = seventhParam;
            const errorMessage = eighthParam;
            const info = this.getRequestInfo(req);
            const userInfo = this.getUserInfo(req);
            return this.log({
                ...userInfo,
                ...info,
                userId: actorId,
                userEmail: actorEmail,
                action: 'USER_UPDATED',
                category: 'user',
                level: success ? 'info' : 'error',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                details: { changes },
                success,
                errorMessage,
            });
        }
        else {
            // Formato legacy
            const ip = sixthParam;
            const userAgent = seventhParam;
            const success = eighthParam;
            const errorMessage = ninthParam;
            return this.log({
                userId: actorId,
                userEmail: actorEmail,
                action: 'USER_UPDATED',
                category: 'user',
                level: success ? 'info' : 'error',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                details: { changes },
                ip: ip || '0.0.0.0',
                userAgent: userAgent || 'unknown',
                success,
                errorMessage,
            });
        }
    }
    /**
     * Desativação de usuário - Aceita Request OU parâmetros individuais
     */
    static async logUserDeactivation(actorId, actorEmail, targetUserId, targetUserEmail, fifthParam, sixthParam, seventhParam, eighthParam) {
        if (typeof fifthParam === 'object' && fifthParam !== null && 'headers' in fifthParam) {
            // É um Request
            const req = fifthParam;
            const success = sixthParam;
            const errorMessage = seventhParam;
            const info = this.getRequestInfo(req);
            const userInfo = this.getUserInfo(req);
            return this.log({
                ...userInfo,
                ...info,
                userId: actorId,
                userEmail: actorEmail,
                action: 'USER_DEACTIVATED',
                category: 'user',
                level: success ? 'info' : 'error',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                success,
                errorMessage,
            });
        }
        else {
            // Formato legacy
            const ip = fifthParam;
            const userAgent = sixthParam;
            const success = seventhParam;
            const errorMessage = eighthParam;
            return this.log({
                userId: actorId,
                userEmail: actorEmail,
                action: 'USER_DEACTIVATED',
                category: 'user',
                level: success ? 'info' : 'error',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                ip: ip || '0.0.0.0',
                userAgent: userAgent || 'unknown',
                success,
                errorMessage,
            });
        }
    }
    /**
     * Reativação de usuário - Aceita Request OU parâmetros individuais
     */
    static async logUserReactivation(actorId, actorEmail, targetUserId, targetUserEmail, fifthParam, sixthParam, seventhParam, eighthParam) {
        if (typeof fifthParam === 'object' && fifthParam !== null && 'headers' in fifthParam) {
            // É um Request
            const req = fifthParam;
            const success = sixthParam;
            const errorMessage = seventhParam;
            const info = this.getRequestInfo(req);
            const userInfo = this.getUserInfo(req);
            return this.log({
                ...userInfo,
                ...info,
                userId: actorId,
                userEmail: actorEmail,
                action: 'USER_REACTIVATED',
                category: 'user',
                level: success ? 'info' : 'error',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                success,
                errorMessage,
            });
        }
        else {
            // Formato legacy
            const ip = fifthParam;
            const userAgent = sixthParam;
            const success = seventhParam;
            const errorMessage = eighthParam;
            return this.log({
                userId: actorId,
                userEmail: actorEmail,
                action: 'USER_REACTIVATED',
                category: 'user',
                level: success ? 'info' : 'error',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                ip: ip || '0.0.0.0',
                userAgent: userAgent || 'unknown',
                success,
                errorMessage,
            });
        }
    }
    /**
     * Reset de senha - Aceita Request OU parâmetros individuais
     */
    static async logPasswordReset(actorId, actorEmail, targetUserId, targetUserEmail, fifthParam, sixthParam, seventhParam, eighthParam) {
        if (typeof fifthParam === 'object' && fifthParam !== null && 'headers' in fifthParam) {
            // É um Request
            const req = fifthParam;
            const success = sixthParam;
            const errorMessage = seventhParam;
            const info = this.getRequestInfo(req);
            const userInfo = this.getUserInfo(req);
            return this.log({
                ...userInfo,
                ...info,
                userId: actorId,
                userEmail: actorEmail,
                action: 'PASSWORD_RESET_CONFIRM',
                category: 'auth',
                level: success ? 'info' : 'warning',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                success,
                errorMessage,
            });
        }
        else {
            // Formato legacy
            const ip = fifthParam;
            const userAgent = sixthParam;
            const success = seventhParam;
            const errorMessage = eighthParam;
            return this.log({
                userId: actorId,
                userEmail: actorEmail,
                action: 'PASSWORD_RESET_CONFIRM',
                category: 'auth',
                level: success ? 'info' : 'warning',
                resource: 'User',
                resourceId: targetUserId,
                resourceName: targetUserEmail,
                ip: ip || '0.0.0.0',
                userAgent: userAgent || 'unknown',
                success,
                errorMessage,
            });
        }
    }
    static async logUserRegister(userId, userEmail, companyId, companyName, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId,
            userEmail,
            companyId,
            companyName,
            ...info,
            action: 'USER_REGISTER',
            category: 'auth',
            level: success ? 'info' : 'error',
            resource: 'User',
            resourceId: userId,
            resourceName: userEmail,
            details: { companyName },
            success,
            errorMessage,
        });
    }
    // 🏢 EMPRESAS
    static async logCompanyCreation(actorId, actorEmail, companyId, companyName, plan, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            companyId,
            companyName,
            ...info,
            action: 'COMPANY_CREATED',
            category: 'company',
            level: success ? 'info' : 'error',
            resource: 'Company',
            resourceId: companyId,
            resourceName: companyName,
            details: { plan },
            success,
            errorMessage,
        });
    }
    static async logCompanyUpdate(actorId, actorEmail, companyId, companyName, changes, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            companyId,
            companyName,
            ...info,
            action: 'COMPANY_UPDATED',
            category: 'company',
            level: success ? 'info' : 'error',
            resource: 'Company',
            resourceId: companyId,
            resourceName: companyName,
            details: { changes },
            success,
            errorMessage,
        });
    }
    static async logCompanyPlanChange(actorId, actorEmail, companyId, companyName, oldPlan, newPlan, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            companyId,
            companyName,
            ...info,
            action: 'COMPANY_PLAN_CHANGED',
            category: 'company',
            level: 'info',
            resource: 'Company',
            resourceId: companyId,
            resourceName: companyName,
            details: { oldPlan, newPlan },
            success,
            errorMessage,
        });
    }
    // 📄 DOCUMENTOS (Governança)
    static async logDocumentCreation(actorId, actorEmail, documentId, documentCode, documentTitle, companyId, companyName, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            companyId,
            companyName,
            ...info,
            action: 'DOCUMENT_CREATED',
            category: 'governance',
            level: success ? 'info' : 'error',
            resource: 'GovernanceDocument',
            resourceId: documentId,
            resourceName: documentCode,
            details: { title: documentTitle },
            success,
            errorMessage,
        });
    }
    static async logDocumentApproval(actorId, actorEmail, documentId, documentCode, documentTitle, companyId, companyName, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            companyId,
            companyName,
            ...info,
            action: 'DOCUMENT_APPROVED',
            category: 'governance',
            level: 'info',
            resource: 'GovernanceDocument',
            resourceId: documentId,
            resourceName: documentCode,
            details: { title: documentTitle },
            success,
            errorMessage,
        });
    }
    static async logDocumentDownload(actorId, actorEmail, documentId, documentCode, documentTitle, format, companyId, companyName, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            companyId,
            companyName,
            ...info,
            action: 'DOCUMENT_DOWNLOADED',
            category: 'governance',
            level: 'info',
            resource: 'GovernanceDocument',
            resourceId: documentId,
            resourceName: documentCode,
            details: { title: documentTitle, format },
            success,
            errorMessage,
        });
    }
    // 📊 CONTROLES
    static async logControlAssignment(actorId, actorEmail, targetUserIdOrControlIds, targetUserEmailOrTargetEmail, controlIdsOrIp, sixthParam, seventhParam, eighthParam, ninthParam) {
        let targetUserId = '';
        let targetUserEmail = '';
        let controlIds = [];
        let ip = '0.0.0.0';
        let userAgent = 'unknown';
        let success = true;
        let errorMessage;
        if (Array.isArray(controlIdsOrIp)) {
            targetUserId = targetUserIdOrControlIds;
            targetUserEmail = targetUserEmailOrTargetEmail;
            controlIds = controlIdsOrIp;
            ip = sixthParam || '0.0.0.0';
            userAgent = seventhParam || 'unknown';
            success = typeof eighthParam === 'boolean' ? eighthParam : true;
            errorMessage = ninthParam;
        }
        else {
            targetUserId = typeof eighthParam === 'string' ? eighthParam : '';
            targetUserEmail = typeof ninthParam === 'string' ? ninthParam : '';
            controlIds = Array.isArray(targetUserIdOrControlIds) ? targetUserIdOrControlIds : [targetUserIdOrControlIds];
            ip = sixthParam || '0.0.0.0';
            userAgent = typeof seventhParam === 'string' ? seventhParam : 'unknown';
            success = typeof seventhParam === 'boolean' ? seventhParam : true;
        }
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            action: 'CONTROL_ASSIGNED',
            category: 'controls',
            level: success ? 'info' : 'error',
            resource: 'ControlAssignment',
            resourceId: targetUserId,
            details: { targetUserEmail, controlIds },
            ip,
            userAgent,
            success,
            errorMessage,
        });
    }
    static async logControlResponse(userId, userEmail, assignmentIdOrControlId, controlIdOrName, maturityLevel, sixthParam, seventhParam, eighthParam, ninthParam) {
        let ip = '0.0.0.0';
        let userAgent = 'unknown';
        let success = true;
        let errorMessage;
        if (typeof sixthParam === 'object' && sixthParam !== null && 'headers' in sixthParam) {
            const req = sixthParam;
            const reqInfo = this.getRequestInfo(req);
            ip = reqInfo.ip;
            userAgent = reqInfo.userAgent;
            success = typeof seventhParam === 'boolean' ? seventhParam : true;
            errorMessage = eighthParam;
        }
        else {
            ip = sixthParam || '0.0.0.0';
            userAgent = seventhParam || 'unknown';
            success = typeof eighthParam === 'boolean' ? eighthParam : true;
            errorMessage = ninthParam;
        }
        return this.log({
            userId,
            userEmail,
            action: 'CONTROL_RESPONDED',
            category: 'controls',
            level: 'info',
            resource: 'ControlResponse',
            resourceId: assignmentIdOrControlId,
            details: { controlId: controlIdOrName, maturityLevel },
            ip,
            userAgent,
            success,
            errorMessage,
        });
    }
    // 📈 RELATÓRIOS
    static async logReportGeneration(actorId, actorEmail, companyId, companyName, reportId, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId: actorId,
            userEmail: actorEmail,
            companyId,
            companyName,
            ...info,
            action: 'REPORT_GENERATED',
            category: 'reports',
            level: success ? 'info' : 'error',
            resource: 'Report',
            resourceId: reportId,
            resourceName: `Relatório ${companyName}`,
            success,
            errorMessage,
        });
    }
    // 💰 PAGAMENTOS
    static async logPayment(userId, userEmail, companyId, companyName, paymentId, amount, status, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        const action = success ? 'PAYMENT_COMPLETED' : 'PAYMENT_FAILED';
        return this.log({
            userId,
            userEmail,
            companyId,
            companyName,
            ...info,
            action,
            category: 'financial',
            level: success ? 'info' : 'error',
            resource: 'Payment',
            resourceId: paymentId,
            details: { amount, status },
            success,
            errorMessage,
        });
    }
    // 🔔 NOTIFICAÇÕES
    static async logNotificationSent(userId, userEmail, notificationId, type, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId,
            userEmail,
            ...info,
            action: 'NOTIFICATION_SENT',
            category: 'notification',
            level: 'info',
            resource: 'Notification',
            resourceId: notificationId,
            details: { type },
            success,
            errorMessage,
        });
    }
    // 🛡️ SEGURANÇA
    static async logSecurityAlert(message, level, details, req, userId, userEmail) {
        const info = this.getRequestInfo(req);
        return this.log({
            userId,
            userEmail,
            ...info,
            action: 'SECURITY_ALERT',
            category: 'security',
            level: level || 'warning',
            resource: 'Security',
            details: { message, ...details },
            success: false,
        });
    }
    // ⚙️ SISTEMA
    static async logSystemAction(action, resource, resourceId, details, req, success, errorMessage) {
        const info = this.getRequestInfo(req);
        return this.log({
            ...info,
            action,
            category: 'system',
            level: success ? 'info' : 'error',
            resource,
            resourceId,
            details,
            success,
            errorMessage,
        });
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=AuditService.js.map