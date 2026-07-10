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
exports.CompanyDocument = void 0;
// backend/src/models/CompanyDocument.ts
const mongoose_1 = __importStar(require("mongoose"));
const CompanyDocumentSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Empresa é obrigatória'],
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Título é obrigatório'],
        trim: true,
        maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    description: {
        type: String,
        required: false,
        trim: true,
        maxlength: [1000, 'Descrição deve ter no máximo 1000 caracteres'],
    },
    category: {
        type: String,
        enum: ['policy', 'procedure', 'evidence', 'other'],
        required: [true, 'Categoria é obrigatória'],
        index: true,
    },
    subcategory: {
        type: String,
        required: false,
        trim: true,
        maxlength: [100, 'Subcategoria deve ter no máximo 100 caracteres'],
    },
    fileName: {
        type: String,
        required: [true, 'Nome do arquivo é obrigatório'],
        trim: true,
    },
    fileUrl: {
        type: String,
        required: [true, 'URL do arquivo é obrigatória'],
    },
    fileSize: {
        type: Number,
        required: [true, 'Tamanho do arquivo é obrigatório'],
        min: [0, 'Tamanho deve ser maior que 0'],
    },
    mimeType: {
        type: String,
        required: [true, 'Tipo MIME é obrigatório'],
    },
    version: {
        type: Number,
        default: 1,
        min: [1, 'Versão deve ser maior que 0'],
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'active',
        index: true,
    },
    uploadedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário que fez o upload é obrigatório'],
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: false,
    },
    tags: {
        type: [String],
        default: [],
        index: true,
    },
    controlIds: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Control',
        default: [],
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});
// Índices otimizados
CompanyDocumentSchema.index({ companyId: 1, category: 1 });
CompanyDocumentSchema.index({ companyId: 1, status: 1 });
CompanyDocumentSchema.index({ companyId: 1, createdAt: -1 });
CompanyDocumentSchema.index({ companyId: 1, title: 'text' });
CompanyDocumentSchema.index({ tags: 1 });
CompanyDocumentSchema.index({ controlIds: 1 });
// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
// Buscar documentos por empresa
CompanyDocumentSchema.statics.findByCompany = function (companyId, filters) {
    const query = { companyId };
    if (filters?.category)
        query.category = filters.category;
    if (filters?.status)
        query.status = filters.status;
    if (filters?.search) {
        query.$text = { $search: filters.search };
    }
    return this.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .lean();
};
// Buscar documentos por controle
CompanyDocumentSchema.statics.findByControl = function (controlId) {
    return this.find({ controlIds: controlId })
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .lean();
};
// Contar documentos por categoria
CompanyDocumentSchema.statics.countByCategory = function (companyId) {
    return this.aggregate([
        { $match: { companyId: new mongoose_1.default.Types.ObjectId(companyId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
};
exports.CompanyDocument = mongoose_1.default.model('CompanyDocument', CompanyDocumentSchema);
//# sourceMappingURL=CompanyDocument.js.map