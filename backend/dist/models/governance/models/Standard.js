"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Standard = void 0;
const mongoose_1 = require("mongoose");
const GovernanceDocument_1 = require("./GovernanceDocument");
/**
 * Schema específico das Normas.
 *
 * Os demais campos são herdados do GovernanceDocument por meio
 * do mecanismo de discriminator do Mongoose.
 */
const StandardSchema = new mongoose_1.Schema({
    policyId: {
        type: String,
        ref: 'GovernanceDocument',
        required: true,
    },
    mandatory: {
        type: Boolean,
        default: true,
    },
    nonCompliancePenalty: {
        type: String,
    },
    responsibleArea: {
        type: String,
    },
});
/**
 * Model Standard.
 *
 * GovernanceDocument utiliza discriminatorKey: '__type'.
 * Portanto, Standard deve ser criado como discriminator de
 * GovernanceDocument para preservar toda a estrutura base:
 *
 * - code
 * - title
 * - version
 * - status
 * - level
 * - category
 * - parentId
 * - content
 * - summary
 * - keywords
 * - createdBy
 * - updatedBy
 * - approvedBy
 * - approvedAt
 * - effectiveDate
 * - reviewDate
 * - responsible
 * - strategicObjective
 * - scope
 * - frameworks
 * - companyId
 * - isGlobal
 * - versionHistory
 * - attachments
 * - deletedAt
 * - timestamps
 *
 * e acrescentar os campos específicos de Standard.
 */
exports.Standard = GovernanceDocument_1.GovernanceDocument.discriminators?.Standard ||
    GovernanceDocument_1.GovernanceDocument.discriminator('Standard', StandardSchema);
//# sourceMappingURL=Standard.js.map