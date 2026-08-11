// backend/src/services/AuditService.ts
import { logger } from '../utils/logger.js';
import { AuditLog, IAuditLog, AuditAction, AuditCategory, AuditLevel } from '../models/AuditLog.js';
import { Request } from 'express';

export interface AuditLogEntry {
  // Usuário
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;

  // Empresa
  companyId?: string;
  companyName?: string;

  // Ação
  action: AuditAction;
  category: AuditCategory;
  level: AuditLevel;

  // Recurso
  resource: string;
  resourceId?: string;
  resourceName?: string;

  // Detalhes
  details?: {
    before?: any;
    after?: any;
    changes?: Record<string, { before: any; after: any }>;
    metadata?: Record<string, any>;
    [key: string]: any;
  };

  // Status
  success: boolean;
  errorMessage?: string;
  errorCode?: string;
  duration?: number;

  // Contexto da requisição
  ip: string;
  userAgent: string;
  origin?: string;
  referer?: string;
  method?: string;
  path?: string;
  query?: Record<string, any>;

  // Metadados
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
}

export class AuditService {
  /**
   * Criar um log de auditoria
   */
  static async log(entry: AuditLogEntry): Promise<IAuditLog | null> {
    try {
      const auditLog = new AuditLog({
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

      // Também loga no console para debug
      logger.info(`[AUDIT] ${entry.action} | User: ${entry.userEmail || 'system'} | Resource: ${entry.resource} | Success: ${entry.success}`);

      return auditLog;
    } catch (error) {
      logger.error('Erro ao gravar log de auditoria:', error);
      return null;
    }
  }

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
  } {
    return {
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '0.0.0.0',
      userAgent: req.headers['user-agent'] || 'unknown',
      origin: req.headers['origin'],
      referer: req.headers['referer'],
      method: req.method,
      path: req.path,
      query: req.query as Record<string, any>,
    };
  }

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
  } {
    const user = (req as any).user;
    if (!user) return {};

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
  // MÉTODOS AUXILIARES POR CATEGORIA
  // ============================================

  // 🔐 AUTENTICAÇÃO
  static async logLogin(userId: string, userEmail: string, req: Request, success: boolean, errorMessage?: string) {
    const info = this.getRequestInfo(req);
    const userInfo = this.getUserInfo(req);
    return this.log({
      ...userInfo,
      ...info,
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

  static async logLogout(userId: string, userEmail: string, req: Request) {
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

  static async logPasswordReset(userId: string, userEmail: string, req: Request, success: boolean, errorMessage?: string) {
    const info = this.getRequestInfo(req);
    return this.log({
      userId,
      userEmail,
      ...info,
      action: 'PASSWORD_RESET_CONFIRM',
      category: 'auth',
      level: success ? 'info' : 'warning',
      resource: 'User',
      resourceId: userId,
      resourceName: userEmail,
      success,
      errorMessage,
    });
  }

  // 👤 USUÁRIOS
  static async logUserCreation(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    targetRole: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
    const info = this.getRequestInfo(req);
    return this.log({
      userId: actorId,
      userEmail: actorEmail,
      ...info,
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

  static async logUserUpdate(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    changes: any,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
    const info = this.getRequestInfo(req);
    return this.log({
      userId: actorId,
      userEmail: actorEmail,
      ...info,
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

  static async logUserDeactivation(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
    const info = this.getRequestInfo(req);
    return this.log({
      userId: actorId,
      userEmail: actorEmail,
      ...info,
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

  static async logUserRegister(
    userId: string,
    userEmail: string,
    companyId: string,
    companyName: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
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
  static async logCompanyCreation(
    actorId: string,
    actorEmail: string,
    companyId: string,
    companyName: string,
    plan: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
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

  static async logCompanyUpdate(
    actorId: string,
    actorEmail: string,
    companyId: string,
    companyName: string,
    changes: any,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
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

  static async logCompanyPlanChange(
    actorId: string,
    actorEmail: string,
    companyId: string,
    companyName: string,
    oldPlan: string,
    newPlan: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
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
  static async logDocumentCreation(
    actorId: string,
    actorEmail: string,
    documentId: string,
    documentCode: string,
    documentTitle: string,
    companyId: string,
    companyName: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
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

  static async logDocumentApproval(
    actorId: string,
    actorEmail: string,
    documentId: string,
    documentCode: string,
    documentTitle: string,
    companyId: string,
    companyName: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
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

  static async logDocumentDownload(
    actorId: string,
    actorEmail: string,
    documentId: string,
    documentCode: string,
    documentTitle: string,
    format: 'pdf' | 'doc',
    companyId: string,
    companyName: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
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
  static async logControlAssignment(
    actorId: string,
    actorEmail: string,
    controlId: string,
    controlName: string,
    targetUserId: string,
    targetUserEmail: string,
    companyId: string,
    companyName: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
    const info = this.getRequestInfo(req);
    return this.log({
      userId: actorId,
      userEmail: actorEmail,
      companyId,
      companyName,
      ...info,
      action: 'CONTROL_ASSIGNED',
      category: 'control',
      level: success ? 'info' : 'error',
      resource: 'Control',
      resourceId: controlId,
      resourceName: controlName,
      details: { targetUserEmail },
      success,
      errorMessage,
    });
  }

  static async logControlResponse(
    userId: string,
    userEmail: string,
    controlId: string,
    controlName: string,
    maturityLevel: number,
    companyId: string,
    companyName: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
    const info = this.getRequestInfo(req);
    return this.log({
      userId,
      userEmail,
      companyId,
      companyName,
      ...info,
      action: 'CONTROL_RESPONDED',
      category: 'control',
      level: 'info',
      resource: 'Control',
      resourceId: controlId,
      resourceName: controlName,
      details: { maturityLevel },
      success,
      errorMessage,
    });
  }

  // 📈 RELATÓRIOS
  static async logReportGeneration(
    actorId: string,
    actorEmail: string,
    companyId: string,
    companyName: string,
    reportId: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
    const info = this.getRequestInfo(req);
    return this.log({
      userId: actorId,
      userEmail: actorEmail,
      companyId,
      companyName,
      ...info,
      action: 'REPORT_GENERATED',
      category: 'report',
      level: success ? 'info' : 'error',
      resource: 'Report',
      resourceId: reportId,
      resourceName: `Relatório ${companyName}`,
      success,
      errorMessage,
    });
  }

  // 💰 PAGAMENTOS
  static async logPayment(
    userId: string,
    userEmail: string,
    companyId: string,
    companyName: string,
    paymentId: string,
    amount: number,
    status: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
    const info = this.getRequestInfo(req);
    const action = success ? 'PAYMENT_COMPLETED' : 'PAYMENT_FAILED';
    return this.log({
      userId,
      userEmail,
      companyId,
      companyName,
      ...info,
      action,
      category: 'payment',
      level: success ? 'info' : 'error',
      resource: 'Payment',
      resourceId: paymentId,
      details: { amount, status },
      success,
      errorMessage,
    });
  }

  // 🔔 NOTIFICAÇÕES
  static async logNotificationSent(
    userId: string,
    userEmail: string,
    notificationId: string,
    type: string,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
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
  static async logSecurityAlert(
    message: string,
    level: AuditLevel,
    details: any,
    req: Request,
    userId?: string,
    userEmail?: string
  ) {
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
  static async logSystemAction(
    action: AuditAction,
    resource: string,
    resourceId: string,
    details: any,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
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