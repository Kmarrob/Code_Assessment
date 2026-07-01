// backend/src/routes/notification.routes.ts
import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { authenticate } from '../middleware/auth.js';
import { authenticatedRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// ============================================
// ROTAS DE NOTIFICAÇÕES
// ============================================

// 🔴 NOVO: Criar uma notificação (para testes e admin)
router.post(
  '/',
  authenticatedRateLimiter,
  NotificationController.createNotification
);

// Buscar notificações do usuário (com paginação)
router.get(
  '/',
  authenticatedRateLimiter,
  NotificationController.getNotifications
);

// Buscar notificações não lidas
router.get(
  '/unread',
  authenticatedRateLimiter,
  NotificationController.getUnreadNotifications
);

// Contar notificações não lidas
router.get(
  '/unread/count',
  authenticatedRateLimiter,
  NotificationController.countUnread
);

// Marcar todas as notificações como lidas
router.patch(
  '/read-all',
  authenticatedRateLimiter,
  NotificationController.markAllAsRead
);

// Marcar notificação específica como lida
router.patch(
  '/:id/read',
  authenticatedRateLimiter,
  NotificationController.markAsRead
);

// Excluir notificação específica
router.delete(
  '/:id',
  authenticatedRateLimiter,
  NotificationController.deleteNotification
);

// Excluir notificações antigas (admin apenas)
router.delete(
  '/old',
  authenticatedRateLimiter,
  NotificationController.deleteOldNotifications
);

export default router;