"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/migrate-scenario-description.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("../config/env.js");
const Response_js_1 = require("../models/Response.js");
const Question_js_1 = require("../models/Question.js");
const Control_js_1 = require("../models/Control.js");
const logger_js_1 = require("../utils/logger.js");
async function migrateScenarioDescription() {
    try {
        // Conectar ao banco
        await mongoose_1.default.connect(env_js_1.config.MONGODB_URI);
        logger_js_1.logger.info('📦 Conectado ao MongoDB');
        // Buscar todas as respostas com scenarioDescription vazio
        const responses = await Response_js_1.Response.find({
            $or: [
                { scenarioDescription: { $eq: '' } },
                { scenarioDescription: { $exists: false } },
                { scenarioDescription: null },
            ],
        }).lean();
        logger_js_1.logger.info(`🔍 Encontradas ${responses.length} respostas sem scenarioDescription`);
        let updated = 0;
        let errors = 0;
        for (const response of responses) {
            try {
                // Buscar o controle para obter o controlId
                const control = await Control_js_1.Control.findById(response.controlId).lean();
                if (!control) {
                    logger_js_1.logger.warn(`⚠️ Controle não encontrado para response ${response._id}`);
                    errors++;
                    continue;
                }
                // Buscar a pergunta relacionada ao controle
                const question = await Question_js_1.Question.findOne({
                    controlId: control.id,
                    active: true,
                }).lean();
                if (!question) {
                    logger_js_1.logger.warn(`⚠️ Pergunta não encontrada para o controle ${control.id}`);
                    errors++;
                    continue;
                }
                // Selecionar o texto correto baseado no maturityLevel
                const level = Number(response.maturityLevel);
                let scenarioDescription = '';
                if (level === 2) {
                    scenarioDescription = question.answerImplemented || '';
                }
                else if (level === 1) {
                    scenarioDescription = question.answerPartial || '';
                }
                else if (level === 0) {
                    scenarioDescription = question.answerNotImplemented || '';
                }
                if (scenarioDescription) {
                    // Atualizar a resposta
                    await Response_js_1.Response.updateOne({ _id: response._id }, { $set: { scenarioDescription } });
                    updated++;
                    logger_js_1.logger.info(`✅ Atualizada resposta ${response._id} - Nível: ${level}`);
                }
                else {
                    logger_js_1.logger.warn(`⚠️ Texto vazio para resposta ${response._id} - Nível: ${level}`);
                    errors++;
                }
            }
            catch (error) {
                logger_js_1.logger.error(`❌ Erro ao processar resposta ${response._id}:`, error);
                errors++;
            }
        }
        logger_js_1.logger.info(`📊 Resumo: ${updated} respostas atualizadas, ${errors} erros`);
        process.exit(0);
    }
    catch (error) {
        logger_js_1.logger.error('❌ Erro na migração:', error);
        process.exit(1);
    }
}
migrateScenarioDescription();
//# sourceMappingURL=migrate-scenario-description.js.map