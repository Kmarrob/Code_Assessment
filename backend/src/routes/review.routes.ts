// backend/src/routes/review.routes.ts
import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController.js';
import { authenticate } from '../middleware/auth.js';
import { validateSchema } from '../middleware/validateSchema.js';
import { z } from 'zod';

const router = Router();

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const createReviewSchema = z.object({
  responseId: z.string().min(1, 'ID da resposta é obrigatório'),
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  controlId: z.string().min(1, 'ID do controle é obrigatório'),
  justification: z.string().min(10, 'A justificativa deve ter no mínimo 10 caracteres'),
  attachments: z.array(z.object({
    filename: z.string(),
    originalName: z.string(),
    mimeType: z.string(),
    size: z.number(),
    uploadedAt: z.date().optional(),
  })).optional(),
  companyId: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status deve ser "approved" ou "rejected"' }),
  }),
  companyId: z.string().optional(),
});

const addAttachmentsSchema = z.object({
  attachments: z.array(z.object({
    filename: z.string(),
    originalName: z.string(),
    mimeType: z.string(),
    size: z.number(),
    uploadedAt: z.date().optional(),
  })).min(1, 'Pelo menos um anexo é obrigatório'),
  companyId: z.string().optional(),
});

// ============================================
// ROTAS (Todas requerem autenticação)
// ============================================

// 🔴 CORREÇÃO: Usar authenticate em vez de authMiddleware
router.use(authenticate);

router.post(
  '/',
  validateSchema(createReviewSchema),
  ReviewController.createReviewRequest
);

router.get('/', ReviewController.getReviews);

router.get('/stats', ReviewController.getReviewStats);

router.get('/user/:userId', ReviewController.getReviewsByUser);

router.get('/:reviewId', ReviewController.getReviewById);

router.patch(
  '/:reviewId/status',
  validateSchema(updateStatusSchema),
  ReviewController.updateReviewStatus
);

router.post(
  '/:reviewId/attachments',
  validateSchema(addAttachmentsSchema),
  ReviewController.addAttachments
);

router.delete('/:reviewId', ReviewController.deleteReview);

export default router;