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
exports.Assignment = void 0;
// backend/src/models/Assignment.ts
const mongoose_1 = __importStar(require("mongoose"));
const index_js_1 = require("../types/index.js");
const assignmentSchema = new mongoose_1.Schema({
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
    assignedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Preposto que atribuiu é obrigatório'],
    },
    assignedAt: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: Object.values(index_js_1.ResponseStatus),
        default: index_js_1.ResponseStatus.PENDING,
    },
}, {
    timestamps: true,
});
// ============================================
// ÍNDICES OTIMIZADOS PARA REP
// ============================================
// Garantir que um controle não seja atribuído duas vezes ao mesmo usuário
assignmentSchema.index({ userId: 1, controlId: 1 }, { unique: true });
// Para consultas do preposto
assignmentSchema.index({ assignedBy: 1, userId: 1 });
assignmentSchema.index({ assignedBy: 1, status: 1 });
assignmentSchema.index({ userId: 1, status: 1 });
// Para consultas de progresso
assignmentSchema.index({ assignedBy: 1, assignedAt: -1 });
// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
// Buscar atribuições de um preposto
assignmentSchema.statics.findByRep = function (repId) {
    return this.find({ assignedBy: repId })
        .populate('userId', 'name email')
        .populate('controlId', 'id nome')
        .sort({ assignedAt: -1 });
};
// Buscar atribuições de um usuário
assignmentSchema.statics.findByUser = function (userId) {
    return this.find({ userId })
        .populate('controlId', 'id nome')
        .sort({ assignedAt: -1 });
};
// Contar atribuições por status
assignmentSchema.statics.countByStatus = function (repId) {
    return this.aggregate([
        { $match: { assignedBy: new mongoose_1.default.Types.ObjectId(repId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
};
// Verificar se um controle já foi atribuído a um usuário
assignmentSchema.statics.isControlAssigned = async function (userId, controlId) {
    const assignment = await this.findOne({ userId, controlId });
    return !!assignment;
};
exports.Assignment = mongoose_1.default.model('Assignment', assignmentSchema);
//# sourceMappingURL=Assignment.js.map