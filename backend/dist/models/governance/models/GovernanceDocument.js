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
exports.GovernanceDocument = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GovernanceDocumentSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    version: { type: String, required: true, default: 'v1.0' },
    status: {
        type: String,
        enum: ['draft', 'review', 'approved', 'archived'],
        default: 'draft',
        required: true
    },
    level: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true
    },
    category: { type: String, required: true },
    parentId: { type: String, ref: 'GovernanceDocument' },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    keywords: { type: [String], default: [] },
    createdBy: { type: String, ref: 'User', required: true },
    updatedBy: { type: String, ref: 'User', required: true },
    approvedBy: { type: String, ref: 'User' },
    approvedAt: { type: Date },
    effectiveDate: { type: Date, required: true },
    reviewDate: { type: Date, required: true },
    // 🆕 CAMPOS ADICIONAIS PARA POLÍTICAS
    responsible: { type: String, default: '' },
    strategicObjective: { type: String, default: '' },
    scope: {
        type: String,
        enum: ['all', 'it', 'security', 'privacy'],
        default: 'all'
    },
    frameworks: {
        iso27001: { type: [String], default: [] },
        nist: { type: [String], default: [] },
        cobit: { type: [String], default: [] },
        pciDss: { type: [String], default: [] },
        lgpd: { type: [String], default: [] },
        bacen: { type: [String], default: [] },
    },
    // 🆕 CORRIGIDO (v40) - Removido required para permitir documentos globais
    companyId: { type: String, ref: 'Company', default: null },
    // 🆕 NOVO (v40) - Documento global acessível a todas as empresas Enterprise
    isGlobal: {
        type: Boolean,
        default: false,
        description: 'Documento global acessível a todas as empresas com plano Enterprise'
    },
    versionHistory: [
        {
            version: { type: String, required: true },
            date: { type: Date, default: Date.now },
            user: { type: String, ref: 'User', required: true },
            changes: { type: String, required: true },
        },
    ],
    attachments: [
        {
            filename: { type: String, required: true },
            path: { type: String, required: true },
            size: { type: Number, required: true },
            mimetype: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now },
        },
    ],
    deletedAt: { type: Date },
}, {
    timestamps: true,
    discriminatorKey: '__type',
});
// Índices para performance
GovernanceDocumentSchema.index({ code: 1, companyId: 1 }, { unique: true, partialFilterExpression: { companyId: { $ne: null } } });
GovernanceDocumentSchema.index({ companyId: 1, level: 1 });
GovernanceDocumentSchema.index({ companyId: 1, status: 1 });
GovernanceDocumentSchema.index({ companyId: 1, category: 1 });
GovernanceDocumentSchema.index({ keywords: 1 });
// 🆕 NOVO (v40) - Índice para documentos globais
GovernanceDocumentSchema.index({ isGlobal: 1 });
exports.GovernanceDocument = mongoose_1.default.model('GovernanceDocument', GovernanceDocumentSchema);
//# sourceMappingURL=GovernanceDocument.js.map