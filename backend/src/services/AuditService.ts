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
  // 🆕 MÉTODOS LEGACY (para compatibilidade com AdminController)
  // ============================================

  /**
   * 🆕 Método legacy para criação de usuário (compatível com AdminController)
   */
  static async logUserCreationLegacy(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    targetRole: string,
    ip: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<IAuditLog | null> {
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
  static async logUserUpdateLegacy(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    changes: any,
    ip: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<IAuditLog | null> {
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
  static async logUserDeactivationLegacy(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    ip: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<IAuditLog | null> {
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
  static async logUserReactivationLegacy(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    ip: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<IAuditLog | null> {
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
  static async logPasswordResetLegacy(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    ip: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<IAuditLog | null> {
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

  /**
   * 🔑 ALIAS DE COMPATIBILIDADE: logUserLogin -> chama logLogin
   */
  static async logUserLogin(
    userId: string,
    userEmail: string,
    thirdParam: Request | string,
    fourthParam?: boolean | string,
    fifthParam?: string | boolean,
    sixthParam?: boolean,
    seventhParam?: string
  ) {
    if (typeof thirdParam === 'object' && thirdParam !== null && 'headers' in thirdParam) {
      const req = thirdParam as Request;
      const success = typeof fourthParam === 'boolean' ? fourthParam : true;
      const errorMessage = typeof fifthParam === 'string' ? fifthParam : undefined;
      return this.logLogin(userId, userEmail, req, success, errorMessage);
    } else {
      const ip = thirdParam as string;
      const userAgent = (fourthParam as string) || 'unknown';
      const success = typeof fifthParam === 'boolean' ? fifthParam : true;
      const errorMessage = seventhParam || (typeof sixthParam === 'string' ? sixthParam : undefined);
      return this.log({
        userId,
        userEmail,
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

  // 👤 USUÁRIOS - MÉTODOS FLEXÍVEIS (aceitam Request OU parâmetros individuais)
  
  /**
   * Criação de usuário - Aceita Request OU parâmetros individuais
   */
  static async logUserCreation(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    targetRole: string,
    sixthParam: string | Request,
    seventhParam: string | boolean,
    eighthParam?: boolean | string,
    ninthParam?: string
  ): Promise<IAuditLog | null> {
    // Verificar se o sexto parâmetro é um Request
    if (typeof sixthParam === 'object' && sixthParam !== null && 'headers' in sixthParam) {
      // É um Request - usar o método com Request
      const req = sixthParam as Request;
      const success = seventhParam as boolean;
      const errorMessage = eighthParam as string | undefined;
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
    } else {
      // É o formato legacy (ip, userAgent, success)
      const ip = sixthParam as string;
      const userAgent = seventhParam as string;
      const success = eighthParam as boolean;
      const errorMessage = ninthParam as string | undefined;
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
  static async logUserUpdate(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    changes: any,
    sixthParam: string | Request,
    seventhParam: string | boolean,
    eighthParam?: boolean | string,
    ninthParam?: string
  ): Promise<IAuditLog | null> {
    // Verificar se o sexto parâmetro é um Request
    if (typeof sixthParam === 'object' && sixthParam !== null && 'headers' in sixthParam) {
      // É um Request
      const req = sixthParam as Request;
      const success = seventhParam as boolean;
      const errorMessage = eighthParam as string | undefined;
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
    } else {
      // Formato legacy
      const ip = sixthParam as string;
      const userAgent = seventhParam as string;
      const success = eighthParam as boolean;
      const errorMessage = ninthParam as string | undefined;
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
  static async logUserDeactivation(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    fifthParam: string | Request,
    sixthParam: string | boolean,
    seventhParam?: boolean | string,
    eighthParam?: string
  ): Promise<IAuditLog | null> {
    if (typeof fifthParam === 'object' && fifthParam !== null && 'headers' in fifthParam) {
      // É um Request
      const req = fifthParam as Request;
      const success = sixthParam as boolean;
      const errorMessage = seventhParam as string | undefined;
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
    } else {
      // Formato legacy
      const ip = fifthParam as string;
      const userAgent = sixthParam as string;
      const success = seventhParam as boolean;
      const errorMessage = eighthParam as string | undefined;
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
  static async logUserReactivation(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    fifthParam: string | Request,
    sixthParam: string | boolean,
    seventhParam?: boolean | string,
    eighthParam?: string
  ): Promise<IAuditLog | null> {
    if (typeof fifthParam === 'object' && fifthParam !== null && 'headers' in fifthParam) {
      // É um Request
      const req = fifthParam as Request;
      const success = sixthParam as boolean;
      const errorMessage = seventhParam as string | undefined;
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
    } else {
      // Formato legacy
      const ip = fifthParam as string;
      const userAgent = sixthParam as string;
      const success = seventhParam as boolean;
      const errorMessage = eighthParam as string | undefined;
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
  static async logPasswordReset(
    actorId: string,
    actorEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    fifthParam: string | Request,
    sixthParam: string | boolean,
    seventhParam?: boolean | string,
    eighthParam?: string
  ): Promise<IAuditLog | null> {
    if (typeof fifthParam === 'object' && fifthParam !== null && 'headers' in fifthParam) {
      // É um Request
      const req = fifthParam as Request;
      const success = sixthParam as boolean;
      const errorMessage = seventhParam as string | undefined;
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
    } else {
      // Formato legacy
      const ip = fifthParam as string;
      const userAgent = sixthParam as string;
      const success = seventhParam as boolean;
      const errorMessage = eighthParam as string | undefined;
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
    targetUserIdOrControlIds: string | string[],
    targetUserEmailOrTargetEmail: string,
    controlIdsOrIp?: string[] | string,
    sixthParam?: string,
    seventhParam?: string | boolean,
    eighthParam?: boolean,
    ninthParam?: string
  ) {
    let targetUserId = '';
    let targetUserEmail = '';
    let controlIds: string[] = [];
    let ip = '0.0.0.0';
    let userAgent = 'unknown';
    let success = true;
    let errorMessage: string | undefined;

    if (Array.isArray(controlIdsOrIp)) {
      targetUserId = targetUserIdOrControlIds as string;
      targetUserEmail = targetUserEmailOrTargetEmail;
      controlIds = controlIdsOrIp;
      ip = (sixthParam as string) || '0.0.0.0';
      userAgent = (seventhParam as string) || 'unknown';
      success = typeof eighthParam === 'boolean' ? eighthParam : true;
      errorMessage = ninthParam;
    } else {
      targetUserId = typeof eighthParam === 'string' ? eighthParam : '';
      targetUserEmail = typeof ninthParam === 'string' ? ninthParam : '';
      controlIds = Array.isArray(targetUserIdOrControlIds) ? targetUserIdOrControlIds : [targetUserIdOrControlIds as string];
      ip = (sixthParam as string) || '0.0.0.0';
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

  static async logControlResponse(
    userId: string,
    userEmail: string,
    assignmentIdOrControlId: string,
    controlIdOrName: string,
    maturityLevel: any,
    sixthParam?: string | Request,
    seventhParam?: string | boolean,
    eighthParam?: boolean | string,
    ninthParam?: string
  ) {
    let ip = '0.0.0.0';
    let userAgent = 'unknown';
    let success = true;
    let errorMessage: string | undefined;

    if (typeof sixthParam === 'object' && sixthParam !== null && 'headers' in sixthParam) {
      const req = sixthParam as Request;
      const reqInfo = this.getRequestInfo(req);
      ip = reqInfo.ip;
      userAgent = reqInfo.userAgent;
      success = typeof seventhParam === 'boolean' ? seventhParam : true;
      errorMessage = eighthParam as string | undefined;
    } else {
      ip = (sixthParam as string) || '0.0.0.0';
      userAgent = (seventhParam as string) || 'unknown';
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