// backend/src/models/Subscription.ts
import mongoose, { Schema, Model } from 'mongoose';

/**
 * Status da assinatura
 */
export type SubscriptionStatus = 
  | 'trial'        // Em período de teste
  | 'active'       // Ativa e paga
  | 'past_due'     // Pagamento em atraso
  | 'suspended'    // Suspensa (não paga)
  | 'cancelled'    // Cancelada
  | 'expired'      // Expirada
  | 'pending'      // Aguardando confirmação de pagamento
  | 'trialing'     // Em teste (ativo)

/**
 * Modelo de Assinatura
 */
export interface ISubscription {
  _id: mongoose.Types.ObjectId;
  
  // Relacionamentos
  companyId: mongoose.Types.ObjectId;    // Empresa assinante
  planId: mongoose.Types.ObjectId;       // Plano atual
  userId: mongoose.Types.ObjectId;       // Usuário que criou/gerencia
  
  // Status e datas
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  trialStartDate?: Date;
  trialEndDate?: Date;
  cancelledAt?: Date;
  suspendedAt?: Date;
  reactivatedAt?: Date;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  
  // Valores
  amount: number;
  currency: 'BRL' | 'USD';
  billingCycle: 'monthly' | 'annual';
  autoRenew: boolean;
  
  // Usuários
  maxUsers: number;
  currentUsers: number;
  
  // Features
  features: {
    maxUsers: number;
    maxControls: number;
    canViewReport: boolean;
    canPrintReport: boolean;
    canDownloadReport: boolean;
    canViewRoadmap: boolean;
    canViewComparative: boolean;
    canExportData: boolean;
    hasConsultingHours: boolean;
    consultingHours: number;
    consultingHoursUsed: number;
    supportPriority: 'low' | 'medium' | 'high' | 'critical';
    supportHours: 'business' | 'extended' | '24x7';
    canCustomizeBranding: boolean;
    canAddCustomControls: boolean;
    canIntegrateAPI: boolean;
    canIntegrateSSO: boolean;
  };
  
  // Consultoria
  consultingHoursTotal: number;
  consultingHoursUsed: number;
  consultingHoursRemaining: number;
  
  // Pagamento
  paymentMethod?: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
  paymentProvider?: 'stripe' | 'pagseguro' | 'mercadopago' | 'manual';
  paymentId?: string;
  subscriptionId?: string;
  
  // Histórico
  changeHistory: Array<{
    fromPlan: string;
    toPlan: string;
    changedAt: Date;
    changedBy: mongoose.Types.ObjectId;
    reason?: string;
  }>;
  
  // Metadados
  metadata?: Record<string, any>;
  notes?: string;
  
  // Auditoria
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

/**
 * Schema da Assinatura
 */
const subscriptionFeaturesSchema = new Schema({
  maxUsers: { type: Number, required: true },
  maxControls: { type: Number, required: true },
  canViewReport: { type: Boolean, default: false },
  canPrintReport: { type: Boolean, default: false },
  canDownloadReport: { type: Boolean, default: false },
  canViewRoadmap: { type: Boolean, default: false },
  canViewComparative: { type: Boolean, default: false },
  canExportData: { type: Boolean, default: false },
  hasConsultingHours: { type: Boolean, default: false },
  consultingHours: { type: Number, default: 0 },
  consultingHoursUsed: { type: Number, default: 0 },
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
  canCustomizeBranding: { type: Boolean, default: false },
  canAddCustomControls: { type: Boolean, default: false },
  canIntegrateAPI: { type: Boolean, default: false },
  canIntegrateSSO: { type: Boolean, default: false },
}, { _id: false });

const changeHistorySchema = new Schema({
  fromPlan: { type: String, required: true },
  toPlan: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, trim: true },
}, { _id: false });

const subscriptionSchema = new Schema<ISubscription>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'past_due', 'suspended', 'cancelled', 'expired', 'pending', 'trialing'],
      required: true,
      default: 'pending',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    trialStartDate: {
      type: Date,
    },
    trialEndDate: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    suspendedAt: {
      type: Date,
    },
    reactivatedAt: {
      type: Date,
    },
    lastPaymentDate: {
      type: Date,
    },
    nextPaymentDate: {
      type: Date,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Valor em centavos',
    },
    currency: {
      type: String,
      enum: ['BRL', 'USD'],
      default: 'BRL',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual'],
      required: true,
      default: 'monthly',
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    maxUsers: {
      type: Number,
      required: true,
      default: 5,
    },
    currentUsers: {
      type: Number,
      default: 0,
    },
    features: {
      type: subscriptionFeaturesSchema,
      required: true,
    },
    consultingHoursTotal: {
      type: Number,
      default: 0,
    },
    consultingHoursUsed: {
      type: Number,
      default: 0,
    },
    consultingHoursRemaining: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'boleto', 'pix', 'bank_transfer'],
    },
    paymentProvider: {
      type: String,
      enum: ['stripe', 'pagseguro', 'mercadopago', 'manual'],
    },
    paymentId: {
      type: String,
      trim: true,
    },
    subscriptionId: {
      type: String,
      trim: true,
    },
    changeHistory: [changeHistorySchema],
    metadata: {
      type: Schema.Types.Mixed,
    },
    notes: {
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

// ============================================
// ÍNDICES
// ============================================
subscriptionSchema.index({ companyId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ status: 1, endDate: 1 });
subscriptionSchema.index({ companyId: 1, planId: 1 });
subscriptionSchema.index({ userId: 1 });

// ============================================
// MÉTODOS DE INSTÂNCIA
// ============================================

/**
 * Verifica se a assinatura está ativa
 */
subscriptionSchema.methods.isActive = function(): boolean {
  return this.status === 'active' || this.status === 'trialing' || this.status === 'trial';
};

/**
 * Verifica se está em período de teste
 */
subscriptionSchema.methods.isOnTrial = function(): boolean {
  return this.status === 'trial' || this.status === 'trialing';
};

/**
 * Verifica se a assinatura está suspensa
 */
subscriptionSchema.methods.isSuspended = function(): boolean {
  return this.status === 'suspended';
};

/**
 * Verifica se a assinatura está cancelada
 */
subscriptionSchema.methods.isCancelled = function(): boolean {
  return this.status === 'cancelled';
};

/**
 * Verifica se a assinatura expirou
 */
subscriptionSchema.methods.isExpired = function(): boolean {
  return this.status === 'expired' || (this.endDate && new Date() > this.endDate);
};

/**
 * Verifica se o usuário pode acessar uma feature
 */
subscriptionSchema.methods.canAccessFeature = function(feature: string): boolean {
  return this.features[feature] as boolean || false;
};

/**
 * Verifica se a assinatura está em atraso
 */
subscriptionSchema.methods.isPastDue = function(): boolean {
  return this.status === 'past_due';
};

/**
 * Calcula dias restantes para expiração
 */
subscriptionSchema.methods.getDaysUntilExpiration = function(): number {
  if (!this.endDate) return 0;
  const now = new Date();
  const diff = this.endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Calcula dias restantes do trial
 */
subscriptionSchema.methods.getDaysUntilTrialEnd = function(): number {
  if (!this.trialEndDate) return 0;
  const now = new Date();
  const diff = this.trialEndDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Obtém o status de forma legível
 */
subscriptionSchema.methods.getStatusLabel = function(): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    'trial': 'Teste Gratuito',
    'active': 'Ativa',
    'past_due': 'Pagamento em Atraso',
    'suspended': 'Suspensa',
    'cancelled': 'Cancelada',
    'expired': 'Expirada',
    'pending': 'Aguardando Pagamento',
    'trialing': 'Em Teste',
  };
  return statusMap[this.status as SubscriptionStatus] || this.status;
};

/**
 * Calcula o valor total considerando usuários extras
 */
subscriptionSchema.methods.calculateTotal = function(
  basePrice: number,
  pricePerUser: number,
  userCount: number,
  maxUsers: number
): number {
  const extraUsers = Math.max(0, userCount - maxUsers);
  return basePrice + (extraUsers * pricePerUser);
};

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

subscriptionSchema.statics.findActiveByCompany = function(companyId: string) {
  return this.findOne({
    companyId,
    status: { $in: ['active', 'trial', 'trialing'] },
    endDate: { $gt: new Date() },
  }).populate('planId');
};

subscriptionSchema.statics.findByCompany = function(companyId: string) {
  return this.find({ companyId })
    .sort({ createdAt: -1 })
    .populate('planId');
};

subscriptionSchema.statics.findExpired = function() {
  return this.find({
    status: { $in: ['active', 'trial', 'trialing'] },
    endDate: { $lt: new Date() },
  });
};

subscriptionSchema.statics.findPastDue = function() {
  return this.find({
    status: 'active',
    endDate: { $lt: new Date() },
  });
};

subscriptionSchema.statics.getActiveCount = function() {
  return this.countDocuments({
    status: { $in: ['active', 'trial', 'trialing'] },
    endDate: { $gt: new Date() },
  });
};

export interface SubscriptionModel extends Model<ISubscription> {
  findActiveByCompany(companyId: string): Promise<ISubscription | null>;
  findByCompany(companyId: string): Promise<ISubscription[]>;
  findExpired(): Promise<ISubscription[]>;
  findPastDue(): Promise<ISubscription[]>;
  getActiveCount(): Promise<number>;
}

export const Subscription = mongoose.model<ISubscription, SubscriptionModel>(
  'Subscription',
  subscriptionSchema
);