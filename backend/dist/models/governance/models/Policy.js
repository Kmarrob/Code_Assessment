"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Policy = void 0;
const mongoose_1 = require("mongoose");
const GovernanceDocument_1 = require("./GovernanceDocument");
const PolicySchema = new mongoose_1.Schema({
    scope: {
        type: String,
        enum: ['all', 'it', 'security', 'privacy'],
        required: true,
        default: 'all'
    },
    strategicObjective: { type: String, required: true },
    responsible: { type: String, required: true },
});
exports.Policy = GovernanceDocument_1.GovernanceDocument.discriminator('Policy', PolicySchema);
//# sourceMappingURL=Policy.js.map