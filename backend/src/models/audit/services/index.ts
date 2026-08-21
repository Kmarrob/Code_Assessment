// ============================================================
// Importar as classes (para serviços que exportam apenas a classe)
// ============================================================
import { AuditPlanService } from './AuditPlanService';
import { AuditChecklistService } from './AuditChecklistService';
import { AuditFindingService } from './AuditFindingService';
import { AuditEvidenceService } from './AuditEvidenceService';
import { AuditActionPlanService } from './AuditActionPlanService';
import { AuditReportService } from './AuditReportService';

// ============================================================
// Importar as instâncias (para serviços que já exportam instância)
// ============================================================
import { auditProgramService } from './AuditProgramService';
import { auditSoAService } from './AuditSoAService';
import { auditRiskService } from './AuditRiskService';
import { auditDocumentReviewService } from './AuditDocumentReviewService';

// ============================================================
// Criar instâncias para os serviços que NÃO exportam
// ============================================================
const auditPlanService = new AuditPlanService();
const auditChecklistService = new AuditChecklistService();
const auditFindingService = new AuditFindingService();
const auditEvidenceService = new AuditEvidenceService();
const auditActionPlanService = new AuditActionPlanService();
const auditReportService = new AuditReportService();

// ============================================================
// Exportar as classes (para uso em outros lugares)
// ============================================================
export {
  AuditPlanService,
  AuditChecklistService,
  AuditFindingService,
  AuditEvidenceService,
  AuditActionPlanService,
  AuditReportService,
};

// Exportar os serviços que já exportam instância
export {
  auditProgramService,
  auditSoAService,
  auditRiskService,
  auditDocumentReviewService,
};

// ============================================================
// Exportar todas as instâncias (para uso nos controllers)
// ============================================================
export {
  auditPlanService,
  auditChecklistService,
  auditFindingService,
  auditEvidenceService,
  auditActionPlanService,
  auditReportService,
};