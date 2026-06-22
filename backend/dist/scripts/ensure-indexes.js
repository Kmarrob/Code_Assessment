"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/ensure-indexes.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
const User_js_1 = require("../models/User.js");
async function ensureIndexes() {
    try {
        await mongoose_1.default.connect(env_js_1.config.MONGODB_URI, {
            dbName: env_js_1.config.MONGODB_DB_NAME,
        });
        logger_js_1.logger.info('📦 Conectado ao MongoDB');
        await User_js_1.User.createIndexes();
        logger_js_1.logger.info('✅ Índices do User criados/verificados');
        const indexes = await User_js_1.User.collection.indexes();
        logger_js_1.logger.info('📋 Índices existentes:');
        indexes.forEach((index) => {
            logger_js_1.logger.info(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        process.exit(0);
    }
    catch (error) {
        logger_js_1.logger.error('❌ Erro ao criar índices:', error);
        process.exit(1);
    }
}
ensureIndexes();
//# sourceMappingURL=ensure-indexes.js.map