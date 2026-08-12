"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
// backend/src/models/AuditLog.ts
const mongoose_1 = __importStar(require("mongoose"));
const AuditLogSchema = new mongoose_1.Schema({
    timestamp: { type: Date, default: Date.now, required: true, index: true },
    userId: { type: String, ref: 'User', index: true },
    userEmail: { type: String, index: true },
    userName: { type: String },
    userRole: { type: String },
    companyId: { type: String, ref: 'Company', index: true },
    companyName: { type: String, index: true },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN',
            'LOGOUT',
            'LOGIN_FAILED',
            'REFRESH_TOKEN',
            'PASSWORD_RESET_REQUEST',
            'PASSWORD_RESET_CONFIRM',
            'PASSWORD_CHANGE',
            '2FA_ENABLED',
            '2FA_DISABLED',
            '2FA_VERIFIED',
            'TENANT_SWITCHED',
            'USER_REGISTER',
            'USER_CREATED',
            'USER_UPDATED',
            'USER_DEACTIVATED',
            'USER_REACTIVATED',
            'USER_DELETED',
            'USER_ROLE_CHANGED',
            'USER_PASSWORD_CHANGED',
            'USER_INVITED',
            'USER_ACCEPTED_INVITE',
            'COMPANY_CREATED',
            'COMPANY_UPDATED',
            'COMPANY_DEACTIVATED',
            'COMPANY_REACTIVATED',
            'COMPANY_PLAN_CHANGED',
            'COMPANY_BRANDING_UPDATED',
            'DOCUMENT_CREATED',
            'DOCUMENT_UPDATED',
            'DOCUMENT_DELETED',
            'DOCUMENT_APPROVED',
            'DOCUMENT_ARCHIVED',
            'DOCUMENT_DOWNLOADED',
            'DOCUMENT_VIEWED',
            'DOCUMENT_UPLOADED',
            'DOCUMENT_RESTORED',
            'CONTROL_ASSIGNED',
            'CONTROL_REVOKED',
            'CONTROL_REASSIGNED',
            'CONTROL_RESPONDED',
            'CONTROL_RESPONSE_UPDATED',
            'CONTROL_REVIEW_REQUESTED',
            'CONTROL_REVIEW_COMPLETED',
            'RECOMMENDATION_CREATED',
            'RECOMMENDATION_UPDATED',
            'RECOMMENDATION_DELETED',
            'REPORT_GENERATED',
            'REPORT_DOWNLOADED',
            'REPORT_VIEWED',
            'REPORT_EXPORTED',
            'REPORT_UPDATED',
            'REPORT_EXPORTED_PDF',
            'PAYMENT_CREATED',
            'PAYMENT_COMPLETED',
            'PAYMENT_FAILED',
            'PAYMENT_REFUNDED',
            'PAYMENT_CONFIRMED_WEBHOOK',
            'PAYMENT_FAILED_WEBHOOK',
            'PAYMENT_CONFIRMED_MANUALLY',
            'INVOICE_GENERATED',
            'SUBSCRIPTION_CREATED',
            'SUBSCRIPTION_UPDATED',
            'SUBSCRIPTION_CANCELLED',
            'SUBSCRIPTION_RENEWED',
            'SYSTEM_CONFIG_UPDATED',
            'SYSTEM_BACKUP',
            'SYSTEM_RESTORE',
            'SEED_EXECUTED',
            'MAINTENANCE_MODE',
            'HEALTH_CHECK',
            'SYSTEM_ACTION',
            'NOTIFICATION_SENT',
            'NOTIFICATION_READ',
            'NOTIFICATION_DELETED',
            'COMPANY_DOCUMENT_UPLOADED',
            'COMPANY_DOCUMENT_DOWNLOADED',
            'COMPANY_DOCUMENT_DELETED',
            'SECURITY_ALERT',
            'RATE_LIMIT_EXCEEDED',
            'SUSPICIOUS_ACTIVITY',
            'API_ACCESS_DENIED',
        ],
    },
    category: {
        type: String,
        required: true,
        enum: [
            'auth',
            'user',
            'company',
            'document',
            'documents',
            'governance',
            'control',
            'controls',
            'report',
            'reports',
            'payment',
            'financial',
            'subscription',
            'system',
            'notification',
            'security',
        ],
        index: true,
    },
    level: {
        type: String,
        required: true,
        enum: ['info', 'warning', 'error', 'critical'],
        default: 'info',
        index: true,
    },
    resource: { type: String, required: true },
    resourceId: { type: String, index: true },
    resourceName: { type: String },
    details: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    success: { type: Boolean, default: true, index: true },
    errorMessage: { type: String },
    errorCode: { type: String },
    duration: { type: Number },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    origin: { type: String },
    referer: { type: String },
    method: { type: String },
    path: { type: String },
    query: { type: mongoose_1.Schema.Types.Mixed },
    sessionId: { type: String },
    requestId: { type: String },
    correlationId: { type: String },
}, {
    timestamps: true,
    collection: 'audit_logs',
});
// Índices compostos para consultas rápidas
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ companyId: 1, timestamp: -1 });
AuditLogSchema.index({ level: 1, timestamp: -1 });
AuditLogSchema.index({ success: 1, timestamp: -1 });
AuditLogSchema.index({ createdAt: -1 });
// Índice composto para buscas comuns
AuditLogSchema.index({ action: 1, userId: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, companyId: 1, timestamp: -1 });
// TTL automático para logs antigos (ex: remover após 90 dias)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 dias
exports.AuditLog = mongoose_1.default.model('AuditLog', AuditLogSchema);
//# sourceMappingURL=AuditLog.js.map