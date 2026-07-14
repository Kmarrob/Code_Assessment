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
exports.Payment = void 0;
// backend/src/models/Payment.ts
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Schema de status history
 */
const paymentStatusHistorySchema = new mongoose_1.Schema({
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
const paymentItemSchema = new mongoose_1.Schema({
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    type: {
        type: String,
        enum: ['plan', 'user', 'consulting', 'custom'],
        required: true,
    },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
}, { _id: false });
/**
 * Schema de desconto
 */
const paymentDiscountSchema = new mongoose_1.Schema({
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
const paymentFeeSchema = new mongoose_1.Schema({
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
const billingPeriodSchema = new mongoose_1.Schema({
    start: { type: Date, required: true },
    end: { type: Date, required: true },
}, { _id: false });
const paymentSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true,
    },
    subscriptionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subscription',
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.Mixed,
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
        type: mongoose_1.Schema.Types.Mixed,
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
paymentSchema.methods.isPaid = function () {
    return this.status === 'paid';
};
/**
 * Verifica se o pagamento está pendente
 */
paymentSchema.methods.isPending = function () {
    return this.status === 'pending' || this.status === 'processing';
};
/**
 * Verifica se o pagamento foi estornado
 */
paymentSchema.methods.isRefunded = function () {
    return this.status === 'refunded';
};
/**
 * Verifica se o pagamento falhou
 */
paymentSchema.methods.isFailed = function () {
    return this.status === 'failed';
};
/**
 * Verifica se o pagamento está atrasado
 */
paymentSchema.methods.isOverdue = function () {
    return this.status === 'pending' && this.dueDate && new Date() > this.dueDate;
};
/**
 * Obtém o status de forma legível
 */
paymentSchema.methods.getStatusLabel = function () {
    const statusMap = {
        'pending': 'Aguardando Pagamento',
        'paid': 'Pago',
        'failed': 'Falhou',
        'refunded': 'Estornado',
        'chargeback': 'Chargeback',
        'processing': 'Processando',
        'cancelled': 'Cancelado',
        'expired': 'Expirado',
    };
    return statusMap[this.status] || this.status;
};
/**
 * Obtém o método de pagamento de forma legível
 */
paymentSchema.methods.getPaymentMethodLabel = function () {
    const methodMap = {
        'credit_card': 'Cartão de Crédito',
        'boleto': 'Boleto Bancário',
        'pix': 'Pix',
        'bank_transfer': 'Transferência Bancária',
    };
    return methodMap[this.paymentMethod] || this.paymentMethod;
};
/**
 * Obtém o valor total com desconto e taxas
 */
paymentSchema.methods.getTotalWithFees = function () {
    const totalItems = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalDiscounts = this.discounts.reduce((sum, d) => sum + d.amount, 0);
    const totalFees = this.fees.reduce((sum, f) => sum + f.amount, 0);
    return totalItems - totalDiscounts + totalFees;
};
/**
 * Adiciona status ao histórico
 */
paymentSchema.methods.addStatusHistory = function (status, reason) {
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
paymentSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId })
        .sort({ createdAt: -1 });
};
paymentSchema.statics.findByProviderPaymentId = function (providerPaymentId) {
    return this.findOne({ providerPaymentId });
};
paymentSchema.statics.findPending = function () {
    return this.find({
        status: { $in: ['pending', 'processing'] },
        dueDate: { $gte: new Date() },
    });
};
paymentSchema.statics.findOverdue = function () {
    return this.find({
        status: { $in: ['pending', 'processing'] },
        dueDate: { $lt: new Date() },
    });
};
paymentSchema.statics.getTotalRevenue = function (startDate, endDate) {
    const match = { status: 'paid' };
    if (startDate || endDate) {
        match.paidAt = {};
        if (startDate)
            match.paidAt.$gte = startDate;
        if (endDate)
            match.paidAt.$lte = endDate;
    }
    return this.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
};
paymentSchema.statics.getRevenueByPeriod = function (period) {
    const dateFormat = {
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
exports.Payment = mongoose_1.default.model('Payment', paymentSchema);
//# sourceMappingURL=Payment.js.map