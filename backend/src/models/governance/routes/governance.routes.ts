import { Router, Request, Response, NextFunction } from 'express';
import { GovernanceController } from '../controller/GovernanceController';
import { authenticate, authorize } from '../../../middleware/auth';
import { UserRole } from '../../../types/index.js';
import { FeatureService } from '../services/FeatureService.js';

const router = Router();
const governanceController = new GovernanceController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// 🆕 BYPASS TOTAL PARA ADMIN - Verifica ANTES de qualquer outra coisa
router.use((req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  // Se for admin, passa direto sem verificar nada
  if (user?.role === 'ADMIN' || user?.role === 'admin') {
    return next();
  }
  next();
});

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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      // 🔧 BYPASS: Admin sempre tem acesso
      if (user?.role === 'ADMIN' || user?.role === 'admin') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        const planLabel: Record<string, string> = {
          basic: 'Básico',
          pro: 'Profissional',
          enterprise: 'Enterprise'
        };
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
          currentPlan: user?.plan || 'basic',
          currentPlanLabel: planLabel[user?.plan || 'basic'] || 'Básico',
          requiredPlan: 'enterprise',
          requiredPlanLabel: 'Enterprise',
          message: `Seu plano atual (${planLabel[user?.plan || 'basic'] || 'Básico'}) não inclui acesso ao módulo de governança. Faça upgrade para o plano Enterprise para acessar políticas, processos e procedimentos.`,
          upgradeUrl: '/plans'
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      // 🔧 BYPASS: Admin sempre tem acesso
      if (user?.role === 'ADMIN' || user?.role === 'admin') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        const planLabel: Record<string, string> = {
          basic: 'Básico',
          pro: 'Profissional',
          enterprise: 'Enterprise'
        };
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
          currentPlan: user?.plan || 'basic',
          currentPlanLabel: planLabel[user?.plan || 'basic'] || 'Básico',
          requiredPlan: 'enterprise',
          requiredPlanLabel: 'Enterprise',
          message: `Seu plano atual (${planLabel[user?.plan || 'basic'] || 'Básico'}) não inclui acesso ao módulo de governança. Faça upgrade para o plano Enterprise para acessar políticas, processos e procedimentos.`,
          upgradeUrl: '/plans'
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      // 🔧 BYPASS: Admin sempre tem acesso
      if (user?.role === 'ADMIN' || user?.role === 'admin') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        const planLabel: Record<string, string> = {
          basic: 'Básico',
          pro: 'Profissional',
          enterprise: 'Enterprise'
        };
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
          currentPlan: user?.plan || 'basic',
          currentPlanLabel: planLabel[user?.plan || 'basic'] || 'Básico',
          requiredPlan: 'enterprise',
          requiredPlanLabel: 'Enterprise',
          message: `Seu plano atual (${planLabel[user?.plan || 'basic'] || 'Básico'}) não inclui acesso ao módulo de governança. Faça upgrade para o plano Enterprise para acessar políticas, processos e procedimentos.`,
          upgradeUrl: '/plans'
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      // 🔧 BYPASS: Admin sempre tem acesso
      if (user?.role === 'ADMIN' || user?.role === 'admin') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        const planLabel: Record<string, string> = {
          basic: 'Básico',
          pro: 'Profissional',
          enterprise: 'Enterprise'
        };
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
          currentPlan: user?.plan || 'basic',
          currentPlanLabel: planLabel[user?.plan || 'basic'] || 'Básico',
          requiredPlan: 'enterprise',
          requiredPlanLabel: 'Enterprise',
          message: `Seu plano atual (${planLabel[user?.plan || 'basic'] || 'Básico'}) não inclui acesso ao módulo de governança. Faça upgrade para o plano Enterprise para acessar políticas, processos e procedimentos.`,
          upgradeUrl: '/plans'
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      // 🔧 BYPASS: Admin sempre tem acesso
      if (user?.role === 'ADMIN' || user?.role === 'admin') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        const planLabel: Record<string, string> = {
          basic: 'Básico',
          pro: 'Profissional',
          enterprise: 'Enterprise'
        };
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
          currentPlan: user?.plan || 'basic',
          currentPlanLabel: planLabel[user?.plan || 'basic'] || 'Básico',
          requiredPlan: 'enterprise',
          requiredPlanLabel: 'Enterprise',
          message: `Seu plano atual (${planLabel[user?.plan || 'basic'] || 'Básico'}) não inclui acesso ao módulo de governança. Faça upgrade para o plano Enterprise para acessar políticas, processos e procedimentos.`,
          upgradeUrl: '/plans'
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      // 🔧 BYPASS: Admin sempre tem acesso
      if (user?.role === 'ADMIN' || user?.role === 'admin') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        const planLabel: Record<string, string> = {
          basic: 'Básico',
          pro: 'Profissional',
          enterprise: 'Enterprise'
        };
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
          currentPlan: user?.plan || 'basic',
          currentPlanLabel: planLabel[user?.plan || 'basic'] || 'Básico',
          requiredPlan: 'enterprise',
          requiredPlanLabel: 'Enterprise',
          message: `Seu plano atual (${planLabel[user?.plan || 'basic'] || 'Básico'}) não inclui acesso ao módulo de governança. Faça upgrade para o plano Enterprise para acessar políticas, processos e procedimentos.`,
          upgradeUrl: '/plans'
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      // 🔧 BYPASS: Admin sempre tem acesso
      if (user?.role === 'ADMIN' || user?.role === 'admin') return next();
      
      const hasAccess = await FeatureService.hasGovernanceAccess(user?.plan || 'basic');
      if (!hasAccess) {
        const planLabel: Record<string, string> = {
          basic: 'Básico',
          pro: 'Profissional',
          enterprise: 'Enterprise'
        };
        return res.status(403).json({
          error: 'Plano Enterprise necessário para acessar o módulo de governança',
          code: 'PLAN_FEATURE_NOT_AVAILABLE',
          currentPlan: user?.plan || 'basic',
          currentPlanLabel: planLabel[user?.plan || 'basic'] || 'Básico',
          requiredPlan: 'enterprise',
          requiredPlanLabel: 'Enterprise',
          message: `Seu plano atual (${planLabel[user?.plan || 'basic'] || 'Básico'}) não inclui acesso ao módulo de governança. Faça upgrade para o plano Enterprise para acessar políticas, processos e procedimentos.`,
          upgradeUrl: '/plans'
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