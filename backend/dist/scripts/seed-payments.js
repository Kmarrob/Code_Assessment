"use strict";
/**
 * ============================================
 * SCRIPT: POPULAR PAGAMENTOS HISTÓRICOS
 * ============================================
 *
 * Este script cria registros de pagamento para cada empresa
 * baseado no plano e data de criação.
 *
 * @module seed-payments
 * @since v32.0
 *
 * Como executar:
 * npx ts-node src/scripts/seed-payments.ts
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const Company_js_1 = require("../models/Company.js");
const Payment_js_1 = require("../models/Payment.js");
const Subscription_js_1 = require("../models/Subscription.js");
const User_js_1 = require("../models/User.js");
dotenv.config();
// ============================================
// CONFIGURAÇÕES
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_assessment';
// Mapeamento de planos para preços (em centavos)
const PLAN_PRICES = {
    'basic': 1497,
    'pro': 3297,
    'enterprise': 5997
};
const PLAN_NAMES = {
    'basic': 'Básico',
    'pro': 'Profissional',
    'enterprise': 'Enterprise'
};
// ============================================
// FUNÇÃO PRINCIPAL
// ============================================
async function seedPayments() {
    console.log('🚀 Iniciando script de popular pagamentos...');
    console.log('📊 Conectando ao MongoDB...');
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Conectado ao MongoDB com sucesso!');
        // ============================================
        // 1. Buscar todas as empresas ativas
        // ============================================
        console.log('📊 Buscando empresas...');
        const companies = await Company_js_1.Company.find({
            status: { $in: ['active'] }
        });
        console.log(`📊 Encontradas ${companies.length} empresas ativas.`);
        let totalPaymentsCreated = 0;
        let totalPaymentsUpdated = 0;
        // ============================================
        // 2. Para cada empresa, criar pagamentos históricos
        // ============================================
        for (const company of companies) {
            console.log(`\n📊 Processando empresa: ${company.name} (${company._id})`);
            console.log(`   Plano: ${company.plan}, Criada em: ${company.createdAt}`);
            // Buscar o primeiro usuário da empresa (para preencher userId, userEmail, userName)
            const user = await User_js_1.User.findOne({
                companyId: company._id
            }).sort({ createdAt: 1 });
            if (!user) {
                console.log(`   ⚠️ Nenhum usuário encontrado para esta empresa. Pulando...`);
                continue;
            }
            console.log(`   Usuário encontrado: ${user.name} (${user.email})`);
            // Buscar assinatura da empresa
            const subscription = await Subscription_js_1.Subscription.findOne({
                companyId: company._id,
                status: { $in: ['active', 'trialing'] }
            }).sort({ createdAt: -1 });
            // Determinar o plano e preço
            const planKey = company.plan?.toLowerCase() || 'basic';
            const price = PLAN_PRICES[planKey] || 1497;
            const planDisplayName = PLAN_NAMES[planKey] || 'Básico';
            console.log(`   Preço mensal: R$ ${(price / 100).toFixed(2)}`);
            // Data de início (usa a data da empresa ou da assinatura)
            const startDate = subscription?.startDate || company.createdAt;
            const now = new Date();
            console.log(`   Data de início: ${startDate}`);
            // Calcular quantos meses de pagamento já passaram
            const startDateObj = new Date(startDate);
            let currentDate = new Date(startDateObj);
            currentDate.setDate(1); // Primeiro dia do mês
            let paymentsCreated = 0;
            let paymentsUpdated = 0;
            // ============================================
            // 3. Criar pagamento para cada mês desde o início
            // ============================================
            while (currentDate <= now) {
                const paymentDate = new Date(currentDate);
                // Verificar se já existe pagamento para este mês
                const existingPayment = await Payment_js_1.Payment.findOne({
                    companyId: company._id,
                    createdAt: {
                        $gte: new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1),
                        $lt: new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 1)
                    }
                });
                // Se não existir, criar
                if (!existingPayment) {
                    const payment = new Payment_js_1.Payment({
                        companyId: company._id,
                        subscriptionId: subscription?._id || null,
                        userId: user._id,
                        amount: price,
                        amountPaid: price,
                        amountRefunded: 0,
                        currency: 'BRL',
                        transactionType: 'subscription',
                        paymentMethod: 'boleto',
                        paymentProvider: 'manual',
                        status: 'paid',
                        statusHistory: [
                            {
                                status: 'paid',
                                changedAt: paymentDate,
                                reason: 'Pagamento histórico gerado automaticamente'
                            }
                        ],
                        dueDate: new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 1),
                        paidAt: paymentDate,
                        processedAt: paymentDate,
                        billingPeriod: {
                            start: new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1),
                            end: new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 1)
                        },
                        items: [
                            {
                                description: `Plano ${planDisplayName} - ${paymentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
                                quantity: 1,
                                unitPrice: price,
                                totalPrice: price,
                                type: 'plan'
                            }
                        ],
                        discounts: [],
                        fees: [],
                        companyName: company.name,
                        companyCnpj: company.cnpj || '',
                        userEmail: user.email || '',
                        userName: user.name || '',
                        metadata: {
                            generatedBy: 'seed-payments-script',
                            generatedAt: new Date(),
                            month: paymentDate.getMonth() + 1,
                            year: paymentDate.getFullYear(),
                            isHistorical: true
                        },
                        notes: 'Pagamento gerado automaticamente pelo script de seed',
                        createdBy: company.createdBy || null,
                        createdAt: paymentDate,
                        updatedAt: paymentDate
                    });
                    await payment.save();
                    paymentsCreated++;
                    console.log(`   ✅ Criado pagamento: ${paymentDate.toLocaleDateString('pt-BR')} - R$ ${(price / 100).toFixed(2)}`);
                }
                else {
                    // Verificar se o pagamento está com status correto
                    if (existingPayment.status !== 'paid') {
                        existingPayment.status = 'paid';
                        existingPayment.paidAt = paymentDate;
                        existingPayment.processedAt = paymentDate;
                        existingPayment.amountPaid = existingPayment.amount;
                        existingPayment.addStatusHistory('paid', 'Status atualizado pelo script de seed');
                        await existingPayment.save();
                        paymentsUpdated++;
                        console.log(`   🔄 Atualizado pagamento: ${paymentDate.toLocaleDateString('pt-BR')} - status alterado para 'paid'`);
                    }
                    else {
                        console.log(`   ⏳ Pagamento já existe: ${paymentDate.toLocaleDateString('pt-BR')}`);
                    }
                }
                // Avançar para o próximo mês
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            console.log(`   📊 Total: ${paymentsCreated} criados, ${paymentsUpdated} atualizados`);
            totalPaymentsCreated += paymentsCreated;
            totalPaymentsUpdated += paymentsUpdated;
        }
        // ============================================
        // 4. Resumo final
        // ============================================
        console.log('\n✅ SCRIPT CONCLUÍDO COM SUCESSO!');
        console.log(`📊 Total de pagamentos criados: ${totalPaymentsCreated}`);
        console.log(`📊 Total de pagamentos atualizados: ${totalPaymentsUpdated}`);
        // ============================================
        // 5. Estatísticas finais
        // ============================================
        const totalPayments = await Payment_js_1.Payment.countDocuments();
        const totalPaidResult = await Payment_js_1.Payment.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
        ]);
        const totalPaid = totalPaidResult.length > 0 ? totalPaidResult[0].total : 0;
        console.log(`\n📊 Estatísticas finais:`);
        console.log(`   Total de registros de pagamento: ${totalPayments}`);
        console.log(`   Total pago: R$ ${(totalPaid / 100).toFixed(2)}`);
        // Listar empresas com pagamentos
        const companiesWithPayments = await Payment_js_1.Payment.aggregate([
            { $group: { _id: '$companyId', count: { $sum: 1 }, total: { $sum: '$amountPaid' } } },
            { $sort: { total: -1 } },
            { $limit: 10 }
        ]);
        console.log(`\n📊 Top 10 empresas por valor pago:`);
        for (const item of companiesWithPayments) {
            const company = await Company_js_1.Company.findById(item._id);
            if (company) {
                console.log(`   ${company.name}: ${item.count} pagamentos - R$ ${(item.total / 100).toFixed(2)}`);
            }
        }
        await mongoose_1.default.disconnect();
        console.log('🔌 Desconectado do MongoDB.');
    }
    catch (error) {
        console.error('❌ Erro ao executar script:', error);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
}
// ============================================
// EXECUÇÃO
// ============================================
seedPayments();
//# sourceMappingURL=seed-payments.js.map