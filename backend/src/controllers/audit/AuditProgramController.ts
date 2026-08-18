import { Response } from 'express';
import { auditProgramService } from '../../models/audit/services/AuditProgramService';
import { AuditProgram } from '../../models/audit/models/AuditProgram';
import { AuthenticatedRequest } from '../../types';

export class AuditProgramController {
  /**
   * Criar novo programa de auditorias
   * POST /api/internal-audit/program
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { companyId, year, sectors, supplierAudits, externalAudit, otherActivities, observations } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!companyId) {
        return res.status(400).json({ error: 'companyId é obrigatório' });
      }

      if (!year) {
        return res.status(400).json({ error: 'year é obrigatório' });
      }

      // Verificar se já existe programa para este ano
      const existing = await auditProgramService.findByCompanyAndYear(companyId, year);
      if (existing) {
        return res.status(409).json({ error: `Já existe um programa de auditorias para o ano ${year}` });
      }

      const program = await auditProgramService.create({
        companyId,
        year,
        sectors: sectors || [],
        supplierAudits: supplierAudits || [],
        externalAudit: externalAudit || { status: 'not_planned' },
        otherActivities: otherActivities || [],
        createdBy: userId,
        status: 'draft',
        observations,
      });

      return res.status(201).json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Buscar programa por ID
   * GET /api/internal-audit/program/:id
   */
  async findById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const program = await auditProgramService.findById(id);

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Buscar programa por empresa e ano
   * GET /api/internal-audit/program/company/:companyId/year/:year
   */
  async findByCompanyAndYear(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { companyId, year } = req.params;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId é obrigatório' });
      }

      if (!year) {
        return res.status(400).json({ error: 'year é obrigatório' });
      }

      const program = await auditProgramService.findByCompanyAndYear(
        companyId,
        parseInt(year)
      );

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Listar programas de uma empresa
   * GET /api/internal-audit/program/company/:companyId
   */
  async findAllByCompany(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId é obrigatório' });
      }

      const { status, limit, skip } = req.query;

      const programs = await auditProgramService.findAllByCompany(companyId, {
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        skip: skip ? parseInt(skip as string) : undefined,
      });

      return res.json(programs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar programa
   * PUT /api/internal-audit/program/:id
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { sectors, supplierAudits, externalAudit, otherActivities, observations } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const program = await auditProgramService.update(id, {
        sectors,
        supplierAudits,
        externalAudit,
        otherActivities,
        observations,
      });

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Aprovar programa
   * POST /api/internal-audit/program/:id/approve
   */
  async approve(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const program = await auditProgramService.approve(id, userId);

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Ativar programa
   * POST /api/internal-audit/program/:id/activate
   */
  async activate(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const program = await auditProgramService.activate(id);

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Arquivar programa
   * POST /api/internal-audit/program/:id/archive
   */
  async archive(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const program = await auditProgramService.archive(id);

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Adicionar setor ao programa
   * POST /api/internal-audit/program/:id/sector
   */
  async addSector(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, processes, importance, scoreA, scoreB, frequency, nextAuditDate } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      if (!name) {
        return res.status(400).json({ error: 'name é obrigatório' });
      }

      const program = await auditProgramService.addSector(id, {
        name,
        processes: processes || [],
        importance: importance || 'standard',
        scoreA: scoreA || 0,
        scoreB: scoreB || 0,
        frequency: frequency || 'annual',
        nextAuditDate: nextAuditDate ? new Date(nextAuditDate) : undefined,
      });

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar setor do programa
   * PUT /api/internal-audit/program/:id/sector/:index
   */
  async updateSector(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id, index } = req.params;
      const data = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      if (!index) {
        return res.status(400).json({ error: 'index é obrigatório' });
      }

      const program = await auditProgramService.updateSector(id, parseInt(index), data);

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Adicionar auditoria de fornecedor
   * POST /api/internal-audit/program/:id/supplier-audit
   */
  async addSupplierAudit(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { supplierName, supplierId, auditDate, scope } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      if (!supplierName) {
        return res.status(400).json({ error: 'supplierName é obrigatório' });
      }

      if (!auditDate) {
        return res.status(400).json({ error: 'auditDate é obrigatório' });
      }

      if (!scope) {
        return res.status(400).json({ error: 'scope é obrigatório' });
      }

      const program = await auditProgramService.addSupplierAudit(id, {
        supplierName,
        supplierId,
        auditDate: new Date(auditDate),
        scope,
      });

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar auditoria de fornecedor
   * PUT /api/internal-audit/program/:id/supplier-audit/:index
   */
  async updateSupplierAudit(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id, index } = req.params;
      const data = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      if (!index) {
        return res.status(400).json({ error: 'index é obrigatório' });
      }

      const program = await auditProgramService.updateSupplierAudit(id, parseInt(index), data);

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar auditoria externa
   * PUT /api/internal-audit/program/:id/external-audit
   */
  async updateExternalAudit(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      if (data.plannedDate) {
        data.plannedDate = new Date(data.plannedDate);
      }

      const program = await auditProgramService.updateExternalAudit(id, data);

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Adicionar atividade ao programa
   * POST /api/internal-audit/program/:id/activity
   */
  async addActivity(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description, scheduledDate } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      if (!name) {
        return res.status(400).json({ error: 'name é obrigatório' });
      }

      if (!scheduledDate) {
        return res.status(400).json({ error: 'scheduledDate é obrigatório' });
      }

      const program = await auditProgramService.addActivity(id, {
        name,
        description: description || '',
        scheduledDate: new Date(scheduledDate),
      });

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar atividade
   * PUT /api/internal-audit/program/:id/activity/:index
   */
  async updateActivity(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id, index } = req.params;
      const data = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      if (!index) {
        return res.status(400).json({ error: 'index é obrigatório' });
      }

      if (data.scheduledDate) {
        data.scheduledDate = new Date(data.scheduledDate);
      }
      if (data.completedAt) {
        data.completedAt = new Date(data.completedAt);
      }

      const program = await auditProgramService.updateActivity(id, parseInt(index), data);

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(program);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Excluir programa
   * DELETE /api/internal-audit/program/:id
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const program = await auditProgramService.delete(id);

      if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json({ message: 'Programa excluído com sucesso' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter estatísticas do programa
   * GET /api/internal-audit/program/:id/stats
   */
  async getStatistics(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const stats = await auditProgramService.getStatistics(id);

      if (!stats) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Gerar próximas auditorias
   * GET /api/internal-audit/program/:id/next-audits
   */
  async generateNextAudits(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const nextAudits = await auditProgramService.generateNextAudits(id);

      if (!nextAudits) {
        return res.status(404).json({ error: 'Programa não encontrado' });
      }

      return res.json(nextAudits);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export const auditProgramController = new AuditProgramController();