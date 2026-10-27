"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditReportController = exports.auditActionPlanController = exports.auditEvidenceController = exports.auditFindingController = exports.auditChecklistController = exports.auditPlanController = exports.auditDocumentReviewController = exports.auditRiskController = exports.auditSoAController = exports.auditProgramController = exports.auditDashboardController = exports.AuditDashboardController = exports.auditControlQuestionController = exports.AuditControlQuestionController = exports.auditQuestionController = exports.AuditQuestionController = exports.AuditReportController = exports.AuditActionPlanController = exports.AuditEvidenceController = exports.AuditFindingController = exports.AuditChecklistController = exports.AuditPlanController = void 0;
// ============================================================
// Importar as classes (para controllers que exportam apenas a classe)
// ============================================================
const AuditPlanController_1 = require("./AuditPlanController");
Object.defineProperty(exports, "AuditPlanController", { enumerable: true, get: function () { return AuditPlanController_1.AuditPlanController; } });
const AuditChecklistController_1 = require("./AuditChecklistController");
Object.defineProperty(exports, "AuditChecklistController", { enumerable: true, get: function () { return AuditChecklistController_1.AuditChecklistController; } });
const AuditFindingController_1 = require("./AuditFindingController");
Object.defineProperty(exports, "AuditFindingController", { enumerable: true, get: function () { return AuditFindingController_1.AuditFindingController; } });
const AuditEvidenceController_1 = require("./AuditEvidenceController");
Object.defineProperty(exports, "AuditEvidenceController", { enumerable: true, get: function () { return AuditEvidenceController_1.AuditEvidenceController; } });
const AuditActionPlanController_1 = require("./AuditActionPlanController");
Object.defineProperty(exports, "AuditActionPlanController", { enumerable: true, get: function () { return AuditActionPlanController_1.AuditActionPlanController; } });
const AuditReportController_1 = require("./AuditReportController");
Object.defineProperty(exports, "AuditReportController", { enumerable: true, get: function () { return AuditReportController_1.AuditReportController; } });
// ============================================================
// 🆕 v50.1 — Importar o controller de perguntas por controle
// ============================================================
const AuditControlQuestionController_1 = require("./AuditControlQuestionController");
Object.defineProperty(exports, "AuditControlQuestionController", { enumerable: true, get: function () { return AuditControlQuestionController_1.AuditControlQuestionController; } });
Object.defineProperty(exports, "auditControlQuestionController", { enumerable: true, get: function () { return AuditControlQuestionController_1.auditControlQuestionController; } });
// ============================================================
// 🆕 v50.2.15 — Importar o controller do dashboard de auditoria
// ============================================================
const AuditDashboardController_1 = require("./AuditDashboardController");
Object.defineProperty(exports, "AuditDashboardController", { enumerable: true, get: function () { return AuditDashboardController_1.AuditDashboardController; } });
Object.defineProperty(exports, "auditDashboardController", { enumerable: true, get: function () { return AuditDashboardController_1.auditDashboardController; } });
// ============================================================
// Importar as instâncias (para controllers que já exportam instância)
// ============================================================
const AuditProgramController_1 = require("./AuditProgramController");
Object.defineProperty(exports, "auditProgramController", { enumerable: true, get: function () { return AuditProgramController_1.auditProgramController; } });
const AuditSoAController_1 = require("./AuditSoAController");
Object.defineProperty(exports, "auditSoAController", { enumerable: true, get: function () { return AuditSoAController_1.auditSoAController; } });
const AuditRiskController_1 = require("./AuditRiskController");
Object.defineProperty(exports, "auditRiskController", { enumerable: true, get: function () { return AuditRiskController_1.auditRiskController; } });
const AuditDocumentReviewController_1 = require("./AuditDocumentReviewController");
Object.defineProperty(exports, "auditDocumentReviewController", { enumerable: true, get: function () { return AuditDocumentReviewController_1.auditDocumentReviewController; } });
// ============================================================
// Criar instâncias para os controllers que NÃO exportam
// ============================================================
const auditPlanController = new AuditPlanController_1.AuditPlanController();
exports.auditPlanController = auditPlanController;
const auditChecklistController = new AuditChecklistController_1.AuditChecklistController();
exports.auditChecklistController = auditChecklistController;
const auditFindingController = new AuditFindingController_1.AuditFindingController();
exports.auditFindingController = auditFindingController;
const auditEvidenceController = new AuditEvidenceController_1.AuditEvidenceController();
exports.auditEvidenceController = auditEvidenceController;
const auditActionPlanController = new AuditActionPlanController_1.AuditActionPlanController();
exports.auditActionPlanController = auditActionPlanController;
const auditReportController = new AuditReportController_1.AuditReportController();
exports.auditReportController = auditReportController;
// ============================================================
// 🆕 v49.2 — Exportar o controller de perguntas de auditoria
// ============================================================
var AuditQuestionController_1 = require("./AuditQuestionController");
Object.defineProperty(exports, "AuditQuestionController", { enumerable: true, get: function () { return AuditQuestionController_1.AuditQuestionController; } });
var AuditQuestionController_2 = require("./AuditQuestionController");
Object.defineProperty(exports, "auditQuestionController", { enumerable: true, get: function () { return AuditQuestionController_2.auditQuestionController; } });
//# sourceMappingURL=index.js.map