// frontend/src/services/notification.service.ts
import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  companyId: string;
  type: 'assignment' | 'response' | 'review_request' | 'review_completed' | 'user_inactivated' | 'control_revoked' | 'reminder' | 'control_updated';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
  metadata?: {
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
    pendingCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
  timestamp: string;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
  timestamp: string;
}

export const notificationService = {
  /**
   * Buscar notificações do usuário com paginação
   */
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    filter: 'all' | 'unread' = 'all'
  ): Promise<NotificationsResponse> {
    const response = await api.get<NotificationsResponse>('/notifications', {
      params: { page, limit, filter },
    });
    return response.data;
  },

  /**
   * Buscar apenas notificações não lidas
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get<{ success: boolean; data: Notification[]; count: number }>(
      '/notifications/unread'
    );
    return response.data.data;
  },

  /**
   * Obter contagem de notificações não lidas
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<UnreadCountResponse>('/notifications/unread/count');
    return response.data.data.count;
  },

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.patch<{ success: boolean; data: Notification }>(
      `/notifications/${notificationId}/read`
    );
    return response.data.data;
  },

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(): Promise<number> {
    const response = await api.patch<{ success: boolean; data: { count: number } }>(
      '/notifications/read-all'
    );
    return response.data.data.count;
  },

  /**
   * Excluir uma notificação
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  /**
   * Excluir notificações antigas (apenas admin)
   */
  async deleteOldNotifications(days: number = 30): Promise<number> {
    const response = await api.delete<{ success: boolean; data: { deleted: number } }>(
      '/notifications/old',
      { params: { days } }
    );
    return response.data.data.deleted;
  },
};