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
exports.Company = void 0;
// backend/src/models/Company.ts
const mongoose_1 = __importStar(require("mongoose"));
const companySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Nome da empresa é obrigatório'],
        trim: true,
        unique: true,
    },
    cnpj: {
        type: String,
        trim: true,
        sparse: true,
    },
    plan: {
        type: String,
        enum: ['basic', 'pro', 'enterprise'],
        default: 'basic',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    },
    maxUsers: {
        type: Number,
        default: 10,
    },
    maxControls: {
        type: Number,
        default: 93,
    },
    assignedControls: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Control',
        default: [],
    },
    // ============================================
    // NOVOS CAMPOS
    // ============================================
    consultantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true,
    },
}, {
    timestamps: true,
});
// Índices
companySchema.index({ name: 1 }, { unique: true });
companySchema.index({ cnpj: 1 }, { sparse: true });
companySchema.index({ status: 1 });
companySchema.index({ assignedControls: 1 });
companySchema.index({ consultantId: 1 }); // NOVO ÍNDICE
companySchema.index({ createdBy: 1 }); // NOVO ÍNDICE
companySchema.index({ consultantId: 1, status: 1 }); // NOVO ÍNDICE COMPOSTO
exports.Company = mongoose_1.default.model('Company', companySchema);
//# sourceMappingURL=Company.js.map