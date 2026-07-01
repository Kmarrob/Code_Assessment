// backend/src/controllers/NotificationController.ts
import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService.js';
import { AppError } from '../utils/errors.js';
import { AuthenticatedRequest } from '../types/index.js';

export class NotificationController {
  /**
   * Buscar notificações do usuário autenticado
   * GET /api/notifications
   */
  static async getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filter = (req.query.filter as 'all' | 'unread') || 'all';

      const result = await NotificationService.getNotifications(userId, {
        page,
        limit,
        filter,
      });

      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
        unreadCount: result.unreadCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar apenas notificações não lidas
   * GET /api/notifications/unread
   */
  static async getUnreadNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const notifications = await NotificationService.getUnreadNotifications(userId);

      res.status(200).json({
        success: true,
        data: notifications,
        count: notifications.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Contar notificações não lidas
   * GET /api/notifications/unread/count
   */
  static async countUnread(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const count = await NotificationService.countUnread(userId);

      res.status(200).json({
        success: true,
        data: { count },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marcar notificação como lida
   * PATCH /api/notifications/:id/read
   */
  static async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      if (!id) {
        throw new AppError('ID da notificação é obrigatório', 400);
      }

      const notification = await NotificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notificação marcada como lida',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marcar todas as notificações como lidas
   * PATCH /api/notifications/read-all
   */
  static async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const count = await NotificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        data: { count },
        message: `${count} notificações marcadas como lidas`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir notificação
   * DELETE /api/notifications/:id
   */
  static async deleteNotification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      if (!id) {
        throw new AppError('ID da notificação é obrigatório', 400);
      }

      await NotificationService.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notificação excluída com sucesso',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir notificações antigas (admin apenas)
   * DELETE /api/notifications/old
   */
  static async deleteOldNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // Verificar se é admin
      if (req.user?.role !== 'admin') {
        throw new AppError('Apenas administradores podem executar esta ação', 403);
      }

      const days = parseInt(req.query.days as string) || 30;
      const count = await NotificationService.deleteOldNotifications(days);

      res.status(200).json({
        success: true,
        data: { deleted: count },
        message: `${count} notificações antigas excluídas`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}