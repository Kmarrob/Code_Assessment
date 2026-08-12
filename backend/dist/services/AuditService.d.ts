import { IAuditLog, AuditAction, AuditCategory, AuditLevel } from '../models/AuditLog.js';
import { Request } from 'express';
export interface AuditLogEntry {
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
    companyId?: string;
    companyName?: string;
    action: AuditAction;
    category: AuditCategory;
    level: AuditLevel;
    resource: string;
    resourceId?: string;
    resourceName?: string;
    details?: {
        before?: any;
        after?: any;
        changes?: Record<string, {
            before: any;
            after: any;
        }>;
        metadata?: Record<string, any>;
        [key: string]: any;
    };
    success: boolean;
    errorMessage?: string;
    errorCode?: string;
    duration?: number;
    ip: string;
    userAgent: string;
    origin?: string;
    referer?: string;
    method?: string;
    path?: string;
    query?: Record<string, any>;
    sessionId?: string;
    requestId?: string;
    correlationId?: string;
}
export declare class AuditService {
    /**
     * Criar um log de auditoria
     */
    static log(entry: AuditLogEntry): Promise<IAuditLog | null>;
    /**
     * Extrair informações da requisição para o log
     */
    static getRequestInfo(req: Request): {
        ip: string;
        userAgent: string;
        origin?: string;
        referer?: string;
        method: string;
        path: string;
        query: Record<string, any>;
    };
    /**
     * Extrair informações do usuário para o log
     */
    static getUserInfo(req: Request): {
        userId?: string;
        userEmail?: string;
        userName?: string;
        userRole?: string;
        companyId?: string;
        companyName?: string;
    };
    /**
     * 🆕 Método legacy para criação de usuário (compatível com AdminController)
     */
    static logUserCreationLegacy(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, targetRole: string, ip: string, userAgent: string, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    /**
     * 🆕 Método legacy para atualização de usuário (compatível com AdminController)
     */
    static logUserUpdateLegacy(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, changes: any, ip: string, userAgent: string, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    /**
     * 🆕 Método legacy para desativação de usuário (compatível com AdminController)
     */
    static logUserDeactivationLegacy(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, ip: string, userAgent: string, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    /**
     * 🆕 Método legacy para reativação de usuário (compatível com AdminController)
     */
    static logUserReactivationLegacy(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, ip: string, userAgent: string, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    /**
     * 🆕 Método legacy para reset de senha (compatível com AdminController)
     */
    static logPasswordResetLegacy(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, ip: string, userAgent: string, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logLogin(userId: string, userEmail: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    /**
     * 🔑 ALIAS DE COMPATIBILIDADE: logUserLogin -> chama logLogin
     */
    static logUserLogin(userId: string, userEmail: string, thirdParam: Request | string, fourthParam?: boolean | string, fifthParam?: string | boolean, sixthParam?: boolean, seventhParam?: string): Promise<IAuditLog | null>;
    static logLogout(userId: string, userEmail: string, req: Request): Promise<IAuditLog | null>;
    /**
     * Criação de usuário - Aceita Request OU parâmetros individuais
     */
    static logUserCreation(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, targetRole: string, sixthParam: string | Request, seventhParam: string | boolean, eighthParam?: boolean | string, ninthParam?: string): Promise<IAuditLog | null>;
    /**
     * Atualização de usuário - Aceita Request OU parâmetros individuais
     */
    static logUserUpdate(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, changes: any, sixthParam: string | Request, seventhParam: string | boolean, eighthParam?: boolean | string, ninthParam?: string): Promise<IAuditLog | null>;
    /**
     * Desativação de usuário - Aceita Request OU parâmetros individuais
     */
    static logUserDeactivation(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, fifthParam: string | Request, sixthParam: string | boolean, seventhParam?: boolean | string, eighthParam?: string): Promise<IAuditLog | null>;
    /**
     * Reativação de usuário - Aceita Request OU parâmetros individuais
     */
    static logUserReactivation(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, fifthParam: string | Request, sixthParam: string | boolean, seventhParam?: boolean | string, eighthParam?: string): Promise<IAuditLog | null>;
    /**
     * Reset de senha - Aceita Request OU parâmetros individuais
     */
    static logPasswordReset(actorId: string, actorEmail: string, targetUserId: string, targetUserEmail: string, fifthParam: string | Request, sixthParam: string | boolean, seventhParam?: boolean | string, eighthParam?: string): Promise<IAuditLog | null>;
    static logUserRegister(userId: string, userEmail: string, companyId: string, companyName: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logCompanyCreation(actorId: string, actorEmail: string, companyId: string, companyName: string, plan: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logCompanyUpdate(actorId: string, actorEmail: string, companyId: string, companyName: string, changes: any, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logCompanyPlanChange(actorId: string, actorEmail: string, companyId: string, companyName: string, oldPlan: string, newPlan: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logDocumentCreation(actorId: string, actorEmail: string, documentId: string, documentCode: string, documentTitle: string, companyId: string, companyName: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logDocumentApproval(actorId: string, actorEmail: string, documentId: string, documentCode: string, documentTitle: string, companyId: string, companyName: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logDocumentDownload(actorId: string, actorEmail: string, documentId: string, documentCode: string, documentTitle: string, format: 'pdf' | 'doc', companyId: string, companyName: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logControlAssignment(actorId: string, actorEmail: string, targetUserIdOrControlIds: string | string[], targetUserEmailOrTargetEmail: string, controlIdsOrIp?: string[] | string, sixthParam?: string, seventhParam?: string | boolean, eighthParam?: boolean, ninthParam?: string): Promise<IAuditLog | null>;
    static logControlResponse(userId: string, userEmail: string, assignmentIdOrControlId: string, controlIdOrName: string, maturityLevel: any, sixthParam?: string | Request, seventhParam?: string | boolean, eighthParam?: boolean | string, ninthParam?: string): Promise<IAuditLog | null>;
    static logReportGeneration(actorId: string, actorEmail: string, companyId: string, companyName: string, reportId: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logPayment(userId: string, userEmail: string, companyId: string, companyName: string, paymentId: string, amount: number, status: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logNotificationSent(userId: string, userEmail: string, notificationId: string, type: string, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
    static logSecurityAlert(message: string, level: AuditLevel, details: any, req: Request, userId?: string, userEmail?: string): Promise<IAuditLog | null>;
    static logSystemAction(action: AuditAction, resource: string, resourceId: string, details: any, req: Request, success: boolean, errorMessage?: string): Promise<IAuditLog | null>;
}
//# sourceMappingURL=AuditService.d.ts.map