"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditReportService = exports.auditActionPlanService = exports.auditEvidenceService = exports.auditFindingService = exports.auditChecklistService = exports.auditPlanService = exports.auditDocumentReviewService = exports.auditRiskService = exports.auditSoAService = exports.auditProgramService = exports.auditDashboardService = exports.AuditDashboardService = exports.auditControlQuestionService = exports.AuditControlQuestionService = exports.auditQuestionService = exports.AuditQuestionService = exports.AuditReportService = exports.AuditActionPlanService = exports.AuditEvidenceService = exports.AuditFindingService = exports.AuditChecklistService = exports.AuditPlanService = void 0;
// ============================================================
// Importar as classes (para serviços que exportam apenas a classe)
// ============================================================
const AuditPlanService_1 = require("./AuditPlanService");
Object.defineProperty(exports, "AuditPlanService", { enumerable: true, get: function () { return AuditPlanService_1.AuditPlanService; } });
const AuditChecklistService_1 = require("./AuditChecklistService");
Object.defineProperty(exports, "AuditChecklistService", { enumerable: true, get: function () { return AuditChecklistService_1.AuditChecklistService; } });
const AuditFindingService_1 = require("./AuditFindingService");
Object.defineProperty(exports, "AuditFindingService", { enumerable: true, get: function () { return AuditFindingService_1.AuditFindingService; } });
const AuditEvidenceService_1 = require("./AuditEvidenceService");
Object.defineProperty(exports, "AuditEvidenceService", { enumerable: true, get: function () { return AuditEvidenceService_1.AuditEvidenceService; } });
const AuditActionPlanService_1 = require("./AuditActionPlanService");
Object.defineProperty(exports, "AuditActionPlanService", { enumerable: true, get: function () { return AuditActionPlanService_1.AuditActionPlanService; } });
const AuditReportService_1 = require("./AuditReportService");
Object.defineProperty(exports, "AuditReportService", { enumerable: true, get: function () { return AuditReportService_1.AuditReportService; } });
// ============================================================
// 🆕 v50.1 — Importar o service de perguntas de auditoria por controle
// ============================================================
const AuditControlQuestionService_1 = require("./AuditControlQuestionService");
Object.defineProperty(exports, "AuditControlQuestionService", { enumerable: true, get: function () { return AuditControlQuestionService_1.AuditControlQuestionService; } });
Object.defineProperty(exports, "auditControlQuestionService", { enumerable: true, get: function () { return AuditControlQuestionService_1.auditControlQuestionService; } });
// ============================================================
// 🆕 v50.2.15 — Importar o service do dashboard de auditoria
// ============================================================
const AuditDashboardService_1 = require("./AuditDashboardService");
Object.defineProperty(exports, "AuditDashboardService", { enumerable: true, get: function () { return AuditDashboardService_1.AuditDashboardService; } });
Object.defineProperty(exports, "auditDashboardService", { enumerable: true, get: function () { return AuditDashboardService_1.auditDashboardService; } });
// ============================================================
// Importar as instâncias (para serviços que já exportam instância)
// ============================================================
const AuditProgramService_1 = require("./AuditProgramService");
Object.defineProperty(exports, "auditProgramService", { enumerable: true, get: function () { return AuditProgramService_1.auditProgramService; } });
const AuditSoAService_1 = require("./AuditSoAService");
Object.defineProperty(exports, "auditSoAService", { enumerable: true, get: function () { return AuditSoAService_1.auditSoAService; } });
const AuditRiskService_1 = require("./AuditRiskService");
Object.defineProperty(exports, "auditRiskService", { enumerable: true, get: function () { return AuditRiskService_1.auditRiskService; } });
const AuditDocumentReviewService_1 = require("./AuditDocumentReviewService");
Object.defineProperty(exports, "auditDocumentReviewService", { enumerable: true, get: function () { return AuditDocumentReviewService_1.auditDocumentReviewService; } });
// ============================================================
// Criar instâncias para os serviços que NÃO exportam
// ============================================================
const auditPlanService = new AuditPlanService_1.AuditPlanService();
exports.auditPlanService = auditPlanService;
const auditChecklistService = new AuditChecklistService_1.AuditChecklistService();
exports.auditChecklistService = auditChecklistService;
const auditFindingService = new AuditFindingService_1.AuditFindingService();
exports.auditFindingService = auditFindingService;
const auditEvidenceService = new AuditEvidenceService_1.AuditEvidenceService();
exports.auditEvidenceService = auditEvidenceService;
const auditActionPlanService = new AuditActionPlanService_1.AuditActionPlanService();
exports.auditActionPlanService = auditActionPlanService;
const auditReportService = new AuditReportService_1.AuditReportService();
exports.auditReportService = auditReportService;
// ============================================================
// 🆕 v49.2 — Exportar o service de perguntas de auditoria
// ============================================================
var AuditQuestionService_1 = require("./AuditQuestionService");
Object.defineProperty(exports, "AuditQuestionService", { enumerable: true, get: function () { return AuditQuestionService_1.AuditQuestionService; } });
var AuditQuestionService_2 = require("./AuditQuestionService");
Object.defineProperty(exports, "auditQuestionService", { enumerable: true, get: function () { return AuditQuestionService_2.auditQuestionService; } });
//# sourceMappingURL=index.js.map