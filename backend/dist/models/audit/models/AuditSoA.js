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
exports.AuditSoA = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AuditSoASchema = new mongoose_1.Schema({
    companyId: { type: String, required: true, index: true },
    version: { type: String, required: true, default: '0.1' },
    status: {
        type: String,
        enum: ['draft', 'review', 'approved', 'archived'],
        default: 'draft',
    },
    controls: [
        {
            clause: { type: String, required: true, index: true },
            title: { type: String, required: true },
            objective: { type: String, required: true },
            motivators: {
                business: { type: Boolean, default: false },
                risk: { type: Boolean, default: false },
                legal: { type: Boolean, default: false },
                contract: { type: Boolean, default: false },
            },
            applicable: { type: Boolean, default: true },
            justification: { type: String },
            lastAssessmentDate: { type: Date },
            implemented: { type: Boolean, default: false },
            implementationDate: { type: Date },
            responsible: { type: String },
            evidence: { type: String },
        },
    ],
    statistics: {
        total: { type: Number, default: 0 },
        applicable: { type: Number, default: 0 },
        notApplicable: { type: Number, default: 0 },
        implemented: { type: Number, default: 0 },
        notImplemented: { type: Number, default: 0 },
        byCategory: {
            organizational: { type: Number, default: 0 },
            people: { type: Number, default: 0 },
            physical: { type: Number, default: 0 },
            technological: { type: Number, default: 0 },
        },
    },
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    reviewedAt: { type: Date },
    nextReviewDate: { type: Date },
    observations: { type: String },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Índices
AuditSoASchema.index({ companyId: 1, version: 1 });
AuditSoASchema.index({ companyId: 1, status: 1 });
AuditSoASchema.index({ 'controls.clause': 1 });
// Virtual
AuditSoASchema.virtual('id').get(function () {
    return this._id.toString();
});
// Middleware para soft delete
AuditSoASchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditSoASchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
// Método para atualizar estatísticas
AuditSoASchema.methods.updateStatistics = function () {
    const total = this.controls.length;
    const applicable = this.controls.filter((c) => c.applicable).length;
    const implemented = this.controls.filter((c) => c.implemented).length;
    // Por categoria (baseado no clause prefix)
    const categories = {
        organizational: this.controls.filter((c) => c.clause.startsWith('5.')).length,
        people: this.controls.filter((c) => c.clause.startsWith('6.')).length,
        physical: this.controls.filter((c) => c.clause.startsWith('7.')).length,
        technological: this.controls.filter((c) => c.clause.startsWith('8.')).length,
    };
    this.statistics = {
        total,
        applicable,
        notApplicable: total - applicable,
        implemented,
        notImplemented: applicable - implemented,
        byCategory: categories,
    };
};
exports.AuditSoA = mongoose_1.default.model('AuditSoA', AuditSoASchema);
//# sourceMappingURL=AuditSoA.js.map