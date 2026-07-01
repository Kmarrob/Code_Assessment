// backend/src/services/UserService.ts
import { Assignment } from '../models/Assignment.js';
import { Response } from '../models/Response.js';
import { User } from '../models/User.js';
import { Question } from '../models/Question.js';
import { Control } from '../models/Control.js'; // 🔴 NOVO
import { NotFoundError, AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { ResponseStatus, MaturityLevel } from '../types/index.js';

export class UserService {
  /**
   * Obter controles atribuídos ao usuário
   */
  static async getUserControls(userId: string) {
    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Buscar todas as atribuições do usuário
    const assignments = await Assignment.find({ userId })
      .populate({
        path: 'controlId',
        select: '_id id nome dominioDeSI tipoDeControle nota',
      })
      .populate({
        path: 'assignedBy',
        select: 'name email',
      })
      .sort({ assignedAt: -1 })
      .lean();

    // Buscar respostas do usuário
    const responses = await Response.find({ userId })
      .populate('controlId', 'id nome')
      .lean();

    // Mapear respostas por assignmentId
    const responseMap = new Map();
    responses.forEach((r) => {
      responseMap.set(r.assignmentId.toString(), r);
    });

    // Montar resultado
    const controls = assignments.map((assignment) => ({
      assignmentId: assignment._id,
      control: assignment.controlId,
      assignedBy: assignment.assignedBy,
      assignedAt: assignment.assignedAt,
      status: assignment.status,
      response: responseMap.get(assignment._id.toString()) || null,
    }));

    return controls;
  }

  /**
   * Obter estatísticas do usuário
   */
  static async getUserStats(userId: string) {
    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Buscar todas as atribuições do usuário
    const assignments = await Assignment.find({ userId });
    const total = assignments.length;

    // Buscar respostas do usuário
    const responses = await Response.find({ userId });
    const completed = responses.length;

    // Calcular estatísticas por status
    const pending = assignments.filter(
      (a) => a.status === ResponseStatus.PENDING
    ).length;

    const inProgress = assignments.filter(
      (a) => a.status === ResponseStatus.IN_PROGRESS
    ).length;

    return {
      total,
      completed,
      pending,
      inProgress,
    };
  }

  /**
   * Salvar resposta de um controle com automação do scenarioDescription
   */
  static async saveResponse(
    userId: string,
    data: {
      assignmentId: string;
      maturityLevel: MaturityLevel;
      scenarioDescription?: string;
      evidence?: string | string[];
      notes?: string;
    }
  ) {
    const { assignmentId, maturityLevel, scenarioDescription, evidence, notes } = data;

    // Verificar se a atribuição existe e pertence ao usuário
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      userId,
    });

    if (!assignment) {
      throw new AppError('Atribuição não encontrada ou não pertence ao usuário', 404);
    }

    // Buscar o usuário para obter o companyId
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const companyId = user.companyId;

    // Converter evidence para string se for array
    let evidenceString = '';
    if (evidence) {
      if (Array.isArray(evidence)) {
        evidenceString = evidence.join(', ');
      } else {
        evidenceString = evidence;
      }
    }

    // 🔴 AUTOMAÇÃO CORRIGIDA: Buscar o controle para obter o 'id' (string)
    let autoScenarioDescription = scenarioDescription || '';

    if (!scenarioDescription || scenarioDescription.trim() === '') {
      try {
        // 🔴 BUSCAR O CONTROLE PRIMEIRO
        const control = await Control.findById(assignment.controlId);
        if (!control) {
          logger.warn(`⚠️ Controle não encontrado para o assignment ${assignmentId}`);
        } else {
          // 🔴 USAR O CAMPO 'id' DO CONTROLE (STRING) PARA BUSCAR A PERGUNTA
          const question = await Question.findOne({ 
            controlId: control.id,
            active: true 
          });

          if (question) {
            const level = Number(maturityLevel);
            if (level === 2) {
              autoScenarioDescription = question.answerImplemented || '';
            } else if (level === 1) {
              autoScenarioDescription = question.answerPartial || '';
            } else if (level === 0) {
              autoScenarioDescription = question.answerNotImplemented || '';
            }
            
            logger.info(`🔍 Descrição automática preenchida para controle ${control.id} - Nível: ${level}`);
          } else {
            logger.warn(`⚠️ Pergunta não encontrada para o controle ${control.id}`);
          }
        }
      } catch (error) {
        logger.error(`❌ Erro ao buscar pergunta para o controle ${assignment.controlId}:`, error);
        autoScenarioDescription = scenarioDescription || '';
      }
    }

    // Verificar se já existe uma resposta
    let response = await Response.findOne({ assignmentId });

    if (response) {
      // Atualizar resposta existente
      response.maturityLevel = maturityLevel;
      response.scenarioDescription = autoScenarioDescription;
      response.evidence = evidenceString ? [evidenceString] : [];
      response.observations = notes || '';
      await response.save();
    } else {
      // Criar nova resposta com companyId
      response = new Response({
        assignmentId,
        userId,
        controlId: assignment.controlId,
        companyId: companyId,
        maturityLevel,
        scenarioDescription: autoScenarioDescription,
        evidence: evidenceString ? [evidenceString] : [],
        observations: notes || '',
        submittedAt: new Date(),
      });
      await response.save();

      // Atualizar status da atribuição
      assignment.status = ResponseStatus.COMPLETED;
      await assignment.save();
    }

    logger.info(`Resposta salva para o usuário ${userId} - Controle: ${assignment.controlId}`);

    return response;
  }

  /**
   * Obter progresso do usuário
   */
  static async getUserProgress(userId: string) {
    const controls = await this.getUserControls(userId);
    const stats = await this.getUserStats(userId);

    return {
      stats,
      controls,
    };
  }
}