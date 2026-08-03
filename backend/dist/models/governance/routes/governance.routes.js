"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GovernanceController_1 = require("../controller/GovernanceController");
const auth_1 = require("../../../middleware/auth");
const index_js_1 = require("../../../types/index.js");
const FeatureService_js_1 = require("../services/FeatureService.js");
const router = (0, express_1.Router)();
const governanceController = new GovernanceController_1.GovernanceController();
// Middleware de autenticação para todas as rotas
router.use(auth_1.authenticate);
// 🆕 BYPASS TOTAL PARA ADMIN - Verifica ANTES de qualquer outra coisa
router.use((req, res, next) => {
    const user = req.user;
    // Se for admin, passa direto sem verificar nada
    if (user?.role === 'ADMIN' || user?.role === 'admin') {
        return next();
    }
    next();
});
// ============================================
// ROTAS ADMIN (controle total)
// ============================================
router.post('/admin/documents', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.create.bind(governanceController));
router.get('/admin/documents', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.findAll.bind(governanceController));
router.get('/admin/documents/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.findById.bind(governanceController));
router.put('/admin/documents/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.update.bind(governanceController));
router.delete('/admin/documents/:id', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.delete.bind(governanceController));
router.patch('/admin/documents/:id/approve', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.approve.bind(governanceController));
router.get('/admin/documents/level/:level', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.getByLevel.bind(governanceController));
router.get('/admin/documents/tree', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.getTree.bind(governanceController));
// ============================================
// ROTAS REP (apenas visualização - Enterprise)
// ============================================
router.get('/rep/documents', async (req, res, next) => {
    try {
        const user = req.user;
        // 🔧 BYPASS: Admin sempre tem acesso
        if (user?.role === 'ADMIN' || user?.role === 'admin')
            return next();
        const hasAccess = await FeatureService_js_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Plano Enterprise necessário para acessar o módulo de governança',
                code: 'PLAN_FEATURE_NOT_AVAILABLE',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
}, governanceController.findAll.bind(governanceController));
router.get('/rep/documents/:id', async (req, res, next) => {
    try {
        const user = req.user;
        // 🔧 BYPASS: Admin sempre tem acesso
        if (user?.role === 'ADMIN' || user?.role === 'admin')
            return next();
        const hasAccess = await FeatureService_js_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Plano Enterprise necessário para acessar o módulo de governança',
                code: 'PLAN_FEATURE_NOT_AVAILABLE',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
}, governanceController.findById.bind(governanceController));
router.get('/rep/documents/level/:level', async (req, res, next) => {
    try {
        const user = req.user;
        // 🔧 BYPASS: Admin sempre tem acesso
        if (user?.role === 'ADMIN' || user?.role === 'admin')
            return next();
        const hasAccess = await FeatureService_js_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Plano Enterprise necessário para acessar o módulo de governança',
                code: 'PLAN_FEATURE_NOT_AVAILABLE',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
}, governanceController.getByLevel.bind(governanceController));
router.get('/rep/documents/tree', async (req, res, next) => {
    try {
        const user = req.user;
        // 🔧 BYPASS: Admin sempre tem acesso
        if (user?.role === 'ADMIN' || user?.role === 'admin')
            return next();
        const hasAccess = await FeatureService_js_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Plano Enterprise necessário para acessar o módulo de governança',
                code: 'PLAN_FEATURE_NOT_AVAILABLE',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
}, governanceController.getTree.bind(governanceController));
// ============================================
// 🆕 NOVO (v39) - ROTAS DE DOWNLOAD
// ============================================
// Admin - Download DOC
router.get('/admin/documents/:id/download/doc', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.downloadDoc.bind(governanceController));
// Admin - Download PDF
router.get('/admin/documents/:id/download/pdf', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.downloadPdf.bind(governanceController));
// Rep - Download DOC (Enterprise)
router.get('/rep/documents/:id/download/doc', async (req, res, next) => {
    try {
        const user = req.user;
        // 🔧 BYPASS: Admin sempre tem acesso
        if (user?.role === 'ADMIN' || user?.role === 'admin')
            return next();
        const hasAccess = await FeatureService_js_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Plano Enterprise necessário para acessar o módulo de governança',
                code: 'PLAN_FEATURE_NOT_AVAILABLE',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
}, governanceController.downloadDoc.bind(governanceController));
// Rep - Download PDF (Enterprise)
router.get('/rep/documents/:id/download/pdf', async (req, res, next) => {
    try {
        const user = req.user;
        // 🔧 BYPASS: Admin sempre tem acesso
        if (user?.role === 'ADMIN' || user?.role === 'admin')
            return next();
        const hasAccess = await FeatureService_js_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Plano Enterprise necessário para acessar o módulo de governança',
                code: 'PLAN_FEATURE_NOT_AVAILABLE',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
}, governanceController.downloadPdf.bind(governanceController));
// ============================================
// 🆕 NOVO (v40) - ROTAS DE VISUALIZAÇÃO COM SUBSTITUIÇÃO
// ============================================
// Admin - Visualizar documento com substituição
router.get('/admin/documents/:id/view', (0, auth_1.authorize)(index_js_1.UserRole.ADMIN), governanceController.viewDocument.bind(governanceController));
// Rep - Visualizar documento com substituição (Enterprise)
router.get('/rep/documents/:id/view', async (req, res, next) => {
    try {
        const user = req.user;
        // 🔧 BYPASS: Admin sempre tem acesso
        if (user?.role === 'ADMIN' || user?.role === 'admin')
            return next();
        const hasAccess = await FeatureService_js_1.FeatureService.hasGovernanceAccess(user?.plan || 'basic');
        if (!hasAccess) {
            return res.status(403).json({
                error: 'Plano Enterprise necessário para acessar o módulo de governança',
                code: 'PLAN_FEATURE_NOT_AVAILABLE',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
}, governanceController.viewDocument.bind(governanceController));
exports.default = router;
//# sourceMappingURL=governance.routes.js.map