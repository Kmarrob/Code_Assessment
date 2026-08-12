"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/audit.routes.ts
const express_1 = require("express");
const AuditController_js_1 = require("../controllers/AuditController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_js_1.authenticate);
// 🆕 BYPASS TOTAL PARA ADMIN
router.use((req, res, next) => {
    const user = req.user;
    if (user?.role === 'ADMIN' || user?.role === 'admin') {
        return next(); // ADMIN passa direto, sem verificar companyId
    }
    next();
});
// 🔴 ROTAS ADMIN (protegidas)
router.use((0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN));
// Listar logs com filtros
router.get('/logs', rateLimit_js_1.adminRateLimiter, AuditController_js_1.AuditController.listLogs);
// Estatísticas de logs
router.get('/stats', rateLimit_js_1.adminRateLimiter, AuditController_js_1.AuditController.getStats);
// Buscar log por ID
router.get('/logs/:id', rateLimit_js_1.adminRateLimiter, AuditController_js_1.AuditController.getLogById);
// Exportar logs
router.get('/export', rateLimit_js_1.adminRateLimiter, AuditController_js_1.AuditController.exportLogs);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map