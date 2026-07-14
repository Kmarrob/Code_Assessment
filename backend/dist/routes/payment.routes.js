"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/payment.routes.ts
const express_1 = require("express");
const PaymentController_js_1 = require("../controllers/PaymentController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// ============================================
// ROTAS PÚBLICAS (webhook)
// ============================================
// Webhook para confirmar pagamento (provedor)
router.post('/webhook', rateLimit_js_1.authenticatedRateLimiter, PaymentController_js_1.PaymentController.webhook);
// ============================================
// ROTAS PROTEGIDAS
// ============================================
// Todas as rotas abaixo exigem autenticação
router.use(auth_js_1.authenticate);
// ============================================
// ROTAS PARA REP (self-service)
// ============================================
// Criar pagamento
router.post('/', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, PaymentController_js_1.PaymentController.createPayment);
// Listar pagamentos da empresa
router.get('/', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, PaymentController_js_1.PaymentController.listPayments);
// Obter pagamento por ID
router.get('/:id', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, PaymentController_js_1.PaymentController.getPaymentById);
// Gerar fatura para assinatura
router.post('/subscriptions/:subscriptionId/invoice', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, PaymentController_js_1.PaymentController.generateInvoice);
// ============================================
// ROTAS ADMIN
// ============================================
// Listar todos os pagamentos (admin)
router.get('/admin/payments', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.adminRateLimiter, PaymentController_js_1.PaymentController.listAllPayments);
// Métricas de pagamento (admin)
router.get('/admin/payments/metrics', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.adminRateLimiter, PaymentController_js_1.PaymentController.getMetrics);
// Confirmar pagamento manualmente (admin)
router.post('/admin/payments/:id/confirm', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.adminRateLimiter, PaymentController_js_1.PaymentController.confirmPaymentManually);
// Estornar pagamento (admin)
router.post('/admin/payments/:id/refund', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.adminRateLimiter, PaymentController_js_1.PaymentController.refundPayment);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map