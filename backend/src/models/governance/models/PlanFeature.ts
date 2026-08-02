import mongoose, { Schema, Document } from 'mongoose';

export interface IPlanFeature extends Document {
  planName: 'basic' | 'pro' | 'enterprise' | 'trial';
  governance: boolean;
  // Futuras features podem ser adicionadas aqui
  customFeatures?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PlanFeatureSchema = new Schema<IPlanFeature>(
  {
    planName: {
      type: String,
      enum: ['basic', 'pro', 'enterprise', 'trial'],
      required: true,
      unique: true,
      index: true,
    },
    governance: {
      type: Boolean,
      default: false,
      description: 'Acesso ao módulo de governança (políticas, normas, procedimentos)',
    },
    customFeatures: {
      type: Schema.Types.Mixed,
      default: {},
      description: 'Features adicionais para futuras expansões',
    },
  },
  {
    timestamps: true,
  }
);

export const PlanFeature = mongoose.model<IPlanFeature>(
  'PlanFeature',
  PlanFeatureSchema
);