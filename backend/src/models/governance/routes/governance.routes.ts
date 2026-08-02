import { Router } from 'express';
import { GovernanceController } from '../controllers/GovernanceController';
import { authMiddleware } from '../../../middleware/auth';
import { planGuard } from '../../../middleware/planGuard';
import { isAdmin } from '../../../middleware/auth';

const router = Router();
const governanceController = new GovernanceController();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// ============================================
// ROTAS ADMIN (controle total)
// ============================================
router.post(
  '/admin/documents',
  isAdmin,
  governanceController.create.bind(governanceController)
);

router.get(
  '/admin/documents',
  isAdmin,
  governanceController.findAll.bind(governanceController)
);

router.get(
  '/admin/documents/:id',
  isAdmin,
  governanceController.findById.bind(governanceController)
);

router.put(
  '/admin/documents/:id',
  isAdmin,
  governanceController.update.bind(governanceController)
);

router.delete(
  '/admin/documents/:id',
  isAdmin,
  governanceController.delete.bind(governanceController)
);

router.patch(
  '/admin/documents/:id/approve',
  isAdmin,
  governanceController.approve.bind(governanceController)
);

router.get(
  '/admin/documents/level/:level',
  isAdmin,
  governanceController.getByLevel.bind(governanceController)
);

router.get(
  '/admin/documents/tree',
  isAdmin,
  governanceController.getTree.bind(governanceController)
);

// ============================================
// ROTAS REP (apenas visualização - Enterprise)
// ============================================
router.get(
  '/rep/documents',
  planGuard('governance'),
  governanceController.findAll.bind(governanceController)
);

router.get(
  '/rep/documents/:id',
  planGuard('governance'),
  governanceController.findById.bind(governanceController)
);

router.get(
  '/rep/documents/level/:level',
  planGuard('governance'),
  governanceController.getByLevel.bind(governanceController)
);

router.get(
  '/rep/documents/tree',
  planGuard('governance'),
  governanceController.getTree.bind(governanceController)
);

// ============================================
// 🆕 NOVO (v39) - ROTAS DE DOWNLOAD
// ============================================

// Admin - Download DOC
router.get(
  '/admin/documents/:id/download/doc',
  isAdmin,
  governanceController.downloadDoc.bind(governanceController)
);

// Admin - Download PDF
router.get(
  '/admin/documents/:id/download/pdf',
  isAdmin,
  governanceController.downloadPdf.bind(governanceController)
);

// Rep - Download DOC (Enterprise)
router.get(
  '/rep/documents/:id/download/doc',
  planGuard('governance'),
  governanceController.downloadDoc.bind(governanceController)
);

// Rep - Download PDF (Enterprise)
router.get(
  '/rep/documents/:id/download/pdf',
  planGuard('governance'),
  governanceController.downloadPdf.bind(governanceController)
);

export default router;