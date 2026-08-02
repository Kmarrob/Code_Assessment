import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PlanFeature } from '../models/PlanFeature.js';
import { FeatureService } from '../services/FeatureService.js';

dotenv.config();

async function seedPlanFeatures() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_assessment';
    const dbName = process.env.MONGODB_DB_NAME || 'code_assessment';
    
    console.log(`🔗 Conectando ao MongoDB...`);
    await mongoose.connect(mongoUri, { dbName });
    console.log('✅ Conectado ao MongoDB');

    console.log('🧹 Removendo PlanFeatures existentes...');
    await PlanFeature.deleteMany({});
    console.log('✅ PlanFeatures removidas');

    console.log('📝 Inicializando features padrão...');
    await FeatureService.initializeDefaultFeatures();

    console.log('\n📋 Features criadas:');
    const features = await PlanFeature.find({}).sort({ planName: 1 });
    features.forEach((feature) => {
      console.log(`  - ${feature.planName}:`);
      console.log(`    governance: ${feature.governance ? '✅ Sim' : '❌ Não'}`);
    });

    console.log('\n✅ Seed de features concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seedPlanFeatures();