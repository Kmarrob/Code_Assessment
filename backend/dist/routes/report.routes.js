"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReportController_js_1 = require("../controllers/ReportController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const sanitizeAdmin_js_1 = require("../middleware/sanitizeAdmin.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// ============================================
// ROTAS DO RELATÓRIO
// ============================================
// Todas as rotas exigem autenticação
router.use(auth_js_1.authenticate);
// ============================================
// ROTAS ADMIN (visão global)
// ============================================
router.get('/', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.adminRateLimiter, ReportController_js_1.ReportController.listReports);
// ============================================
// ROTAS REP (dashboard do relatório)
// ============================================
router.get('/dashboard', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, ReportController_js_1.ReportController.getReportDashboard);
// ============================================
// 🔴 NOVA ROTA: Dashboard por nome da empresa
// ============================================
router.get('/dashboard/company/:companyName', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, ReportController_js_1.ReportController.getReportDashboardByCompanyName);
// ============================================
// 🔴 NOVA ROTA: ADMIN dashboard por empresa
// ============================================
router.get('/admin/dashboard/:companyId', (0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN), rateLimit_js_1.adminRateLimiter, ReportController_js_1.ReportController.getAdminDashboardByCompany);
// ============================================
// 🔴 NOVA ROTA: Matriz de Priorização
// ============================================
router.get('/priorization/:companyId', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, ReportController_js_1.ReportController.getPriorizationMatrix);
// ============================================
// 🔴 NOVA ROTA: Roadmap de Implementação
// ============================================
router.get('/roadmap/:companyId', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, ReportController_js_1.ReportController.getRoadmap);
// ============================================
// ROTAS POR EMPRESA
// ============================================
// Obter relatório de uma empresa específica
router.get('/company/:companyId', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, ReportController_js_1.ReportController.getReportByCompany);
// Gerar dados automáticos do relatório
router.post('/company/:companyId/generate', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, ReportController_js_1.ReportController.generateReport);
// Atualizar relatório
router.put('/company/:companyId', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, ReportController_js_1.ReportController.updateReport);
// ============================================
// 🔴 NOVA ROTA: Gerar PDF do relatório
// ============================================
router.get('/:companyId/pdf', (0, auth_js_1.authorize)(index_js_1.UserRole.REP, index_js_1.UserRole.ADMIN), rateLimit_js_1.authenticatedRateLimiter, ReportController_js_1.ReportController.generatePDF);
exports.default = router;
//# sourceMappingURL=report.routes.js.map