"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/rep.routes.ts
const express_1 = require("express");
const RepController_js_1 = require("../controllers/RepController.js");
const DashboardController_js_1 = require("../controllers/DashboardController.js");
const auth_js_1 = require("../middleware/auth.js");
const sanitizeAdmin_js_1 = require("../middleware/sanitizeAdmin.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const index_js_1 = require("../types/index.js");
const Company_js_1 = require("../models/Company.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_js_1.authenticate);
// ============================================
// 🆕 ROTA PARA REP BUSCAR NOME DA PRÓPRIA EMPRESA (v41.9)
// ============================================
// 🔧 CORREÇÃO: Esta rota DEVE vir ANTES do middleware authorize(UserRole.REP)
// para que o REP possa acessar sem ser bloqueado
router.get('/company/:id', rateLimit_js_1.authenticatedRateLimiter, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        console.log('🔍 [GET /company/:id] user:', {
            id: user?.id,
            role: user?.role,
            companyId: user?.companyId,
            email: user?.email
        });
        // 🔒 Verificar se o REP está tentando acessar a própria empresa
        // ADMIN pode acessar qualquer empresa, REP apenas a sua
        if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
            // 🔧 CORREÇÃO: Converter ObjectId para string antes de comparar
            if (user?.companyId?.toString() !== id) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
        }
        const company = await Company_js_1.Company.findById(id).select('name');
        if (!company) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        return res.json({
            id: company._id,
            name: company.name
        });
    }
    catch (error) {
        console.error('Erro ao buscar empresa:', error);
        return res.status(500).json({ error: 'Erro ao buscar empresa' });
    }
});
// ============================================
// ROTAS DO PREPOSTO (exigem role REP)
// ============================================
router.use((0, auth_js_1.authorize)(index_js_1.UserRole.REP));
// Listar usuários do preposto
router.get('/users', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.listUsers);
// 🔴 NOVA ROTA ESTÁTICA: Movida para cima para evitar conflito com parâmetros dinâmicos
router.get('/users-with-responses', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getUsersWithResponses);
// Criar usuário
router.post('/users', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.createUser);
// 🔴 NOVO: Editar usuário
router.put('/users/:userId', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.updateUser);
// 🔴 NOVO: Inativar usuário
router.delete('/users/:userId', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.inactivateUser);
// Atribuir controles a um usuário
router.post('/assignments', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.assignControls);
// 🔴 NOVO: Revogar controle com reatribuição
router.post('/assignments/:assignmentId/revoke', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.revokeControl);
// 🔴 CORREÇÃO CRÍTICA DE ORDEM: 'progress/overall' DEVE vir antes de 'progress/:userId'
router.get('/progress/overall', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getOverallProgress);
// Obter progresso de um usuário específico
router.get('/progress/:userId', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getUserProgress);
// Obter estatísticas do preposto
router.get('/stats', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getStats);
// Obter dashboard da empresa
router.get('/dashboard/:companyId', rateLimit_js_1.authenticatedRateLimiter, DashboardController_js_1.DashboardController.getRepDashboard);
// 🔴 NOVO: Gerar PDF do dashboard da empresa
router.get('/dashboard/:companyId/pdf', rateLimit_js_1.authenticatedRateLimiter, DashboardController_js_1.DashboardController.generateDashboardPDF);
// ============================================
// 🔴 NOVAS ROTAS PARA PDFS ESPECÍFICOS POR SEÇÃO
// ============================================
/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Categorização
 * GET /api/rep/dashboard/:companyId/pdf/categorization
 */
router.get('/dashboard/:companyId/pdf/categorization', rateLimit_js_1.authenticatedRateLimiter, DashboardController_js_1.DashboardController.generateCategorizationPDF);
/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Tipos de Controle
 * GET /api/rep/dashboard/:companyId/pdf/control-types
 */
router.get('/dashboard/:companyId/pdf/control-types', rateLimit_js_1.authenticatedRateLimiter, DashboardController_js_1.DashboardController.generateControlTypesPDF);
/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Conceitos Cibernéticos
 * GET /api/rep/dashboard/:companyId/pdf/cyber-concepts
 */
router.get('/dashboard/:companyId/pdf/cyber-concepts', rateLimit_js_1.authenticatedRateLimiter, DashboardController_js_1.DashboardController.generateCyberConceptsPDF);
/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Capacidades Operacionais
 * GET /api/rep/dashboard/:companyId/pdf/capabilities
 */
router.get('/dashboard/:companyId/pdf/capabilities', rateLimit_js_1.authenticatedRateLimiter, DashboardController_js_1.DashboardController.generateCapabilitiesPDF);
/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Domínios
 * GET /api/rep/dashboard/:companyId/pdf/domains
 */
router.get('/dashboard/:companyId/pdf/domains', rateLimit_js_1.authenticatedRateLimiter, DashboardController_js_1.DashboardController.generateDomainsPDF);
// ============================================
// ROTA: Obter controles da empresa do preposto
// ============================================
router.get('/controls', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getCompanyControls);
// ============================================
// 🔴 NOVAS ROTAS PARA ATRIBUIÇÃO PARA SI MESMO
// ============================================
/**
 * 🔴 NOVO: Buscar controles já atribuídos ao preposto
 * GET /api/rep/my-assignments
 */
router.get('/my-assignments', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getMyAssignments);
/**
 * 🔴 NOVO: Atribuir controles para o próprio preposto
 * POST /api/rep/assign-to-self
 */
router.post('/assign-to-self', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.assignToSelf);
exports.default = router;
//# sourceMappingURL=rep.routes.js.map