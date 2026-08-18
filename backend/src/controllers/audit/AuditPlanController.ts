import { Response } from 'express';
import { AuditPlanService } from '../../models/audit/services/AuditPlanService';
import { CreateAuditPlanDTO, UpdateAuditPlanDTO } from '../../models/audit/types/audit.types';
import { AuthenticatedRequest } from '../../types';

const auditPlanService = new AuditPlanService();

export class AuditPlanController {
  // ============================================================
  // CRIAR PLANO
  // ============================================================
  async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id?.toString();
      const companyId = req.user?.companyId?.toString();

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!companyId) {
        return res.status(400).json({ success: false, message: 'Empresa não identificada' });
      }

      const data: CreateAuditPlanDTO = req.body;
      const plan = await auditPlanService.create(data, userId, companyId);

      return res.status(201).json({ success: true, data: plan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR PLANOS
  // ============================================================
  async findAll(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const companyId = req.user?.companyId?.toString();

      if (!companyId) {
        return res.status(400).json({ success: false, message: 'Empresa não identificada' });
      }

      const { status, leadAuditor, auditor, search } = req.query;

      const filters = {
        companyId,
        status: status as any,
        leadAuditor: leadAuditor as string,
        auditor: auditor as string,
        search: search as string,
      };

      const plans = await auditPlanService.findAll(filters);
      return res.status(200).json({ success: true, data: plans });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // BUSCAR PLANO POR ID
  // ============================================================
  async findById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      const plan = await auditPlanService.findById(id);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plano não encontrado' });
      }

      return res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ATUALIZAR PLANO
  // ============================================================
  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();
      const data: UpdateAuditPlanDTO = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const plan = await auditPlanService.update(id, data, userId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plano não encontrado' });
      }

      return res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ENVIAR PARA APROVAÇÃO
  // ============================================================
  async submitForApproval(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const plan = await auditPlanService.submitForApproval(id, userId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plano não encontrado' });
      }

      return res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // APROVAR PLANO
  // ============================================================
  async approve(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const plan = await auditPlanService.approve(id, userId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plano não encontrado' });
      }

      return res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // REJEITAR PLANO
  // ============================================================
  async reject(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();
      const { reason } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!reason) {
        return res.status(400).json({ success: false, message: 'Motivo da rejeição é obrigatório' });
      }

      const plan = await auditPlanService.reject(id, userId, reason);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plano não encontrado' });
      }

      return res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // CANCELAR PLANO
  // ============================================================
  async cancel(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const plan = await auditPlanService.cancel(id, userId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plano não encontrado' });
      }

      return res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // INICIAR AUDITORIA
  // ============================================================
  async startAudit(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const plan = await auditPlanService.startAudit(id, userId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plano não encontrado' });
      }

      return res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // CONCLUIR AUDITORIA
  // ============================================================
  async completeAudit(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const plan = await auditPlanService.completeAudit(id, userId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plano não encontrado' });
      }

      return res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ESTATÍSTICAS
  // ============================================================
  async getStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const companyId = req.user?.companyId?.toString();

      if (!companyId) {
        return res.status(400).json({ success: false, message: 'Empresa não identificada' });
      }

      const stats = await auditPlanService.getStats(companyId);
      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}