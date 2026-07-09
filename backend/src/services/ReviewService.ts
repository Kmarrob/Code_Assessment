// backend/src/services/ReviewService.ts
import mongoose from 'mongoose';
import { ReviewRequest, IReviewRequest, IAttachment } from '../models/ReviewRequest.js';
import { Response } from '../models/Response.js';
import { User } from '../models/User.js';
import { Control } from '../models/Control.js';
import { Company } from '../models/Company.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js'; // 🔴 CORREÇÃO: Import do logger adicionado
// 🔴 NOVO: Import do NotificationService
import { NotificationService } from './NotificationService.js';
import fs from 'fs/promises';
import path from 'path';

interface CreateReviewRequestDTO {
  companyId: string;
  responseId: string;
  userId: string;
  repId: string;
  controlId: string;
  justification: string;
  attachments?: IAttachment[];
}

interface UpdateReviewStatusDTO {
  reviewId: string;
  status: 'approved' | 'rejected';
  companyId: string;
  reviewNotes?: string;
}

export class ReviewService {
  
  /**
   * Cria uma nova solicitação de revisão
   */
  static async createReviewRequest(data: CreateReviewRequestDTO): Promise<IReviewRequest> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validar se a resposta existe
      const response = await Response.findById(data.responseId).session(session);
      if (!response) {
        throw new AppError('Resposta não encontrada', 404);
      }

      // 2. Validar se o usuário existe
      const user = await User.findById(data.userId).session(session);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // 3. Validar se o controle existe
      const control = await Control.findById(data.controlId).session(session);
      if (!control) {
        throw new AppError('Controle não encontrado', 404);
      }

      // 4. Validar se a empresa existe
      const company = await Company.findById(data.companyId).session(session);
      if (!company) {
        throw new AppError('Empresa não encontrada', 404);
      }

      // 5. Validar se o preposto existe e pertence à empresa
      const rep = await User.findById(data.repId).session(session);
      if (!rep || rep.role !== 'rep') {
        throw new AppError('Preposto não encontrado ou perfil inválido', 403);
      }

      // 6. Verificar se já existe uma solicitação pendente para esta resposta
      const existingRequest = await ReviewRequest.findOne({
        responseId: data.responseId,
        status: 'pending',
      }).session(session);

      if (existingRequest) {
        throw new AppError('Já existe uma solicitação de revisão pendente para esta resposta', 409);
      }

      // 7. Criar a solicitação de revisão
      const reviewRequest = new ReviewRequest({
        companyId: data.companyId,
        responseId: data.responseId,
        userId: data.userId,
        repId: data.repId,
        controlId: data.controlId,
        justification: data.justification,
        attachments: data.attachments || [],
        status: 'pending',
      });

      await reviewRequest.save({ session });
      await session.commitTransaction();

      // 🔴 NOTIFICAÇÃO: Solicitação de revisão para o usuário
      try {
        const repPopulated = await User.findById(data.repId).select('name email');
        
        await NotificationService.notifyReviewRequest(
          data.userId,
          data.companyId,
          control?.nome || 'Controle',
          control?.id || data.controlId,
          repPopulated?.name || 'Preposto',
          reviewRequest._id.toString()
        );
        
        logger.info(`📬 Notificação de revisão enviada para o usuário ${data.userId}`);
      } catch (notifyError) {
        logger.error('❌ Erro ao enviar notificação de solicitação de revisão:', notifyError);
      }

      return reviewRequest;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Busca todas as solicitações de revisão de uma empresa
   */
  static async getReviewRequestsByCompany(
    companyId: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ reviews: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const filter: any = { companyId: new mongoose.Types.ObjectId(companyId) };
    if (status) {
      filter.status = status;
    }

    const [reviews, total] = await Promise.all([
      ReviewRequest.find(filter)
        .populate('userId', 'name email')
        .populate('repId', 'name email')
        .populate('controlId', 'name id')
        .populate('responseId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewRequest.countDocuments(filter),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca solicitações de revisão por usuário
   */
  static async getReviewRequestsByUser(
    userId: string,
    companyId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ reviews: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      companyId: new mongoose.Types.ObjectId(companyId),
    };

    const [reviews, total] = await Promise.all([
      ReviewRequest.find(filter)
        .populate('repId', 'name email')
        .populate('controlId', 'name id')
        .populate('responseId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewRequest.countDocuments(filter),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca uma solicitação de revisão por ID
   */
  static async getReviewRequestById(reviewId: string, companyId: string): Promise<any | null> {
    const review = await ReviewRequest.findOne({
      _id: reviewId,
      companyId: new mongoose.Types.ObjectId(companyId),
    })
      .populate('userId', 'name email')
      .populate('repId', 'name email')
      .populate('controlId', 'name id')
      .populate('responseId')
      .lean();

    return review;
  }

  /**
   * Atualiza o status de uma solicitação de revisão
   */
  static async updateReviewStatus(data: UpdateReviewStatusDTO): Promise<IReviewRequest> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const review = await ReviewRequest.findOne({
        _id: data.reviewId,
        companyId: new mongoose.Types.ObjectId(data.companyId),
      }).session(session);

      if (!review) {
        throw new AppError('Solicitação de revisão não encontrada', 404);
      }

      if (review.status !== 'pending') {
        throw new AppError('Esta solicitação já foi respondida', 400);
      }

      review.status = data.status;
      
      if (data.reviewNotes) {
        review.reviewNotes = data.reviewNotes;
      }
      
      review.reviewedAt = new Date();
      
      await review.save({ session });
      await session.commitTransaction();

      // 🔴 NOTIFICAÇÃO: Conclusão de revisão para o usuário
      try {
        const control = await Control.findById(review.controlId);
        
        await NotificationService.notifyReviewCompleted(
          review.userId.toString(),
          data.companyId,
          control?.nome || 'Controle',
          control?.id || review.controlId,
          data.status,
          review._id.toString()
        );
        
        logger.info(`📬 Notificação de revisão ${data.status} enviada para o usuário ${review.userId}`);
      } catch (notifyError) {
        logger.error('❌ Erro ao enviar notificação de conclusão de revisão:', notifyError);
      }

      return review;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Remove uma solicitação de revisão (apenas se estiver pendente)
   */
  static async deleteReviewRequest(reviewId: string, companyId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const review = await ReviewRequest.findOne({
        _id: reviewId,
        companyId: new mongoose.Types.ObjectId(companyId),
      }).session(session);

      if (!review) {
        throw new AppError('Solicitação de revisão não encontrada', 404);
      }

      if (review.status !== 'pending') {
        throw new AppError('Não é possível excluir uma solicitação já respondida', 400);
      }

      if (review.attachments && review.attachments.length > 0) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'reviews', reviewId);
        await fs.rm(uploadDir, { recursive: true, force: true });
      }

      await ReviewRequest.deleteOne({ _id: reviewId }).session(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Adiciona anexos a uma solicitação de revisão existente
   */
  static async addAttachments(
    reviewId: string,
    companyId: string,
    attachments: IAttachment[]
  ): Promise<IReviewRequest> {
    const review = await ReviewRequest.findOne({
      _id: reviewId,
      companyId: new mongoose.Types.ObjectId(companyId),
    });

    if (!review) {
      throw new AppError('Solicitação de revisão não encontrada', 404);
    }

    if (review.status !== 'pending') {
      throw new AppError('Não é possível adicionar anexos a uma solicitação já respondida', 400);
    }

    review.attachments.push(...attachments);
    await review.save();

    return review;
  }

  /**
   * Estatísticas de solicitações de revisão
   */
  static async getReviewStats(companyId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const filter = { companyId: new mongoose.Types.ObjectId(companyId) };

    const [total, pending, approved, rejected] = await Promise.all([
      ReviewRequest.countDocuments(filter),
      ReviewRequest.countDocuments({ ...filter, status: 'pending' }),
      ReviewRequest.countDocuments({ ...filter, status: 'approved' }),
      ReviewRequest.countDocuments({ ...filter, status: 'rejected' }),
    ]);

    return { total, pending, approved, rejected };
  }
}