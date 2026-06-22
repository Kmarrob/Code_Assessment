// backend/src/services/AuditService.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

// ============================================
// INTERFACES
// ============================================

export interface AuditLogEntry {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ip: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
}

// ============================================
// AUDIT SERVICE
// ============================================

export class AuditService {
  /**
   * Log de criação de usuário
   */
  static async logUserCreation(
    userId: string,
    userEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    targetRole: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'USER_CREATED',
      resource: 'User',
      resourceId: targetUserId,
      details: {
        targetUserEmail,
        targetRole,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de atualização de usuário
   */
  static async logUserUpdate(
    userId: string,
    userEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    changes: any,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'USER_UPDATED',
      resource: 'User',
      resourceId: targetUserId,
      details: {
        targetUserEmail,
        changes,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de desativação de usuário
   */
  static async logUserDeactivation(
    userId: string,
    userEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'USER_DEACTIVATED',
      resource: 'User',
      resourceId: targetUserId,
      details: {
        targetUserEmail,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de reativação de usuário
   */
  static async logUserReactivation(
    userId: string,
    userEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'USER_REACTIVATED',
      resource: 'User',
      resourceId: targetUserId,
      details: {
        targetUserEmail,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de reset de senha
   */
  static async logPasswordReset(
    userId: string,
    userEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'PASSWORD_RESET',
      resource: 'User',
      resourceId: targetUserId,
      details: {
        targetUserEmail,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de login
   */
  static async logLogin(
    userId: string,
    userEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'LOGIN',
      resource: 'Auth',
      details: {
        success,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de logout
   */
  static async logLogout(
    userId: string,
    userEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'LOGOUT',
      resource: 'Auth',
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de criação de empresa
   */
  static async logCompanyCreation(
    userId: string,
    userEmail: string,
    companyId: string,
    companyName: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'COMPANY_CREATED',
      resource: 'Company',
      resourceId: companyId,
      details: {
        companyName,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de atualização de empresa
   */
  static async logCompanyUpdate(
    userId: string,
    userEmail: string,
    companyId: string,
    companyName: string,
    changes: any,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'COMPANY_UPDATED',
      resource: 'Company',
      resourceId: companyId,
      details: {
        companyName,
        changes,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de atribuição de controles
   */
  static async logControlAssignment(
    userId: string,
    userEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    controlIds: string[],
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'CONTROLS_ASSIGNED',
      resource: 'Assignment',
      details: {
        targetUserEmail,
        controlIds,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log de resposta a controle
   */
  static async logControlResponse(
    userId: string,
    userEmail: string,
    assignmentId: string,
    controlId: string,
    maturityLevel: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): Promise<void> {
    const entry: AuditLogEntry = {
      userId,
      userEmail,
      action: 'CONTROL_RESPONDED',
      resource: 'Response',
      resourceId: assignmentId,
      details: {
        controlId,
        maturityLevel,
      },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

  /**
   * Log genérico
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Em produção, isso pode ser salvo em um banco separado
      logger.info(`[AUDIT] ${entry.action} - ${entry.userEmail} - ${entry.resource}`, entry);
    } catch (error) {
      logger.error('Erro ao salvar log de auditoria:', error);
    }
  }

  /**
   * Gerar token JWT para auditoria (se necessário)
   */
  static generateAuditToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, purpose: 'audit' },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
}

export default AuditService;