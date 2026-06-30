// backend/src/controllers/ReviewController.ts
import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/ReviewService.js';
import { AppError } from '../utils/errors.js';
import { IAttachment } from '../models/ReviewRequest.js';

// 🔴 EXTENDER O TIPO REQUEST PARA INCLUIR USER
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId: string;
    role: string;
    name: string;
    email: string;
  };
}

export class ReviewController {
  
  static async createReviewRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

  static async getReviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

  static async getReviewsByUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const companyId = req.user?.companyId || req.query.companyId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      if (!userId) {
        throw new AppError('ID do usuário é obrigatório', 400);
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

  static async getReviewById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const companyId = req.user?.companyId || req.query.companyId as string;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      if (!reviewId) {
        throw new AppError('ID da solicitação é obrigatório', 400);
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

  static async updateReviewStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const { status } = req.body;
      const companyId = req.user?.companyId || req.body.companyId;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      if (!reviewId) {
        throw new AppError('ID da solicitação é obrigatório', 400);
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

  static async deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const companyId = req.user?.companyId || req.query.companyId as string;

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      if (!reviewId) {
        throw new AppError('ID da solicitação é obrigatório', 400);
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

  static async addAttachments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const companyId = req.user?.companyId || req.body.companyId;
      const attachments = req.body.attachments as IAttachment[];

      if (!companyId) {
        throw new AppError('Empresa não identificada', 400);
      }

      if (!reviewId) {
        throw new AppError('ID da solicitação é obrigatório', 400);
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

  static async getReviewStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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