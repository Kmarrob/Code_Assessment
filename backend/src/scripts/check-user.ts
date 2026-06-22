// backend/src/scripts/check-user.ts
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

async function checkUser() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB_NAME,
    });
    
    logger.info('📦 Conectado ao MongoDB');
    
    // Buscar o usuário específico
    const user = await User.findOne({ email: 'carlos@teste.com.br' })
      .select('_id name email createdBy companyId role')
      .lean();
    
    if (user) {
      logger.info('✅ Usuário encontrado:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      logger.warn('⚠️ Usuário não encontrado');
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkUser();
