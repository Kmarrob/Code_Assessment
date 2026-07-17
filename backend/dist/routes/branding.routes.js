"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/branding.routes.ts
const express_1 = require("express");
const AdminController_js_1 = require("../controllers/AdminController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const cache_js_1 = require("../middleware/cache.js");
const router = (0, express_1.Router)();
// ============================================
// ROTAS DE BRANDING (acessível para ADMIN e REP da própria empresa)
// ============================================
// Todas as rotas exigem autenticação
router.use(auth_js_1.authenticate);
router.use(rateLimit_js_1.authenticatedRateLimiter);
// Obter branding da empresa (ADMIN ou REP da própria empresa)
router.get('/company/:companyId/branding', cache_js_1.noCache, AdminController_js_1.AdminController.getBranding);
exports.default = router;
//# sourceMappingURL=branding.routes.js.map