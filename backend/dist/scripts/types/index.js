"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaturityLevel = exports.ResponseStatus = exports.UserRole = void 0;
// ============================================
// ENUMS
// ============================================
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["REP"] = "rep";
    UserRole["CONSULTANT"] = "consultant";
    UserRole["USER"] = "user";
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
