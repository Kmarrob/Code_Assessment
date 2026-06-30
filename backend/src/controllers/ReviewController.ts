// backend/src/controllers/ReviewController.ts
import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/ReviewService.js';
import { AppError } from '../utils/errors.js';
import { IAttachment } from '../models/ReviewRequest.js';

export class ReviewController {
  
  /**
   * Criar uma nova solicitação de revisão
   * POST /api/review
   */
  static async createReviewRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        responseId, 
        userId, 
        controlId, 
        justification,
        attachments 
      } = req.body;

      const companyId = req.user?.companyId || req.body.companyId;
      const repId = req.user?.id;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      if (!repId) {
        throw new AppError('Preposto não identificado', 401);
      }

      // Validar campos obrigatórios
      if (!responseId || !userId || !controlId || !justification) {
        throw new AppError('Campos obrigatórios: responseId, userId, controlId, justification', 400);
      }

      if (justification.length < 10) {
        throw new AppError('A justificativa deve ter no mínimo 10 caracteres', 400);
      }

      const review = await ReviewService.createReviewRequest({
        companyId,
        responseId,
        userId,
        repId,
        controlId,
        justification,
        attachments: attachments || [],
      });

      res.status(201).json({
        success: true,
        data: review,
        message: 'Solicitação de revisão criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar solicitações de revisão da empresa
   * GET /api/review
   */
  static async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || req.query.companyId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      const result = await ReviewService.getReviewRequestsByCompany(
        companyId,
        page,
        limit,
        status
      );

      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: {
          page: result.page,
          total: result.total,
          totalPages: result.totalPages,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar solicitações de revisão por usuário
   * GET /api/review/user/:userId
   */
  static async getReviewsByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const companyId = req.user?.companyId || req.query.companyId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      const result = await ReviewService.getReviewRequestsByUser(
        userId,
        companyId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: {
          page: result.page,
          total: result.total,
          totalPages: result.totalPages,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar uma solicitação de revisão por ID
   * GET /api/review/:reviewId
   */
  static async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const companyId = req.user?.companyId || req.query.companyId as string;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      const review = await ReviewService.getReviewRequestById(reviewId, companyId);

      if (!review) {
        throw new AppError('Solicitação de revisão não encontrada', 404);
      }

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar status de uma solicitação de revisão
   * PATCH /api/review/:reviewId/status
   */
  static async updateReviewStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const { status } = req.body;
      const companyId = req.user?.companyId || req.body.companyId;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      if (!status || !['approved', 'rejected'].includes(status)) {
        throw new AppError('Status inválido. Use "approved" ou "rejected"', 400);
      }

      const review = await ReviewService.updateReviewStatus({
        reviewId,
        status,
        companyId,
      });

      res.status(200).json({
        success: true,
        data: review,
        message: `Solicitação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excluir uma solicitação de revisão (apenas se pendente)
   * DELETE /api/review/:reviewId
   */
  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const companyId = req.user?.companyId || req.query.companyId as string;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      await ReviewService.deleteReviewRequest(reviewId, companyId);

      res.status(200).json({
        success: true,
        message: 'Solicitação de revisão excluída com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adicionar anexos a uma solicitação de revisão existente
   * POST /api/review/:reviewId/attachments
   */
  static async addAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const companyId = req.user?.companyId || req.body.companyId;
      const attachments = req.body.attachments as IAttachment[];

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      if (!attachments || attachments.length === 0) {
        throw new AppError('Nenhum anexo enviado', 400);
      }

      const review = await ReviewService.addAttachments(
        reviewId,
        companyId,
        attachments
      );

      res.status(200).json({
        success: true,
        data: review,
        message: 'Anexos adicionados com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Estatísticas de solicitações de revisão da empresa
   * GET /api/review/stats
   */
  static async getReviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.user?.companyId || req.query.companyId as string;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      const stats = await ReviewService.getReviewStats(companyId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}