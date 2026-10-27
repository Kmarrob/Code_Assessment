"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaturityLevel = exports.ProgressStatus = exports.ResponseStatus = exports.UserRole = void 0;
// ============================================
// ENUMS
// ============================================
// ============================================================
// 🆕 v52.0 — USER ROLE EXPANDIDO
// ============================================================
//
// MOTIVO:
//   O sistema precisa suportar papéis específicos de auditoria
//   interna (SGSI), permitindo que o REP cadastre usuários com
//   responsabilidades claras:
//     - Auditor Líder: aprova planos, executa, vê relatórios
//     - Auditor: executa em parceria, vê relatórios
//     - Observador: somente leitura
//
// REGRAS DE NEGÓCIO:
//   - Os 4 roles existentes (admin, rep, consultant, user) são
//     PRESERVADOS. Nada é removido ou renomeado.
//   - Os 3 novos roles são ADITIVOS.
//   - Login, refresh de token e validações existentes
//     continuam funcionando sem alteração.
//
// COMPATIBILIDADE:
//   - Tokens JWT antigos continuam válidos (o payload é string).
//   - O enum do Mongoose aceita os valores antigos + novos.
//   - Middlewares de autorização que usam `authorize(role)`
//     continuam funcionando para os roles antigos.
//
// ============================================================
var UserRole;
(function (UserRole) {
    // ---- Roles existentes (INALTERADOS) ----
    UserRole["ADMIN"] = "admin";
    UserRole["REP"] = "rep";
    UserRole["CONSULTANT"] = "consultant";
    UserRole["USER"] = "user";
    // ---- 🆕 v52.0 — Roles de auditoria interna (SGSI) ----
    UserRole["AUDITOR_LEAD"] = "auditor_lead";
    UserRole["AUDITOR"] = "auditor";
    UserRole["OBSERVER"] = "observer";
})(UserRole || (exports.UserRole = UserRole = {}));
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus["PENDING"] = "pending";
    ResponseStatus["IN_PROGRESS"] = "in_progress";
    ResponseStatus["COMPLETED"] = "completed";
    ResponseStatus["SKIPPED"] = "skipped";
    ResponseStatus["EXPIRED"] = "expired";
    ResponseStatus["REVOKED"] = "revoked";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
// 🆕 NOVO ENUM PARA PROGRESSO
var ProgressStatus;
(function (ProgressStatus) {
    ProgressStatus["NOT_STARTED"] = "not_started";
    ProgressStatus["IN_PROGRESS"] = "in_progress";
    ProgressStatus["INTERRUPTED"] = "interrupted";
    ProgressStatus["COMPLETED"] = "completed";
})(ProgressStatus || (exports.ProgressStatus = ProgressStatus = {}));
var MaturityLevel;
(function (MaturityLevel) {
    MaturityLevel["N_A"] = "N/A";
    MaturityLevel["LEVEL_0"] = "0";
    MaturityLevel["LEVEL_1"] = "1";
    MaturityLevel["LEVEL_2"] = "2";
    MaturityLevel["LEVEL_3"] = "3";
    MaturityLevel["LEVEL_4"] = "4";
    MaturityLevel["LEVEL_5"] = "5";
})(MaturityLevel || (exports.MaturityLevel = MaturityLevel = {}));
//# sourceMappingURL=index.js.map