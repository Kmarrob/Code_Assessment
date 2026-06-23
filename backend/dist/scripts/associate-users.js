"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/associate-users.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("../config/env.js");
const Company_js_1 = require("../models/Company.js");
const User_js_1 = require("../models/User.js");
const logger_js_1 = require("../utils/logger.js");
async function associateUsers() {
    try {
        await mongoose_1.default.connect(env_js_1.config.MONGODB_URI, {
            dbName: env_js_1.config.MONGODB_DB_NAME,
        });
        logger_js_1.logger.info('📦 Conectado ao MongoDB');
        // Buscar empresa padrão
        const company = await Company_js_1.Company.findOne({ name: 'Empresa Padrão' });
        if (!company) {
            logger_js_1.logger.error('❌ Empresa padrão não encontrada');
            process.exit(1);
        }
        logger_js_1.logger.info(`🏢 Empresa encontrada: ${company.name} (${company._id})`);
        // Atualizar usuários sem empresa
        const result = await User_js_1.User.updateMany({ companyId: { $exists: false } }, { $set: { companyId: company._id } });
        logger_js_1.logger.info(`✅ ${result.modifiedCount} usuários associados à empresa padrão`);
        // Listar usuários atualizados
        const users = await User_js_1.User.find({ companyId: company._id })
            .select('name email role')
            .lean();
        logger_js_1.logger.info(`📋 Total de usuários na empresa: ${users.length}`);
        users.forEach((u) => {
            logger_js_1.logger.info(`  - ${u.name} (${u.email}) - ${u.role}`);
        });
        process.exit(0);
    }
    catch (error) {
        logger_js_1.logger.error('❌ Erro:', error);
        process.exit(1);
    }
}
associateUsers();
//# sourceMappingURL=associate-users.js.map