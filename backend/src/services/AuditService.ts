// backend/src/services/AuditService.ts
import { SecurityLogger, SecurityEventType } from '../utils/securityLogger.js';

export interface AuditLog {
  userId: string;
  email: string;
  action: string;
  targetUserId?: string;
  targetEmail?: string;
  details?: Record<string, any>;
  ip: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
}

export class AuditService {
  static logAdminAction(
    userId: string,
    email: string,
    action: string,
    ip: string,
    userAgent: string,
    success: boolean,
    details?: Record<string, any>
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_UPDATED,
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

  static logUserCreation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    role: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_CREATED,
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

  static logUserUpdate(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    changes: Record<string, any>,
    ip: string,
    userAgent: string,
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_UPDATED,
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

  static logUserDeactivation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_DELETED,
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

  static logUserReactivation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_UPDATED,
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

  static logPasswordReset(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.PASSWORD_CHANGE,
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

  static logAccessDenied(
    userId: string,
    email: string,
    action: string,
    ip: string,
    userAgent: string,
    reason: string
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.ACCESS_DENIED,
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

  static async getAuditLogs(
    _filter?: AuditFilter,
    _page: number = 1,
    _limit: number = 50
  ): Promise<{ logs: AuditLog[]; total: number }> {
    // Em produção, isso seria uma consulta ao banco de dados
    return {
      logs: [],
      total: 0,
    };
  }
}