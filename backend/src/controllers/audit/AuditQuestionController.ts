// ============================================================
// AuditQuestionController.ts
// ============================================================
//
// CONTROLLER: Gerenciamento de perguntas de auditoria
//
// ACESSO:
//   Todas as rotas têm middleware `authorize(UserRole.ADMIN)`
//   no arquivo de rotas (defesa em profundidade).
//
// ============================================================

import { Request, Response } from 'express';
import { auditQuestionService } from '../services/AuditQuestionService';
import { AuthenticatedRequest } from '../../types/index.js';

export class AuditQuestionController {
  /**
   * POST /api/internal-audit/questions
   * Cria uma nova pergunta de auditoria.
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Não autenticado' });
        return;
      }

      const question = await auditQuestionService.create(req.body, user._id.toString());

      res.status(201).json({
        success: true,
        data: question,
        message: 'Pergunta criada com sucesso',
      });
    } catch (error: any) {
      console.error('❌ [AuditQuestionController.create]', error);
      res.status(400).json({
        success: false,
        message: error?.message || 'Erro ao criar pergunta',
      });
    }
  }

  /**
   * GET /api/internal-audit/questions
   * Lista todas as perguntas com filtros.
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { clauseId, clauseGroup, criticality, active, search } = req.query;

      const filters: any = {};
      if (clauseId) filters.clauseId = String(clauseId);
      if (clauseGroup) filters.clauseGroup = String(clauseGroup);
      if (criticality) filters.criticality = String(criticality);
      if (active !== undefined) filters.active = active === 'true';
      if (search) filters.search = String(search);

      const questions = await auditQuestionService.findAll(filters);

      res.status(200).json({
        success: true,
        data: questions,
        total: questions.length,
      });
    } catch (error: any) {
      console.error('❌ [AuditQuestionController.findAll]', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao listar perguntas',
      });
    }
  }

  /**
   * GET /api/internal-audit/questions/:id
   * Busca uma pergunta por ID.
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const question = await auditQuestionService.findById(req.params.id);

      if (!question) {
        res.status(404).json({ success: false, message: 'Pergunta não encontrada' });
        return;
      }

      res.status(200).json({ success: true, data: question });
    } catch (error: any) {
      console.error('❌ [AuditQuestionController.findById]', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao buscar pergunta',
      });
    }
  }

  /**
   * PUT /api/internal-audit/questions/:id
   * Atualiza uma pergunta.
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const question = await auditQuestionService.update(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: question,
        message: 'Pergunta atualizada com sucesso',
      });
    } catch (error: any) {
      console.error('❌ [AuditQuestionController.update]', error);
      res.status(400).json({
        success: false,
        message: error?.message || 'Erro ao atualizar pergunta',
      });
    }
  }

  /**
   * DELETE /api/internal-audit/questions/:id
   * Soft delete de uma pergunta.
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await auditQuestionService.delete(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Pergunta excluída com sucesso',
      });
    } catch (error: any) {
      console.error('❌ [AuditQuestionController.delete]', error);
      res.status(400).json({
        success: false,
        message: error?.message || 'Erro ao excluir pergunta',
      });
    }
  }

  /**
   * GET /api/internal-audit/questions/stats
   * Estatísticas das perguntas.
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await auditQuestionService.getStats();

      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      console.error('❌ [AuditQuestionController.getStats]', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao buscar estatísticas',
      });
    }
  }
}

// ============================================================
// INSTÂNCIA SINGLETON
// ============================================================

export const auditQuestionController = new AuditQuestionController();