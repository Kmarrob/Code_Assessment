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
export declare class AuditService {
    static logAdminAction(userId: string, email: string, action: string, ip: string, userAgent: string, success: boolean, details?: Record<string, any>): void;
    static logUserCreation(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, role: string, ip: string, userAgent: string, success: boolean): void;
    static logUserUpdate(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, changes: Record<string, any>, ip: string, userAgent: string, success: boolean): void;
    static logUserDeactivation(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, ip: string, userAgent: string, success: boolean): void;
    static logUserReactivation(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, ip: string, userAgent: string, success: boolean): void;
    static logPasswordReset(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, ip: string, userAgent: string, success: boolean): void;
    static logAccessDenied(userId: string, email: string, action: string, ip: string, userAgent: string, reason: string): void;
    static getAuditLogs(_filter?: AuditFilter, _page?: number, _limit?: number): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
}
//# sourceMappingURL=AuditService.d.ts.map