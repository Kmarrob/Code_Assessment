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

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Company } from '../models/Company.js';
import { Payment } from '../models/Payment.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';

dotenv.config();

// ============================================
// CONFIGURAÇÕES
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_assessment';

// Mapeamento de planos para preços (em centavos)
const PLAN_PRICES: Record<string, number> = {
  'basic': 1497,
  'pro': 3297,
  'enterprise': 5997
};

const PLAN_NAMES: Record<string, string> = {
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
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!');

    // ============================================
    // 1. Buscar todas as empresas ativas
    // ============================================
    
    console.log('📊 Buscando empresas...');
    const companies = await Company.find({
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
      const user = await User.findOne({
        companyId: company._id
      }).sort({ createdAt: 1 });

      if (!user) {
        console.log(`   ⚠️ Nenhum usuário encontrado para esta empresa. Pulando...`);
        continue;
      }

      console.log(`   Usuário encontrado: ${user.name} (${user.email})`);

      // Buscar assinatura da empresa
      const subscription = await Subscription.findOne({
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
        const existingPayment = await Payment.findOne({
          companyId: company._id,
          createdAt: {
            $gte: new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1),
            $lt: new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 1)
          }
        });

        // Se não existir, criar
        if (!existingPayment) {
          const payment = new Payment({
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
        } else {
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
          } else {
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

    const totalPayments = await Payment.countDocuments();
    const totalPaidResult = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    const totalPaid = totalPaidResult.length > 0 ? totalPaidResult[0].total : 0;

    console.log(`\n📊 Estatísticas finais:`);
    console.log(`   Total de registros de pagamento: ${totalPayments}`);
    console.log(`   Total pago: R$ ${(totalPaid / 100).toFixed(2)}`);

    // Listar empresas com pagamentos
    const companiesWithPayments = await Payment.aggregate([
      { $group: { _id: '$companyId', count: { $sum: 1 }, total: { $sum: '$amountPaid' } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    console.log(`\n📊 Top 10 empresas por valor pago:`);
    for (const item of companiesWithPayments) {
      const company = await Company.findById(item._id);
      if (company) {
        console.log(`   ${company.name}: ${item.count} pagamentos - R$ ${(item.total / 100).toFixed(2)}`);
      }
    }

    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB.');

  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// ============================================
// EXECUÇÃO
// ============================================

seedPayments();