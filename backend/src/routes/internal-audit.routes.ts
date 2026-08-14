import { Router } from 'express';
import {
  AuditPlanController,
  AuditChecklistController,
  AuditFindingController,
  AuditEvidenceController,
  AuditActionPlanController,
  AuditReportController,
} from '../controllers/audit';

import { authMiddleware } from '../middleware/auth';

const router = Router();

// Instanciar controllers
const auditPlanController = new AuditPlanController();
const auditChecklistController = new AuditChecklistController();
const auditFindingController = new AuditFindingController();
const auditEvidenceController = new AuditEvidenceController();
const auditActionPlanController = new AuditActionPlanController();
const auditReportController = new AuditReportController();

// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO (TODAS AS ROTAS)
// ============================================================
router.use(authMiddleware);

// ============================================================
// PLANOS DE AUDITORIA
// ============================================================
router.post('/plans', auditPlanController.create.bind(auditPlanController));
router.get('/plans', auditPlanController.findAll.bind(auditPlanController));
router.get('/plans/:id', auditPlanController.findById.bind(auditPlanController));
router.put('/plans/:id', auditPlanController.update.bind(auditPlanController));
router.post('/plans/:id/submit', auditPlanController.submitForApproval.bind(auditPlanController));
router.post('/plans/:id/approve', auditPlanController.approve.bind(auditPlanController));
router.post('/plans/:id/reject', auditPlanController.reject.bind(auditPlanController));
router.post('/plans/:id/cancel', auditPlanController.cancel.bind(auditPlanController));
router.post('/plans/:id/start', auditPlanController.startAudit.bind(auditPlanController));
router.post('/plans/:id/complete', auditPlanController.completeAudit.bind(auditPlanController));
router.get('/plans/stats', auditPlanController.getStats.bind(auditPlanController));

// ============================================================
// CHECKLISTS
// ============================================================
router.get('/checklists/plan/:auditPlanId', auditChecklistController.findByPlanId.bind(auditChecklistController));
router.get('/checklists/plan/:auditPlanId/control/:controlId', auditChecklistController.findByPlanAndControl.bind(auditChecklistController));
router.put('/checklists/:id', auditChecklistController.update.bind(auditChecklistController));
router.post('/checklists/:id/complete', auditChecklistController.complete.bind(auditChecklistController));
router.get('/checklists/plan/:auditPlanId/stats', auditChecklistController.getStats.bind(auditChecklistController));

// ============================================================
// NÃO CONFORMIDADES (FINDINGS)
// ============================================================
router.post('/findings/plan/:auditPlanId', auditFindingController.create.bind(auditFindingController));
router.get('/findings/plan/:auditPlanId', auditFindingController.findByPlanId.bind(auditFindingController));
router.get('/findings', auditFindingController.findAll.bind(auditFindingController));
router.get('/findings/:id', auditFindingController.findById.bind(auditFindingController));
router.put('/findings/:id', auditFindingController.update.bind(auditFindingController));
router.post('/findings/:id/submit', auditFindingController.submitForValidation.bind(auditFindingController));
router.post('/findings/:id/validate', auditFindingController.validate.bind(auditFindingController));
router.get('/findings/plan/:auditPlanId/stats', auditFindingController.getStats.bind(auditFindingController));

// ============================================================
// PLANOS DE AÇÃO
// ============================================================
router.post('/actions', auditActionPlanController.create.bind(auditActionPlanController));
router.get('/actions/finding/:findingId', auditActionPlanController.findByFindingId.bind(auditActionPlanController));
router.get('/actions/responsible/:responsible', auditActionPlanController.findByResponsible.bind(auditActionPlanController));
router.get('/actions/:id', auditActionPlanController.findById.bind(auditActionPlanController));
router.put('/actions/:id', auditActionPlanController.update.bind(auditActionPlanController));
router.post('/actions/:id/start', auditActionPlanController.startProgress.bind(auditActionPlanController));
router.post('/actions/:id/complete', auditActionPlanController.complete.bind(auditActionPlanController));
router.post('/actions/:id/validate', auditActionPlanController.validate.bind(auditActionPlanController));

// ============================================================
// EVIDÊNCIAS
// ============================================================
router.post('/evidence/upload', auditEvidenceController.upload.bind(auditEvidenceController));
router.get('/evidence/plan/:auditPlanId', auditEvidenceController.findByPlanId.bind(auditEvidenceController));
router.get('/evidence/finding/:findingId', auditEvidenceController.findByFindingId.bind(auditEvidenceController));
router.get('/evidence/:id', auditEvidenceController.findById.bind(auditEvidenceController));
router.delete('/evidence/:id', auditEvidenceController.delete.bind(auditEvidenceController));

// ============================================================
// RELATÓRIOS
// ============================================================
router.post('/reports', auditReportController.create.bind(auditReportController));
router.get('/reports', auditReportController.findAll.bind(auditReportController));
router.get('/reports/plan/:auditPlanId', auditReportController.findByPlanId.bind(auditReportController));
router.get('/reports/:id', auditReportController.findById.bind(auditReportController));
router.put('/reports/:id', auditReportController.update.bind(auditReportController));
router.post('/reports/:id/submit', auditReportController.submitForReview.bind(auditReportController));
router.post('/reports/:id/approve', auditReportController.approve.bind(auditReportController));
router.post('/reports/:id/reject', auditReportController.reject.bind(auditReportController));
router.post('/reports/plan/:auditPlanId/generate', auditReportController.generateAutoReport.bind(auditReportController));

export default router;