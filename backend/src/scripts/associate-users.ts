// backend/src/scripts/associate-users.ts
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

async function associateUsers() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB_NAME,
    });
    
    logger.info('📦 Conectado ao MongoDB');
    
    // Buscar empresa padrão
    const company = await Company.findOne({ name: 'Empresa Padrão' });
    if (!company) {
      logger.error('❌ Empresa padrão não encontrada');
      process.exit(1);
    }
    
    logger.info(`🏢 Empresa encontrada: ${company.name} (${company._id})`);
    
    // Atualizar usuários sem empresa
    const result = await User.updateMany(
      { companyId: { $exists: false } },
      { $set: { companyId: company._id } }
    );
    
    logger.info(`✅ ${result.modifiedCount} usuários associados à empresa padrão`);
    
    // Listar usuários atualizados
    const users = await User.find({ companyId: company._id })
      .select('name email role')
      .lean();
    
    logger.info(`📋 Total de usuários na empresa: ${users.length}`);
    users.forEach((u) => {
      logger.info(`  - ${u.name} (${u.email}) - ${u.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro:', error);
    process.exit(1);
  }
}

associateUsers();