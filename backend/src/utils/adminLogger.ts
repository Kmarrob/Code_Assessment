// backend/src/utils/adminLogger.ts
import { logger } from './logger.js';
import { SecurityLogger, SecurityEventType } from './securityLogger.js';

export interface AdminLogContext {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  action: string;
  targetUserId?: string;
  targetEmail?: string;
  details?: Record<string, any>;
  success: boolean;
}

export class AdminLogger {
  static logAdminAction(context: AdminLogContext): void {
    const logData = {
      eventType: SecurityEventType.USER_UPDATED,
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
      logger.info(`[ADMIN] ${context.action}`, logData);
    } else {
      logger.warn(`[ADMIN] ${context.action} - FALHOU`, logData);
    }

    SecurityLogger.log(logData);
  }

  static logUserCreation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    role: string,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
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

  static logUserUpdate(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    changes: Record<string, any>,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
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

  static logUserDeactivation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
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

  static logUserReactivation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
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

  static logPasswordReset(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
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

  static logAccessDenied(
    userId: string,
    email: string,
    action: string,
    ip: string,
    userAgent: string,
    reason: string
  ): void {
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
