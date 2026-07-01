// backend/src/controllers/ReviewController.ts
import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/ReviewService.js';
import { AppError } from '../utils/errors.js';
import { IAttachment } from '../models/ReviewRequest.js';
import { emailService } from '../services/EmailService.js'; // 🔴 NOVO IMPORT
import { User } from '../models/User.js'; // 🔴 NOVO IMPORT
import { Control } from '../models/Control.js'; // 🔴 NOVO IMPORT
import { Response as ResponseModel } from '../models/Response.js'; // 🔴 NOVO IMPORT

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
      const repName = req.user?.name || 'Preposto';

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

      // 🔴 NOVO: Buscar dados para enviar e-mail ao usuário
      try {
        // Buscar usuário
        const user = await User.findById(userId).select('name email');
        // Buscar controle
        const control = await Control.findById(controlId).select('id name');
        // Buscar resposta
        const response = await ResponseModel.findById(responseId).select('maturityLevel');

        if (user && user.email && control) {
          const maturityLabels: Record<string, string> = {
            '0': 'Não Implementado',
            '1': 'Parcialmente Implementado',
            '2': 'Totalmente Implementado',
          };
          const maturityLabel = response?.maturityLevel 
            ? maturityLabels[response.maturityLevel.toString()] || response.maturityLevel 
            : 'Não informado';

          const loginLink = process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com/login';

          await emailService.sendReviewRequestEmail({
            to: user.email,
            userName: user.name || 'Usuário',
            controlName: control.name || 'Controle',
            controlId: control.id || controlId,
            repName: repName,
            justification: justification,
            companyName: req.user?.companyId || 'Empresa',
            loginLink: `${loginLink}?redirect=/user/dashboard&reviewId=${review._id}`,
          });
        }
      } catch (emailError) {
        // Não interrompe o fluxo se o e-mail falhar
        console.error('❌ Erro ao enviar e-mail de notificação:', emailError);
      }

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
      const { status, reviewNotes } = req.body;
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

      // 🔴 NOVO: Buscar dados para enviar e-mail ao preposto
      try {
        // Buscar preposto (quem criou a solicitação)
        const rep = await User.findById(review.repId).select('name email');
        // Buscar usuário que respondeu
        const user = await User.findById(review.userId).select('name');
        // Buscar controle
        const control = await Control.findById(review.controlId).select('id name');
        // Buscar resposta
        const response = await ResponseModel.findById(review.responseId).select('maturityLevel');

        if (rep && rep.email && control) {
          const statusLabel = status === 'approved' ? 'Aprovada ✅' : 'Rejeitada ❌';
          const maturityLabels: Record<string, string> = {
            '0': 'Não Implementado',
            '1': 'Parcialmente Implementado',
            '2': 'Totalmente Implementado',
          };
          const maturityLabel = response?.maturityLevel 
            ? maturityLabels[response.maturityLevel.toString()] || response.maturityLevel 
            : 'Não informado';

          const loginLink = process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com/login';

          await emailService.sendReviewCompletedEmail({
            to: rep.email,
            repName: rep.name || 'Preposto',
            userName: user?.name || 'Usuário',
            controlName: control.name || 'Controle',
            controlId: control.id || review.controlId,
            status: status,
            statusLabel: statusLabel,
            reviewNotes: reviewNotes || `Nível de maturidade: ${maturityLabel}`,
            companyName: companyId.toString(),
            loginLink: `${loginLink}?redirect=/rep/responses&reviewId=${review._id}`,
          });
        }
      } catch (emailError) {
        // Não interrompe o fluxo se o e-mail falhar
        console.error('❌ Erro ao enviar e-mail de notificação:', emailError);
      }

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