"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Standard = void 0;
const mongoose_1 = require("mongoose");
const GovernanceDocument_1 = require("./GovernanceDocument");
const StandardSchema = new mongoose_1.Schema({
    policyId: { type: String, ref: 'GovernanceDocument', required: true },
    mandatory: { type: Boolean, default: true },
    nonCompliancePenalty: { type: String },
});
exports.Standard = GovernanceDocument_1.GovernanceDocument.discriminator('Standard', StandardSchema);
//# sourceMappingURL=Standard.js.map