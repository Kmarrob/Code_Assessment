"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/review.routes.ts
const express_1 = require("express");
const ReviewController_js_1 = require("../controllers/ReviewController.js");
const auth_js_1 = require("../middleware/auth.js");
const validateSchema_js_1 = require("../middleware/validateSchema.js");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================
const createReviewSchema = zod_1.z.object({
    responseId: zod_1.z.string().min(1, 'ID da resposta é obrigatório'),
    userId: zod_1.z.string().min(1, 'ID do usuário é obrigatório'),
    controlId: zod_1.z.string().min(1, 'ID do controle é obrigatório'),
    justification: zod_1.z.string().min(10, 'A justificativa deve ter no mínimo 10 caracteres'),
    attachments: zod_1.z.array(zod_1.z.object({
        filename: zod_1.z.string(),
        originalName: zod_1.z.string(),
        mimeType: zod_1.z.string(),
        size: zod_1.z.number(),
        uploadedAt: zod_1.z.date().optional(),
    })).optional(),
    companyId: zod_1.z.string().optional(),
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['approved', 'rejected'], {
        errorMap: () => ({ message: 'Status deve ser "approved" ou "rejected"' }),
    }),
    companyId: zod_1.z.string().optional(),
});
const addAttachmentsSchema = zod_1.z.object({
    attachments: zod_1.z.array(zod_1.z.object({
        filename: zod_1.z.string(),
        originalName: zod_1.z.string(),
        mimeType: zod_1.z.string(),
        size: zod_1.z.number(),
        uploadedAt: zod_1.z.date().optional(),
    })).min(1, 'Pelo menos um anexo é obrigatório'),
    companyId: zod_1.z.string().optional(),
});
// ============================================
// ROTAS (Todas requerem autenticação)
// ============================================
// 🔴 CORREÇÃO: Usar authenticate em vez de authMiddleware
router.use(auth_js_1.authenticate);
router.post('/', (0, validateSchema_js_1.validateSchema)(createReviewSchema), ReviewController_js_1.ReviewController.createReviewRequest);
router.get('/', ReviewController_js_1.ReviewController.getReviews);
router.get('/stats', ReviewController_js_1.ReviewController.getReviewStats);
router.get('/user/:userId', ReviewController_js_1.ReviewController.getReviewsByUser);
router.get('/:reviewId', ReviewController_js_1.ReviewController.getReviewById);
router.patch('/:reviewId/status', (0, validateSchema_js_1.validateSchema)(updateStatusSchema), ReviewController_js_1.ReviewController.updateReviewStatus);
router.post('/:reviewId/attachments', (0, validateSchema_js_1.validateSchema)(addAttachmentsSchema), ReviewController_js_1.ReviewController.addAttachments);
router.delete('/:reviewId', ReviewController_js_1.ReviewController.deleteReview);
exports.default = router;
//# sourceMappingURL=review.routes.js.map