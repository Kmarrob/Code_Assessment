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
exports.AuditReport = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AuditReportSchema = new mongoose_1.Schema({
    auditPlanId: { type: String, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    version: { type: String, required: true, default: '1.0' },
    organization: {
        legalName: { type: String, required: true },
        corporateGroup: { type: String },
        address: { type: String, required: true },
        country: { type: String, required: true },
        contact: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        language: { type: String, required: true },
        scope: { type: String, required: true },
        industry: { type: String, required: true },
    },
    profile: {
        standards: [{ type: String, required: true }],
        auditType: {
            type: String,
            enum: ['internal', 'external', 'supplier'],
            required: true,
        },
        documentation: { type: String, required: true },
        frequency: { type: String, required: true },
        leadAuditor: { type: String, required: true },
        auditTeam: [{ type: String }],
        specialists: [{ type: String }],
        trainees: [{ type: String }],
        multiSite: { type: Boolean, default: false },
        sites: [{ type: String }],
        operationalShifts: { type: String, required: true },
    },
    details: {
        auditedLocations: [{ type: String, required: true }],
        auditDate: { type: Date, required: true },
        auditEndDate: { type: Date, required: true },
        workDays: { type: Number, required: true, min: 0 },
    },
    results: {
        conforme: { type: Number, default: 0 },
        nonconformitiesA: { type: Number, default: 0 },
        nonconformitiesB: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        opportunities: { type: Number, default: 0 },
        goodPractices: { type: Number, default: 0 },
    },
    findings: [
        {
            type: {
                type: String,
                enum: ['NC_A', 'NC_B', 'CM', 'OM', 'AP'],
                required: true,
            },
            number: { type: String, required: true },
            description: { type: String, required: true },
            area: { type: String, required: true },
            process: { type: String, required: true },
            clause: { type: String, required: true },
            deadline: { type: Date, required: true },
            status: {
                type: String,
                enum: ['open', 'in_progress', 'closed'],
                default: 'open',
            },
            actionPlan: { type: String },
        },
    ],
    summary: { type: String, required: true },
    conclusion: { type: String, required: true },
    followUp: {
        required: {
            type: String,
            enum: ['none', 'reaudit', 'next_audit'],
            default: 'none',
        },
        details: { type: String, default: '' },
    },
    attachments: [
        {
            name: { type: String, required: true },
            type: {
                type: String,
                enum: ['checklist', 'questionnaire', 'evidence', 'other'],
                default: 'other',
            },
            url: { type: String, required: true },
        },
    ],
    status: {
        type: String,
        enum: ['draft', 'pending_review', 'approved', 'rejected'],
        default: 'draft',
    },
    rejectionReason: { type: String },
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Índices
AuditReportSchema.index({ auditPlanId: 1 }, { unique: true });
AuditReportSchema.index({ companyId: 1, status: 1 });
// Virtual
AuditReportSchema.virtual('id').get(function () {
    return this._id.toString();
});
// Virtual para total de não conformidades
AuditReportSchema.virtual('totalNonconformities').get(function () {
    return this.results.nonconformitiesA + this.results.nonconformitiesB;
});
// Middleware para soft delete
AuditReportSchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditReportSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
exports.AuditReport = mongoose_1.default.model('AuditReport', AuditReportSchema);
//# sourceMappingURL=AuditReport.js.map