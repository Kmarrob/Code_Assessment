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
exports.Recommendation = void 0;
// backend/src/models/Recommendation.ts
const mongoose_1 = __importStar(require("mongoose"));
const RecommendationSchema = new mongoose_1.Schema({
    controlId: {
        type: String,
        required: [true, 'ID do controle é obrigatório'],
        trim: true,
        index: true,
    },
    controlObjectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Control',
        required: [true, 'Referência ao controle é obrigatória'],
        index: true,
    },
    titulo: {
        type: String,
        required: [true, 'Título é obrigatório'],
        trim: true,
        maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    dominio: {
        type: String,
        required: [true, 'Domínio é obrigatório'],
        trim: true,
        enum: [
            'Controles organizacionais',
            'Controles de pessoas',
            'Controles físicos',
            'Controles tecnológicos',
        ],
    },
    recomendacoes: {
        type: [String],
        required: [true, 'Pelo menos uma recomendação é obrigatória'],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Pelo menos uma recomendação deve ser fornecida',
        },
    },
    solucoesTecnicas: {
        type: [String],
        required: false,
        default: [],
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário criador é obrigatório'],
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário que atualizou é obrigatório'],
    },
}, {
    timestamps: true,
});
// Índices para busca eficiente
RecommendationSchema.index({ controlId: 1, controlObjectId: 1 });
RecommendationSchema.index({ dominio: 1 });
RecommendationSchema.index({ createdAt: -1 });
exports.Recommendation = mongoose_1.default.model('Recommendation', RecommendationSchema);
//# sourceMappingURL=Recommendation.js.map