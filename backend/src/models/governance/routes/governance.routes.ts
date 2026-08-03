import { Router } from 'express';
import { GovernanceController } from '../controller/GovernanceController';
import { authenticate, authorize } from '../../../middleware/auth';
import { UserRole } from '../../../types/index.js';
import { FeatureService } from '../services/FeatureService.js';

const router = Router();
const governanceController = new GovernanceController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// ============================================
// ROTAS ADMIN (controle total)
// ============================================
router.post(
  '/admin/documents',
  authorize(UserRole.ADMIN),
  governanceController.create.bind(governanceController)
);

router.get(
  '/admin/documents',
  authorize(UserRole.ADMIN),
  governanceController.findAll.bind(governanceController)
);

router.get(
  '/admin/documents/:id',
  authorize(UserRole.ADMIN),
  governanceController.findById.bind(governanceController)
);

router.put(
  '/admin/documents/:id',
  authorize(UserRole.ADMIN),
  governanceController.update.bind(governanceController)
);

router.delete(
  '/admin/documents/:id',
  authorize(UserRole.ADMIN),
  governanceController.delete.bind(governanceController)
);

router.patch(
  '/admin/documents/:id/approve',
  authorize(UserRole.ADMIN),
  governanceController.approve.bind(governanceController)
);

router.get(
  '/admin/documents/level/:level',
  authorize(UserRole.ADMIN),
  governanceController.getByLevel.bind(governanceController)
);

router.get(
  '/admin/documents/tree',
  authorize(UserRole.ADMIN),
  governanceController.getTree.bind(governanceController)
);

// ============================================
// ROTAS REP (apenas visualização - Enterprise)
// ============================================
router.get(
  '/rep/documents',
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      if (user?.role === 'ADMIN') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  },
  governanceController.findAll.bind(governanceController)
);

router.get(
  '/rep/documents/:id',
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      if (user?.role === 'ADMIN') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  },
  governanceController.findById.bind(governanceController)
);

router.get(
  '/rep/documents/level/:level',
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      if (user?.role === 'ADMIN') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  },
  governanceController.getByLevel.bind(governanceController)
);

router.get(
  '/rep/documents/tree',
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      if (user?.role === 'ADMIN') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  },
  governanceController.getTree.bind(governanceController)
);

// ============================================
// 🆕 NOVO (v39) - ROTAS DE DOWNLOAD
// ============================================

// Admin - Download DOC
router.get(
  '/admin/documents/:id/download/doc',
  authorize(UserRole.ADMIN),
  governanceController.downloadDoc.bind(governanceController)
);

// Admin - Download PDF
router.get(
  '/admin/documents/:id/download/pdf',
  authorize(UserRole.ADMIN),
  governanceController.downloadPdf.bind(governanceController)
);

// Rep - Download DOC (Enterprise)
router.get(
  '/rep/documents/:id/download/doc',
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      if (user?.role === 'ADMIN') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  },
  governanceController.downloadDoc.bind(governanceController)
);

// Rep - Download PDF (Enterprise)
router.get(
  '/rep/documents/:id/download/pdf',
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      if (user?.role === 'ADMIN') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  },
  governanceController.downloadPdf.bind(governanceController)
);

// ============================================
// 🆕 NOVO (v40) - ROTAS DE VISUALIZAÇÃO COM SUBSTITUIÇÃO
// ============================================

// Admin - Visualizar documento com substituição
router.get(
  '/admin/documents/:id/view',
  authorize(UserRole.ADMIN),
  governanceController.viewDocument.bind(governanceController)
);

// Rep - Visualizar documento com substituição (Enterprise)
router.get(
  '/rep/documents/:id/view',
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      if (user?.role === 'ADMIN') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  },
  governanceController.viewDocument.bind(governanceController)
);

export default router;