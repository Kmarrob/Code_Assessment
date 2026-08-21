"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const audit_1 = require("../controllers/audit");
const router = (0, express_1.Router)();
// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================================
router.use(auth_1.authenticate);
// ============================================================
// ROTAS DE PLANOS DE AUDITORIA
// ============================================================
router.post('/plans', audit_1.auditPlanController.create);
router.get('/plans', audit_1.auditPlanController.findAll);
router.get('/plans/stats', audit_1.auditPlanController.getStats);
router.get('/plans/:id', audit_1.auditPlanController.findById);
router.put('/plans/:id', audit_1.auditPlanController.update);
router.delete('/plans/:id', audit_1.auditPlanController.delete);
router.post('/plans/:id/submit', audit_1.auditPlanController.submitForApproval);
router.post('/plans/:id/approve', audit_1.auditPlanController.approve);
router.post('/plans/:id/reject', audit_1.auditPlanController.reject);
router.post('/plans/:id/start', audit_1.auditPlanController.startAudit);
router.post('/plans/:id/complete', audit_1.auditPlanController.completeAudit);
// ============================================================
// ROTAS DE CHECKLISTS
// ============================================================
router.get('/checklists/plan/:auditPlanId', audit_1.auditChecklistController.findByPlanId);
router.get('/checklists/plan/:auditPlanId/control/:controlId', audit_1.auditChecklistController.findByPlanAndControl);
router.get('/checklists/plan/:auditPlanId/stats', audit_1.auditChecklistController.getStats);
router.put('/checklists/:id', audit_1.auditChecklistController.updateChecklist);
router.post('/checklists/:id/complete', audit_1.auditChecklistController.complete);
// 🆕 NOVO (v47.0) - Popula checklists com respostas dos usuários
// POST /api/internal-audit/checklists/populate/:auditPlanId
router.post('/checklists/populate/:auditPlanId', audit_1.auditChecklistController.populateWithUserResponses);
// ============================================================
// ROTAS DE NÃO CONFORMIDADES (FINDINGS)
// ============================================================
router.post('/findings/plan/:auditPlanId', audit_1.auditFindingController.create);
router.get('/findings/plan/:auditPlanId', audit_1.auditFindingController.findByPlanId);
router.get('/findings', audit_1.auditFindingController.findAll);
router.get('/findings/:id', audit_1.auditFindingController.findById);
router.put('/findings/:id', audit_1.auditFindingController.update);
router.delete('/findings/:id', audit_1.auditFindingController.delete);
router.post('/findings/:id/submit', audit_1.auditFindingController.submitForValidation);
router.post('/findings/:id/validate', audit_1.auditFindingController.validate);
router.get('/findings/plan/:auditPlanId/stats', audit_1.auditFindingController.getStats);
// ============================================================
// ROTAS DE EVIDÊNCIAS
// ============================================================
router.post('/evidence/upload', audit_1.auditEvidenceController.upload);
router.get('/evidence/plan/:auditPlanId', audit_1.auditEvidenceController.findByPlanId);
router.get('/evidence/finding/:findingId', audit_1.auditEvidenceController.findByFindingId);
router.get('/evidence/:id', audit_1.auditEvidenceController.findById);
router.delete('/evidence/:id', audit_1.auditEvidenceController.delete);
// ============================================================
// ROTAS DE PLANOS DE AÇÃO
// ============================================================
router.post('/actions', audit_1.auditActionPlanController.create);
router.get('/actions/finding/:findingId', audit_1.auditActionPlanController.findByFindingId);
router.get('/actions/responsible/:responsible', audit_1.auditActionPlanController.findByResponsible);
router.get('/actions/:id', audit_1.auditActionPlanController.findById);
router.put('/actions/:id', audit_1.auditActionPlanController.update);
router.delete('/actions/:id', audit_1.auditActionPlanController.delete);
router.post('/actions/:id/start', audit_1.auditActionPlanController.startProgress);
router.post('/actions/:id/complete', audit_1.auditActionPlanController.complete);
router.post('/actions/:id/validate', audit_1.auditActionPlanController.validate);
// ============================================================
// ROTAS DE RELATÓRIOS
// ============================================================
router.post('/reports', audit_1.auditReportController.create);
router.get('/reports', audit_1.auditReportController.findAll);
router.get('/reports/plan/:auditPlanId', audit_1.auditReportController.findByPlanId);
router.get('/reports/:id', audit_1.auditReportController.findById);
router.put('/reports/:id', audit_1.auditReportController.update);
router.delete('/reports/:id', audit_1.auditReportController.delete);
router.post('/reports/:id/submit', audit_1.auditReportController.submitForReview);
router.post('/reports/:id/approve', audit_1.auditReportController.approve);
router.post('/reports/:id/reject', audit_1.auditReportController.reject);
router.post('/reports/plan/:auditPlanId/generate', audit_1.auditReportController.generateAutoReport);
// ============================================================
// ROTAS DE PROGRAMA DE AUDITORIAS
// ============================================================
router.post('/program', audit_1.auditProgramController.create);
router.get('/program/company/:companyId', audit_1.auditProgramController.findAllByCompany);
router.get('/program/company/:companyId/year/:year', audit_1.auditProgramController.findByCompanyAndYear);
router.get('/program/:id', audit_1.auditProgramController.findById);
router.put('/program/:id', audit_1.auditProgramController.update);
router.delete('/program/:id', audit_1.auditProgramController.delete);
router.post('/program/:id/approve', audit_1.auditProgramController.approve);
router.post('/program/:id/activate', audit_1.auditProgramController.activate);
router.post('/program/:id/archive', audit_1.auditProgramController.archive);
router.get('/program/:id/stats', audit_1.auditProgramController.getStatistics);
router.get('/program/:id/next-audits', audit_1.auditProgramController.generateNextAudits);
// Setores
router.post('/program/:id/sector', audit_1.auditProgramController.addSector);
router.put('/program/:id/sector/:index', audit_1.auditProgramController.updateSector);
// Auditoria de fornecedores
router.post('/program/:id/supplier-audit', audit_1.auditProgramController.addSupplierAudit);
router.put('/program/:id/supplier-audit/:index', audit_1.auditProgramController.updateSupplierAudit);
// Auditoria externa
router.put('/program/:id/external-audit', audit_1.auditProgramController.updateExternalAudit);
// Atividades
router.post('/program/:id/activity', audit_1.auditProgramController.addActivity);
router.put('/program/:id/activity/:index', audit_1.auditProgramController.updateActivity);
// ============================================================
// ROTAS DE DECLARAÇÃO DE APLICABILIDADE (SoA)
// ============================================================
router.post('/soa', audit_1.auditSoAController.create);
router.get('/soa/company/:companyId', audit_1.auditSoAController.findByCompany);
router.get('/soa/company/:companyId/active', audit_1.auditSoAController.findActiveByCompany);
router.get('/soa/:id', audit_1.auditSoAController.findById);
router.put('/soa/:id', audit_1.auditSoAController.update);
router.delete('/soa/:id', audit_1.auditSoAController.delete);
router.post('/soa/:id/approve', audit_1.auditSoAController.approve);
router.post('/soa/:id/archive', audit_1.auditSoAController.archive);
router.get('/soa/:id/stats', audit_1.auditSoAController.getStatistics);
router.get('/soa/:id/export', audit_1.auditSoAController.exportToSpreadsheet);
// Controles da SoA
router.put('/soa/:id/control/:clause', audit_1.auditSoAController.updateControl);
// ============================================================
// ROTAS DE GESTÃO DE RISCOS
// ============================================================
router.post('/risks', audit_1.auditRiskController.create);
router.get('/risks/company/:companyId', audit_1.auditRiskController.findAllByCompany);
router.get('/risks/company/:companyId/stats', audit_1.auditRiskController.getStatistics);
router.get('/risks/company/:companyId/critical', audit_1.auditRiskController.getCriticalRisks);
router.get('/risks/company/:companyId/export', audit_1.auditRiskController.exportToSpreadsheet);
router.get('/risks/:id', audit_1.auditRiskController.findById);
router.get('/risks/company/:companyId/risk-id/:riskId', audit_1.auditRiskController.findByRiskId);
router.put('/risks/:id', audit_1.auditRiskController.update);
router.delete('/risks/:id', audit_1.auditRiskController.delete);
router.put('/risks/:id/assessment', audit_1.auditRiskController.updateAssessment);
router.post('/risks/:id/treat', audit_1.auditRiskController.treatRisk);
router.put('/risks/:id/monitor', audit_1.auditRiskController.monitorRisk);
router.post('/risks/:id/reopen', audit_1.auditRiskController.reopenRisk);
// ============================================================
// ROTAS DE REVISÃO DE DOCUMENTAÇÃO
// ============================================================
router.post('/document-review', audit_1.auditDocumentReviewController.create);
router.get('/document-review/company/:companyId', audit_1.auditDocumentReviewController.findAllByCompany);
router.get('/document-review/plan/:auditPlanId', audit_1.auditDocumentReviewController.findByAuditPlanId);
router.get('/document-review/:id', audit_1.auditDocumentReviewController.findById);
router.put('/document-review/:id', audit_1.auditDocumentReviewController.update);
router.delete('/document-review/:id', audit_1.auditDocumentReviewController.delete);
router.post('/document-review/:id/complete', audit_1.auditDocumentReviewController.completeReview);
router.get('/document-review/:id/summary', audit_1.auditDocumentReviewController.getSummary);
router.get('/document-review/:id/nonconformities', audit_1.auditDocumentReviewController.getNonconformities);
router.get('/document-review/:id/recommendations', audit_1.auditDocumentReviewController.getRecommendations);
// Documentos da revisão
router.put('/document-review/:id/document/:clause', audit_1.auditDocumentReviewController.updateDocument);
router.put('/document-review/:id/document/:clause/status', audit_1.auditDocumentReviewController.updateDocumentStatus);
router.post('/document-review/:id/document', audit_1.auditDocumentReviewController.addDocument);
router.delete('/document-review/:id/document/:clause', audit_1.auditDocumentReviewController.removeDocument);
exports.default = router;
//# sourceMappingURL=internal-audit.routes.js.map