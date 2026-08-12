import mongoose, { Document } from 'mongoose';
export type AuditAction = 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'REFRESH_TOKEN' | 'PASSWORD_RESET_REQUEST' | 'PASSWORD_RESET_CONFIRM' | 'PASSWORD_CHANGE' | '2FA_ENABLED' | '2FA_DISABLED' | '2FA_VERIFIED' | 'TENANT_SWITCHED' | 'USER_REGISTER' | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DEACTIVATED' | 'USER_REACTIVATED' | 'USER_DELETED' | 'USER_ROLE_CHANGED' | 'USER_PASSWORD_CHANGED' | 'USER_INVITED' | 'USER_ACCEPTED_INVITE' | 'COMPANY_CREATED' | 'COMPANY_UPDATED' | 'COMPANY_DEACTIVATED' | 'COMPANY_REACTIVATED' | 'COMPANY_PLAN_CHANGED' | 'COMPANY_BRANDING_UPDATED' | 'DOCUMENT_CREATED' | 'DOCUMENT_UPDATED' | 'DOCUMENT_DELETED' | 'DOCUMENT_APPROVED' | 'DOCUMENT_ARCHIVED' | 'DOCUMENT_DOWNLOADED' | 'DOCUMENT_VIEWED' | 'DOCUMENT_UPLOADED' | 'DOCUMENT_RESTORED' | 'CONTROL_ASSIGNED' | 'CONTROL_REVOKED' | 'CONTROL_REASSIGNED' | 'CONTROL_RESPONDED' | 'CONTROL_RESPONSE_UPDATED' | 'CONTROL_REVIEW_REQUESTED' | 'CONTROL_REVIEW_COMPLETED' | 'RECOMMENDATION_CREATED' | 'RECOMMENDATION_UPDATED' | 'RECOMMENDATION_DELETED' | 'REPORT_GENERATED' | 'REPORT_DOWNLOADED' | 'REPORT_VIEWED' | 'REPORT_EXPORTED' | 'REPORT_UPDATED' | 'REPORT_EXPORTED_PDF' | 'PAYMENT_CREATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'PAYMENT_REFUNDED' | 'PAYMENT_CONFIRMED_WEBHOOK' | 'PAYMENT_FAILED_WEBHOOK' | 'PAYMENT_CONFIRMED_MANUALLY' | 'INVOICE_GENERATED' | 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_UPDATED' | 'SUBSCRIPTION_CANCELLED' | 'SUBSCRIPTION_RENEWED' | 'SYSTEM_CONFIG_UPDATED' | 'SYSTEM_BACKUP' | 'SYSTEM_RESTORE' | 'SEED_EXECUTED' | 'MAINTENANCE_MODE' | 'HEALTH_CHECK' | 'SYSTEM_ACTION' | 'NOTIFICATION_SENT' | 'NOTIFICATION_READ' | 'NOTIFICATION_DELETED' | 'COMPANY_DOCUMENT_UPLOADED' | 'COMPANY_DOCUMENT_DOWNLOADED' | 'COMPANY_DOCUMENT_DELETED' | 'SECURITY_ALERT' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'API_ACCESS_DENIED';
export type AuditCategory = 'auth' | 'user' | 'company' | 'document' | 'documents' | 'governance' | 'control' | 'controls' | 'report' | 'reports' | 'payment' | 'financial' | 'subscription' | 'system' | 'notification' | 'security';
export type AuditLevel = 'info' | 'warning' | 'error' | 'critical';
export interface IAuditLog extends Document {
    _id: mongoose.Types.ObjectId;
    timestamp: Date;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
    companyId?: string;
    companyName?: string;
    action: AuditAction;
    category: AuditCategory;
    level: AuditLevel;
    resource: string;
    resourceId?: string;
    resourceName?: string;
    details?: {
        before?: any;
        after?: any;
        changes?: Record<string, {
            before: any;
            after: any;
        }>;
        metadata?: Record<string, any>;
        [key: string]: any;
    };
    success: boolean;
    errorMessage?: string;
    errorCode?: string;
    duration?: number;
    ip: string;
    userAgent: string;
    origin?: string;
    referer?: string;
    method?: string;
    path?: string;
    query?: Record<string, any>;
    sessionId?: string;
    requestId?: string;
    correlationId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AuditLog: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditLog.d.ts.map