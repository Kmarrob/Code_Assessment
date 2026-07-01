// backend/src/services/NotificationService.ts
import mongoose from 'mongoose';
import { Notification, INotification, NotificationType, INotificationMetadata } from '../models/Notification.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
// 🔴 NOVO: Import do EmailService
import { emailService } from './EmailService.js';

interface CreateNotificationDTO {
  userId: string;
  companyId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: INotificationMetadata;
}

interface NotificationFilters {
  page?: number;
  limit?: number;
  filter?: 'all' | 'unread';
}

export class NotificationService {
  
  /**
   * Cria uma nova notificação
   */
  static async createNotification(data: CreateNotificationDTO): Promise<INotification> {
    try {
      // Validar se o usuário existe
      const user = await User.findById(data.userId);
      if (!user) {
        logger.warn(`Usuário ${data.userId} não encontrado para notificação`);
        return null as any;
      }

      const notification = new Notification({
        userId: new mongoose.Types.ObjectId(data.userId),
        companyId: new mongoose.Types.ObjectId(data.companyId),
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || null,
        read: false,
        metadata: data.metadata || {},
      });

      await notification.save();
      logger.info(`📬 Notificação criada para ${user.email}: ${data.title}`);

      // 🔴 NOVO: Enviar e-mail para o usuário (se tiver email)
      await this.sendEmailNotification(user, data);

      return notification;
    } catch (error) {
      logger.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  }

  /**
   * 🔴 NOVO: Envia e-mail para o usuário sobre a notificação
   */
  private static async sendEmailNotification(
    user: any,
    data: CreateNotificationDTO
  ): Promise<void> {
    try {
      if (!user.email) {
        logger.warn(`Usuário ${user._id} não tem email cadastrado`);
        return;
      }

      // Construir o link completo
      const baseUrl = process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com';
      const fullLink = data.link ? `${baseUrl}${data.link}` : baseUrl;

      // Mapear tipo para emoji e assunto
      const typeMap: Record<string, { emoji: string; subject: string }> = {
        assignment: { emoji: '📋', subject: 'Novo Controle Atribuído' },
        response: { emoji: '📝', subject: 'Nova Resposta Recebida' },
        review_request: { emoji: '🔍', subject: 'Solicitação de Revisão' },
        review_completed: { emoji: '✅', subject: 'Revisão Concluída' },
        user_inactivated: { emoji: '👤', subject: 'Usuário Inativado' },
        control_revoked: { emoji: '🚫', subject: 'Controle Revogado' },
        reminder: { emoji: '⏰', subject: 'Lembrete de Pendências' },
        control_updated: { emoji: '📌', subject: 'Controle Atualizado' },
      };

      const typeInfo = typeMap[data.type] || { emoji: '📬', subject: 'Nova Notificação' };
      const subject = `${typeInfo.emoji} ${typeInfo.subject}`;

      // Montar HTML do e-mail
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
            .header { background: #1a56db; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .notification-box { background: #f0f4ff; padding: 15px; border-left: 4px solid #1a56db; margin: 15px 0; border-radius: 4px; }
            .button { display: inline-block; background: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${typeInfo.emoji} ${data.title}</h2>
            </div>
            <div class="content">
              <p>Olá <strong>${user.name || 'Usuário'}</strong>,</p>
              <div class="notification-box">
                <p>${data.message}</p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${fullLink}" class="button">🔐 Ver no Sistema</a>
              </p>
              <p><strong>Link alternativo:</strong> ${fullLink}</p>
              <p>Atenciosamente,<br><strong>Equipe Code_Assessment</strong></p>
            </div>
            <div class="footer">
              <p>Este é um e-mail automático. Por favor, não responda.</p>
              <p>© ${new Date().getFullYear()} Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Texto plano para fallback
      const text = `
${typeInfo.emoji} ${data.title}

Olá ${user.name || 'Usuário'},

${data.message}

Acesse o sistema para mais detalhes:
${fullLink}

Atenciosamente,
Equipe Code_Assessment
      `;

      await emailService.sendEmail({
        to: user.email,
        subject,
        html,
        text,
      });

      logger.info(`📧 E-mail enviado para ${user.email}: ${subject}`);
    } catch (emailError) {
      // Não interrompe o fluxo se o e-mail falhar
      logger.error(`❌ Erro ao enviar e-mail para notificação:`, emailError);
    }
  }

  /**
   * Cria notificações em lote para múltiplos usuários
   */
  static async createBulkNotifications(
    userIds: string[],
    data: Omit<CreateNotificationDTO, 'userId'>
  ): Promise<INotification[]> {
    try {
      const notifications = userIds.map((userId) => ({
        userId: new mongoose.Types.ObjectId(userId),
        companyId: new mongoose.Types.ObjectId(data.companyId),
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || null,
        read: false,
        metadata: data.metadata || {},
      }));

      const result = await Notification.insertMany(notifications);
      logger.info(`📬 ${result.length} notificações criadas em lote`);
      
      // 🔴 NOVO: Enviar e-mails em lote (de forma assíncrona, sem bloquear)
      for (const userId of userIds) {
        try {
          const user = await User.findById(userId);
          if (user && user.email) {
            await this.sendEmailNotification(user, { ...data, userId });
          }
        } catch (emailError) {
          logger.error(`❌ Erro ao enviar e-mail para ${userId}:`, emailError);
        }
      }

      return result as any;
    } catch (error) {
      logger.error('❌ Erro ao criar notificações em lote:', error);
      throw error;
    }
  }

  /**
   * Busca notificações do usuário
   */
  static async getNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
    const { page = 1, limit = 20, filter = 'all' } = filters;
    const skip = (page - 1) * limit;

    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (filter === 'unread') {
      query.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() as any,
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId), read: false }),
    ]);

    return {
      notifications: notifications as any[],
      total,
      unreadCount,
    };
  }

  /**
   * Busca apenas notificações não lidas
   */
  static async getUnreadNotifications(userId: string): Promise<any[]> {
    return Notification.find({ 
      userId: new mongoose.Types.ObjectId(userId), 
      read: false 
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean() as any;
  }

  /**
   * Conta notificações não lidas
   */
  static async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ 
      userId: new mongoose.Types.ObjectId(userId), 
      read: false 
    });
  }

  /**
   * Marca notificação como lida
   */
  static async markAsRead(notificationId: string, userId: string): Promise<any | null> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: new mongoose.Types.ObjectId(userId) },
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notificação não encontrada', 404);
    }

    return notification;
  }

  /**
   * Marca todas as notificações como lidas
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    
    return result.modifiedCount || 0;
  }

  /**
   * Exclui uma notificação
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await Notification.deleteOne({ 
      _id: notificationId, 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    
    if (result.deletedCount === 0) {
      throw new AppError('Notificação não encontrada', 404);
    }
  }

  /**
   * Exclui notificações antigas (lidas há mais de X dias)
   */
  static async deleteOldNotifications(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await Notification.deleteMany({
      read: true,
      readAt: { $lt: cutoffDate },
    });
    
    logger.info(`🗑️ ${result.deletedCount} notificações antigas excluídas`);
    return result.deletedCount || 0;
  }

  // ============================================
  // MÉTODOS DE CONVENIÊNCIA PARA EVENTOS COMUNS
  // ============================================

  /**
   * Notifica um usuário sobre nova atribuição de controle
   */
  static async notifyAssignment(
    userId: string,
    companyId: string,
    controlName: string,
    controlId: string,
    assignedBy: string
  ): Promise<INotification | null> {
    return this.createNotification({
      userId,
      companyId,
      type: 'assignment',
      title: '📋 Novo Controle Atribuído',
      message: `O controle "${controlName}" foi atribuído a você.`,
      link: `/user/answer`,
      metadata: {
        controlId,
        controlName,
        userId: assignedBy,
      },
    });
  }

  /**
   * Notifica o preposto sobre uma nova resposta
   */
  static async notifyResponse(
    prepostoId: string,
    companyId: string,
    userName: string,
    controlName: string,
    controlId: string,
    responseId: string
  ): Promise<INotification | null> {
    return this.createNotification({
      userId: prepostoId,
      companyId,
      type: 'response',
      title: '📝 Nova Resposta Recebida',
      message: `${userName} respondeu ao controle "${controlName}".`,
      link: `/rep/responses`,
      metadata: {
        controlId,
        controlName,
        userId: prepostoId,
        userName,
        responseId,
      },
    });
  }

  /**
   * Notifica o usuário sobre solicitação de revisão
   */
  static async notifyReviewRequest(
    userId: string,
    companyId: string,
    controlName: string,
    controlId: string,
    repName: string,
    reviewId: string
  ): Promise<INotification | null> {
    return this.createNotification({
      userId,
      companyId,
      type: 'review_request',
      title: '🔍 Solicitação de Revisão',
      message: `${repName} solicitou uma revisão para o controle "${controlName}".`,
      link: `/user/dashboard`,
      metadata: {
        controlId,
        controlName,
        userName: repName,
        reviewId,
      },
    });
  }

  /**
   * Notifica sobre conclusão de revisão
   */
  static async notifyReviewCompleted(
    userId: string,
    companyId: string,
    controlName: string,
    controlId: string,
    status: 'approved' | 'rejected',
    reviewId: string
  ): Promise<INotification | null> {
    const statusText = status === 'approved' ? 'aprovada ✅' : 'rejeitada ❌';
    return this.createNotification({
      userId,
      companyId,
      type: 'review_completed',
      title: `📋 Revisão ${status === 'approved' ? 'Aprovada' : 'Rejeitada'}`,
      message: `A revisão para o controle "${controlName}" foi ${statusText}.`,
      link: `/user/dashboard`,
      metadata: {
        controlId,
        controlName,
        status,
        reviewId,
      },
    });
  }

  /**
   * Notifica sobre revogação de controle
   */
  static async notifyControlRevoked(
    userId: string,
    companyId: string,
    controlName: string,
    controlId: string,
    reason?: string
  ): Promise<INotification | null> {
    return this.createNotification({
      userId,
      companyId,
      type: 'control_revoked',
      title: '🚫 Controle Revogado',
      message: `O controle "${controlName}" foi revogado.${reason ? ` Motivo: ${reason}` : ''}`,
      link: `/user/dashboard`,
      metadata: {
        controlId,
        controlName,
        reason,
      },
    });
  }

  /**
   * Notifica sobre inativação de usuário
   */
  static async notifyUserInactivated(
    userId: string,
    companyId: string,
    inactivatedBy: string,
    reason: string
  ): Promise<INotification | null> {
    return this.createNotification({
      userId,
      companyId,
      type: 'user_inactivated',
      title: '👤 Usuário Inativado',
      message: `Seu acesso foi desativado. Motivo: ${reason}`,
      link: `/login`,
      metadata: {
        userId: inactivatedBy,
        reason,
      },
    });
  }

  /**
   * Envia lembrete para usuários com controles pendentes
   */
  static async sendReminder(
    userId: string,
    companyId: string,
    pendingCount: number
  ): Promise<INotification | null> {
    if (pendingCount === 0) return null;

    return this.createNotification({
      userId,
      companyId,
      type: 'reminder',
      title: '⏰ Lembrete de Pendências',
      message: `Você tem ${pendingCount} controle(s) pendente(s) para responder.`,
      link: `/user/dashboard`,
      metadata: {
        pendingCount: pendingCount,
      },
    });
  }
}