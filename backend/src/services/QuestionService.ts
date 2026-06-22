// backend/src/services/QuestionService.ts
import { Question, IQuestion } from '../models/Question.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class QuestionService {
  /**
   * Listar todas as perguntas
   */
  static async listQuestions(filters: {
    search?: string;
    category?: string;
    active?: boolean;
    controlId?: string;
  } = {}) {
    const filter: any = {};

    if (filters.controlId) {
      filter.controlId = filters.controlId;
    }

    if (filters.category && filters.category !== 'Todas') {
      filter.controlCategory = filters.category;
    }

    if (filters.active !== undefined) {
      filter.active = filters.active;
    }

    if (filters.search) {
      filter.$or = [
        { controlId: { $regex: filters.search, $options: 'i' } },
        { text: { $regex: filters.search, $options: 'i' } },
        { controlName: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const questions = await Question.find(filter)
      .sort({ controlId: 1, order: 1 })
      .lean();

    return questions;
  }

  /**
   * Buscar perguntas por controle
   */
  static async getQuestionsByControl(controlId: string) {
    const questions = await Question.find({
      controlId,
      active: true,
    })
      .sort({ order: 1 })
      .lean();

    return questions;
  }

  /**
   * Buscar pergunta por ID
   */
  static async getQuestionById(id: string) {
    const question = await Question.findById(id).lean();
    if (!question) {
      throw new NotFoundError('Pergunta não encontrada');
    }
    return question;
  }

  /**
   * Criar pergunta
   */
  static async createQuestion(data: Partial<IQuestion>) {
    // Verificar se já existe pergunta com mesmo controlId e ordem
    if (data.controlId && data.order) {
      const existing = await Question.findOne({
        controlId: data.controlId,
        order: data.order,
      });
      if (existing) {
        throw new ValidationError({
          order: [`Já existe uma pergunta com a ordem ${data.order} para este controle`],
        });
      }
    }

    const question = new Question(data);
    await question.save();

    logger.info(`Pergunta criada para o controle ${question.controlId}`);

    return question;
  }

  /**
   * Atualizar pergunta
   */
  static async updateQuestion(id: string, data: Partial<IQuestion>) {
    const question = await Question.findById(id);
    if (!question) {
      throw new NotFoundError('Pergunta não encontrada');
    }

    // Verificar conflito de ordem
    if (data.controlId && data.order) {
      const existing = await Question.findOne({
        controlId: data.controlId,
        order: data.order,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ValidationError({
          order: [`Já existe uma pergunta com a ordem ${data.order} para este controle`],
        });
      }
    }

    Object.assign(question, data);
    await question.save();

    logger.info(`Pergunta ${question._id} atualizada`);

    return question;
  }

  /**
   * Deletar pergunta
   */
  static async deleteQuestion(id: string) {
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      throw new NotFoundError('Pergunta não encontrada');
    }

    logger.info(`Pergunta ${question._id} deletada`);

    return question;
  }

  /**
   * Ativar/Desativar pergunta
   */
  static async toggleActive(id: string) {
    const question = await Question.findById(id);
    if (!question) {
      throw new NotFoundError('Pergunta não encontrada');
    }

    question.active = !question.active;
    await question.save();

    logger.info(`Pergunta ${question._id} ${question.active ? 'ativada' : 'desativada'}`);

    return question;
  }
}