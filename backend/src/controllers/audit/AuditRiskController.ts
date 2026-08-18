import { Request, Response } from 'express';
import { auditRiskService } from '../../models/audit/services/AuditRiskService';

export class AuditRiskController {
  /**
   * Criar novo risco
   * POST /api/internal-audit/risks
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        companyId,
        auditPlanId,
        description,
        eventOrAsset,
        owner,
        threat,
        vulnerability,
        existingControl,
        probability,
        impact,
        riskClassification,
        treatment,
        treatmentPlan,
        probabilityAfter,
        impactAfter,
        treatmentDeadline,
        status,
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const risk = await auditRiskService.create({
        companyId,
        auditPlanId,
        description,
        eventOrAsset,
        owner,
        threat,
        vulnerability,
        existingControl,
        probability,
        impact,
        riskClassification,
        treatment: treatment || 'mitigate',
        treatmentPlan: treatmentPlan || '',
        probabilityAfter: probabilityAfter || probability,
        impactAfter: impactAfter || impact,
        treatmentDeadline: treatmentDeadline ? new Date(treatmentDeadline) : undefined,
        status: status || 'identified',
        createdBy: userId,
        updatedBy: userId,
      });

      return res.status(201).json(risk);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Buscar risco por ID
   * GET /api/internal-audit/risks/:id
   */
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const risk = await auditRiskService.findById(id);

      if (!risk) {
        return res.status(404).json({ error: 'Risco não encontrado' });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Buscar risco por ID (identificador único)
   * GET /api/internal-audit/risks/company/:companyId/risk-id/:riskId
   */
  async findByRiskId(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId, riskId } = req.params;
      const risk = await auditRiskService.findByRiskId(companyId, riskId);

      if (!risk) {
        return res.status(404).json({ error: 'Risco não encontrado' });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Listar riscos de uma empresa
   * GET /api/internal-audit/risks/company/:companyId
   */
  async findAllByCompany(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.params;
      const { status, riskLevel, auditPlanId, limit, skip } = req.query;

      const risks = await auditRiskService.findAllByCompany(companyId, {
        status: status as string,
        riskLevel: riskLevel as string,
        auditPlanId: auditPlanId as string,
        limit: limit ? parseInt(limit as string) : undefined,
        skip: skip ? parseInt(skip as string) : undefined,
      });

      return res.json(risks);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar risco
   * PUT /api/internal-audit/risks/:id
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const data = req.body;
      data.updatedBy = userId;

      // Converter datas
      if (data.treatmentDeadline) {
        data.treatmentDeadline = new Date(data.treatmentDeadline);
      }
      if (data.treatedAt) {
        data.treatedAt = new Date(data.treatedAt);
      }

      const risk = await auditRiskService.update(id, data);

      if (!risk) {
        return res.status(404).json({ error: 'Risco não encontrado' });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar avaliação do risco
   * PUT /api/internal-audit/risks/:id/assessment
   */
  async updateAssessment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { probability, impact } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const risk = await auditRiskService.updateAssessment(id, {
        probability,
        impact,
        updatedBy: userId,
      });

      if (!risk) {
        return res.status(404).json({ error: 'Risco não encontrado' });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Tratar risco
   * POST /api/internal-audit/risks/:id/treat
   */
  async treatRisk(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const {
        treatment,
        treatmentPlan,
        probabilityAfter,
        impactAfter,
        treatmentDeadline,
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const risk = await auditRiskService.treatRisk(id, {
        treatment,
        treatmentPlan,
        probabilityAfter,
        impactAfter,
        treatmentDeadline: treatmentDeadline ? new Date(treatmentDeadline) : undefined,
        treatedBy: userId,
      });

      if (!risk) {
        return res.status(404).json({ error: 'Risco não encontrado' });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Monitorar risco
   * PUT /api/internal-audit/risks/:id/monitor
   */
  async monitorRisk(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (status !== 'monitored' && status !== 'closed') {
        return res.status(400).json({ error: 'Status inválido. Use "monitored" ou "closed"' });
      }

      const risk = await auditRiskService.monitorRisk(id, {
        status,
        updatedBy: userId,
      });

      if (!risk) {
        return res.status(404).json({ error: 'Risco não encontrado' });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Reabrir risco
   * POST /api/internal-audit/risks/:id/reopen
   */
  async reopenRisk(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const risk = await auditRiskService.reopenRisk(id, {
        reason,
        updatedBy: userId,
      });

      if (!risk) {
        return res.status(404).json({ error: 'Risco não encontrado' });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Excluir risco
   * DELETE /api/internal-audit/risks/:id
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const risk = await auditRiskService.delete(id);

      if (!risk) {
        return res.status(404).json({ error: 'Risco não encontrado' });
      }

      return res.json({ message: 'Risco excluído com sucesso' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter estatísticas de riscos
   * GET /api/internal-audit/risks/company/:companyId/stats
   */
  async getStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.params;
      const stats = await auditRiskService.getStatistics(companyId);

      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter riscos críticos
   * GET /api/internal-audit/risks/company/:companyId/critical
   */
  async getCriticalRisks(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.params;
      const risks = await auditRiskService.getCriticalRisks(companyId);

      return res.json(risks);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Exportar riscos para formato de planilha
   * GET /api/internal-audit/risks/company/:companyId/export
   */
  async exportToSpreadsheet(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.params;
      const data = await auditRiskService.exportToSpreadsheet(companyId);

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export const auditRiskController = new AuditRiskController();