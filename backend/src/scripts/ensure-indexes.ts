// backend/src/scripts/ensure-indexes.ts
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';

async function ensureIndexes() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB_NAME,
    });

    logger.info('📦 Conectado ao MongoDB');

    await User.createIndexes();
    logger.info('✅ Índices do User criados/verificados');

    const indexes = await User.collection.indexes();
    logger.info('📋 Índices existentes:');
    indexes.forEach((index) => {
      logger.info(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro ao criar índices:', error);
    process.exit(1);
  }
}

ensureIndexes();
