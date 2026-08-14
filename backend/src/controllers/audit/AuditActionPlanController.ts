import { Request, Response } from 'express';
import { AuditActionPlanService } from '../../models/audit/services/AuditActionPlanService';
import { CreateAuditActionPlanDTO, UpdateAuditActionPlanDTO } from '../../models/audit/types/audit.types';

const auditActionPlanService = new AuditActionPlanService();

export class AuditActionPlanController {
  // ============================================================
  // CRIAR PLANO DE AÇÃO
  // ============================================================
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId;
      const data: CreateAuditActionPlanDTO = req.body;

      const actionPlan = await auditActionPlanService.create(data, userId);

      return res.status(201).json({ success: true, data: actionPlan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR PLANOS DE AÇÃO POR NC
  // ============================================================
  async findByFindingId(req: Request, res: Response): Promise<Response> {
    try {
      const { findingId } = req.params;

      const actionPlans = await auditActionPlanService.findByFindingId(findingId);

      return res.status(200).json({ success: true, data: actionPlans });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR PLANOS DE AÇÃO POR RESPONSÁVEL
  // ============================================================
  async findByResponsible(req: Request, res: Response): Promise<Response> {
    try {
      const { responsible } = req.params;

      const actionPlans = await auditActionPlanService.findByResponsible(responsible);

      return res.status(200).json({ success: true, data: actionPlans });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // BUSCAR PLANO DE AÇÃO POR ID
  // ============================================================
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const actionPlan = await auditActionPlanService.findById(id);

      if (!actionPlan) {
        return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
      }

      return res.status(200).json({ success: true, data: actionPlan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ATUALIZAR PLANO DE AÇÃO
  // ============================================================
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const data: UpdateAuditActionPlanDTO = req.body;

      const actionPlan = await auditActionPlanService.update(id, data, userId);

      if (!actionPlan) {
        return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
      }

      return res.status(200).json({ success: true, data: actionPlan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // MARCAR COMO EM ANDAMENTO
  // ============================================================
  async startProgress(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const actionPlan = await auditActionPlanService.startProgress(id, userId);

      if (!actionPlan) {
        return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
      }

      return res.status(200).json({ success: true, data: actionPlan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // MARCAR COMO CONCLUÍDO
  // ============================================================
  async complete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { evidenceIds } = req.body;

      const actionPlan = await auditActionPlanService.complete(id, userId, evidenceIds);

      if (!actionPlan) {
        return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
      }

      return res.status(200).json({ success: true, data: actionPlan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // VALIDAR PLANO DE AÇÃO
  // ============================================================
  async validate(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { status, comment } = req.body;

      if (!status || !['completed', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status deve ser "completed" ou "rejected"' });
      }

      const actionPlan = await auditActionPlanService.validate(id, userId, status, comment);

      if (!actionPlan) {
        return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
      }

      return res.status(200).json({ success: true, data: actionPlan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}