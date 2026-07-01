// backend/src/models/Notification.ts
import mongoose, { Schema, Model, Document } from 'mongoose';

export type NotificationType = 
  | 'assignment'        // Controle atribuído ao usuário
  | 'response'          // Usuário respondeu um controle
  | 'review_request'    // Preposto solicitou revisão
  | 'review_completed'  // Revisão concluída (aprovada/rejeitada)
  | 'user_inactivated'  // Usuário foi inativado
  | 'control_revoked'   // Controle foi revogado
  | 'reminder'          // Lembrete de pendências
  | 'control_updated';  // Controle foi atualizado

export interface INotificationMetadata {
  assignmentId?: string;
  responseId?: string;
  reviewId?: string;
  controlId?: string;
  userId?: string;
  userName?: string;
  controlName?: string;
  controlIdString?: string;
  status?: string;
  reason?: string;
  pendingCount?: number; // 🔴 ADICIONADO - para notificações de lembrete
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: Date;
  metadata?: INotificationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuário é obrigatório'],
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Empresa é obrigatória'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'assignment',
        'response',
        'review_request',
        'review_completed',
        'user_inactivated',
        'control_revoked',
        'reminder',
        'control_updated',
      ],
      required: [true, 'Tipo de notificação é obrigatório'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    message: {
      type: String,
      required: [true, 'Mensagem é obrigatória'],
      maxlength: [500, 'Mensagem deve ter no máximo 500 caracteres'],
    },
    link: {
      type: String,
      required: false,
      maxlength: [500, 'Link deve ter no máximo 500 caracteres'],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Índices otimizados
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, read: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ createdAt: -1 });

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

// Buscar notificações não lidas de um usuário
NotificationSchema.statics.findUnreadByUser = function(userId: string) {
  return this.find({ userId, read: false })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

// Buscar notificações de um usuário com paginação
NotificationSchema.statics.findByUser = function(
  userId: string,
  page: number = 1,
  limit: number = 20,
  filter: 'all' | 'unread' = 'all'
) {
  const skip = (page - 1) * limit;
  const query: any = { userId };
  if (filter === 'unread') {
    query.read = false;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Contar notificações não lidas
NotificationSchema.statics.countUnreadByUser = function(userId: string) {
  return this.countDocuments({ userId, read: false });
};

// Marcar todas as notificações como lidas
NotificationSchema.statics.markAllAsRead = function(userId: string) {
  return this.updateMany(
    { userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );
};

// Marcar notificação como lida
NotificationSchema.statics.markAsRead = function(notificationId: string, userId: string) {
  return this.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true, readAt: new Date() } },
    { new: true }
  );
};

// Excluir notificações antigas (mais de 30 dias)
NotificationSchema.statics.deleteOldNotifications = function(days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.deleteMany({ createdAt: { $lt: cutoffDate }, read: true });
};

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);