"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditControlQuestion = exports.AuditQuestion = exports.AuditDocumentReview = exports.AuditRisk = exports.AuditSoA = exports.AuditProgram = exports.AuditReport = exports.AuditActionPlan = exports.AuditEvidence = exports.AuditFinding = exports.AuditChecklist = exports.AuditPlan = void 0;
var AuditPlan_1 = require("./AuditPlan");
Object.defineProperty(exports, "AuditPlan", { enumerable: true, get: function () { return AuditPlan_1.AuditPlan; } });
var AuditChecklist_1 = require("./AuditChecklist");
Object.defineProperty(exports, "AuditChecklist", { enumerable: true, get: function () { return AuditChecklist_1.AuditChecklist; } });
var AuditFinding_1 = require("./AuditFinding");
Object.defineProperty(exports, "AuditFinding", { enumerable: true, get: function () { return AuditFinding_1.AuditFinding; } });
var AuditEvidence_1 = require("./AuditEvidence");
Object.defineProperty(exports, "AuditEvidence", { enumerable: true, get: function () { return AuditEvidence_1.AuditEvidence; } });
var AuditActionPlan_1 = require("./AuditActionPlan");
Object.defineProperty(exports, "AuditActionPlan", { enumerable: true, get: function () { return AuditActionPlan_1.AuditActionPlan; } });
var AuditReport_1 = require("./AuditReport");
Object.defineProperty(exports, "AuditReport", { enumerable: true, get: function () { return AuditReport_1.AuditReport; } });
var AuditProgram_1 = require("./AuditProgram");
Object.defineProperty(exports, "AuditProgram", { enumerable: true, get: function () { return AuditProgram_1.AuditProgram; } });
var AuditSoA_1 = require("./AuditSoA");
Object.defineProperty(exports, "AuditSoA", { enumerable: true, get: function () { return AuditSoA_1.AuditSoA; } });
var AuditRisk_1 = require("./AuditRisk");
Object.defineProperty(exports, "AuditRisk", { enumerable: true, get: function () { return AuditRisk_1.AuditRisk; } });
var AuditDocumentReview_1 = require("./AuditDocumentReview");
Object.defineProperty(exports, "AuditDocumentReview", { enumerable: true, get: function () { return AuditDocumentReview_1.AuditDocumentReview; } });
var AuditQuestion_1 = require("./AuditQuestion");
Object.defineProperty(exports, "AuditQuestion", { enumerable: true, get: function () { return AuditQuestion_1.AuditQuestion; } });
// ============================================================
// 🆕 v50.1 — Perguntas de auditoria por controle (Anexo A)
// ============================================================
// Coleção nova e isolada para armazenar as perguntas de
// auditoria dos 93 controles (ISO 27001:2022 Anexo A).
// Diferente de AuditQuestion (cláusulas 4-10) e de Question
// (Assessment do usuário).
var AuditControlQuestion_1 = require("./AuditControlQuestion");
Object.defineProperty(exports, "AuditControlQuestion", { enumerable: true, get: function () { return AuditControlQuestion_1.AuditControlQuestion; } });
//# sourceMappingURL=index.js.map