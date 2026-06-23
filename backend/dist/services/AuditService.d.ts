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
export declare class AuditService {
    private static log;
    static logUserCreation(userId: string, userEmail: string, targetUserId: string, targetUserEmail: string, targetRole: string, ip: string, userAgent: string, success: boolean): Promise<void>;
    static logUserUpdate(userId: string, userEmail: string, targetUserId: string, targetUserEmail: string, changes: any, ip: string, userAgent: string, success: boolean): Promise<void>;
    static logUserDeactivation(userId: string, userEmail: string, targetUserId: string, targetUserEmail: string, ip: string, userAgent: string, success: boolean): Promise<void>;
    static logUserReactivation(userId: string, userEmail: string, targetUserId: string, targetUserEmail: string, ip: string, userAgent: string, success: boolean): Promise<void>;
    static logPasswordReset(userId: string, userEmail: string, targetUserId: string, targetUserEmail: string, ip: string, userAgent: string, success: boolean): Promise<void>;
}
//# sourceMappingURL=AuditService.d.ts.map