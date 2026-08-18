import { Response } from 'express';
import { AuditFindingService } from '../../models/audit/services/AuditFindingService';
import { CreateAuditFindingDTO, UpdateAuditFindingDTO } from '../../models/audit/types/audit.types';
import { AuthenticatedRequest } from '../../types';

const auditFindingService = new AuditFindingService();

export class AuditFindingController {
  // ============================================================
  // CRIAR NC
  // ============================================================
  async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id?.toString();
      const { auditPlanId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const data: CreateAuditFindingDTO = req.body;
      const finding = await auditFindingService.create(data, auditPlanId, userId);

      return res.status(201).json({ success: true, data: finding });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR NCs POR PLANO
  // ============================================================
  async findByPlanId(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const findings = await auditFindingService.findByPlanId(auditPlanId);

      return res.status(200).json({ success: true, data: findings });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR NCs COM FILTROS
  // ============================================================
  async findAll(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { auditPlanId, type, status, area, createdBy } = req.query;

      const filters = {
        auditPlanId: auditPlanId as string,
        type: type as any,
        status: status as any,
        area: area as string,
        createdBy: createdBy as string,
      };

      const findings = await auditFindingService.findAll(filters);

      return res.status(200).json({ success: true, data: findings });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // BUSCAR NC POR ID
  // ============================================================
  async findById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      const finding = await auditFindingService.findById(id);

      if (!finding) {
        return res.status(404).json({ success: false, message: 'NC não encontrada' });
      }

      return res.status(200).json({ success: true, data: finding });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ATUALIZAR NC
  // ============================================================
  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();
      const data: UpdateAuditFindingDTO = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const finding = await auditFindingService.update(id, data, userId);

      if (!finding) {
        return res.status(404).json({ success: false, message: 'NC não encontrada' });
      }

      return res.status(200).json({ success: true, data: finding });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ENVIAR NC PARA VALIDAÇÃO (corresponde a submit na rota)
  // ============================================================
  async submitForValidation(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const finding = await auditFindingService.submitForValidation(id, userId);

      if (!finding) {
        return res.status(404).json({ success: false, message: 'NC não encontrada' });
      }

      return res.status(200).json({ success: true, data: finding });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // VALIDAR NC (FECHAR/REABRIR)
  // ============================================================
  async validate(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();
      const { status, comment } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!status || !['closed', 'reopened'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status deve ser "closed" ou "reopened"' });
      }

      const finding = await auditFindingService.validate(id, userId, status, comment);

      if (!finding) {
        return res.status(404).json({ success: false, message: 'NC não encontrada' });
      }

      return res.status(200).json({ success: true, data: finding });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ESTATÍSTICAS DE NCs
  // ============================================================
  async getStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const stats = await auditFindingService.getStats(auditPlanId);

      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}