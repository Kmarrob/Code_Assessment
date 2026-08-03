"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Record = void 0;
const mongoose_1 = require("mongoose");
const GovernanceDocument_1 = require("./GovernanceDocument");
const RecordSchema = new mongoose_1.Schema({
    procedureId: { type: String, ref: 'GovernanceDocument', required: true },
    recordType: {
        type: String,
        enum: ['form', 'evidence', 'report', 'log'],
        required: true
    },
    retentionPeriod: { type: Number, required: true, default: 365 },
    retentionPolicy: { type: String, required: true },
});
exports.Record = GovernanceDocument_1.GovernanceDocument.discriminator('Record', RecordSchema);
//# sourceMappingURL=Record.js.map