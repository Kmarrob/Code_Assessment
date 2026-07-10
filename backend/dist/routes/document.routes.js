"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/document.routes.ts
const express_1 = require("express");
const DocumentController_js_1 = require("../controllers/DocumentController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_js_1.authenticate);
// ============================================
// ROTAS DE DOCUMENTOS
// ============================================
// Upload de novo documento (multipart/form-data)
router.post('/', rateLimit_js_1.authenticatedRateLimiter, DocumentController_js_1.DocumentController.uploadSingleFile, DocumentController_js_1.DocumentController.uploadDocument);
// Buscar documentos da empresa (com filtros)
router.get('/', rateLimit_js_1.authenticatedRateLimiter, DocumentController_js_1.DocumentController.getDocuments);
// Estatísticas de documentos
router.get('/stats', rateLimit_js_1.authenticatedRateLimiter, DocumentController_js_1.DocumentController.getStats);
// Buscar documento por ID
router.get('/:id', rateLimit_js_1.authenticatedRateLimiter, DocumentController_js_1.DocumentController.getDocumentById);
// Download do arquivo
router.get('/:id/download', rateLimit_js_1.authenticatedRateLimiter, DocumentController_js_1.DocumentController.downloadDocument);
// Atualizar documento
router.patch('/:id', rateLimit_js_1.authenticatedRateLimiter, DocumentController_js_1.DocumentController.updateDocument);
// Arquivar documento
router.patch('/:id/archive', rateLimit_js_1.authenticatedRateLimiter, DocumentController_js_1.DocumentController.archiveDocument);
// Restaurar documento arquivado
router.patch('/:id/restore', rateLimit_js_1.authenticatedRateLimiter, DocumentController_js_1.DocumentController.restoreDocument);
// Excluir documento
router.delete('/:id', rateLimit_js_1.authenticatedRateLimiter, DocumentController_js_1.DocumentController.deleteDocument);
exports.default = router;
//# sourceMappingURL=document.routes.js.map