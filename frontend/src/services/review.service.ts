// backend/src/services/ReviewService.ts
import mongoose from 'mongoose';
import { ReviewRequest, IReviewRequest, IAttachment } from '../models/ReviewRequest.js';
import { Response } from '../models/Response.js';
import { User } from '../models/User.js';
import { Control } from '../models/Control.js';
import { Company } from '../models/Company.js';
import { AppError } from '../utils/errors.js';

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
}

export class ReviewService {
  
  static async createReviewRequest(data: CreateReviewRequestDTO): Promise<IReviewRequest> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const response = await Response.findById(data.responseId).session(session);
      if (!response) {
        throw new AppError('Resposta não encontrada', 404);
      }

      const user = await User.findById(data.userId).session(session);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const control = await Control.findById(data.controlId).session(session);
      if (!control) {
        throw new AppError('Controle não encontrado', 404);
      }

      const company = await Company.findById(data.companyId).session(session);
      if (!company) {
        throw new AppError('Empresa não encontrada', 404);
      }

      const rep = await User.findById(data.repId).session(session);
      if (!rep || rep.role !== 'rep') {
        throw new AppError('Preposto não encontrado ou perfil inválido', 403);
      }

      const existingRequest = await ReviewRequest.findOne({
        responseId: data.responseId,
        status: 'pending',
      }).session(session);

      if (existingRequest) {
        throw new AppError('Já existe uma solicitação de revisão pendente para esta resposta', 409);
      }

      const reviewRequest = new ReviewRequest({
        companyId: new mongoose.Types.ObjectId(data.companyId),
        responseId: new mongoose.Types.ObjectId(data.responseId),
        userId: new mongoose.Types.ObjectId(data.userId),
        repId: new mongoose.Types.ObjectId(data.repId),
        controlId: new mongoose.Types.ObjectId(data.controlId),
        justification: data.justification,
        attachments: data.attachments || [],
        status: 'pending',
      });

      await reviewRequest.save({ session });
      await session.commitTransaction();

      return reviewRequest;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

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

  static async getReviewRequestById(reviewId: string, companyId: string): Promise<any | null> {
    const review = await ReviewRequest.findOne({
      _id: new mongoose.Types.ObjectId(reviewId),
      companyId: new mongoose.Types.ObjectId(companyId),
    })
      .populate('userId', 'name email')
      .populate('repId', 'name email')
      .populate('controlId', 'name id')
      .populate('responseId')
      .lean();

    return review;
  }

  static async updateReviewStatus(data: UpdateReviewStatusDTO): Promise<IReviewRequest> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const review = await ReviewRequest.findOne({
        _id: new mongoose.Types.ObjectId(data.reviewId),
        companyId: new mongoose.Types.ObjectId(data.companyId),
      }).session(session);

      if (!review) {
        throw new AppError('Solicitação de revisão não encontrada', 404);
      }

      if (review.status !== 'pending') {
        throw new AppError('Esta solicitação já foi respondida', 400);
      }

      review.status = data.status;
      await review.save({ session });
      await session.commitTransaction();

      return review;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async deleteReviewRequest(reviewId: string, companyId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const review = await ReviewRequest.findOne({
        _id: new mongoose.Types.ObjectId(reviewId),
        companyId: new mongoose.Types.ObjectId(companyId),
      }).session(session);

      if (!review) {
        throw new AppError('Solicitação de revisão não encontrada', 404);
      }

      if (review.status !== 'pending') {
        throw new AppError('Não é possível excluir uma solicitação já respondida', 400);
      }

      await ReviewRequest.deleteOne({ _id: new mongoose.Types.ObjectId(reviewId) }).session(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async addAttachments(
    reviewId: string,
    companyId: string,
    attachments: IAttachment[]
  ): Promise<IReviewRequest> {
    const review = await ReviewRequest.findOne({
      _id: new mongoose.Types.ObjectId(reviewId),
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

  // 🔴 MÉTODO ADICIONADO - Estatísticas
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