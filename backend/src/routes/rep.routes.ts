// backend/src/routes/rep.routes.ts
import { Router } from 'express';
import { RepController } from '../controllers/RepController.js';
import { DashboardController } from '../controllers/DashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sanitizeAdminInputs } from '../middleware/sanitizeAdmin.js';
import { adminRateLimiter, authenticatedRateLimiter } from '../middleware/rateLimit.js';
import { UserRole } from '../types/index.js';
import { Company } from '../models/Company.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// ============================================
// 🆕 ROTA PARA REP BUSCAR NOME DA PRÓPRIA EMPRESA (v41.9)
// ============================================
// 🔧 CORREÇÃO: Esta rota DEVE vir ANTES do middleware authorize(UserRole.REP)
// para que o REP possa acessar sem ser bloqueado
router.get(
  '/company/:id',
  authenticatedRateLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      
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
      
      const company = await Company.findById(id).select('name');
      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
      
      return res.json({ 
        id: company._id,
        name: company.name 
      });
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      return res.status(500).json({ error: 'Erro ao buscar empresa' });
    }
  }
);

// ============================================
// ROTAS DO PREPOSTO (exigem role REP)
// ============================================
router.use(authorize(UserRole.REP));

// Listar usuários do preposto
router.get(
  '/users',
  adminRateLimiter,
  RepController.listUsers
);

// 🔴 NOVA ROTA ESTÁTICA: Movida para cima para evitar conflito com parâmetros dinâmicos
router.get(
  '/users-with-responses',
  adminRateLimiter,
  RepController.getUsersWithResponses
);

// Criar usuário
router.post(
  '/users',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.createUser
);

// 🔴 NOVO: Editar usuário
router.put(
  '/users/:userId',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.updateUser
);

// 🔴 NOVO: Inativar usuário
router.delete(
  '/users/:userId',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.inactivateUser
);

// Atribuir controles a um usuário
router.post(
  '/assignments',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.assignControls
);

// 🔴 NOVO: Revogar controle com reatribuição
router.post(
  '/assignments/:assignmentId/revoke',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.revokeControl
);

// 🔴 CORREÇÃO CRÍTICA DE ORDEM: 'progress/overall' DEVE vir antes de 'progress/:userId'
router.get(
  '/progress/overall',
  adminRateLimiter,
  RepController.getOverallProgress
);

// Obter progresso de um usuário específico
router.get(
  '/progress/:userId',
  adminRateLimiter,
  RepController.getUserProgress
);

// Obter estatísticas do preposto
router.get(
  '/stats',
  adminRateLimiter,
  RepController.getStats
);

// Obter dashboard da empresa
router.get(
  '/dashboard/:companyId',
  authenticatedRateLimiter,
  DashboardController.getRepDashboard
);

// 🔴 NOVO: Gerar PDF do dashboard da empresa
router.get(
  '/dashboard/:companyId/pdf',
  authenticatedRateLimiter,
  DashboardController.generateDashboardPDF
);

// ============================================
// 🔴 NOVAS ROTAS PARA PDFS ESPECÍFICOS POR SEÇÃO
// ============================================

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Categorização
 * GET /api/rep/dashboard/:companyId/pdf/categorization
 */
router.get(
  '/dashboard/:companyId/pdf/categorization',
  authenticatedRateLimiter,
  DashboardController.generateCategorizationPDF
);

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Tipos de Controle
 * GET /api/rep/dashboard/:companyId/pdf/control-types
 */
router.get(
  '/dashboard/:companyId/pdf/control-types',
  authenticatedRateLimiter,
  DashboardController.generateControlTypesPDF
);

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Conceitos Cibernéticos
 * GET /api/rep/dashboard/:companyId/pdf/cyber-concepts
 */
router.get(
  '/dashboard/:companyId/pdf/cyber-concepts',
  authenticatedRateLimiter,
  DashboardController.generateCyberConceptsPDF
);

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Capacidades Operacionais
 * GET /api/rep/dashboard/:companyId/pdf/capabilities
 */
router.get(
  '/dashboard/:companyId/pdf/capabilities',
  authenticatedRateLimiter,
  DashboardController.generateCapabilitiesPDF
);

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Domínios
 * GET /api/rep/dashboard/:companyId/pdf/domains
 */
router.get(
  '/dashboard/:companyId/pdf/domains',
  authenticatedRateLimiter,
  DashboardController.generateDomainsPDF
);

// ============================================
// 🆕 NOVO (v47.0) - BUSCAR CONTROLES CRÍTICOS PARA AUDITORIA
// ============================================

/**
 * 🆕 NOVO: Buscar controles com maturidade Nível 0 ou 1 para priorizar na auditoria
 * GET /api/rep/dashboard/critical-controls
 * 
 * Esta rota é utilizada pelo módulo de auditoria para:
 * - Alertar o REP sobre controles críticos
 * - Pré-selecionar controles para novos planos de auditoria
 * - Gerar recomendações automáticas de escopo
 * 
 * Acesso: REP ou ADMIN
 */
router.get(
  '/dashboard/critical-controls',
  authenticatedRateLimiter,
  DashboardController.getCriticalControls
);

// ============================================
// ROTA: Obter controles da empresa do preposto
// ============================================
router.get(
  '/controls',
  adminRateLimiter,
  RepController.getCompanyControls
);

// ============================================
// 🔴 NOVAS ROTAS PARA ATRIBUIÇÃO PARA SI MESMO
// ============================================

/**
 * 🔴 NOVO: Buscar controles já atribuídos ao preposto
 * GET /api/rep/my-assignments
 */
router.get(
  '/my-assignments',
  adminRateLimiter,
  RepController.getMyAssignments
);

/**
 * 🔴 NOVO: Atribuir controles para o próprio preposto
 * POST /api/rep/assign-to-self
 */
router.post(
  '/assign-to-self',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.assignToSelf
);

export default router;