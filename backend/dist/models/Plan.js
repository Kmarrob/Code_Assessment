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
exports.seedPlans = exports.Plan = void 0;
// backend/src/models/Plan.ts
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Schema do Plano
 */
const planFeaturesSchema = new mongoose_1.Schema({
    maxUsers: {
        type: Number,
        required: true,
        default: 5,
    },
    maxControls: {
        type: Number,
        required: true,
        default: 93,
    },
    canViewReport: {
        type: Boolean,
        default: true,
    },
    canPrintReport: {
        type: Boolean,
        default: false,
    },
    canDownloadReport: {
        type: Boolean,
        default: false,
    },
    canViewRoadmap: {
        type: Boolean,
        default: false,
    },
    canViewComparative: {
        type: Boolean,
        default: false,
    },
    canExportData: {
        type: Boolean,
        default: false,
    },
    hasConsultingHours: {
        type: Boolean,
        default: false,
    },
    consultingHours: {
        type: Number,
        default: 0,
    },
    consultingHoursUsed: {
        type: Number,
        default: 0,
    },
    supportPriority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low',
    },
    supportHours: {
        type: String,
        enum: ['business', 'extended', '24x7'],
        default: 'business',
    },
    canCustomizeBranding: {
        type: Boolean,
        default: false,
    },
    canAddCustomControls: {
        type: Boolean,
        default: false,
    },
    canIntegrateAPI: {
        type: Boolean,
        default: false,
    },
    canIntegrateSSO: {
        type: Boolean,
        default: false,
    },
}, { _id: false });
const planSchema = new mongoose_1.Schema({
    name: {
        type: String,
        enum: ['basic', 'pro', 'enterprise', 'trial'],
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    priceMonthly: {
        type: Number,
        required: true,
        min: 0,
        comment: 'Preço em centavos (ex: 149700 = R$ 1.497,00)',
    },
    priceAnnual: {
        type: Number,
        required: true,
        min: 0,
        comment: 'Preço em centavos',
    },
    pricePerUser: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
        comment: 'Preço por usuário adicional',
    },
    features: {
        type: planFeaturesSchema,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    trialDays: {
        type: Number,
        default: 7,
    },
    allowCustomPricing: {
        type: Boolean,
        default: true,
    },
    customPriceMonthly: {
        type: Number,
        min: 0,
    },
    customPriceAnnual: {
        type: Number,
        min: 0,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
    badge: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
// Índices
planSchema.index({ name: 1 }, { unique: true });
planSchema.index({ isActive: 1, isPublic: 1 });
planSchema.index({ sortOrder: 1 });
// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
planSchema.statics.getDefaultPlans = async function () {
    const plans = await this.find({ isActive: true }).sort({ sortOrder: 1 });
    return plans;
};
planSchema.statics.getPlanByName = async function (name) {
    return this.findOne({ name, isActive: true });
};
planSchema.statics.getPublicPlans = async function () {
    return this.find({ isActive: true, isPublic: true }).sort({ sortOrder: 1 });
};
// ============================================
// MÉTODOS DE INSTÂNCIA
// ============================================
planSchema.methods.getEffectivePrice = function (isAnnual = false, userCount = 0) {
    const basePrice = isAnnual ? this.priceAnnual : this.priceMonthly;
    const extraUsers = Math.max(0, userCount - this.features.maxUsers);
    const extraPrice = extraUsers * this.pricePerUser;
    return basePrice + extraPrice;
};
planSchema.methods.getDisplayPrice = function (isAnnual = false) {
    const price = isAnnual ? this.priceAnnual : this.priceMonthly;
    const formatted = (price / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
    return formatted;
};
planSchema.methods.canAccessFeature = function (feature) {
    return this.features[feature];
};
exports.Plan = mongoose_1.default.model('Plan', planSchema);
// ============================================
// SEED INICIAL DOS PLANOS
// ============================================
const seedPlans = async () => {
    const existingPlans = await exports.Plan.countDocuments();
    if (existingPlans > 0) {
        console.log('📋 Planos já existentes, pulando seed');
        return;
    }
    console.log('🌱 Iniciando seed de planos...');
    const plans = [
        {
            name: 'basic',
            displayName: 'Básico',
            description: 'Perfeito para pequenas empresas que estão começando sua jornada de maturidade em segurança da informação.',
            priceMonthly: 149700, // R$ 1.497,00
            priceAnnual: 1497000, // R$ 14.970,00
            pricePerUser: 29700, // R$ 297,00
            features: {
                maxUsers: 5,
                maxControls: 93,
                canViewReport: true,
                canPrintReport: false,
                canDownloadReport: false,
                canViewRoadmap: false,
                canViewComparative: false,
                canExportData: false,
                hasConsultingHours: false,
                consultingHours: 0,
                consultingHoursUsed: 0,
                supportPriority: 'low',
                supportHours: 'business',
                canCustomizeBranding: false,
                canAddCustomControls: false,
                canIntegrateAPI: false,
                canIntegrateSSO: false,
            },
            sortOrder: 1,
            trialDays: 7,
            badge: 'Para começar',
        },
        {
            name: 'pro',
            displayName: 'Profissional',
            description: 'Ideal para empresas que buscam um assessment completo com suporte especializado.',
            priceMonthly: 329700, // R$ 3.297,00
            priceAnnual: 3297000, // R$ 32.970,00
            pricePerUser: 29700, // R$ 297,00
            features: {
                maxUsers: 10,
                maxControls: 93,
                canViewReport: true,
                canPrintReport: false,
                canDownloadReport: false,
                canViewRoadmap: false,
                canViewComparative: false,
                canExportData: true,
                hasConsultingHours: true,
                consultingHours: 4,
                consultingHoursUsed: 0,
                supportPriority: 'high',
                supportHours: 'extended',
                canCustomizeBranding: true,
                canAddCustomControls: false,
                canIntegrateAPI: false,
                canIntegrateSSO: false,
            },
            sortOrder: 2,
            trialDays: 7,
            badge: 'Mais popular',
        },
        {
            name: 'enterprise',
            displayName: 'Enterprise',
            description: 'Solução completa para grandes organizações com necessidades avançadas de conformidade e segurança.',
            priceMonthly: 599700, // R$ 5.997,00
            priceAnnual: 5997000, // R$ 59.970,00
            pricePerUser: 29700, // R$ 297,00
            features: {
                maxUsers: 999, // Ilimitado (na prática)
                maxControls: 93,
                canViewReport: true,
                canPrintReport: true,
                canDownloadReport: true,
                canViewRoadmap: true,
                canViewComparative: true,
                canExportData: true,
                hasConsultingHours: true,
                consultingHours: 12,
                consultingHoursUsed: 0,
                supportPriority: 'critical',
                supportHours: '24x7',
                canCustomizeBranding: true,
                canAddCustomControls: true,
                canIntegrateAPI: true,
                canIntegrateSSO: true,
            },
            sortOrder: 3,
            trialDays: 7,
            badge: 'Completo',
        },
        {
            name: 'trial',
            displayName: 'Teste Gratuito',
            description: 'Avalie o sistema gratuitamente por 7 dias com todas as funcionalidades do plano Enterprise.',
            priceMonthly: 0,
            priceAnnual: 0,
            pricePerUser: 0,
            features: {
                maxUsers: 10,
                maxControls: 93,
                canViewReport: true,
                canPrintReport: true,
                canDownloadReport: true,
                canViewRoadmap: true,
                canViewComparative: true,
                canExportData: true,
                hasConsultingHours: false,
                consultingHours: 0,
                consultingHoursUsed: 0,
                supportPriority: 'low',
                supportHours: 'business',
                canCustomizeBranding: true,
                canAddCustomControls: false,
                canIntegrateAPI: false,
                canIntegrateSSO: false,
            },
            sortOrder: 0,
            trialDays: 7,
            isPublic: false,
            badge: 'Gratuito por 7 dias',
        },
    ];
    for (const planData of plans) {
        const plan = new exports.Plan(planData);
        await plan.save();
        console.log(`✅ Plano criado: ${plan.displayName} (${plan.name})`);
    }
    console.log('✅ Seed de planos concluído!');
};
exports.seedPlans = seedPlans;
//# sourceMappingURL=Plan.js.map