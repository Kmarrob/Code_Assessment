// backend/src/models/AuditLog.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export type AuditAction =
  // 🔐 Autenticação
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'REFRESH_TOKEN'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_CONFIRM'
  | 'PASSWORD_CHANGE'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | '2FA_VERIFIED'
  | 'TENANT_SWITCHED'

  // 👤 Usuários
  | 'USER_REGISTER'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DEACTIVATED'
  | 'USER_REACTIVATED'
  | 'USER_DELETED'
  | 'USER_ROLE_CHANGED'
  | 'USER_PASSWORD_CHANGED'
  | 'USER_INVITED'
  | 'USER_ACCEPTED_INVITE'

  // 🏢 Empresas
  | 'COMPANY_CREATED'
  | 'COMPANY_UPDATED'
  | 'COMPANY_DEACTIVATED'
  | 'COMPANY_REACTIVATED'
  | 'COMPANY_PLAN_CHANGED'
  | 'COMPANY_BRANDING_UPDATED'

  // 📄 Documentos (Governança)
  | 'DOCUMENT_CREATED'
  | 'DOCUMENT_UPDATED'
  | 'DOCUMENT_DELETED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_ARCHIVED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_RESTORED'

  // 📊 Controles
  | 'CONTROL_ASSIGNED'
  | 'CONTROL_REVOKED'
  | 'CONTROL_REASSIGNED'
  | 'CONTROL_RESPONDED'
  | 'CONTROL_RESPONSE_UPDATED'
  | 'CONTROL_REVIEW_REQUESTED'
  | 'CONTROL_REVIEW_COMPLETED'
  | 'RECOMMENDATION_CREATED'
  | 'RECOMMENDATION_UPDATED'
  | 'RECOMMENDATION_DELETED'

  // 📈 Relatórios
  | 'REPORT_GENERATED'
  | 'REPORT_DOWNLOADED'
  | 'REPORT_VIEWED'
  | 'REPORT_EXPORTED'
  | 'REPORT_UPDATED'
  | 'REPORT_EXPORTED_PDF'

  // 💰 Pagamentos
  | 'PAYMENT_CREATED'
  | 'PAYMENT_COMPLETED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_CONFIRMED_WEBHOOK'
  | 'PAYMENT_FAILED_WEBHOOK'
  | 'PAYMENT_CONFIRMED_MANUALLY'
  | 'INVOICE_GENERATED'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_UPDATED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'SUBSCRIPTION_RENEWED'

  // ⚙️ Sistema
  | 'SYSTEM_CONFIG_UPDATED'
  | 'SYSTEM_BACKUP'
  | 'SYSTEM_RESTORE'
  | 'SEED_EXECUTED'
  | 'MAINTENANCE_MODE'
  | 'HEALTH_CHECK'
  | 'SYSTEM_ACTION'

  // 🔔 Notificações
  | 'NOTIFICATION_SENT'
  | 'NOTIFICATION_READ'
  | 'NOTIFICATION_DELETED'

  // 📁 Documentos da Empresa
  | 'COMPANY_DOCUMENT_UPLOADED'
  | 'COMPANY_DOCUMENT_DOWNLOADED'
  | 'COMPANY_DOCUMENT_DELETED'

  // 🛡️ Segurança
  | 'SECURITY_ALERT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'API_ACCESS_DENIED';

export type AuditCategory =
  | 'auth'
  | 'user'
  | 'company'
  | 'document'
  | 'documents'
  | 'governance'
  | 'control'
  | 'controls'
  | 'report'
  | 'reports'
  | 'payment'
  | 'financial'
  | 'subscription'
  | 'system'
  | 'notification'
  | 'security';

export type AuditLevel = 'info' | 'warning' | 'error' | 'critical';

export interface IAuditLog extends Document {
  // Identificação
  _id: mongoose.Types.ObjectId;
  timestamp: Date;

  // Usuário que realizou a ação
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;

  // Empresa afetada (se aplicável)
  companyId?: string;
  companyName?: string;

  // Ação
  action: AuditAction;
  category: AuditCategory;
  level: AuditLevel;

  // Recurso afetado
  resource: string;
  resourceId?: string;
  resourceName?: string;

  // Detalhes
  details?: {
    before?: any;
    after?: any;
    changes?: Record<string, { before: any; after: any }>;
    metadata?: Record<string, any>;
    [key: string]: any;
  };

  // Status
  success: boolean;
  errorMessage?: string;
  errorCode?: string;
  duration?: number; // ms

  // Informações de contexto
  ip: string;
  userAgent: string;
  origin?: string;
  referer?: string;
  method?: string;
  path?: string;
  query?: Record<string, any>;

  // Metadados
  sessionId?: string;
  requestId?: string;
  correlationId?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
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
      type: Schema.Types.Mixed,
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
    query: { type: Schema.Types.Mixed },

    sessionId: { type: String },
    requestId: { type: String },
    correlationId: { type: String },
  },
  {
    timestamps: true,
    collection: 'audit_logs',
  }
);

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

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);