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
exports.Response = void 0;
// backend/src/models/Response.ts
const mongoose_1 = __importStar(require("mongoose"));
const responseSchema = new mongoose_1.Schema({
    assignmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: [true, 'Atribuição é obrigatória'],
        unique: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário é obrigatório'],
    },
    controlId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Control',
        required: [true, 'Controle é obrigatório'],
    },
    // 🔴 CAMPO ADICIONADO
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Empresa é obrigatória'],
        index: true,
    },
    maturityLevel: {
        type: String,
        enum: ['N/A', '0', '1', '2'],
        required: [true, 'Nível de maturidade é obrigatório'],
    },
    scenarioDescription: {
        type: String,
        default: '',
        maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres'],
    },
    evidence: {
        type: [String],
        default: [],
    },
    observations: {
        type: String,
        default: '',
        maxlength: [1000, 'Observações devem ter no máximo 1000 caracteres'],
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// ============================================
// ÍNDICES OTIMIZADOS
// ============================================
responseSchema.index({ assignmentId: 1 }, { unique: true });
responseSchema.index({ userId: 1, controlId: 1 });
responseSchema.index({ userId: 1, maturityLevel: 1 });
responseSchema.index({ controlId: 1, maturityLevel: 1 });
// 🔴 NOVO ÍNDICE
responseSchema.index({ companyId: 1, userId: 1 });
// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
// Buscar respostas de um usuário
responseSchema.statics.findByUser = function (userId) {
    return this.find({ userId })
        .populate('controlId', 'id nome')
        .sort({ submittedAt: -1 });
};
// Buscar respostas de um preposto (via atribuições)
responseSchema.statics.findByRep = function (repId) {
    return this.aggregate([
        {
            $lookup: {
                from: 'assignments',
                localField: 'assignmentId',
                foreignField: '_id',
                as: 'assignment',
            },
        },
        { $unwind: '$assignment' },
        { $match: { 'assignment.assignedBy': new mongoose_1.default.Types.ObjectId(repId) } },
        {
            $lookup: {
                from: 'controls',
                localField: 'controlId',
                foreignField: '_id',
                as: 'control',
            },
        },
        { $unwind: '$control' },
        { $sort: { submittedAt: -1 } },
    ]);
};
// Calcular estatísticas de maturidade por usuário
responseSchema.statics.getUserStats = function (userId) {
    return this.aggregate([
        { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$maturityLevel',
                count: { $sum: 1 },
            },
        },
    ]);
};
exports.Response = mongoose_1.default.model('Response', responseSchema);
//# sourceMappingURL=Response.js.map