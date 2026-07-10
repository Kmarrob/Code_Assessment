"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
// backend/src/services/NotificationService.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_js_1 = require("../models/Notification.js");
const User_js_1 = require("../models/User.js");
const errors_js_1 = require("../utils/errors.js");
const logger_js_1 = require("../utils/logger.js");
// 🔴 SUBSTITUÍDO: EmailService pelo EmailJSService
const EmailJSService_js_1 = require("./EmailJSService.js");
class NotificationService {
    /**
     * Cria uma nova notificação
     */
    static async createNotification(data) {
        try {
            // Validar se o usuário existe
            const user = await User_js_1.User.findById(data.userId);
            if (!user) {
                logger_js_1.logger.warn(`Usuário ${data.userId} não encontrado para notificação`);
                return null;
            }
            const notification = new Notification_js_1.Notification({
                userId: new mongoose_1.default.Types.ObjectId(data.userId),
                companyId: new mongoose_1.default.Types.ObjectId(data.companyId),
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link || null,
                read: false,
                metadata: data.metadata || {},
            });
            await notification.save();
            logger_js_1.logger.info(`📬 Notificação criada para ${user.email}: ${data.title}`);
            // 🔴 ENVIAR E-MAIL VIA EMAILJS
            await this.sendEmailNotificationViaEmailJS(user, data);
            return notification;
        }
        catch (error) {
            logger_js_1.logger.error('❌ Erro ao criar notificação:', error);
            throw error;
        }
    }
    /**
     * 🔴 NOVO: Envia e-mail via EmailJS
     */
    static async sendEmailNotificationViaEmailJS(user, data) {
        try {
            if (!user.email) {
                logger_js_1.logger.warn(`Usuário ${user._id} não tem email cadastrado`);
                return;
            }
            // Construir o link completo
            const baseUrl = process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com';
            const fullLink = data.link ? `${baseUrl}${data.link}` : baseUrl;
            // Mapear tipo para emoji e assunto
            const typeMap = {
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
            // Enviar via EmailJS
            const result = await EmailJSService_js_1.emailjsService.sendNotificationEmail({
                to: user.email,
                userName: user.name || 'Usuário',
                title: data.title,
                message: data.message,
                link: fullLink,
            });
            if (result) {
                logger_js_1.logger.info(`📧 E-mail enviado para ${user.email} via EmailJS: ${subject}`);
            }
            else {
                logger_js_1.logger.warn(`⚠️ Falha ao enviar e-mail para ${user.email} via EmailJS`);
            }
        }
        catch (emailError) {
            logger_js_1.logger.error(`❌ Erro ao enviar e-mail para ${user.email} via EmailJS:`, emailError);
        }
    }
    /**
     * Cria notificações em lote para múltiplos usuários
     */
    static async createBulkNotifications(userIds, data) {
        try {
            const notifications = userIds.map((userId) => ({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                companyId: new mongoose_1.default.Types.ObjectId(data.companyId),
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link || null,
                read: false,
                metadata: data.metadata || {},
            }));
            const result = await Notification_js_1.Notification.insertMany(notifications);
            logger_js_1.logger.info(`📬 ${result.length} notificações criadas em lote`);
            // Enviar e-mails em lote via EmailJS
            for (const userId of userIds) {
                try {
                    const user = await User_js_1.User.findById(userId);
                    if (user && user.email) {
                        await this.sendEmailNotificationViaEmailJS(user, { ...data, userId });
                    }
                }
                catch (emailError) {
                    logger_js_1.logger.error(`❌ Erro ao enviar e-mail para ${userId}:`, emailError);
                }
            }
            return result;
        }
        catch (error) {
            logger_js_1.logger.error('❌ Erro ao criar notificações em lote:', error);
            throw error;
        }
    }
    /**
     * Busca notificações do usuário
     */
    static async getNotifications(userId, filters = {}) {
        const { page = 1, limit = 20, filter = 'all' } = filters;
        const skip = (page - 1) * limit;
        const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
        if (filter === 'unread') {
            query.read = false;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            Notification_js_1.Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification_js_1.Notification.countDocuments(query),
            Notification_js_1.Notification.countDocuments({ userId: new mongoose_1.default.Types.ObjectId(userId), read: false }),
        ]);
        return {
            notifications: notifications,
            total,
            unreadCount,
        };
    }
    /**
     * Busca apenas notificações não lidas
     */
    static async getUnreadNotifications(userId) {
        return Notification_js_1.Notification.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            read: false
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
    }
    /**
     * Conta notificações não lidas
     */
    static async countUnread(userId) {
        return Notification_js_1.Notification.countDocuments({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            read: false
        });
    }
    /**
     * Marca notificação como lida
     */
    static async markAsRead(notificationId, userId) {
        const notification = await Notification_js_1.Notification.findOneAndUpdate({ _id: notificationId, userId: new mongoose_1.default.Types.ObjectId(userId) }, { $set: { read: true, readAt: new Date() } }, { new: true });
        if (!notification) {
            throw new errors_js_1.AppError('Notificação não encontrada', 404);
        }
        return notification;
    }
    /**
     * Marca todas as notificações como lidas
     */
    static async markAllAsRead(userId) {
        const result = await Notification_js_1.Notification.updateMany({ userId: new mongoose_1.default.Types.ObjectId(userId), read: false }, { $set: { read: true, readAt: new Date() } });
        return result.modifiedCount || 0;
    }
    /**
     * Exclui uma notificação
     */
    static async deleteNotification(notificationId, userId) {
        const result = await Notification_js_1.Notification.deleteOne({
            _id: notificationId,
            userId: new mongoose_1.default.Types.ObjectId(userId)
        });
        if (result.deletedCount === 0) {
            throw new errors_js_1.AppError('Notificação não encontrada', 404);
        }
    }
    /**
     * Exclui notificações antigas (lidas há mais de X dias)
     */
    static async deleteOldNotifications(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const result = await Notification_js_1.Notification.deleteMany({
            read: true,
            readAt: { $lt: cutoffDate },
        });
        logger_js_1.logger.info(`🗑️ ${result.deletedCount} notificações antigas excluídas`);
        return result.deletedCount || 0;
    }
    // ============================================
    // MÉTODOS DE CONVENIÊNCIA PARA EVENTOS COMUNS
    // ============================================
    /**
     * Notifica um usuário sobre nova atribuição de controle
     */
    static async notifyAssignment(userId, companyId, controlName, controlId, assignedBy) {
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
    static async notifyResponse(prepostoId, companyId, userName, controlName, controlId, responseId) {
        return this.createNotification({
            userId: prepostoId,
            companyId,
            type: 'response',
            title: '📝 Nova Resposta Recebida',
            message: `${userName} respondeu ao controle "${controlName}".`,
            // 🔴 CORREÇÃO: Incluir prepostoId na URL para filtrar respostas do usuário específico
            link: `/rep/responses?userId=${prepostoId}`,
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
    static async notifyReviewRequest(userId, companyId, controlName, controlId, repName, reviewId) {
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
    static async notifyReviewCompleted(userId, companyId, controlName, controlId, status, reviewId) {
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
    static async notifyControlRevoked(userId, companyId, controlName, controlId, reason) {
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
    static async notifyUserInactivated(userId, companyId, inactivatedBy, reason) {
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
    static async sendReminder(userId, companyId, pendingCount) {
        if (pendingCount === 0)
            return null;
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
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map