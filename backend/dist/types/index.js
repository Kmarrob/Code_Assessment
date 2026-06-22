"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaturityLevel = exports.ResponseStatus = exports.UserRole = void 0;
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
    ResponseStatus["REJECTED"] = "rejected";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
var MaturityLevel;
(function (MaturityLevel) {
    MaturityLevel["NOT_APPLICABLE"] = "N/A";
    MaturityLevel[MaturityLevel["NOT_IMPLEMENTED"] = 0] = "NOT_IMPLEMENTED";
    MaturityLevel[MaturityLevel["PARTIALLY_IMPLEMENTED"] = 1] = "PARTIALLY_IMPLEMENTED";
    MaturityLevel[MaturityLevel["IMPLEMENTED"] = 2] = "IMPLEMENTED";
})(MaturityLevel || (exports.MaturityLevel = MaturityLevel = {}));
//# sourceMappingURL=index.js.map