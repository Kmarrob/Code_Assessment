"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/consultant.routes.ts
const express_1 = require("express");
const ConsultantController_js_1 = require("../controllers/ConsultantController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação e role CONSULTANT
router.use(auth_js_1.authenticate);
router.use((0, auth_js_1.authorize)(index_js_1.UserRole.CONSULTANT));
// ============================================
// ROTAS DO CONSULTOR
// ============================================
// Listar empresas do consultor
router.get('/companies', rateLimit_js_1.authenticatedRateLimiter, ConsultantController_js_1.ConsultantController.listCompanies);
// Obter estatísticas do consultor
router.get('/stats', rateLimit_js_1.authenticatedRateLimiter, ConsultantController_js_1.ConsultantController.getStats);
// Obter detalhes de uma empresa
router.get('/companies/:companyId', rateLimit_js_1.authenticatedRateLimiter, ConsultantController_js_1.ConsultantController.getCompanyDetails);
exports.default = router;
//# sourceMappingURL=consultant.routes.js.map