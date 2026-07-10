import { INotification, NotificationType, INotificationMetadata } from '../models/Notification.js';
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
export declare class NotificationService {
    /**
     * Cria uma nova notificação
     */
    static createNotification(data: CreateNotificationDTO): Promise<INotification>;
    /**
     * 🔴 NOVO: Envia e-mail via EmailJS
     */
    private static sendEmailNotificationViaEmailJS;
    /**
     * Cria notificações em lote para múltiplos usuários
     */
    static createBulkNotifications(userIds: string[], data: Omit<CreateNotificationDTO, 'userId'>): Promise<INotification[]>;
    /**
     * Busca notificações do usuário
     */
    static getNotifications(userId: string, filters?: NotificationFilters): Promise<{
        notifications: any[];
        total: number;
        unreadCount: number;
    }>;
    /**
     * Busca apenas notificações não lidas
     */
    static getUnreadNotifications(userId: string): Promise<any[]>;
    /**
     * Conta notificações não lidas
     */
    static countUnread(userId: string): Promise<number>;
    /**
     * Marca notificação como lida
     */
    static markAsRead(notificationId: string, userId: string): Promise<any | null>;
    /**
     * Marca todas as notificações como lidas
     */
    static markAllAsRead(userId: string): Promise<number>;
    /**
     * Exclui uma notificação
     */
    static deleteNotification(notificationId: string, userId: string): Promise<void>;
    /**
     * Exclui notificações antigas (lidas há mais de X dias)
     */
    static deleteOldNotifications(days?: number): Promise<number>;
    /**
     * Notifica um usuário sobre nova atribuição de controle
     */
    static notifyAssignment(userId: string, companyId: string, controlName: string, controlId: string, assignedBy: string): Promise<INotification | null>;
    /**
     * Notifica o preposto sobre uma nova resposta
     */
    static notifyResponse(prepostoId: string, companyId: string, userName: string, controlName: string, controlId: string, responseId: string): Promise<INotification | null>;
    /**
     * Notifica o usuário sobre solicitação de revisão
     */
    static notifyReviewRequest(userId: string, companyId: string, controlName: string, controlId: string, repName: string, reviewId: string): Promise<INotification | null>;
    /**
     * Notifica sobre conclusão de revisão
     */
    static notifyReviewCompleted(userId: string, companyId: string, controlName: string, controlId: string, status: 'approved' | 'rejected', reviewId: string): Promise<INotification | null>;
    /**
     * Notifica sobre revogação de controle
     */
    static notifyControlRevoked(userId: string, companyId: string, controlName: string, controlId: string, reason?: string): Promise<INotification | null>;
    /**
     * Notifica sobre inativação de usuário
     */
    static notifyUserInactivated(userId: string, companyId: string, inactivatedBy: string, reason: string): Promise<INotification | null>;
    /**
     * Envia lembrete para usuários com controles pendentes
     */
    static sendReminder(userId: string, companyId: string, pendingCount: number): Promise<INotification | null>;
}
export {};
//# sourceMappingURL=NotificationService.d.ts.map