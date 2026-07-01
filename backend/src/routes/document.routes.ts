// backend/src/routes/document.routes.ts
import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController.js';
import { authenticate } from '../middleware/auth.js';
import { authenticatedRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// ============================================
// ROTAS DE DOCUMENTOS
// ============================================

// Upload de novo documento (multipart/form-data)
router.post(
  '/',
  authenticatedRateLimiter,
  DocumentController.uploadSingleFile,
  DocumentController.uploadDocument
);

// Buscar documentos da empresa (com filtros)
router.get(
  '/',
  authenticatedRateLimiter,
  DocumentController.getDocuments
);

// Estatísticas de documentos
router.get(
  '/stats',
  authenticatedRateLimiter,
  DocumentController.getStats
);

// Buscar documento por ID
router.get(
  '/:id',
  authenticatedRateLimiter,
  DocumentController.getDocumentById
);

// Download do arquivo
router.get(
  '/:id/download',
  authenticatedRateLimiter,
  DocumentController.downloadDocument
);

// Atualizar documento
router.patch(
  '/:id',
  authenticatedRateLimiter,
  DocumentController.updateDocument
);

// Arquivar documento
router.patch(
  '/:id/archive',
  authenticatedRateLimiter,
  DocumentController.archiveDocument
);

// Restaurar documento arquivado
router.patch(
  '/:id/restore',
  authenticatedRateLimiter,
  DocumentController.restoreDocument
);

// Excluir documento
router.delete(
  '/:id',
  authenticatedRateLimiter,
  DocumentController.deleteDocument
);

export default router;