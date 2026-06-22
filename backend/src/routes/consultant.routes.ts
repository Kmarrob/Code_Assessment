// backend/src/routes/consultant.routes.ts
import { Router } from 'express';
import { ConsultantController } from '../controllers/ConsultantController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { authenticatedRateLimiter } from '../middleware/rateLimit.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Todas as rotas exigem autenticação e role CONSULTANT
router.use(authenticate);
router.use(authorize(UserRole.CONSULTANT));

// ============================================
// ROTAS DO CONSULTOR
// ============================================

// Listar empresas do consultor
router.get(
  '/companies',
  authenticatedRateLimiter,
  ConsultantController.listCompanies
);

// Obter estatísticas do consultor
router.get(
  '/stats',
  authenticatedRateLimiter,
  ConsultantController.getStats
);

// Obter detalhes de uma empresa
router.get(
  '/companies/:companyId',
  authenticatedRateLimiter,
  ConsultantController.getCompanyDetails
);

export default router;