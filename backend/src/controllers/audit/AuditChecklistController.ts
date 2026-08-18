import { Response } from 'express';
import { AuditChecklistService } from '../../models/audit/services/AuditChecklistService';
import { AuthenticatedRequest } from '../../types';

const auditChecklistService = new AuditChecklistService();

export class AuditChecklistController {
  // ============================================================
  // LISTAR CHECKLISTS POR PLANO
  // ============================================================
  async findByPlanId(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const checklists = await auditChecklistService.findByPlanId(auditPlanId);

      return res.status(200).json({ success: true, data: checklists });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // BUSCAR CHECKLIST POR PLANO E CONTROLE
  // ============================================================
  async findByPlanAndControl(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { auditPlanId, controlId } = req.params;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      if (!controlId) {
        return res.status(400).json({ success: false, message: 'ID do controle é obrigatório' });
      }

      const checklist = await auditChecklistService.findByPlanAndControl(auditPlanId, controlId);

      if (!checklist) {
        return res.status(404).json({ success: false, message: 'Checklist não encontrado' });
      }

      return res.status(200).json({ success: true, data: checklist });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ATUALIZAR CHECKLIST (corresponde a updateChecklist na rota)
  // ============================================================
  async updateChecklist(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { questions } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ success: false, message: 'Questões inválidas' });
      }

      const checklist = await auditChecklistService.updateChecklist(id, questions, userId);

      if (!checklist) {
        return res.status(404).json({ success: false, message: 'Checklist não encontrado' });
      }

      return res.status(200).json({ success: true, data: checklist });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // MARCAR CHECKLIST COMO CONCLUÍDO
  // ============================================================
  async complete(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const checklist = await auditChecklistService.complete(id, userId);

      if (!checklist) {
        return res.status(404).json({ success: false, message: 'Checklist não encontrado' });
      }

      return res.status(200).json({ success: true, data: checklist });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ESTATÍSTICAS DO CHECKLIST
  // ============================================================
  async getStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const stats = await auditChecklistService.getStats(auditPlanId);

      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}