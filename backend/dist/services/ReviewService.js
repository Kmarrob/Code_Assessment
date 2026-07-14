"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
// backend/src/services/ReviewService.ts
const mongoose_1 = __importDefault(require("mongoose"));
const ReviewRequest_js_1 = require("../models/ReviewRequest.js");
const Response_js_1 = require("../models/Response.js");
const User_js_1 = require("../models/User.js");
const Control_js_1 = require("../models/Control.js");
const Company_js_1 = require("../models/Company.js");
const errors_js_1 = require("../utils/errors.js");
const logger_js_1 = require("../utils/logger.js"); // 🔴 CORREÇÃO: Import do logger adicionado
// 🔴 NOVO: Import do NotificationService
const NotificationService_js_1 = require("./NotificationService.js");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class ReviewService {
    /**
     * Cria uma nova solicitação de revisão
     */
    static async createReviewRequest(data) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // 1. Validar se a resposta existe
            const response = await Response_js_1.Response.findById(data.responseId).session(session);
            if (!response) {
                throw new errors_js_1.AppError('Resposta não encontrada', 404);
            }
            // 2. Validar se o usuário existe
            const user = await User_js_1.User.findById(data.userId).session(session);
            if (!user) {
                throw new errors_js_1.AppError('Usuário não encontrado', 404);
            }
            // 3. Validar se o controle existe
            const control = await Control_js_1.Control.findById(data.controlId).session(session);
            if (!control) {
                throw new errors_js_1.AppError('Controle não encontrado', 404);
            }
            // 4. Validar se a empresa existe
            const company = await Company_js_1.Company.findById(data.companyId).session(session);
            if (!company) {
                throw new errors_js_1.AppError('Empresa não encontrada', 404);
            }
            // 5. Validar se o preposto existe e pertence à empresa
            const rep = await User_js_1.User.findById(data.repId).session(session);
            if (!rep || rep.role !== 'rep') {
                throw new errors_js_1.AppError('Preposto não encontrado ou perfil inválido', 403);
            }
            // 6. Verificar se já existe uma solicitação pendente para esta resposta
            const existingRequest = await ReviewRequest_js_1.ReviewRequest.findOne({
                responseId: data.responseId,
                status: 'pending',
            }).session(session);
            if (existingRequest) {
                throw new errors_js_1.AppError('Já existe uma solicitação de revisão pendente para esta resposta', 409);
            }
            // 7. Criar a solicitação de revisão
            const reviewRequest = new ReviewRequest_js_1.ReviewRequest({
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
                const repPopulated = await User_js_1.User.findById(data.repId).select('name email');
                await NotificationService_js_1.NotificationService.notifyReviewRequest(data.userId, data.companyId, control?.nome || 'Controle', control?.id || data.controlId, repPopulated?.name || 'Preposto', reviewRequest._id.toString());
                logger_js_1.logger.info(`📬 Notificação de revisão enviada para o usuário ${data.userId}`);
            }
            catch (notifyError) {
                logger_js_1.logger.error('❌ Erro ao enviar notificação de solicitação de revisão:', notifyError);
            }
            return reviewRequest;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    /**
     * Busca todas as solicitações de revisão de uma empresa
     */
    static async getReviewRequestsByCompany(companyId, page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const filter = { companyId: new mongoose_1.default.Types.ObjectId(companyId) };
        if (status) {
            filter.status = status;
        }
        const [reviews, total] = await Promise.all([
            ReviewRequest_js_1.ReviewRequest.find(filter)
                .populate('userId', 'name email')
                .populate('repId', 'name email')
                .populate('controlId', 'name id')
                .populate('responseId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ReviewRequest_js_1.ReviewRequest.countDocuments(filter),
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
    static async getReviewRequestsByUser(userId, companyId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const filter = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
        };
        const [reviews, total] = await Promise.all([
            ReviewRequest_js_1.ReviewRequest.find(filter)
                .populate('repId', 'name email')
                .populate('controlId', 'name id')
                .populate('responseId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ReviewRequest_js_1.ReviewRequest.countDocuments(filter),
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
    static async getReviewRequestById(reviewId, companyId) {
        const review = await ReviewRequest_js_1.ReviewRequest.findOne({
            _id: reviewId,
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
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
    static async updateReviewStatus(data) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const review = await ReviewRequest_js_1.ReviewRequest.findOne({
                _id: data.reviewId,
                companyId: new mongoose_1.default.Types.ObjectId(data.companyId),
            }).session(session);
            if (!review) {
                throw new errors_js_1.AppError('Solicitação de revisão não encontrada', 404);
            }
            if (review.status !== 'pending') {
                throw new errors_js_1.AppError('Esta solicitação já foi respondida', 400);
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
                const control = await Control_js_1.Control.findById(review.controlId);
                await NotificationService_js_1.NotificationService.notifyReviewCompleted(review.userId.toString(), data.companyId, control?.nome || 'Controle', control?.id || review.controlId, data.status, review._id.toString());
                logger_js_1.logger.info(`📬 Notificação de revisão ${data.status} enviada para o usuário ${review.userId}`);
            }
            catch (notifyError) {
                logger_js_1.logger.error('❌ Erro ao enviar notificação de conclusão de revisão:', notifyError);
            }
            return review;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    /**
     * Remove uma solicitação de revisão (apenas se estiver pendente)
     */
    static async deleteReviewRequest(reviewId, companyId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const review = await ReviewRequest_js_1.ReviewRequest.findOne({
                _id: reviewId,
                companyId: new mongoose_1.default.Types.ObjectId(companyId),
            }).session(session);
            if (!review) {
                throw new errors_js_1.AppError('Solicitação de revisão não encontrada', 404);
            }
            if (review.status !== 'pending') {
                throw new errors_js_1.AppError('Não é possível excluir uma solicitação já respondida', 400);
            }
            if (review.attachments && review.attachments.length > 0) {
                const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'reviews', reviewId);
                await promises_1.default.rm(uploadDir, { recursive: true, force: true });
            }
            await ReviewRequest_js_1.ReviewRequest.deleteOne({ _id: reviewId }).session(session);
            await session.commitTransaction();
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    /**
     * Adiciona anexos a uma solicitação de revisão existente
     */
    static async addAttachments(reviewId, companyId, attachments) {
        const review = await ReviewRequest_js_1.ReviewRequest.findOne({
            _id: reviewId,
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
        });
        if (!review) {
            throw new errors_js_1.AppError('Solicitação de revisão não encontrada', 404);
        }
        if (review.status !== 'pending') {
            throw new errors_js_1.AppError('Não é possível adicionar anexos a uma solicitação já respondida', 400);
        }
        review.attachments.push(...attachments);
        await review.save();
        return review;
    }
    /**
     * Estatísticas de solicitações de revisão
     */
    static async getReviewStats(companyId) {
        const filter = { companyId: new mongoose_1.default.Types.ObjectId(companyId) };
        const [total, pending, approved, rejected] = await Promise.all([
            ReviewRequest_js_1.ReviewRequest.countDocuments(filter),
            ReviewRequest_js_1.ReviewRequest.countDocuments({ ...filter, status: 'pending' }),
            ReviewRequest_js_1.ReviewRequest.countDocuments({ ...filter, status: 'approved' }),
            ReviewRequest_js_1.ReviewRequest.countDocuments({ ...filter, status: 'rejected' }),
        ]);
        return { total, pending, approved, rejected };
    }
}
exports.ReviewService = ReviewService;
//# sourceMappingURL=ReviewService.js.map