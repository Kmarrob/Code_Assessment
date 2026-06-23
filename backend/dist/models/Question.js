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
exports.Question = void 0;
// backend/src/models/Question.ts
const mongoose_1 = __importStar(require("mongoose"));
const questionSchema = new mongoose_1.Schema({
    controlId: {
        type: String,
        required: [true, 'ID do controle é obrigatório'],
        trim: true,
    },
    controlName: {
        type: String,
        default: '',
        trim: true,
    },
    controlCategory: {
        type: String,
        enum: ['Controles Organizacionais', 'Controles de Pessoas', 'Controles Físicos', 'Controles Tecnológicos'],
        default: 'Controles Organizacionais',
    },
    text: {
        type: String,
        required: [true, 'Pergunta é obrigatória'],
        trim: true,
    },
    objective: {
        type: String,
        default: '',
        trim: true,
    },
    answerImplemented: {
        type: String,
        default: '',
        trim: true,
    },
    answerPartial: {
        type: String,
        default: '',
        trim: true,
    },
    answerNotImplemented: {
        type: String,
        default: '',
        trim: true,
    },
    guidance: {
        type: String,
        default: '',
        trim: true,
    },
    attachmentUrl: {
        type: String,
        default: '',
    },
    attachmentName: {
        type: String,
        default: '',
    },
    order: {
        type: Number,
        default: 1,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Índices
questionSchema.index({ controlId: 1 });
questionSchema.index({ active: 1 });
questionSchema.index({ controlId: 1, order: 1 });
exports.Question = mongoose_1.default.model('Question', questionSchema);
//# sourceMappingURL=Question.js.map