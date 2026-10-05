import { Request, Response } from 'express';
import { auditControlQuestionService } from '../../models/audit/services/AuditControlQuestionService';
import {
  createAuditControlQuestionSchema,
  updateAuditControlQuestionSchema,
  auditControlQuestionFiltersSchema,
  deleteAuditControlQuestionSchema,
} from '../../models/audit/schemas/auditControlQuestion.schemas';

// ============================================================
// AUDIT CONTROL QUESTION CONTROLLER — v50.1
// ============================================================
//
// 6 endpoints REST para gerenciar as perguntas de auditoria
// por controle (Anexo A — ISO 27001:2022).
//
// TODAS as rotas são protegidas com authorize(ADMIN) no
// arquivo de rotas. O controller assume que req.user.id é
// um ADMIN autenticado.
//
// Coleção NOVA e ISOLADA. Não altera nenhum controller.
// ============================================================

export class AuditControlQuestionController {

  // ============================================================
  // POST /api/internal-audit/control-questions
  // ============================================================

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const adminId = (req as any).user?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      // ---- Validação Zod ----

      const parsed = createAuditControlQuestionSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      // ---- Criar ----

      const question = await auditControlQuestionService.create(
        parsed.data,
        adminId
      );

      return res.status(201).json({
        success: true,
        data: question,
      });
    } catch (error: any) {
      console.error('❌ [AuditControlQuestionController.create]', error);

      return res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao criar pergunta de auditoria',
      });
    }
  }

  // ============================================================
  // GET /api/internal-audit/control-questions
  // ============================================================

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      // ---- Validação de filtros ----

      const parsed = auditControlQuestionFiltersSchema.safeParse(req.query);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Filtros inválidos',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const questions = await auditControlQuestionService.findAll(parsed.data);

      return res.status(200).json({
        success: true,
        data: questions,
        total: questions.length,
      });
    } catch (error: any) {
      console.error('❌ [AuditControlQuestionController.findAll]', error);

      return res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao listar perguntas de auditoria',
      });
    }
  }

  // ============================================================
  // GET /api/internal-audit/control-questions/stats
  // ============================================================
  //
  // IMPORTANTE: esta rota precisa ser declarada ANTES de
  // /control-questions/:id no arquivo de rotas, senão o Express
  // interpreta "stats" como um :id.

  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await auditControlQuestionService.getStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('❌ [AuditControlQuestionController.getStats]', error);

      return res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao buscar estatísticas',
      });
    }
  }

  // ============================================================
  // GET /api/internal-audit/control-questions/:id
  // ============================================================

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = String(req.params.id || '').trim();

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da pergunta é obrigatório',
        });
      }

      const question = await auditControlQuestionService.findById(id);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Pergunta de auditoria não encontrada',
        });
      }

      return res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error: any) {
      console.error('❌ [AuditControlQuestionController.findById]', error);

      return res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao buscar pergunta de auditoria',
      });
    }
  }

  // ============================================================
  // PUT /api/internal-audit/control-questions/:id
  // ============================================================

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const adminId = (req as any).user?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const id = String(req.params.id || '').trim();

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da pergunta é obrigatório',
        });
      }

      // ---- Validação Zod ----

      const parsed = updateAuditControlQuestionSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      // ---- Atualizar ----

      const question = await auditControlQuestionService.update(
        id,
        parsed.data,
        adminId
      );

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Pergunta de auditoria não encontrada',
        });
      }

      return res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error: any) {
      console.error('❌ [AuditControlQuestionController.update]', error);

      return res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao atualizar pergunta de auditoria',
      });
    }
  }

  // ============================================================
  // DELETE /api/internal-audit/control-questions/:id
  // ============================================================

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const adminId = (req as any).user?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const id = String(req.params.id || '').trim();

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da pergunta é obrigatório',
        });
      }

      const deleted = await auditControlQuestionService.delete(id, adminId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Pergunta de auditoria não encontrada',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Pergunta de auditoria excluída com sucesso',
      });
    } catch (error: any) {
      console.error('❌ [AuditControlQuestionController.delete]', error);

      return res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao excluir pergunta de auditoria',
      });
    }
  }
}

// ============================================================
// INSTÂNCIA SINGLETON
// ============================================================

export const auditControlQuestionController =
  new AuditControlQuestionController();