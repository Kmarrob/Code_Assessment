import { Response } from 'express';
import { AuditPlanService } from '../../models/audit/services/AuditPlanService';
import { CreateAuditPlanDTO, UpdateAuditPlanDTO } from '../../models/audit/types/audit.types';
import { AuthenticatedRequest } from '../../types';
import { Response as ResponseModel } from '../../models/Response';
import { Assignment } from '../../models/Assignment';
import mongoose from 'mongoose';

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
  // DELETAR PLANO
  // ============================================================
  async delete(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

  // ============================================================
  // 🆕 NOVO (v47.0) - BUSCAR RESPOSTAS DOS USUÁRIOS POR PLANO
  // ============================================================
  /**
   * GET /api/internal-audit/plans/:planId/responses
   * 
   * Retorna todas as respostas dos usuários para os controles
   * que fazem parte do escopo do plano de auditoria.
   * 
   * Esta rota é utilizada pelo frontend para popular o checklist
   * com as respostas dos usuários (maturityLevel, scenarioDescription, etc.)
   */
  async getResponsesByPlan(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { planId } = req.params;
      const userId = req.user?._id?.toString();
      const companyId = req.user?.companyId?.toString();

      if (!planId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!companyId) {
        return res.status(400).json({ success: false, message: 'Empresa não identificada' });
      }

      // Buscar o plano para obter os controles do escopo
      const plan = await auditPlanService.findById(planId);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plano não encontrado' });
      }

      // Extrair os controlIds do escopo do plano
      const controlIds = plan.scope?.controls || [];

      if (controlIds.length === 0) {
        return res.status(200).json({ success: true, data: [], message: 'Nenhum controle no escopo do plano' });
      }

      // Buscar todos os controles da empresa que estão no escopo
      // Primeiro, buscar os controles pelo ID ou pelo campo 'id'
      const controlObjectIds: mongoose.Types.ObjectId[] = [];
      const controlStringIds: string[] = [];

      for (const controlId of controlIds) {
        if (mongoose.Types.ObjectId.isValid(controlId)) {
          controlObjectIds.push(new mongoose.Types.ObjectId(controlId));
        } else {
          controlStringIds.push(controlId);
        }
      }

      // Buscar os controles no banco para obter os _ids reais
      const controlQuery: any[] = [];
      
      if (controlObjectIds.length > 0) {
        controlQuery.push({ _id: { $in: controlObjectIds } });
      }
      
      if (controlStringIds.length > 0) {
        controlQuery.push({ id: { $in: controlStringIds } });
      }

      const controls = await mongoose.model('Control').find({
        $or: controlQuery,
        companyId: companyId,
      }).lean();

      const controlDbIds = controls.map((c: any) => c._id.toString());

      if (controlDbIds.length === 0) {
        return res.status(200).json({ 
          success: true, 
          data: [], 
          message: 'Nenhum controle encontrado para os IDs do escopo' 
        });
      }

      // Buscar todas as respostas dos usuários para estes controles
      const responses = await ResponseModel.find({
        companyId: companyId,
        controlId: { $in: controlDbIds },
      })
        .populate('userId', 'name email')
        .populate('controlId', 'id nome')
        .lean();

      // Formatar a resposta
      const formattedResponses = responses.map((response: any) => ({
        id: response._id,
        assignmentId: response.assignmentId,
        userId: response.userId,
        controlId: response.controlId?._id || response.controlId,
        controlIdString: response.controlId?.id || '',
        controlName: response.controlId?.nome || 'Controle não identificado',
        maturityLevel: response.maturityLevel || 'N/A',
        scenarioDescription: response.scenarioDescription || '',
        observations: response.observations || '',
        evidence: response.evidence || [],
        submittedAt: response.submittedAt,
        updatedAt: response.updatedAt,
        userName: response.userId?.name || 'Usuário não identificado',
        userEmail: response.userId?.email || '',
      }));

      return res.status(200).json({
        success: true,
        data: formattedResponses,
        total: formattedResponses.length,
        message: `${formattedResponses.length} respostas encontradas para o plano`,
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar respostas por plano:', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}