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
    // ============================================
    // CAMPOS DE BRANDING - LOGO E FAVICON DA MRS CONSULTORIA
    // ============================================
    branding: {
        logo: {
            url: {
                type: String,
                default: '',
                trim: true,
            },
            filename: {
                type: String,
                default: '',
                trim: true,
            },
            size: {
                type: Number,
                default: 0,
            },
            mimeType: {
                type: String,
                default: '',
                trim: true,
            },
            dimensions: {
                width: { type: Number, default: 0 },
                height: { type: Number, default: 0 },
            },
            uploadedAt: {
                type: Date,
                default: null,
            },
            uploadedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                default: null,
            },
        },
        favicon: {
            url: {
                type: String,
                default: '',
                trim: true,
            },
            filename: {
                type: String,
                default: '',
                trim: true,
            },
            size: {
                type: Number,
                default: 0,
            },
            mimeType: {
                type: String,
                default: '',
                trim: true,
            },
            uploadedAt: {
                type: Date,
                default: null,
            },
            uploadedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                default: null,
            },
        },
        colors: {
            primary: {
                type: String,
                default: '#122A40', // Azul Marinho Escuro - Cor principal
                trim: true,
            },
            secondary: {
                type: String,
                default: '#1E5359', // Verde Petróleo - Cor secundária
                trim: true,
            },
            accent: {
                type: String,
                default: '#30736C', // Verde Azulado - Cor de destaque
                trim: true,
            },
            background: {
                type: String,
                default: '#F2F2F2', // Cinza Claro - Fundo
                trim: true,
            },
            text: {
                type: String,
                default: '#122A40', // Azul Marinho - Texto principal
                trim: true,
            },
            extractedFrom: {
                type: Date,
                default: null,
            },
        },
        settings: {
            showLogoInHeader: {
                type: Boolean,
                default: true,
            },
            showLogoInReport: {
                type: Boolean,
                default: true,
            },
            useCustomColors: {
                type: Boolean,
                default: false,
            },
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
}, {
    timestamps: true,
});
// Índices existentes
companySchema.index({ name: 1 }, { unique: true });
companySchema.index({ cnpj: 1 }, { sparse: true });
companySchema.index({ status: 1 });
companySchema.index({ assignedControls: 1 });
companySchema.index({ consultantId: 1 });
companySchema.index({ createdBy: 1 });
companySchema.index({ consultantId: 1, status: 1 });
// ============================================
// NOVOS ÍNDICES PARA BRANDING
// ============================================
companySchema.index({ 'branding.logo.url': 1 }, { sparse: true });
companySchema.index({ 'branding.favicon.url': 1 }, { sparse: true });
exports.Company = mongoose_1.default.model('Company', companySchema);
//# sourceMappingURL=Company.js.map