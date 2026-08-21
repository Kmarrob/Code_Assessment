"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditReportController = exports.auditActionPlanController = exports.auditEvidenceController = exports.auditFindingController = exports.auditChecklistController = exports.auditPlanController = exports.auditDocumentReviewController = exports.auditRiskController = exports.auditSoAController = exports.auditProgramController = exports.AuditReportController = exports.AuditActionPlanController = exports.AuditEvidenceController = exports.AuditFindingController = exports.AuditChecklistController = exports.AuditPlanController = void 0;
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
//# sourceMappingURL=index.js.map