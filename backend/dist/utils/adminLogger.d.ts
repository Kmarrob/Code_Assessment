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
export declare class AdminLogger {
    static logAdminAction(context: AdminLogContext): void;
    static logUserCreation(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, role: string, ip: string, userAgent: string, success: boolean, error?: string): void;
    static logUserUpdate(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, changes: Record<string, any>, ip: string, userAgent: string, success: boolean, error?: string): void;
    static logUserDeactivation(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, ip: string, userAgent: string, success: boolean, error?: string): void;
    static logUserReactivation(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, ip: string, userAgent: string, success: boolean, error?: string): void;
    static logPasswordReset(adminId: string, adminEmail: string, targetUserId: string, targetEmail: string, ip: string, userAgent: string, success: boolean, error?: string): void;
    static logAccessDenied(userId: string, email: string, action: string, ip: string, userAgent: string, reason: string): void;
}
//# sourceMappingURL=adminLogger.d.ts.map