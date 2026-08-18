import { Response } from 'express';
import { AuditActionPlanService } from '../../models/audit/services/AuditActionPlanService';
import { CreateAuditActionPlanDTO, UpdateAuditActionPlanDTO } from '../../models/audit/types/audit.types';
import { AuthenticatedRequest } from '../../types';

const auditActionPlanService = new AuditActionPlanService();

export class AuditActionPlanController {
  // ============================================================
  // CRIAR PLANO DE AÇÃO
  // ============================================================
  async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const data: CreateAuditActionPlanDTO = req.body;

      if (!data.findingId) {
        return res.status(400).json({ success: false, message: 'ID da NC é obrigatório' });
      }

      const actionPlan = await auditActionPlanService.create(data, userId);

      return res.status(201).json({ success: true, data: actionPlan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR PLANOS DE AÇÃO POR NC
  // ============================================================
  async findByFindingId(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { findingId } = req.params;

      if (!findingId) {
        return res.status(400).json({ success: false, message: 'ID da NC é obrigatório' });
      }

      const actionPlans = await auditActionPlanService.findByFindingId(findingId);

      return res.status(200).json({ success: true, data: actionPlans });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR PLANOS DE AÇÃO POR RESPONSÁVEL
  // ============================================================
  async findByResponsible(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { responsible } = req.params;

      if (!responsible) {
        return res.status(400).json({ success: false, message: 'ID do responsável é obrigatório' });
      }

      const actionPlans = await auditActionPlanService.findByResponsible(responsible);

      return res.status(200).json({ success: true, data: actionPlans });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // BUSCAR PLANO DE AÇÃO POR ID
  // ============================================================
  async findById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

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
  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const data: UpdateAuditActionPlanDTO = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

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
  // MARCAR COMO EM ANDAMENTO (corresponde a start na rota)
  // ============================================================
  async startProgress(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

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
  async complete(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { evidenceIds } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

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
  async validate(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { status, comment } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

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