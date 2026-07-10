"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const ReviewService_js_1 = require("../services/ReviewService.js");
const errors_js_1 = require("../utils/errors.js");
const EmailService_js_1 = require("../services/EmailService.js");
const User_js_1 = require("../models/User.js");
const Control_js_1 = require("../models/Control.js");
const Response_js_1 = require("../models/Response.js");
class ReviewController {
    static async createReviewRequest(req, res, next) {
        try {
            const { responseId, userId, controlId, justification, attachments } = req.body;
            const companyId = req.user?.companyId || req.body.companyId;
            const repId = req.user?.id;
            const repName = req.user?.name || 'Preposto';
            if (!companyId) {
                throw new errors_js_1.AppError('Empresa não identificada', 400);
            }
            if (!repId) {
                throw new errors_js_1.AppError('Preposto não identificado', 401);
            }
            if (!responseId || !userId || !controlId || !justification) {
                throw new errors_js_1.AppError('Campos obrigatórios: responseId, userId, controlId, justification', 400);
            }
            if (justification.length < 10) {
                throw new errors_js_1.AppError('A justificativa deve ter no mínimo 10 caracteres', 400);
            }
            const review = await ReviewService_js_1.ReviewService.createReviewRequest({
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
                const user = await User_js_1.User.findById(userId).select('name email');
                // Buscar controle
                const control = await Control_js_1.Control.findById(controlId).select('id name');
                // Buscar resposta
                const response = await Response_js_1.Response.findById(responseId).select('maturityLevel');
                if (user && user.email && control) {
                    const maturityLabels = {
                        '0': 'Não Implementado',
                        '1': 'Parcialmente Implementado',
                        '2': 'Totalmente Implementado',
                    };
                    const maturityLabel = response?.maturityLevel
                        ? maturityLabels[response.maturityLevel.toString()] || response.maturityLevel
                        : 'Não informado';
                    const loginLink = process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com/login';
                    await EmailService_js_1.emailService.sendReviewRequestEmail({
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
            }
            catch (emailError) {
                // Não interrompe o fluxo se o e-mail falhar
                console.error('❌ Erro ao enviar e-mail de notificação:', emailError);
            }
            res.status(201).json({
                success: true,
                data: review,
                message: 'Solicitação de revisão criada com sucesso',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getReviews(req, res, next) {
        try {
            const companyId = req.user?.companyId || req.query.companyId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;
            if (!companyId) {
                throw new errors_js_1.AppError('Empresa não identificada', 400);
            }
            const result = await ReviewService_js_1.ReviewService.getReviewRequestsByCompany(companyId, page, limit, status);
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getReviewsByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const companyId = req.user?.companyId || req.query.companyId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            if (!companyId) {
                throw new errors_js_1.AppError('Empresa não identificada', 400);
            }
            if (!userId) {
                throw new errors_js_1.AppError('ID do usuário é obrigatório', 400);
            }
            const result = await ReviewService_js_1.ReviewService.getReviewRequestsByUser(userId, companyId, page, limit);
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getReviewById(req, res, next) {
        try {
            const { reviewId } = req.params;
            const companyId = req.user?.companyId || req.query.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Empresa não identificada', 400);
            }
            if (!reviewId) {
                throw new errors_js_1.AppError('ID da solicitação é obrigatório', 400);
            }
            const review = await ReviewService_js_1.ReviewService.getReviewRequestById(reviewId, companyId);
            if (!review) {
                throw new errors_js_1.AppError('Solicitação de revisão não encontrada', 404);
            }
            res.status(200).json({
                success: true,
                data: review,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateReviewStatus(req, res, next) {
        try {
            const { reviewId } = req.params;
            const { status, reviewNotes } = req.body;
            const companyId = req.user?.companyId || req.body.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Empresa não identificada', 400);
            }
            if (!reviewId) {
                throw new errors_js_1.AppError('ID da solicitação é obrigatório', 400);
            }
            if (!status || !['approved', 'rejected'].includes(status)) {
                throw new errors_js_1.AppError('Status inválido. Use "approved" ou "rejected"', 400);
            }
            const review = await ReviewService_js_1.ReviewService.updateReviewStatus({
                reviewId,
                status,
                companyId,
                reviewNotes,
            });
            // 🔴 NOVO: Buscar dados para enviar e-mail ao preposto
            try {
                // Buscar preposto (quem criou a solicitação)
                const rep = await User_js_1.User.findById(review.repId).select('name email');
                // Buscar usuário que respondeu
                const user = await User_js_1.User.findById(review.userId).select('name');
                // Buscar controle
                const control = await Control_js_1.Control.findById(review.controlId).select('id name');
                // Buscar resposta
                const response = await Response_js_1.Response.findById(review.responseId).select('maturityLevel');
                if (rep && rep.email && control) {
                    const statusLabel = status === 'approved' ? 'Aprovada ✅' : 'Rejeitada ❌';
                    const maturityLabels = {
                        '0': 'Não Implementado',
                        '1': 'Parcialmente Implementado',
                        '2': 'Totalmente Implementado',
                    };
                    const maturityLabel = response?.maturityLevel
                        ? maturityLabels[response.maturityLevel.toString()] || response.maturityLevel
                        : 'Não informado';
                    const loginLink = process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com/login';
                    await EmailService_js_1.emailService.sendReviewCompletedEmail({
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
            }
            catch (emailError) {
                // Não interrompe o fluxo se o e-mail falhar
                console.error('❌ Erro ao enviar e-mail de notificação:', emailError);
            }
            res.status(200).json({
                success: true,
                data: review,
                message: `Solicitação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteReview(req, res, next) {
        try {
            const { reviewId } = req.params;
            const companyId = req.user?.companyId || req.query.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Empresa não identificada', 400);
            }
            if (!reviewId) {
                throw new errors_js_1.AppError('ID da solicitação é obrigatório', 400);
            }
            await ReviewService_js_1.ReviewService.deleteReviewRequest(reviewId, companyId);
            res.status(200).json({
                success: true,
                message: 'Solicitação de revisão excluída com sucesso',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async addAttachments(req, res, next) {
        try {
            const { reviewId } = req.params;
            const companyId = req.user?.companyId || req.body.companyId;
            const attachments = req.body.attachments;
            if (!companyId) {
                throw new errors_js_1.AppError('Empresa não identificada', 400);
            }
            if (!reviewId) {
                throw new errors_js_1.AppError('ID da solicitação é obrigatório', 400);
            }
            if (!attachments || attachments.length === 0) {
                throw new errors_js_1.AppError('Nenhum anexo enviado', 400);
            }
            const review = await ReviewService_js_1.ReviewService.addAttachments(reviewId, companyId, attachments);
            res.status(200).json({
                success: true,
                data: review,
                message: 'Anexos adicionados com sucesso',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getReviewStats(req, res, next) {
        try {
            const companyId = req.user?.companyId || req.query.companyId;
            if (!companyId) {
                throw new errors_js_1.AppError('Empresa não identificada', 400);
            }
            const stats = await ReviewService_js_1.ReviewService.getReviewStats(companyId);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReviewController = ReviewController;
//# sourceMappingURL=ReviewController.js.map