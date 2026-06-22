// backend/src/utils/securityLogger.ts
import { logger } from './logger.js';

export enum SecurityEventType {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  REGISTER_ATTEMPT = 'REGISTER_ATTEMPT',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILED = 'REGISTER_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_CHANGE_SUCCESS = 'PASSWORD_CHANGE_SUCCESS',
  PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCESS_DENIED = 'ACCESS_DENIED',
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  BRUTE_FORCE_DETECTED = 'BRUTE_FORCE_DETECTED',
  SQL_INJECTION_DETECTED = 'SQL_INJECTION_DETECTED',
  XSS_DETECTED = 'XSS_DETECTED',
}

export interface SecurityLog {
  eventType: SecurityEventType;
  timestamp: Date;
  userId?: string;
  email?: string;
  role?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  message?: string;
  details?: Record<string, any>;
}

export class SecurityLogger {
  static log(event: SecurityLog): void {
    const logData = {
      eventType: event.eventType,
      timestamp: event.timestamp || new Date(),
      userId: event.userId,
      email: event.email,
      role: event.role,
      ip: event.ip,
      userAgent: event.userAgent,
      success: event.success,
      message: event.message,
      details: event.details,
    };

    if (event.success) {
      logger.info(`[SECURITY] ${event.eventType}`, logData);
    } else {
      logger.warn(`[SECURITY] ${event.eventType} - FAILED`, logData);
    }
  }

  static loginAttempt(email: string, ip: string, userAgent: string, success: boolean, reason?: string): void {
    this.log({
      eventType: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILED,
      timestamp: new Date(),
      email,
      ip,
      userAgent,
      success,
      message: reason,
      details: { attemptType: 'login' },
    });
  }

  static registerAttempt(email: string, ip: string, userAgent: string, success: boolean, reason?: string): void {
    this.log({
      eventType: success ? SecurityEventType.REGISTER_SUCCESS : SecurityEventType.REGISTER_FAILED,
      timestamp: new Date(),
      email,
      ip,
      userAgent,
      success,
      message: reason,
      details: { attemptType: 'register' },
    });
  }

  static passwordChange(userId: string, email: string, ip: string, userAgent: string, success: boolean, reason?: string): void {
    this.log({
      eventType: success ? SecurityEventType.PASSWORD_CHANGE_SUCCESS : SecurityEventType.PASSWORD_CHANGE_FAILED,
      timestamp: new Date(),
      userId,
      email,
      ip,
      userAgent,
      success,
      message: reason,
      details: { operation: 'password_change' },
    });
  }

  static tokenRefresh(email: string, ip: string, userAgent: string, success: boolean, reason?: string): void {
    this.log({
      eventType: success ? SecurityEventType.TOKEN_REFRESH : SecurityEventType.TOKEN_REFRESH_FAILED,
      timestamp: new Date(),
      email,
      ip,
      userAgent,
      success,
      message: reason,
      details: { operation: 'token_refresh' },
    });
  }

  static accessDenied(userId: string, email: string, resource: string, ip: string, reason: string): void {
    this.log({
      eventType: SecurityEventType.ACCESS_DENIED,
      timestamp: new Date(),
      userId,
      email,
      ip,
      success: false,
      message: `Acesso negado ao recurso: ${resource}`,
      details: { resource, reason },
    });
  }

  static suspiciousActivity(email: string, ip: string, userAgent: string, details: Record<string, any>): void {
    this.log({
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      timestamp: new Date(),
      email,
      ip,
      userAgent,
      success: false,
      message: 'Atividade suspeita detectada',
      details,
    });
  }

  static bruteForceDetected(ip: string, attempts: number, email?: string): void {
    this.log({
      eventType: SecurityEventType.BRUTE_FORCE_DETECTED,
      timestamp: new Date(),
      email,
      ip,
      success: false,
      message: `Ataque de força bruta detectado - ${attempts} tentativas`,
      details: { attempts, ip },
    });
  }
}
