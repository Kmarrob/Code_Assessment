import mongoose, { Schema, Model } from 'mongoose';
import { IPlan, IPlanFeatures } from '../types/plan.types.js';

/**
 * Schema das funcionalidades do plano
 */
const planFeaturesSchema = new Schema<IPlanFeatures>(
  {
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
  },
  {
    _id: false,
  }
);

/**
 * Schema do Plano
 */
const planSchema = new Schema<IPlan>(
  {
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
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

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

planSchema.statics.getPlanByName = async function (name: string) {
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
planSchema.methods.getEffectivePrice = function (
  isAnnual: boolean = false,
  userCount: number = 0
): number {
  const basePrice = isAnnual ? this.priceAnnual : this.priceMonthly;

  const extraUsers = Math.max(
    0,
    userCount - this.features.maxUsers
  );

  const extraPrice = extraUsers * this.pricePerUser;

  return basePrice + extraPrice;
};

planSchema.methods.getDisplayPrice = function (
  isAnnual: boolean = false
): string {
  const price = isAnnual
    ? this.priceAnnual
    : this.priceMonthly;

  return (price / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

planSchema.methods.canAccessFeature = function (
  feature: keyof IPlanFeatures
): boolean {
  return this.features[feature] as boolean;
};

/**
 * Interface do Model
 */
export interface PlanModel extends Model<IPlan> {
  getDefaultPlans(): Promise<IPlan[]>;
  getPlanByName(name: string): Promise<IPlan | null>;
  getPublicPlans(): Promise<IPlan[]>;
}

/**
 * Exportação
 */
console.log('🔥 CRIANDO MODEL Plan...');
export const Plan = mongoose.model<IPlan, PlanModel>(
  'Plan',
  planSchema
);
console.log('✅ MODEL Plan criado:', Plan);
