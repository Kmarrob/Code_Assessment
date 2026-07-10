"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/notification.routes.ts
const express_1 = require("express");
const NotificationController_js_1 = require("../controllers/NotificationController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_js_1.authenticate);
// ============================================
// ROTAS DE NOTIFICAÇÕES
// ============================================
// 🔴 NOVO: Criar uma notificação (para testes e admin)
router.post('/', rateLimit_js_1.authenticatedRateLimiter, NotificationController_js_1.NotificationController.createNotification);
// Buscar notificações do usuário (com paginação)
router.get('/', rateLimit_js_1.authenticatedRateLimiter, NotificationController_js_1.NotificationController.getNotifications);
// Buscar notificações não lidas
router.get('/unread', rateLimit_js_1.authenticatedRateLimiter, NotificationController_js_1.NotificationController.getUnreadNotifications);
// Contar notificações não lidas
router.get('/unread/count', rateLimit_js_1.authenticatedRateLimiter, NotificationController_js_1.NotificationController.countUnread);
// Marcar todas as notificações como lidas
router.patch('/read-all', rateLimit_js_1.authenticatedRateLimiter, NotificationController_js_1.NotificationController.markAllAsRead);
// Marcar notificação específica como lida
router.patch('/:id/read', rateLimit_js_1.authenticatedRateLimiter, NotificationController_js_1.NotificationController.markAsRead);
// Excluir notificação específica
router.delete('/:id', rateLimit_js_1.authenticatedRateLimiter, NotificationController_js_1.NotificationController.deleteNotification);
// Excluir notificações antigas (admin apenas)
router.delete('/old', rateLimit_js_1.authenticatedRateLimiter, NotificationController_js_1.NotificationController.deleteOldNotifications);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map