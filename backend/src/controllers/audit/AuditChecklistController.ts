import { Request, Response } from 'express';
import { AuditChecklistService } from '../../models/audit/services/AuditChecklistService';

const auditChecklistService = new AuditChecklistService();

export class AuditChecklistController {
  // ============================================================
  // LISTAR CHECKLISTS POR PLANO
  // ============================================================
  async findByPlanId(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      const checklists = await auditChecklistService.findByPlanId(auditPlanId);

      return res.status(200).json({ success: true, data: checklists });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // BUSCAR CHECKLIST POR PLANO E CONTROLE
  // ============================================================
  async findByPlanAndControl(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId, controlId } = req.params;

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
  // ATUALIZAR CHECKLIST
  // ============================================================
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { questions } = req.body;

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
  async complete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

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
  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      const stats = await auditChecklistService.getStats(auditPlanId);

      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}