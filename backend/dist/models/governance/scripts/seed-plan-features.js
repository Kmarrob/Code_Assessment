"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const PlanFeature_js_1 = require("../models/PlanFeature.js");
const FeatureService_js_1 = require("../services/FeatureService.js");
dotenv_1.default.config();
async function seedPlanFeatures() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_assessment';
        const dbName = process.env.MONGODB_DB_NAME || 'code_assessment';
        console.log(`🔗 Conectando ao MongoDB...`);
        await mongoose_1.default.connect(mongoUri, { dbName });
        console.log('✅ Conectado ao MongoDB');
        console.log('🧹 Removendo PlanFeatures existentes...');
        await PlanFeature_js_1.PlanFeature.deleteMany({});
        console.log('✅ PlanFeatures removidas');
        console.log('📝 Inicializando features padrão...');
        await FeatureService_js_1.FeatureService.initializeDefaultFeatures();
        console.log('\n📋 Features criadas:');
        const features = await PlanFeature_js_1.PlanFeature.find({}).sort({ planName: 1 });
        features.forEach((feature) => {
            console.log(`  - ${feature.planName}:`);
            console.log(`    governance: ${feature.governance ? '✅ Sim' : '❌ Não'}`);
        });
        console.log('\n✅ Seed de features concluído com sucesso!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erro ao executar seed:', error);
        process.exit(1);
    }
}
seedPlanFeatures();
//# sourceMappingURL=seed-plan-features.js.map