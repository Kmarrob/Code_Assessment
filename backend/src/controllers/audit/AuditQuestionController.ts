import { Request, Response } from 'express';
import { auditQuestionService } from '../../models/audit/services/AuditQuestionService';
import { AuthenticatedRequest } from '../../types';

export class AuditQuestionController {
  /**
   * Criar uma nova pergunta
   * POST /api/internal-audit/questions
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const { text, clause, category, controlId, isActive, answerType, order, section } = req.body;

      // Validações básicas
      if (!text || !clause || !category || !section) {
        res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: text, clause, category, section',
        });
        return;
      }

      if (category === 'control' && !controlId) {
        res.status(400).json({
          success: false,
          message: 'Para perguntas de controle, controlId é obrigatório',
        });
        return;
      }

      const question = await auditQuestionService.create(
        {
          text,
          clause,
          category,
          controlId,
          isActive: isActive !== undefined ? isActive : true,
          answerType: answerType || 'C_NC_OB_OM_NA',
          order: order || 0,
          section,
        },
        userId
      );

      res.status(201).json({
        success: true,
        data: question,
        message: 'Pergunta criada com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao criar pergunta',
      });
    }
  }

  /**
   * Listar perguntas com filtros
   * GET /api/internal-audit/questions
   */
  async findAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, category, isActive, clause, section } = req.query;

      const filters = {
        search: search as string,
        category: category as 'clause' | 'control',
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        clause: clause as string,
        section: section as string,
      };

      const questions = await auditQuestionService.findAll(filters);

      // 🔹 Buscar nomes dos controles para enriquecer os dados
      const controlIds = questions
        .filter((q) => q.category === 'control' && q.controlId)
        .map((q) => q.controlId);

      // (Opcional) Buscar nomes dos controles se necessário
      // const controls = await Control.find({ _id: { $in: controlIds } }).lean();

      res.status(200).json({
        success: true,
        data: questions,
        total: questions.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao listar perguntas',
      });
    }
  }

  /**
   * Buscar pergunta por ID
   * GET /api/internal-audit/questions/:id
   */
  async findById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const question = await auditQuestionService.findById(id);

      if (!question) {
        res.status(404).json({
          success: false,
          message: 'Pergunta não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar pergunta',
      });
    }
  }

  /**
   * Atualizar pergunta
   * PUT /api/internal-audit/questions/:id
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const { text, clause, category, controlId, isActive, answerType, order, section } = req.body;

      const question = await auditQuestionService.update(
        id,
        {
          text,
          clause,
          category,
          controlId,
          isActive,
          answerType,
          order,
          section,
        },
        userId
      );

      if (!question) {
        res.status(404).json({
          success: false,
          message: 'Pergunta não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: question,
        message: 'Pergunta atualizada com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao atualizar pergunta',
      });
    }
  }

  /**
   * Ativar/Desativar pergunta
   * PATCH /api/internal-audit/questions/:id/toggle
   */
  async toggleStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      if (isActive === undefined) {
        res.status(400).json({
          success: false,
          message: 'O campo isActive é obrigatório',
        });
        return;
      }

      const question = await auditQuestionService.toggleStatus(id, isActive, userId);

      if (!question) {
        res.status(404).json({
          success: false,
          message: 'Pergunta não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: question,
        message: `Pergunta ${isActive ? 'ativada' : 'desativada'} com sucesso`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao alterar status',
      });
    }
  }

  /**
   * Excluir pergunta (soft delete)
   * DELETE /api/internal-audit/questions/:id
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const question = await auditQuestionService.delete(id, userId);

      if (!question) {
        res.status(404).json({
          success: false,
          message: 'Pergunta não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Pergunta excluída com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao excluir pergunta',
      });
    }
  }

  /**
   * Buscar perguntas por cláusula
   * GET /api/internal-audit/questions/clause/:clause
   */
  async findByClause(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { clause } = req.params;
      const { onlyActive } = req.query;

      const questions = await auditQuestionService.findByClause(
        clause,
        onlyActive !== 'false'
      );

      res.status(200).json({
        success: true,
        data: questions,
        total: questions.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar perguntas por cláusula',
      });
    }
  }

  /**
   * Buscar perguntas por seção
   * GET /api/internal-audit/questions/section/:section
   */
  async findBySection(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { section } = req.params;
      const { onlyActive } = req.query;

      const questions = await auditQuestionService.findBySection(
        section,
        onlyActive !== 'false'
      );

      res.status(200).json({
        success: true,
        data: questions,
        total: questions.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar perguntas por seção',
      });
    }
  }

  /**
   * Obter estatísticas das perguntas
   * GET /api/internal-audit/questions/stats
   */
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await auditQuestionService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao obter estatísticas',
      });
    }
  }
}

export const auditQuestionController = new AuditQuestionController();