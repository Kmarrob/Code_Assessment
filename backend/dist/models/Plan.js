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
exports.Plan = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Schema das funcionalidades do plano
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
}, {
    _id: false,
});
/**
 * Schema do Plano
 */
const planSchema = new mongoose_1.Schema({
    name: {
        type: String,
        enum: ['basic', 'pro', 'enterprise', 'trial'],
        required: true,
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
    },
    priceAnnual: {
        type: Number,
        required: true,
        min: 0,
    },
    pricePerUser: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
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
/**
 * Índices
 */
planSchema.index({ name: 1 }, { unique: true });
planSchema.index({ isActive: 1, isPublic: 1 });
planSchema.index({ sortOrder: 1 });
/**
 * Métodos estáticos
 */
planSchema.statics.getDefaultPlans = async function () {
    return this.find({
        isActive: true,
    }).sort({
        sortOrder: 1,
    });
};
planSchema.statics.getPlanByName = async function (name) {
    return this.findOne({
        name,
        isActive: true,
    });
};
planSchema.statics.getPublicPlans = async function () {
    return this.find({
        isActive: true,
        isPublic: true,
    }).sort({
        sortOrder: 1,
    });
};
/**
 * Métodos de instância
 */
planSchema.methods.getEffectivePrice = function (isAnnual = false, userCount = 0) {
    const basePrice = isAnnual ? this.priceAnnual : this.priceMonthly;
    const extraUsers = Math.max(0, userCount - this.features.maxUsers);
    const extraPrice = extraUsers * this.pricePerUser;
    return basePrice + extraPrice;
};
planSchema.methods.getDisplayPrice = function (isAnnual = false) {
    const price = isAnnual
        ? this.priceAnnual
        : this.priceMonthly;
    return (price / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};
planSchema.methods.canAccessFeature = function (feature) {
    return this.features[feature];
};
/**
 * Exportação
 */
console.log('🔥 CRIANDO MODEL Plan...');
exports.Plan = mongoose_1.default.model('Plan', planSchema);
console.log('✅ MODEL Plan criado:', exports.Plan);
//# sourceMappingURL=Plan.js.map