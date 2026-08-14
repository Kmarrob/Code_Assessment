import { Request, Response } from 'express';
import { AuditFindingService } from '../../models/audit/services/AuditFindingService';
import { CreateAuditFindingDTO, UpdateAuditFindingDTO } from '../../models/audit/types/audit.types';

const auditFindingService = new AuditFindingService();

export class AuditFindingController {
  // ============================================================
  // CRIAR NC
  // ============================================================
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId;
      const { auditPlanId } = req.params;
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
  async findByPlanId(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      const findings = await auditFindingService.findByPlanId(auditPlanId);

      return res.status(200).json({ success: true, data: findings });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR NCs COM FILTROS
  // ============================================================
  async findAll(req: Request, res: Response): Promise<Response> {
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
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

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
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const data: UpdateAuditFindingDTO = req.body;

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
  // ENVIAR NC PARA VALIDAÇÃO
  // ============================================================
  async submitForValidation(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

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
  async validate(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { status, comment } = req.body;

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
  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      const stats = await auditFindingService.getStats(auditPlanId);

      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}