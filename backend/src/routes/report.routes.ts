// backend/src/routes/report.routes.ts
import { Router } from 'express';
import { ReportController } from '../controllers/ReportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminRateLimiter, authenticatedRateLimiter } from '../middleware/rateLimit.js';
import { sanitizeAdminInputs } from '../middleware/sanitizeAdmin.js';
import { UserRole } from '../types/index.js';

const router = Router();

// ============================================
// ROTAS DO RELATÓRIO
// ============================================

// Todas as rotas exigem autenticação
router.use(authenticate);

// ============================================
// ROTAS ADMIN (visão global)
// ============================================
router.get(
  '/',
  authorize(UserRole.ADMIN),
  adminRateLimiter,
  ReportController.listReports
);

// ============================================
// ROTAS REP (dashboard do relatório)
// ============================================
router.get(
  '/dashboard',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  ReportController.getReportDashboard
);

// ============================================
// 🔴 NOVA ROTA: ADMIN dashboard por empresa
// ============================================
router.get(
  '/admin/dashboard/:companyId',
  authorize(UserRole.ADMIN),
  adminRateLimiter,
  ReportController.getAdminDashboardByCompany
);

// ============================================
// 🔴 NOVA ROTA: Matriz de Priorização
// ============================================
router.get(
  '/priorization/:companyId',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  ReportController.getPriorizationMatrix
);

// ============================================
// 🔴 NOVA ROTA: Roadmap de Implementação
// ============================================
router.get(
  '/roadmap/:companyId',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  ReportController.getRoadmap
);

// ============================================
// ROTAS POR EMPRESA
// ============================================

// Obter relatório de uma empresa específica
router.get(
  '/company/:companyId',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  ReportController.getReportByCompany
);

// Gerar dados automáticos do relatório
router.post(
  '/company/:companyId/generate',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  ReportController.generateReport
);

// Atualizar relatório
router.put(
  '/company/:companyId',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  sanitizeAdminInputs,
  ReportController.updateReport
);

export default router;