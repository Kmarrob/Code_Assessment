import { Request, Response } from 'express';
import { auditChecklistService } from '../../models/audit/services';
import { AuthenticatedRequest } from '../../types';

export class AuditChecklistController {
  // ============================================================
  // BUSCAR CHECKLIST POR PLANO E CONTROLE
  // ============================================================
  async findByPlanAndControl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { auditPlanId, controlId } = req.params;
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      // ✅ VALIDAÇÃO: auditPlanId é obrigatório
      if (!auditPlanId) {
        res.status(400).json({ success: false, message: 'auditPlanId é obrigatório' });
        return;
      }

      // ✅ VALIDAÇÃO: controlId é obrigatório
      if (!controlId) {
        res.status(400).json({ success: false, message: 'controlId é obrigatório' });
        return;
      }

      const checklist = await auditChecklistService.findByPlanAndControl(auditPlanId, controlId);

      if (!checklist) {
        res.status(404).json({ success: false, message: 'Checklist não encontrado' });
        return;
      }

      res.status(200).json({ success: true, data: checklist });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erro ao buscar checklist' });
    }
  }

  // ============================================================
  // LISTAR CHECKLISTS POR PLANO
  // ============================================================
  async findByPlanId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { auditPlanId } = req.params;
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      // ✅ VALIDAÇÃO: auditPlanId é obrigatório
      if (!auditPlanId) {
        res.status(400).json({ success: false, message: 'auditPlanId é obrigatório' });
        return;
      }

      const checklists = await auditChecklistService.findByPlanId(auditPlanId);

      res.status(200).json({ success: true, data: checklists });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erro ao listar checklists' });
    }
  }

  // ============================================================
  // ATUALIZAR CHECKLIST
  // ============================================================
  async updateChecklist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { questions } = req.body;
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      // ✅ VALIDAÇÃO: id é obrigatório
      if (!id) {
        res.status(400).json({ success: false, message: 'ID do checklist é obrigatório' });
        return;
      }

      if (!questions || !Array.isArray(questions)) {
        res.status(400).json({ success: false, message: 'Campo questions é obrigatório e deve ser um array' });
        return;
      }

      const checklist = await auditChecklistService.updateChecklist(id, questions, userId);

      if (!checklist) {
        res.status(404).json({ success: false, message: 'Checklist não encontrado' });
        return;
      }

      res.status(200).json({ success: true, data: checklist, message: 'Checklist atualizado com sucesso' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erro ao atualizar checklist' });
    }
  }

  // ============================================================
  // MARCAR CHECKLIST COMO CONCLUÍDO
  // ============================================================
  async complete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      // ✅ VALIDAÇÃO: id é obrigatório
      if (!id) {
        res.status(400).json({ success: false, message: 'ID do checklist é obrigatório' });
        return;
      }

      const checklist = await auditChecklistService.complete(id, userId);

      if (!checklist) {
        res.status(404).json({ success: false, message: 'Checklist não encontrado' });
        return;
      }

      res.status(200).json({ success: true, data: checklist, message: 'Checklist concluído com sucesso' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erro ao concluir checklist' });
    }
  }

  // ============================================================
  // 🆕 POPULAR CHECKLIST COM RESPOSTAS DOS USUÁRIOS
  // ============================================================
  async populateWithUserResponses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { auditPlanId } = req.params;
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      // ✅ VALIDAÇÃO: auditPlanId é obrigatório
      if (!auditPlanId) {
        res.status(400).json({ success: false, message: 'auditPlanId é obrigatório' });
        return;
      }

      const populatedCount = await auditChecklistService.populateAllChecklists(auditPlanId, userId);

      res.status(200).json({
        success: true,
        message: `${populatedCount} checklists populados com respostas dos usuários`,
        data: { populatedCount }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao popular checklists com respostas dos usuários'
      });
    }
  }

  // ============================================================
  // ESTATÍSTICAS DO CHECKLIST
  // ============================================================
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { auditPlanId } = req.params;
      const userId = req.user?._id?.toString();

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      // ✅ VALIDAÇÃO: auditPlanId é obrigatório
      if (!auditPlanId) {
        res.status(400).json({ success: false, message: 'auditPlanId é obrigatório' });
        return;
      }

      const stats = await auditChecklistService.getStats(auditPlanId);

      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erro ao buscar estatísticas' });
    }
  }
}