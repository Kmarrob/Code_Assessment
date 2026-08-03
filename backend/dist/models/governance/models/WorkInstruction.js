"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkInstruction = void 0;
const mongoose_1 = require("mongoose");
const GovernanceDocument_1 = require("./GovernanceDocument");
const WorkInstructionSchema = new mongoose_1.Schema({
    procedureId: { type: String, ref: 'GovernanceDocument', required: true },
    detailedSteps: { type: String, required: true },
    tools: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    verificationPoints: { type: [String], default: [] },
});
exports.WorkInstruction = GovernanceDocument_1.GovernanceDocument.discriminator('WorkInstruction', WorkInstructionSchema);
//# sourceMappingURL=WorkInstruction.js.map