// backend/src/controllers/QuestionController.ts
import { Response, NextFunction } from 'express';
import { QuestionService } from '../services/QuestionService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const questionSchema = z.object({
  controlId: z.string().min(1, 'ID do controle é obrigatório'),
  controlName: z.string().optional(),
  controlCategory: z.string().optional(),
  text: z.string().min(1, 'Pergunta é obrigatória'),
  objective: z.string().optional(),
  answerImplemented: z.string().optional(),
  answerPartial: z.string().optional(),
  answerNotImplemented: z.string().optional(),
  guidance: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentName: z.string().optional(),
  order: z.number().optional(),
  active: z.boolean().optional(),
});

export class QuestionController {
  /**
   * Listar perguntas
   */
  static async listQuestions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { search, category, active, controlId } = req.query;

      const questions = await QuestionService.listQuestions({
        search: search as string,
        category: category as string,
        active: active ? active === 'true' : undefined,
        controlId: controlId as string,
      });

      res.json({
        success: true,
        data: questions,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar perguntas por controle
   */
  static async getQuestionsByControl(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { controlId } = req.params;

      if (!controlId) {
        throw new AppError('ID do controle é obrigatório', 400);
      }

      const questions = await QuestionService.getQuestionsByControl(controlId);

      res.json({
        success: true,
        data: questions,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar pergunta por ID
   */
  static async getQuestionById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('ID da pergunta é obrigatório', 400);
      }

      const question = await QuestionService.getQuestionById(id);

      res.json({
        success: true,
        data: question,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar pergunta
   */
  static async createQuestion(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedData = questionSchema.parse(req.body);

      const question = await QuestionService.createQuestion(validatedData);

      logger.info(`Pergunta criada por ${req.user?.email}`);

      res.status(201).json({
        success: true,
        message: 'Pergunta criada com sucesso',
        data: question,
        statusCode: 201,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors,
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Atualizar pergunta
   */
  static async updateQuestion(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('ID da pergunta é obrigatório', 400);
      }

      const validatedData = questionSchema.partial().parse(req.body);

      const question = await QuestionService.updateQuestion(id, validatedData);

      logger.info(`Pergunta ${id} atualizada por ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Pergunta atualizada com sucesso',
        data: question,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors,
          statusCode: 400,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Deletar pergunta
   */
  static async deleteQuestion(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('ID da pergunta é obrigatório', 400);
      }

      await QuestionService.deleteQuestion(id);

      logger.info(`Pergunta ${id} deletada por ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Pergunta deletada com sucesso',
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ativar/Desativar pergunta
   */
  static async toggleActive(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('ID da pergunta é obrigatório', 400);
      }

      const question = await QuestionService.toggleActive(id);

      logger.info(`Pergunta ${id} ${question.active ? 'ativada' : 'desativada'} por ${req.user?.email}`);

      res.json({
        success: true,
        message: `Pergunta ${question.active ? 'ativada' : 'desativada'} com sucesso`,
        data: question,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}