"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/recommendation.routes.ts
const express_1 = require("express");
const RecommendationController_js_1 = require("../controllers/RecommendationController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const sanitizeAdmin_js_1 = require("../middleware/sanitizeAdmin.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// ============================================
// ROTAS PÚBLICAS (AUTENTICADAS) - DEVEM VIR ANTES DO MIDDLEWARE ADMIN
// ============================================
// GET /api/recommendations/report/:companyId
// Acesso: REP (da empresa) ou ADMIN
router.get('/report/:companyId', auth_js_1.authenticate, rateLimit_js_1.authenticatedRateLimiter, RecommendationController_js_1.RecommendationController.getRecommendationsForReport);
// 🔴 NOVO: GET /api/recommendations/controls/search?q=5.2
// Acesso: ADMIN (busca de controles para autocomplete)
router.get('/controls/search', auth_js_1.authenticate, rateLimit_js_1.authenticatedRateLimiter, RecommendationController_js_1.RecommendationController.searchControls);
// ============================================
// ROTAS ADMIN (CRUD de recomendações)
// ============================================
// Todas as rotas admin exigem autenticação e role ADMIN
router.use(auth_js_1.authenticate);
router.use((0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN));
// Listar recomendações (com filtros)
router.get('/', rateLimit_js_1.adminRateLimiter, RecommendationController_js_1.RecommendationController.listRecommendations);
// Obter domínios disponíveis
router.get('/dominios', rateLimit_js_1.adminRateLimiter, RecommendationController_js_1.RecommendationController.getDominios);
// Buscar recomendação por ID do controle
router.get('/:controlId', rateLimit_js_1.adminRateLimiter, RecommendationController_js_1.RecommendationController.getByControlId);
// Criar recomendação
router.post('/', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RecommendationController_js_1.RecommendationController.createRecommendation);
// Atualizar recomendação
router.put('/:controlId', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RecommendationController_js_1.RecommendationController.updateRecommendation);
// Deletar recomendação
router.delete('/:controlId', rateLimit_js_1.adminRateLimiter, RecommendationController_js_1.RecommendationController.deleteRecommendation);
exports.default = router;
//# sourceMappingURL=recommendation.routes.js.map