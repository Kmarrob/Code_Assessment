"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/check-user.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("../config/env.js");
const User_js_1 = require("../models/User.js");
const logger_js_1 = require("../utils/logger.js");
async function checkUser() {
    try {
        await mongoose_1.default.connect(env_js_1.config.MONGODB_URI, {
            dbName: env_js_1.config.MONGODB_DB_NAME,
        });
        logger_js_1.logger.info('📦 Conectado ao MongoDB');
        // Buscar o usuário específico
        const user = await User_js_1.User.findOne({ email: 'carlos@teste.com.br' })
            .select('_id name email createdBy companyId role')
            .lean();
        if (user) {
            logger_js_1.logger.info('✅ Usuário encontrado:');
            console.log(JSON.stringify(user, null, 2));
        }
        else {
            logger_js_1.logger.warn('⚠️ Usuário não encontrado');
        }
        process.exit(0);
    }
    catch (error) {
        logger_js_1.logger.error('❌ Erro:', error);
        process.exit(1);
    }
}
checkUser();
//# sourceMappingURL=check-user.js.map