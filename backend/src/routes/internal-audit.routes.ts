import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  auditPlanController,
  auditChecklistController,
  auditFindingController,
  auditEvidenceController,
  auditActionPlanController,
  auditReportController,
  auditProgramController,
  auditSoAController,
  auditRiskController,
  auditDocumentReviewController,
  // 🆕 NOVO (v47.0) - Controller de perguntas
  auditQuestionController,
} from '../controllers/audit';

const router = Router();

// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================================
router.use(authenticate);

// ============================================================
// ROTAS DE PLANOS DE AUDITORIA
// ============================================================
router.post('/plans', auditPlanController.create);
router.get('/plans', auditPlanController.findAll);
router.get('/plans/stats', auditPlanController.getStats);
router.get('/plans/:id', auditPlanController.findById);
router.put('/plans/:id', auditPlanController.update);
router.delete('/plans/:id', auditPlanController.delete);
router.post('/plans/:id/submit', auditPlanController.submitForApproval);
router.post('/plans/:id/approve', auditPlanController.approve);
router.post('/plans/:id/reject', auditPlanController.reject);
router.post('/plans/:id/start', auditPlanController.startAudit);
router.post('/plans/:id/complete', auditPlanController.completeAudit);

// ============================================================
// ROTAS DE CHECKLISTS
// ============================================================
router.get('/checklists/plan/:auditPlanId', auditChecklistController.findByPlanId);
router.get('/checklists/plan/:auditPlanId/control/:controlId', auditChecklistController.findByPlanAndControl);
router.get('/checklists/plan/:auditPlanId/stats', auditChecklistController.getStats);
router.put('/checklists/:id', auditChecklistController.updateChecklist);
router.post('/checklists/:id/complete', auditChecklistController.complete);

// ============================================================
// ROTAS DE NÃO CONFORMIDADES (FINDINGS)
// ============================================================
router.post('/findings/plan/:auditPlanId', auditFindingController.create);
router.get('/findings/plan/:auditPlanId', auditFindingController.findByPlanId);
router.get('/findings', auditFindingController.findAll);
router.get('/findings/:id', auditFindingController.findById);
router.put('/findings/:id', auditFindingController.update);
router.delete('/findings/:id', auditFindingController.delete);
router.post('/findings/:id/submit', auditFindingController.submitForValidation);
router.post('/findings/:id/validate', auditFindingController.validate);
router.get('/findings/plan/:auditPlanId/stats', auditFindingController.getStats);

// ============================================================
// ROTAS DE EVIDÊNCIAS
// ============================================================
router.post('/evidence/upload', auditEvidenceController.upload);
router.get('/evidence/plan/:auditPlanId', auditEvidenceController.findByPlanId);
router.get('/evidence/finding/:findingId', auditEvidenceController.findByFindingId);
router.get('/evidence/:id', auditEvidenceController.findById);
router.delete('/evidence/:id', auditEvidenceController.delete);

// ============================================================
// ROTAS DE PLANOS DE AÇÃO
// ============================================================
router.post('/actions', auditActionPlanController.create);
router.get('/actions/finding/:findingId', auditActionPlanController.findByFindingId);
router.get('/actions/responsible/:responsible', auditActionPlanController.findByResponsible);
router.get('/actions/:id', auditActionPlanController.findById);
router.put('/actions/:id', auditActionPlanController.update);
router.delete('/actions/:id', auditActionPlanController.delete);
router.post('/actions/:id/start', auditActionPlanController.startProgress);
router.post('/actions/:id/complete', auditActionPlanController.complete);
router.post('/actions/:id/validate', auditActionPlanController.validate);

// ============================================================
// ROTAS DE RELATÓRIOS
// ============================================================
router.post('/reports', auditReportController.create);
router.get('/reports', auditReportController.findAll);
router.get('/reports/plan/:auditPlanId', auditReportController.findByPlanId);
router.get('/reports/:id', auditReportController.findById);
router.put('/reports/:id', auditReportController.update);
router.delete('/reports/:id', auditReportController.delete);
router.post('/reports/:id/submit', auditReportController.submitForReview);
router.post('/reports/:id/approve', auditReportController.approve);
router.post('/reports/:id/reject', auditReportController.reject);
router.post('/reports/plan/:auditPlanId/generate', auditReportController.generateAutoReport);

// ============================================================
// 🆕 ROTAS DE PROGRAMA DE AUDITORIAS
// ============================================================
router.post('/program', auditProgramController.create);
router.get('/program/company/:companyId', auditProgramController.findAllByCompany);
router.get('/program/company/:companyId/year/:year', auditProgramController.findByCompanyAndYear);
router.get('/program/:id', auditProgramController.findById);
router.put('/program/:id', auditProgramController.update);
router.delete('/program/:id', auditProgramController.delete);
router.post('/program/:id/approve', auditProgramController.approve);
router.post('/program/:id/activate', auditProgramController.activate);
router.post('/program/:id/archive', auditProgramController.archive);
router.get('/program/:id/stats', auditProgramController.getStatistics);
router.get('/program/:id/next-audits', auditProgramController.generateNextAudits);

// Setores
router.post('/program/:id/sector', auditProgramController.addSector);
router.put('/program/:id/sector/:index', auditProgramController.updateSector);

// Auditoria de fornecedores
router.post('/program/:id/supplier-audit', auditProgramController.addSupplierAudit);
router.put('/program/:id/supplier-audit/:index', auditProgramController.updateSupplierAudit);

// Auditoria externa
router.put('/program/:id/external-audit', auditProgramController.updateExternalAudit);

// Atividades
router.post('/program/:id/activity', auditProgramController.addActivity);
router.put('/program/:id/activity/:index', auditProgramController.updateActivity);

// ============================================================
// 🆕 ROTAS DE DECLARAÇÃO DE APLICABILIDADE (SoA)
// ============================================================
router.post('/soa', auditSoAController.create);
router.get('/soa/company/:companyId', auditSoAController.findByCompany);
router.get('/soa/company/:companyId/active', auditSoAController.findActiveByCompany);
router.get('/soa/:id', auditSoAController.findById);
router.put('/soa/:id', auditSoAController.update);
router.delete('/soa/:id', auditSoAController.delete);
router.post('/soa/:id/approve', auditSoAController.approve);
router.post('/soa/:id/archive', auditSoAController.archive);
router.get('/soa/:id/stats', auditSoAController.getStatistics);
router.get('/soa/:id/export', auditSoAController.exportToSpreadsheet);

// Controles da SoA
router.put('/soa/:id/control/:clause', auditSoAController.updateControl);

// ============================================================
// 🆕 ROTAS DE GESTÃO DE RISCOS
// ============================================================
router.post('/risks', auditRiskController.create);
router.get('/risks/company/:companyId', auditRiskController.findAllByCompany);
router.get('/risks/company/:companyId/stats', auditRiskController.getStatistics);
router.get('/risks/company/:companyId/critical', auditRiskController.getCriticalRisks);
router.get('/risks/company/:companyId/export', auditRiskController.exportToSpreadsheet);
router.get('/risks/:id', auditRiskController.findById);
router.get('/risks/company/:companyId/risk-id/:riskId', auditRiskController.findByRiskId);
router.put('/risks/:id', auditRiskController.update);
router.delete('/risks/:id', auditRiskController.delete);
router.put('/risks/:id/assessment', auditRiskController.updateAssessment);
router.post('/risks/:id/treat', auditRiskController.treatRisk);
router.put('/risks/:id/monitor', auditRiskController.monitorRisk);
router.post('/risks/:id/reopen', auditRiskController.reopenRisk);

// ============================================================
// 🆕 ROTAS DE REVISÃO DE DOCUMENTAÇÃO
// ============================================================
router.post('/document-review', auditDocumentReviewController.create);
router.get('/document-review/company/:companyId', auditDocumentReviewController.findAllByCompany);
router.get('/document-review/plan/:auditPlanId', auditDocumentReviewController.findByAuditPlanId);
router.get('/document-review/:id', auditDocumentReviewController.findById);
router.put('/document-review/:id', auditDocumentReviewController.update);
router.delete('/document-review/:id', auditDocumentReviewController.delete);
router.post('/document-review/:id/complete', auditDocumentReviewController.completeReview);
router.get('/document-review/:id/summary', auditDocumentReviewController.getSummary);
router.get('/document-review/:id/nonconformities', auditDocumentReviewController.getNonconformities);
router.get('/document-review/:id/recommendations', auditDocumentReviewController.getRecommendations);

// Documentos da revisão
router.put('/document-review/:id/document/:clause', auditDocumentReviewController.updateDocument);
router.put('/document-review/:id/document/:clause/status', auditDocumentReviewController.updateDocumentStatus);
router.post('/document-review/:id/document', auditDocumentReviewController.addDocument);
router.delete('/document-review/:id/document/:clause', auditDocumentReviewController.removeDocument);

// ============================================================
// 🆕 NOVO (v47.0) - ROTAS DE PERGUNTAS DO CHECKLIST
// ============================================================

// ============================================================
// ROTAS PÚBLICAS (READ) - Qualquer usuário autenticado pode visualizar
// ============================================================

/**
 * GET /api/internal-audit/questions/clause/:clause
 * Buscar perguntas por cláusula
 */
router.get(
  '/questions/clause/:clause',
  async (req, res) => {
    await auditQuestionController.findByClause(req, res);
  }
);

/**
 * GET /api/internal-audit/questions/section/:section
 * Buscar perguntas por seção
 */
router.get(
  '/questions/section/:section',
  async (req, res) => {
    await auditQuestionController.findBySection(req, res);
  }
);

/**
 * GET /api/internal-audit/questions/stats
 * Obter estatísticas das perguntas
 */
router.get(
  '/questions/stats',
  async (req, res) => {
    await auditQuestionController.getStats(req, res);
  }
);

// ============================================================
// ROTAS ADMIN (CRUD) - Apenas ADMIN
// ============================================================

/**
 * GET /api/internal-audit/questions
 * Listar perguntas com filtros
 */
router.get(
  '/questions',
  async (req, res) => {
    await auditQuestionController.findAll(req, res);
  }
);

/**
 * GET /api/internal-audit/questions/:id
 * Buscar pergunta por ID
 */
router.get(
  '/questions/:id',
  async (req, res) => {
    await auditQuestionController.findById(req, res);
  }
);

/**
 * POST /api/internal-audit/questions
 * Criar pergunta
 */
router.post(
  '/questions',
  async (req, res) => {
    await auditQuestionController.create(req, res);
  }
);

/**
 * PUT /api/internal-audit/questions/:id
 * Atualizar pergunta
 */
router.put(
  '/questions/:id',
  async (req, res) => {
    await auditQuestionController.update(req, res);
  }
);

/**
 * PATCH /api/internal-audit/questions/:id/toggle
 * Ativar/Desativar pergunta
 */
router.patch(
  '/questions/:id/toggle',
  async (req, res) => {
    await auditQuestionController.toggleStatus(req, res);
  }
);

/**
 * DELETE /api/internal-audit/questions/:id
 * Excluir pergunta
 */
router.delete(
  '/questions/:id',
  async (req, res) => {
    await auditQuestionController.delete(req, res);
  }
);

export default router;