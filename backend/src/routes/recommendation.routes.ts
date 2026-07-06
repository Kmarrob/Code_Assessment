// backend/src/routes/recommendation.routes.ts
import { Router } from 'express';
import { RecommendationController } from '../controllers/RecommendationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminRateLimiter, authenticatedRateLimiter } from '../middleware/rateLimit.js';
import { sanitizeAdminInputs } from '../middleware/sanitizeAdmin.js';
import { UserRole } from '../types/index.js';

const router = Router();

// ============================================
// ROTAS ADMIN (CRUD de recomendações)
// ============================================

// Todas as rotas admin exigem autenticação e role ADMIN
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Listar recomendações (com filtros)
router.get(
  '/',
  adminRateLimiter,
  RecommendationController.listRecommendations
);

// Obter domínios disponíveis
router.get(
  '/dominios',
  adminRateLimiter,
  RecommendationController.getDominios
);

// Buscar recomendação por ID do controle
router.get(
  '/:controlId',
  adminRateLimiter,
  RecommendationController.getByControlId
);

// Criar recomendação
router.post(
  '/',
  adminRateLimiter,
  sanitizeAdminInputs,
  RecommendationController.createRecommendation
);

// Atualizar recomendação
router.put(
  '/:controlId',
  adminRateLimiter,
  sanitizeAdminInputs,
  RecommendationController.updateRecommendation
);

// Deletar recomendação
router.delete(
  '/:controlId',
  adminRateLimiter,
  RecommendationController.deleteRecommendation
);

// ============================================
// ROTAS PARA RELATÓRIO (REP)
// ============================================

// Rota pública (dentro do contexto do relatório) - será usada pelo ReportView
// Mas vamos manter como uma rota separada para não conflitar com as rotas admin
// GET /api/recommendations/report/:companyId
// Acesso: REP (da empresa) ou ADMIN
// Nota: Esta rota será registrada no server.ts separadamente

export default router;