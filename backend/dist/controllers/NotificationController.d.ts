import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class NotificationController {
    /**
     * Buscar notificações do usuário autenticado
     * GET /api/notifications
     */
    static getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Buscar apenas notificações não lidas
     * GET /api/notifications/unread
     */
    static getUnreadNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Contar notificações não lidas
     * GET /api/notifications/unread/count
     */
    static countUnread(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Criar uma notificação (para testes e admin)
     * POST /api/notifications
     */
    static createNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Marcar notificação como lida
     * PATCH /api/notifications/:id/read
     */
    static markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Marcar todas as notificações como lidas
     * PATCH /api/notifications/read-all
     */
    static markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Excluir notificação
     * DELETE /api/notifications/:id
     */
    static deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Excluir notificações antigas (admin apenas)
     * DELETE /api/notifications/old
     */
    static deleteOldNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=NotificationController.d.ts.map