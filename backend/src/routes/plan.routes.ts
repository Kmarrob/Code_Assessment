// backend/src/routes/plan.routes.ts

import { Router } from 'express';
import { PlanController } from '../controllers/PlanController.js';
import { authenticate } from '../middleware/auth.js';

console.log('==========================');
console.log('PlanController:', PlanController);
console.log('getPublicPlans:', PlanController.getPublicPlans);
console.log('calculatePrice:', PlanController.calculatePrice);
console.log('listPlans:', PlanController.listPlans);
console.log('getPlanById:', PlanController.getPlanById);
console.log('createPlan:', PlanController.createPlan);
console.log('updatePlan:', PlanController.updatePlan);
console.log('deletePlan:', PlanController.deletePlan);
console.log('authenticate:', authenticate);
console.log('typeof authenticate:', typeof authenticate);
console.log('==========================');

const router = Router();

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
router.get('/', PlanController.getPublicPlans);

/**
 * GET /api/plans/public
 * Listar planos públicos
 *
 * Mantida para compatibilidade
 * com chamadas existentes.
 */
router.get('/public', PlanController.getPublicPlans);

/**
 * GET /api/plans/:id/calculate
 * Calcular preço efetivo com base
 * no número de usuários.
 *
 * Query:
 * ?users=5&annual=true
 */
router.get('/:id/calculate', PlanController.calculatePrice);


// ============================================
// ROTAS ADMIN (requer autenticação)
// ============================================

/**
 * GET /api/plans/admin/plans
 * Listar todos os planos
 */
router.get(
  '/admin/plans',
  authenticate,
  PlanController.listPlans
);

/**
 * GET /api/plans/admin/plans/:id
 * Obter plano por ID
 */
router.get(
  '/admin/plans/:id',
  authenticate,
  PlanController.getPlanById
);

/**
 * POST /api/plans/admin/plans
 * Criar novo plano
 */
router.post(
  '/admin/plans',
  authenticate,
  PlanController.createPlan
);

/**
 * PUT /api/plans/admin/plans/:id
 * Atualizar plano
 */
router.put(
  '/admin/plans/:id',
  authenticate,
  PlanController.updatePlan
);

/**
 * DELETE /api/plans/admin/plans/:id
 * Desativar plano
 */
router.delete(
  '/admin/plans/:id',
  authenticate,
  PlanController.deletePlan
);

export default router;