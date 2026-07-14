// backend/src/scripts/seed-plans.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Plan } from '../models/Plan.js';

dotenv.config();

/**
 * Dados dos planos conforme documento v26.0
 * 
 * VALORES EM CENTAVOS
 * - Básico: R$ 1.497,00/mês → 149700
 * - Pro: R$ 3.297,00/mês → 329700
 * - Enterprise: R$ 5.997,00/mês → 599700
 * - Usuário extra: R$ 297,00 → 29700
 */
const planData = [
  {
    name: 'basic',
    displayName: 'Básico',
    description: 'Ideal para pequenas empresas que estão iniciando sua jornada de compliance',
    priceMonthly: 149700,
    priceAnnual: 1497000,
    pricePerUser: 29700,
    trialDays: 7,
    isActive: true,
    isPublic: true,
    allowCustomPricing: false,
    sortOrder: 1,
    badge: 'Para começar',
    features: {
      maxUsers: 5,
      maxControls: 93,
      canViewReport: true,
      canPrintReport: true,
      canDownloadReport: true,
      canViewRoadmap: true,
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
  },
  {
    name: 'pro',
    displayName: 'Profissional',
    description: 'Perfeito para empresas em crescimento que precisam de relatórios completos',
    priceMonthly: 329700,
    priceAnnual: 3297000,
    pricePerUser: 29700,
    trialDays: 7,
    isActive: true,
    isPublic: true,
    allowCustomPricing: false,
    sortOrder: 2,
    badge: 'Mais popular',
    features: {
      maxUsers: 10,
      maxControls: 93,
      canViewReport: true,
      canPrintReport: true,
      canDownloadReport: true,
      canViewRoadmap: true,
      canViewComparative: true,
      canExportData: true,
      hasConsultingHours: true,
      consultingHours: 4,
      consultingHoursUsed: 0,
      supportPriority: 'high',
      supportHours: 'extended',
      canCustomizeBranding: false,
      canAddCustomControls: false,
      canIntegrateAPI: false,
      canIntegrateSSO: false,
    },
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'Solução completa para grandes empresas com necessidades avançadas',
    priceMonthly: 599700,
    priceAnnual: 5997000,
    pricePerUser: 29700,
    trialDays: 7,
    isActive: true,
    isPublic: true,
    allowCustomPricing: true,
    sortOrder: 3,
    badge: 'Máximo desempenho',
    features: {
      maxUsers: 0, // 0 = Ilimitado
      maxControls: 0, // 0 = Ilimitado
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
  },
];

async function seedPlans() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_assessment';
    const dbName = process.env.MONGODB_DB_NAME || 'code_assessment';
    console.log(`🔗 Conectando ao MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri, { dbName });
    console.log('✅ Conectado ao MongoDB');

    console.log('🧹 Removendo planos existentes...');
    await Plan.deleteMany({});
    console.log('✅ Planos removidos');

    console.log('📝 Inserindo novos planos...');
    const inserted = await Plan.insertMany(planData);
    console.log(`✅ ${inserted.length} planos inseridos com sucesso!`);

    console.log('\n📋 Planos criados:');
    inserted.forEach((plan) => {
      console.log(`  - ${plan.displayName} (${plan.name})`);
      console.log(`    Preço mensal: R$ ${(plan.priceMonthly / 100).toFixed(2)}`);
      console.log(`    Preço anual: R$ ${(plan.priceAnnual / 100).toFixed(2)}`);
      console.log(`    Usuários: ${plan.features.maxUsers === 0 ? 'Ilimitado' : plan.features.maxUsers}`);
      console.log(`    Trial: ${plan.trialDays} dias`);
      console.log(`    Público: ${plan.isPublic}`);
      console.log(`    ID: ${plan._id}`);
      console.log('');
    });

    console.log('✅ Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seedPlans();
