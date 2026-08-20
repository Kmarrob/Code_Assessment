// ============================================================
// Importar as classes (para controllers que exportam apenas a classe)
// ============================================================
import { AuditPlanController } from './AuditPlanController';
import { AuditChecklistController } from './AuditChecklistController';
import { AuditFindingController } from './AuditFindingController';
import { AuditEvidenceController } from './AuditEvidenceController';
import { AuditActionPlanController } from './AuditActionPlanController';
import { AuditReportController } from './AuditReportController';

// ============================================================
// 🆕 NOVO (v47.0) - Importar o controller de perguntas
// ============================================================
import { AuditQuestionController } from './AuditQuestionController';

// ============================================================
// Importar as instâncias (para controllers que já exportam instância)
// ============================================================
import { auditProgramController } from './AuditProgramController';
import { auditSoAController } from './AuditSoAController';
import { auditRiskController } from './AuditRiskController';
import { auditDocumentReviewController } from './AuditDocumentReviewController';

// ============================================================
// Criar instâncias para os controllers que NÃO exportam
// ============================================================
const auditPlanController = new AuditPlanController();
const auditChecklistController = new AuditChecklistController();
const auditFindingController = new AuditFindingController();
const auditEvidenceController = new AuditEvidenceController();
const auditActionPlanController = new AuditActionPlanController();
const auditReportController = new AuditReportController();

// ============================================================
// 🆕 NOVO (v47.0) - Criar instância do controller de perguntas
// ============================================================
const auditQuestionController = new AuditQuestionController();

// ============================================================
// Exportar as classes (para uso em outros lugares)
// ============================================================
export {
  AuditPlanController,
  AuditChecklistController,
  AuditFindingController,
  AuditEvidenceController,
  AuditActionPlanController,
  AuditReportController,
  // 🆕 NOVO (v47.0)
  AuditQuestionController,
};

// Exportar os controllers que já exportam instância
export {
  auditProgramController,
  auditSoAController,
  auditRiskController,
  auditDocumentReviewController,
};

// ============================================================
// Exportar todas as instâncias (para uso nas rotas)
// ============================================================
export {
  auditPlanController,
  auditChecklistController,
  auditFindingController,
  auditEvidenceController,
  auditActionPlanController,
  auditReportController,
  // 🆕 NOVO (v47.0)
  auditQuestionController,
};