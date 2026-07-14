import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_assessment';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    const { Plan } = await import('./src/models/Plan.js');

    const count = await Plan.countDocuments();
    console.log('📊 Total de planos no banco:', count);

    const plans = await Plan.find({});
    console.log('📋 Planos:', plans.map(p => ({ name: p.name, displayName: p.displayName, isPublic: p.isPublic })));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
})();
