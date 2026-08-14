import { Request, Response } from 'express';
import { AuditReportService } from '../../models/audit/services/AuditReportService';
import { CreateAuditReportDTO, UpdateAuditReportDTO } from '../../models/audit/types/audit.types';

const auditReportService = new AuditReportService();

export class AuditReportController {
  // ============================================================
  // CRIAR RELATÓRIO
  // ============================================================
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const data: CreateAuditReportDTO = req.body;

      if (!data.auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const report = await auditReportService.create(data, userId);

      return res.status(201).json({ success: true, data: report });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR RELATÓRIOS
  // ============================================================
  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId, status, createdBy } = req.query;

      const filters = {
        auditPlanId: auditPlanId as string,
        status: status as any,
        createdBy: createdBy as string,
      };

      const reports = await auditReportService.findAll(filters);

      return res.status(200).json({ success: true, data: reports });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // BUSCAR RELATÓRIO POR ID
  // ============================================================
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      const report = await auditReportService.findById(id);

      if (!report) {
        return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
      }

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // BUSCAR RELATÓRIO POR PLANO
  // ============================================================
  async findByPlanId(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const reports = await auditReportService.findByPlanId(auditPlanId);

      return res.status(200).json({ success: true, data: reports });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ATUALIZAR RELATÓRIO
  // ============================================================
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const data: UpdateAuditReportDTO = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const report = await auditReportService.update(id, data, userId);

      if (!report) {
        return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
      }

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // ENVIAR PARA REVISÃO
  // ============================================================
  async submitForReview(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const report = await auditReportService.submitForReview(id, userId);

      if (!report) {
        return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
      }

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // APROVAR RELATÓRIO
  // ============================================================
  async approve(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const report = await auditReportService.approve(id, userId);

      if (!report) {
        return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
      }

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // REJEITAR RELATÓRIO
  // ============================================================
  async reject(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
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

      const report = await auditReportService.reject(id, userId, reason);

      if (!report) {
        return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
      }

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // GERAR RELATÓRIO AUTOMÁTICO
  // ============================================================
  async generateAutoReport(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const report = await auditReportService.generateAutoReport(auditPlanId);

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}