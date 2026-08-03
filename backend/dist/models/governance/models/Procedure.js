"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Procedure = void 0;
const mongoose_1 = require("mongoose");
const GovernanceDocument_1 = require("./GovernanceDocument");
const ProcedureSchema = new mongoose_1.Schema({
    standardId: { type: String, ref: 'GovernanceDocument', required: true },
    steps: [
        {
            order: { type: Number, required: true },
            description: { type: String, required: true },
            responsible: { type: String, required: true },
            expectedTime: { type: String, required: true },
        },
    ],
    inputs: { type: [String], default: [] },
    outputs: { type: [String], default: [] },
});
exports.Procedure = GovernanceDocument_1.GovernanceDocument.discriminator('Procedure', ProcedureSchema);
//# sourceMappingURL=Procedure.js.map