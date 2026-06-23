// backend/src/services/AuditService.ts
import { logger } from '../utils/logger.js';

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

export class AuditService {
  private static async log(entry: AuditLogEntry): Promise<void> {
    try {
      logger.info(`[AUDIT] Action: ${entry.action} | User: ${entry.userEmail} | Resource: ${entry.resource} | Success: ${entry.success}`);
    } catch (error) {
      logger.error('Erro ao gravar log de auditoria:', error);
    }
  }

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
      details: { targetUserEmail, targetRole },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

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
      details: { targetUserEmail, changes },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

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
      details: { targetUserEmail },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

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
      details: { targetUserEmail },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }

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
      details: { targetUserEmail },
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    };
    await this.log(entry);
  }
}