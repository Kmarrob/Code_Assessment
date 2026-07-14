// backend/src/models/Payment.ts
import mongoose, { Schema, Model, Types } from 'mongoose';

/**
 * Status do pagamento
 */
export type PaymentStatus = 
  | 'pending'      // Aguardando confirmação
  | 'paid'         // Pago com sucesso
  | 'failed'       // Falhou
  | 'refunded'     // Estornado
  | 'chargeback'   // Chargeback
  | 'processing'   // Processando
  | 'cancelled'    // Cancelado
  | 'expired'      // Expirado (boleto)

/**
 * Método de pagamento
 */
export type PaymentMethod = 
  | 'credit_card'  // Cartão de crédito
  | 'boleto'       // Boleto bancário
  | 'pix'          // Pix
  | 'bank_transfer'// Transferência bancária

/**
 * Provedor de pagamento
 */
export type PaymentProvider = 
  | 'stripe'       // Stripe
  | 'pagseguro'    // PagSeguro
  | 'mercadopago'  // Mercado Pago
  | 'manual'       // Registro manual (admin)

/**
 * Tipo de transação
 */
export type TransactionType = 
  | 'subscription' // Pagamento recorrente (assinatura)
  | 'one_time'     // Pagamento único
  | 'consulting'   // Pagamento de horas de consultoria
  | 'upgrade'      // Upgrade de plano
  | 'renewal'      // Renovação

/**
 * Modelo de Pagamento
 */
export interface IPayment {
  _id: string;  // 🔴 CORRIGIDO: string em vez de mongoose.Types.ObjectId
  
  // Relacionamentos
  companyId: string | Types.ObjectId;        // Empresa que pagou
  subscriptionId?: string | Types.ObjectId;  // Assinatura relacionada (se aplicável)
  userId: string | Types.ObjectId;           // Usuário que realizou o pagamento
  
  // Valores
  amount: number;
  amountPaid: number;
  amountRefunded: number;
  currency: 'BRL' | 'USD';
  
  // Metadados do pagamento
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
  providerPaymentId?: string;
  providerSubscriptionId?: string;
  
  // Status
  status: PaymentStatus;
  statusHistory: Array<{
    status: PaymentStatus;
    changedAt: Date;
    reason?: string;
  }>;
  
  // Datas
  dueDate: Date;
  paidAt?: Date;
  processedAt?: Date;
  refundedAt?: Date;
  expiresAt?: Date;
  
  // Boleto/Pix
  boletoUrl?: string;
  boletoBarcode?: string;
  pixQrCode?: string;
  pixCopiaCola?: string;
  
  // Cartão
  cardLastDigits?: string;
  cardBrand?: string;
  
  // Período do serviço
  billingPeriod: {
    start: Date;
    end: Date;
  };
  
  // Itens do pagamento
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    type: 'plan' | 'user' | 'consulting' | 'custom';
    metadata?: Record<string, any>;
  }>;
  
  // Descontos
  discounts: Array<{
    type: 'percentage' | 'fixed';
    value: number;
    description: string;
    amount: number;
  }>;
  
  // Taxas
  fees: Array<{
    type: 'payment_gateway' | 'installment' | 'tax';
    description: string;
    amount: number;
  }>;
  
  // Metadados
  metadata?: Record<string, any>;
  notes?: string;
  
  // Dados da empresa (cache)
  companyName: string;
  companyCnpj?: string;
  
  // Dados do usuário (cache)
  userEmail: string;
  userName: string;
  
  // Webhook
  webhookReceived?: boolean;
  webhookProcessedAt?: Date;
  webhookPayload?: any;
  
  // Auditoria
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | Types.ObjectId;
  updatedBy?: string | Types.ObjectId;

  // ============================================
  // MÉTODOS DO SCHEMA
  // ============================================
  isPaid(): boolean;
  isPending(): boolean;
  isRefunded(): boolean;
  isFailed(): boolean;
  isOverdue(): boolean;
  getStatusLabel(): string;
  getPaymentMethodLabel(): string;
  getTotalWithFees(): number;
  addStatusHistory(status: PaymentStatus, reason?: string): void;
}

/**
 * Schema de status history
 */
const paymentStatusHistorySchema = new Schema({
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'chargeback', 'processing', 'cancelled', 'expired'],
    required: true,
  },
  changedAt: { type: Date, default: Date.now },
  reason: { type: String, trim: true },
}, { _id: false });

/**
 * Schema de item
 */
const paymentItemSchema = new Schema({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  type: {
    type: String,
    enum: ['plan', 'user', 'consulting', 'custom'],
    required: true,
  },
  metadata: { type: Schema.Types.Mixed },
}, { _id: false });

/**
 * Schema de desconto
 */
const paymentDiscountSchema = new Schema({
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
}, { _id: false });

/**
 * Schema de taxa
 */
const paymentFeeSchema = new Schema({
  type: {
    type: String,
    enum: ['payment_gateway', 'installment', 'tax'],
    required: true,
  },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
}, { _id: false });

/**
 * Schema de billing period
 */
const billingPeriodSchema = new Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
}, { _id: false });

const paymentSchema = new Schema<IPayment>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Valor total em centavos',
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Valor efetivamente pago em centavos',
    },
    amountRefunded: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Valor estornado em centavos',
    },
    currency: {
      type: String,
      enum: ['BRL', 'USD'],
      default: 'BRL',
    },
    transactionType: {
      type: String,
      enum: ['subscription', 'one_time', 'consulting', 'upgrade', 'renewal'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'boleto', 'pix', 'bank_transfer'],
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: ['stripe', 'pagseguro', 'mercadopago', 'manual'],
      required: true,
    },
    providerPaymentId: {
      type: String,
      trim: true,
      index: true,
    },
    providerSubscriptionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'chargeback', 'processing', 'cancelled', 'expired'],
      required: true,
      default: 'pending',
    },
    statusHistory: [paymentStatusHistorySchema],
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    processedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    boletoUrl: {
      type: String,
      trim: true,
    },
    boletoBarcode: {
      type: String,
      trim: true,
    },
    pixQrCode: {
      type: String,
      trim: true,
    },
    pixCopiaCola: {
      type: String,
      trim: true,
    },
    cardLastDigits: {
      type: String,
      trim: true,
    },
    cardBrand: {
      type: String,
      trim: true,
    },
    billingPeriod: {
      type: billingPeriodSchema,
      required: true,
    },
    items: [paymentItemSchema],
    discounts: [paymentDiscountSchema],
    fees: [paymentFeeSchema],
    metadata: {
      type: Schema.Types.Mixed,
    },
    notes: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyCnpj: {
      type: String,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    webhookReceived: {
      type: Boolean,
      default: false,
    },
    webhookProcessedAt: {
      type: Date,
    },
    webhookPayload: {
      type: Schema.Types.Mixed,
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
paymentSchema.index({ companyId: 1, status: 1 });
paymentSchema.index({ providerPaymentId: 1 }, { sparse: true });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ paidAt: 1 });
paymentSchema.index({ status: 1, dueDate: 1 });
paymentSchema.index({ companyId: 1, subscriptionId: 1 });

// ============================================
// MÉTODOS DE INSTÂNCIA
// ============================================

/**
 * Verifica se o pagamento está pago
 */
paymentSchema.methods.isPaid = function(): boolean {
  return this.status === 'paid';
};

/**
 * Verifica se o pagamento está pendente
 */
paymentSchema.methods.isPending = function(): boolean {
  return this.status === 'pending' || this.status === 'processing';
};

/**
 * Verifica se o pagamento foi estornado
 */
paymentSchema.methods.isRefunded = function(): boolean {
  return this.status === 'refunded';
};

/**
 * Verifica se o pagamento falhou
 */
paymentSchema.methods.isFailed = function(): boolean {
  return this.status === 'failed';
};

/**
 * Verifica se o pagamento está atrasado
 */
paymentSchema.methods.isOverdue = function(): boolean {
  return this.status === 'pending' && this.dueDate && new Date() > this.dueDate;
};

/**
 * Obtém o status de forma legível
 */
paymentSchema.methods.getStatusLabel = function(): string {
  const statusMap: Record<PaymentStatus, string> = {
    'pending': 'Aguardando Pagamento',
    'paid': 'Pago',
    'failed': 'Falhou',
    'refunded': 'Estornado',
    'chargeback': 'Chargeback',
    'processing': 'Processando',
    'cancelled': 'Cancelado',
    'expired': 'Expirado',
  };
  return statusMap[this.status as PaymentStatus] || this.status;
};

/**
 * Obtém o método de pagamento de forma legível
 */
paymentSchema.methods.getPaymentMethodLabel = function(): string {
  const methodMap: Record<PaymentMethod, string> = {
    'credit_card': 'Cartão de Crédito',
    'boleto': 'Boleto Bancário',
    'pix': 'Pix',
    'bank_transfer': 'Transferência Bancária',
  };
  return methodMap[this.paymentMethod as PaymentMethod] || this.paymentMethod;
};

/**
 * Obtém o valor total com desconto e taxas
 */
paymentSchema.methods.getTotalWithFees = function(): number {
  const totalItems = this.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
  const totalDiscounts = this.discounts.reduce((sum: number, d: any) => sum + d.amount, 0);
  const totalFees = this.fees.reduce((sum: number, f: any) => sum + f.amount, 0);
  return totalItems - totalDiscounts + totalFees;
};

/**
 * Adiciona status ao histórico
 */
paymentSchema.methods.addStatusHistory = function(
  status: PaymentStatus,
  reason?: string
): void {
  this.statusHistory.push({
    status,
    changedAt: new Date(),
    reason,
  });
  this.status = status;
};

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

paymentSchema.statics.findByCompany = function(companyId: string) {
  return this.find({ companyId })
    .sort({ createdAt: -1 });
};

paymentSchema.statics.findByProviderPaymentId = function(providerPaymentId: string) {
  return this.findOne({ providerPaymentId });
};

paymentSchema.statics.findPending = function() {
  return this.find({
    status: { $in: ['pending', 'processing'] },
    dueDate: { $gte: new Date() },
  });
};

paymentSchema.statics.findOverdue = function() {
  return this.find({
    status: { $in: ['pending', 'processing'] },
    dueDate: { $lt: new Date() },
  });
};

paymentSchema.statics.getTotalRevenue = function(startDate?: Date, endDate?: Date) {
  const match: any = { status: 'paid' };
  if (startDate || endDate) {
    match.paidAt = {};
    if (startDate) match.paidAt.$gte = startDate;
    if (endDate) match.paidAt.$lte = endDate;
  }
  return this.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amountPaid' } } },
  ]);
};

paymentSchema.statics.getRevenueByPeriod = function(period: 'day' | 'month' | 'year') {
  const dateFormat: Record<string, string> = {
    'day': '%Y-%m-%d',
    'month': '%Y-%m',
    'year': '%Y',
  };
  
  return this.aggregate([
    { $match: { status: 'paid' } },
    {
      $group: {
        _id: {
          $dateToString: { format: dateFormat[period], date: '$paidAt' },
        },
        total: { $sum: '$amountPaid' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

export interface PaymentModel extends Model<IPayment> {
  findByCompany(companyId: string): Promise<IPayment[]>;
  findByProviderPaymentId(providerPaymentId: string): Promise<IPayment | null>;
  findPending(): Promise<IPayment[]>;
  findOverdue(): Promise<IPayment[]>;
  getTotalRevenue(startDate?: Date, endDate?: Date): Promise<{ total: number }[]>;
  getRevenueByPeriod(period: 'day' | 'month' | 'year'): Promise<any[]>;
}

export const Payment = mongoose.model<IPayment, PaymentModel>('Payment', paymentSchema);