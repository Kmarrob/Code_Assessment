"use strict";
// backend/src/routes/plan.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PlanController_js_1 = require("../controllers/PlanController.js");
const auth_js_1 = require("../middleware/auth.js");
console.log('==========================');
console.log('PlanController:', PlanController_js_1.PlanController);
console.log('getPublicPlans:', PlanController_js_1.PlanController.getPublicPlans);
console.log('calculatePrice:', PlanController_js_1.PlanController.calculatePrice);
console.log('listPlans:', PlanController_js_1.PlanController.listPlans);
console.log('getPlanById:', PlanController_js_1.PlanController.getPlanById);
console.log('createPlan:', PlanController_js_1.PlanController.createPlan);
console.log('updatePlan:', PlanController_js_1.PlanController.updatePlan);
console.log('deletePlan:', PlanController_js_1.PlanController.deletePlan);
console.log('authenticate:', auth_js_1.authenticate);
console.log('typeof authenticate:', typeof auth_js_1.authenticate);
console.log('==========================');
const router = (0, express_1.Router)();
// ============================================
// ROTAS PÚBLICAS (sem autenticação)
// ============================================
/**
 * GET /api/plans
 * Listar planos públicos
 *
 * Compatibilidade para frontend,
 * página de assinatura e pricing.
 */
router.get('/', PlanController_js_1.PlanController.getPublicPlans);
/**
 * GET /api/plans/public
 * Listar planos públicos
 *
 * Mantida para compatibilidade
 * com chamadas existentes.
 */
router.get('/public', PlanController_js_1.PlanController.getPublicPlans);
/**
 * GET /api/plans/:id/calculate
 * Calcular preço efetivo com base
 * no número de usuários.
 *
 * Query:
 * ?users=5&annual=true
 */
router.get('/:id/calculate', PlanController_js_1.PlanController.calculatePrice);
// ============================================
// ROTAS ADMIN (requer autenticação)
// ============================================
/**
 * GET /api/plans/admin/plans
 * Listar todos os planos
 */
router.get('/admin/plans', auth_js_1.authenticate, PlanController_js_1.PlanController.listPlans);
/**
 * GET /api/plans/admin/plans/:id
 * Obter plano por ID
 */
router.get('/admin/plans/:id', auth_js_1.authenticate, PlanController_js_1.PlanController.getPlanById);
/**
 * POST /api/plans/admin/plans
 * Criar novo plano
 */
router.post('/admin/plans', auth_js_1.authenticate, PlanController_js_1.PlanController.createPlan);
/**
 * PUT /api/plans/admin/plans/:id
 * Atualizar plano
 */
router.put('/admin/plans/:id', auth_js_1.authenticate, PlanController_js_1.PlanController.updatePlan);
/**
 * DELETE /api/plans/admin/plans/:id
 * Desativar plano
 */
router.delete('/admin/plans/:id', auth_js_1.authenticate, PlanController_js_1.PlanController.deletePlan);
exports.default = router;
//# sourceMappingURL=plan.routes.js.map