"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
// backend/src/models/Subscription.ts
var mongoose_1 = require("mongoose");
/**
 * Schema da Assinatura
 */
var subscriptionFeaturesSchema = new mongoose_1.Schema({
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
var changeHistorySchema = new mongoose_1.Schema({
    fromPlan: { type: String, required: true },
    toPlan: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, trim: true },
}, { _id: false });
var subscriptionSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true,
    },
    planId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.Mixed,
    },
    notes: {
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
subscriptionSchema.methods.isActive = function () {
    return this.status === 'active' || this.status === 'trialing' || this.status === 'trial';
};
/**
 * Verifica se está em período de teste
 */
subscriptionSchema.methods.isOnTrial = function () {
    return this.status === 'trial' || this.status === 'trialing';
};
/**
 * Verifica se a assinatura está suspensa
 */
subscriptionSchema.methods.isSuspended = function () {
    return this.status === 'suspended';
};
/**
 * Verifica se a assinatura está cancelada
 */
subscriptionSchema.methods.isCancelled = function () {
    return this.status === 'cancelled';
};
/**
 * Verifica se a assinatura expirou
 */
subscriptionSchema.methods.isExpired = function () {
    return this.status === 'expired' || (this.endDate && new Date() > this.endDate);
};
/**
 * Verifica se o usuário pode acessar uma feature
 */
subscriptionSchema.methods.canAccessFeature = function (feature) {
    return this.features[feature] || false;
};
/**
 * Verifica se a assinatura está em atraso
 */
subscriptionSchema.methods.isPastDue = function () {
    return this.status === 'past_due';
};
/**
 * Calcula dias restantes para expiração
 */
subscriptionSchema.methods.getDaysUntilExpiration = function () {
    if (!this.endDate)
        return 0;
    var now = new Date();
    var diff = this.endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
/**
 * Calcula dias restantes do trial
 */
subscriptionSchema.methods.getDaysUntilTrialEnd = function () {
    if (!this.trialEndDate)
        return 0;
    var now = new Date();
    var diff = this.trialEndDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
/**
 * Obtém o status de forma legível
 */
subscriptionSchema.methods.getStatusLabel = function () {
    var statusMap = {
        'trial': 'Teste Gratuito',
        'active': 'Ativa',
        'past_due': 'Pagamento em Atraso',
        'suspended': 'Suspensa',
        'cancelled': 'Cancelada',
        'expired': 'Expirada',
        'pending': 'Aguardando Pagamento',
        'trialing': 'Em Teste',
    };
    return statusMap[this.status] || this.status;
};
/**
 * Calcula o valor total considerando usuários extras
 */
subscriptionSchema.methods.calculateTotal = function (basePrice, pricePerUser, userCount, maxUsers) {
    var extraUsers = Math.max(0, userCount - maxUsers);
    return basePrice + (extraUsers * pricePerUser);
};
// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
subscriptionSchema.statics.findActiveByCompany = function (companyId) {
    return this.findOne({
        companyId: companyId,
        status: { $in: ['active', 'trial', 'trialing'] },
        endDate: { $gt: new Date() },
    }).populate('planId');
};
subscriptionSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId: companyId })
        .sort({ createdAt: -1 })
        .populate('planId');
};
subscriptionSchema.statics.findExpired = function () {
    return this.find({
        status: { $in: ['active', 'trial', 'trialing'] },
        endDate: { $lt: new Date() },
    });
};
subscriptionSchema.statics.findPastDue = function () {
    return this.find({
        status: 'active',
        endDate: { $lt: new Date() },
    });
};
subscriptionSchema.statics.getActiveCount = function () {
    return this.countDocuments({
        status: { $in: ['active', 'trial', 'trialing'] },
        endDate: { $gt: new Date() },
    });
};
exports.Subscription = mongoose_1.default.model('Subscription', subscriptionSchema);
