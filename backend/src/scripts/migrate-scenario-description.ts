// backend/src/scripts/migrate-scenario-description.ts
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Response } from '../models/Response.js';
import { Question } from '../models/Question.js';
import { Control } from '../models/Control.js';
import { logger } from '../utils/logger.js';

async function migrateScenarioDescription() {
  try {
    // Conectar ao banco
    await mongoose.connect(config.MONGODB_URI);
    logger.info('📦 Conectado ao MongoDB');

    // Buscar todas as respostas com scenarioDescription vazio
    const responses = await Response.find({
      $or: [
        { scenarioDescription: { $eq: '' } },
        { scenarioDescription: { $exists: false } },
        { scenarioDescription: null },
      ],
    }).lean();

    logger.info(`🔍 Encontradas ${responses.length} respostas sem scenarioDescription`);

    let updated = 0;
    let errors = 0;

    for (const response of responses) {
      try {
        // Buscar o controle para obter o controlId
        const control = await Control.findById(response.controlId).lean();
        if (!control) {
          logger.warn(`⚠️ Controle não encontrado para response ${response._id}`);
          errors++;
          continue;
        }

        // Buscar a pergunta relacionada ao controle
        const question = await Question.findOne({
          controlId: control.id,
          active: true,
        }).lean();

        if (!question) {
          logger.warn(`⚠️ Pergunta não encontrada para o controle ${control.id}`);
          errors++;
          continue;
        }

        // Selecionar o texto correto baseado no maturityLevel
        const level = Number(response.maturityLevel);
        let scenarioDescription = '';

        if (level === 2) {
          scenarioDescription = question.answerImplemented || '';
        } else if (level === 1) {
          scenarioDescription = question.answerPartial || '';
        } else if (level === 0) {
          scenarioDescription = question.answerNotImplemented || '';
        }

        if (scenarioDescription) {
          // Atualizar a resposta
          await Response.updateOne(
            { _id: response._id },
            { $set: { scenarioDescription } }
          );
          updated++;
          logger.info(`✅ Atualizada resposta ${response._id} - Nível: ${level}`);
        } else {
          logger.warn(`⚠️ Texto vazio para resposta ${response._id} - Nível: ${level}`);
          errors++;
        }
      } catch (error) {
        logger.error(`❌ Erro ao processar resposta ${response._id}:`, error);
        errors++;
      }
    }

    logger.info(`📊 Resumo: ${updated} respostas atualizadas, ${errors} erros`);
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrateScenarioDescription();