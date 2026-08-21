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
exports.AuditProgram = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AuditProgramSchema = new mongoose_1.Schema({
    year: { type: Number, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    status: {
        type: String,
        enum: ['draft', 'approved', 'active', 'archived'],
        default: 'draft',
    },
    sectors: [
        {
            name: { type: String, required: true },
            processes: [{ type: String }],
            importance: { type: String, enum: ['critical', 'standard'], default: 'standard' },
            scoreA: { type: Number, min: 0, max: 2, default: 0 },
            scoreB: { type: Number, min: 0, max: 1, default: 0 },
            totalScore: { type: Number, min: 0, max: 3, default: 0 },
            frequency: {
                type: String,
                enum: ['annual', 'semiannual', 'quarterly'],
                default: 'annual',
            },
            lastAuditDate: { type: Date },
            nextAuditDate: { type: Date },
            status: {
                type: String,
                enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
                default: 'scheduled',
            },
            auditPlanId: { type: String },
        },
    ],
    supplierAudits: [
        {
            supplierName: { type: String, required: true },
            supplierId: { type: String },
            auditDate: { type: Date, required: true },
            scope: { type: String, required: true },
            status: {
                type: String,
                enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
                default: 'scheduled',
            },
            auditPlanId: { type: String },
        },
    ],
    externalAudit: {
        plannedDate: { type: Date },
        certificationBody: { type: String },
        scope: { type: String },
        status: {
            type: String,
            enum: ['not_planned', 'scheduled', 'in_progress', 'completed', 'cancelled'],
            default: 'not_planned',
        },
        auditPlanId: { type: String },
    },
    otherActivities: [
        {
            name: { type: String, required: true },
            description: { type: String },
            scheduledDate: { type: Date, required: true },
            status: {
                type: String,
                enum: ['pending', 'in_progress', 'completed'],
                default: 'pending',
            },
            completedAt: { type: Date },
        },
    ],
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    observations: { type: String },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Índices compostos para consultas eficientes
AuditProgramSchema.index({ companyId: 1, year: 1 }, { unique: true });
AuditProgramSchema.index({ companyId: 1, status: 1 });
AuditProgramSchema.index({ 'sectors.nextAuditDate': 1 });
// Virtual para ID
AuditProgramSchema.virtual('id').get(function () {
    return this._id.toString();
});
// Middleware para soft delete
AuditProgramSchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditProgramSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
exports.AuditProgram = mongoose_1.default.model('AuditProgram', AuditProgramSchema);
//# sourceMappingURL=AuditProgram.js.map