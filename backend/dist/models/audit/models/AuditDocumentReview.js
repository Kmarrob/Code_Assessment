"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditDocumentReview = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AuditDocumentReviewSchema = new mongoose_1.Schema({
    companyId: { type: String, required: true, index: true },
    auditPlanId: { type: String, required: true, index: true },
    documents: [
        {
            clause: { type: String, required: true },
            requirement: { type: String, required: true },
            status: {
                type: String,
                enum: ['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--'],
                default: '--',
            },
            observations: { type: String, default: '' },
            reviewer: { type: String, required: true },
            reviewDate: { type: Date, required: true },
            documentId: { type: String },
            documentName: { type: String },
        },
    ],
    summary: {
        totalDocuments: { type: Number, default: 0 },
        ok: { type: Number, default: 0 },
        ncA: { type: Number, default: 0 },
        ncB: { type: Number, default: 0 },
        pi: { type: Number, default: 0 },
        gp: { type: Number, default: 0 },
        cm: { type: Number, default: 0 },
        notAssessed: { type: Number, default: 0 },
    },
    createdBy: { type: String, required: true },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    observations: { type: String },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
AuditDocumentReviewSchema.index({ auditPlanId: 1 });
AuditDocumentReviewSchema.index({ companyId: 1, auditPlanId: 1 }, { unique: true });
AuditDocumentReviewSchema.virtual('id').get(function () {
    return this._id.toString();
});
AuditDocumentReviewSchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditDocumentReviewSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
AuditDocumentReviewSchema.methods.updateSummary = function () {
    const statusCounts = {
        OK: 0,
        NC_A: 0,
        NC_B: 0,
        PI: 0,
        GP: 0,
        CM: 0,
        '--': 0,
    };
    this.documents.forEach((doc) => {
        const key = doc.status;
        if (statusCounts[key] !== undefined) {
            statusCounts[key]++;
        }
    });
    this.summary = {
        totalDocuments: this.documents.length,
        ok: statusCounts.OK,
        ncA: statusCounts.NC_A,
        ncB: statusCounts.NC_B,
        pi: statusCounts.PI,
        gp: statusCounts.GP,
        cm: statusCounts.CM,
        notAssessed: statusCounts['--'],
    };
};
exports.AuditDocumentReview = mongoose_1.default.model('AuditDocumentReview', AuditDocumentReviewSchema);
//# sourceMappingURL=AuditDocumentReview.js.map