// backend/src/routes/audit.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { AuditController } from '../controllers/AuditController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminRateLimiter } from '../middleware/rateLimit.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// 🆕 BYPASS TOTAL PARA ADMIN
router.use((req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user?.role === 'ADMIN' || user?.role === 'admin') {
    return next(); // ADMIN passa direto, sem verificar companyId
  }
  next();
});

// 🔴 ROTAS ADMIN (protegidas)
router.use(authorize(UserRole.ADMIN));

// Listar logs com filtros
router.get(
  '/logs',
  adminRateLimiter,
  AuditController.listLogs
);

// Estatísticas de logs
router.get(
  '/stats',
  adminRateLimiter,
  AuditController.getStats
);

// Buscar log por ID
router.get(
  '/logs/:id',
  adminRateLimiter,
  AuditController.getLogById
);

// Exportar logs
router.get(
  '/export',
  adminRateLimiter,
  AuditController.exportLogs
);

export default router;