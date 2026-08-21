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
exports.AuditQuestion = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AuditQuestionSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: [true, 'O texto da pergunta é obrigatório'],
        trim: true,
    },
    clause: {
        type: String,
        required: [true, 'A cláusula é obrigatória'],
        trim: true,
        index: true,
    },
    category: {
        type: String,
        enum: ['clause', 'control'],
        required: [true, 'A categoria é obrigatória'],
        default: 'clause',
    },
    controlId: {
        type: String,
        required: function () {
            return this.category === 'control';
        },
        index: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    answerType: {
        type: String,
        enum: ['C_NC_NA', 'C_NC_OB_OM_NA'],
        required: [true, 'O tipo de resposta é obrigatório'],
        default: 'C_NC_OB_OM_NA',
    },
    order: {
        type: Number,
        default: 0,
    },
    section: {
        type: String,
        required: [true, 'A seção é obrigatória'],
        trim: true,
        index: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    updatedBy: {
        type: String,
        required: true,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Índices
AuditQuestionSchema.index({ clause: 1, category: 1 });
AuditQuestionSchema.index({ section: 1, order: 1 });
AuditQuestionSchema.index({ isActive: 1, clause: 1 });
// Soft delete middleware
AuditQuestionSchema.pre('find', function () {
    this.where({ deletedAt: null });
});
AuditQuestionSchema.pre('findOne', function () {
    this.where({ deletedAt: null });
});
// Virtual para controle
AuditQuestionSchema.virtual('control').get(function () {
    return this.controlId || null;
});
exports.AuditQuestion = mongoose_1.default.model('AuditQuestion', AuditQuestionSchema);
//# sourceMappingURL=AuditQuestion.js.map