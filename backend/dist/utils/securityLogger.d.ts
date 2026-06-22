export declare enum SecurityEventType {
    LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
    LOGIN_SUCCESS = "LOGIN_SUCCESS",
    LOGIN_FAILED = "LOGIN_FAILED",
    LOGOUT = "LOGOUT",
    REGISTER_ATTEMPT = "REGISTER_ATTEMPT",
    REGISTER_SUCCESS = "REGISTER_SUCCESS",
    REGISTER_FAILED = "REGISTER_FAILED",
    TOKEN_REFRESH = "TOKEN_REFRESH",
    TOKEN_REFRESH_FAILED = "TOKEN_REFRESH_FAILED",
    TOKEN_REVOKED = "TOKEN_REVOKED",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    PASSWORD_CHANGE = "PASSWORD_CHANGE",
    PASSWORD_CHANGE_SUCCESS = "PASSWORD_CHANGE_SUCCESS",
    PASSWORD_CHANGE_FAILED = "PASSWORD_CHANGE_FAILED",
    PASSWORD_RESET = "PASSWORD_RESET",
    ACCESS_DENIED = "ACCESS_DENIED",
    ACCESS_GRANTED = "ACCESS_GRANTED",
    USER_CREATED = "USER_CREATED",
    USER_UPDATED = "USER_UPDATED",
    USER_DELETED = "USER_DELETED",
    USER_ROLE_CHANGED = "USER_ROLE_CHANGED",
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
    BRUTE_FORCE_DETECTED = "BRUTE_FORCE_DETECTED",
    SQL_INJECTION_DETECTED = "SQL_INJECTION_DETECTED",
    XSS_DETECTED = "XSS_DETECTED"
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
export declare class SecurityLogger {
    static log(event: SecurityLog): void;
    static loginAttempt(email: string, ip: string, userAgent: string, success: boolean, reason?: string): void;
    static registerAttempt(email: string, ip: string, userAgent: string, success: boolean, reason?: string): void;
    static passwordChange(userId: string, email: string, ip: string, userAgent: string, success: boolean, reason?: string): void;
    static tokenRefresh(email: string, ip: string, userAgent: string, success: boolean, reason?: string): void;
    static accessDenied(userId: string, email: string, resource: string, ip: string, reason: string): void;
    static suspiciousActivity(email: string, ip: string, userAgent: string, details: Record<string, any>): void;
    static bruteForceDetected(ip: string, attempts: number, email?: string): void;
}
//# sourceMappingURL=securityLogger.d.ts.map