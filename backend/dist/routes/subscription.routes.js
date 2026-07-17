"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/subscription.routes.ts
const express_1 = require("express");
const SubscriptionController_js_1 = require("../controllers/SubscriptionController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// ============================================
// ROTAS DE ASSINATURA
// ============================================
// Todas as rotas exigem autenticação
router.use(auth_js_1.authenticate);
// ============================================
// ROTAS PARA REP (self-service)
// ============================================
// Criar assinatura
router.post('/', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, SubscriptionController_js_1.SubscriptionController.createSubscription);
// Obter assinatura ativa da empresa
router.get('/active', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, SubscriptionController_js_1.SubscriptionController.getActiveSubscription);
// Obter histórico de assinaturas
router.get('/history', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, SubscriptionController_js_1.SubscriptionController.getSubscriptionHistory);
// Verificar status da assinatura
router.get('/status', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, SubscriptionController_js_1.SubscriptionController.checkStatus);
// Cancelar assinatura
router.post('/:id/cancel', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, SubscriptionController_js_1.SubscriptionController.cancelSubscription);
// ============================================
// ROTAS ADMIN
// ============================================
// 🔴 NOVO: Obter assinatura ativa de uma empresa específica (admin)
router.get('/admin/:companyId', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.adminRateLimiter, SubscriptionController_js_1.SubscriptionController.getActiveSubscriptionByCompany);
// Atualizar assinatura (admin)
router.put('/:id', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.adminRateLimiter, SubscriptionController_js_1.SubscriptionController.updateSubscription);
// Métricas de assinaturas (admin)
router.get('/admin/metrics', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.adminRateLimiter, SubscriptionController_js_1.SubscriptionController.getMetrics);
exports.default = router;
//# sourceMappingURL=subscription.routes.js.map