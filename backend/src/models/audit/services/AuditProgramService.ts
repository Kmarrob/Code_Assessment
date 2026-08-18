import { AuditProgram, IAuditProgram } from '../models/AuditProgram';
import { AuditPlan } from '../models/AuditPlan';
import mongoose from 'mongoose';

export class AuditProgramService {
  /**
   * Criar um novo programa de auditorias
   */
  async create(data: Partial<IAuditProgram>): Promise<IAuditProgram> {
    const program = new AuditProgram(data);
    return await program.save();
  }

  /**
   * Buscar programa por ID
   */
  async findById(id: string): Promise<IAuditProgram | null> {
    return await AuditProgram.findById(id).lean();
  }

  /**
   * Buscar programa por empresa e ano
   */
  async findByCompanyAndYear(companyId: string, year: number): Promise<IAuditProgram | null> {
    return await AuditProgram.findOne({ companyId, year }).lean();
  }

  /**
   * Listar programas de uma empresa
   */
  async findAllByCompany(companyId: string, options?: { status?: string; limit?: number; skip?: number }): Promise<IAuditProgram[]> {
    const query: any = { companyId };
    if (options?.status) {
      query.status = options.status;
    }
    
    let findQuery = AuditProgram.find(query).sort({ year: -1 });
    
    if (options?.skip) {
      findQuery = findQuery.skip(options.skip);
    }
    if (options?.limit) {
      findQuery = findQuery.limit(options.limit);
    }
    
    return await findQuery.lean();
  }

  /**
   * Atualizar programa
   */
  async update(id: string, data: Partial<IAuditProgram>): Promise<IAuditProgram | null> {
    return await AuditProgram.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Aprovar programa
   */
  async approve(id: string, approvedBy: string): Promise<IAuditProgram | null> {
    return await AuditProgram.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /**
   * Ativar programa (iniciar execução)
   */
  async activate(id: string): Promise<IAuditProgram | null> {
    return await AuditProgram.findByIdAndUpdate(
      id,
      {
        status: 'active',
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /**
   * Arquivar programa
   */
  async archive(id: string): Promise<IAuditProgram | null> {
    return await AuditProgram.findByIdAndUpdate(
      id,
      {
        status: 'archived',
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /**
   * Adicionar setor ao programa
   */
  async addSector(
    id: string,
    sector: {
      name: string;
      processes: string[];
      importance: 'critical' | 'standard';
      scoreA: number;
      scoreB: number;
      frequency: 'annual' | 'semiannual' | 'quarterly';
      nextAuditDate?: Date;
    }
  ): Promise<IAuditProgram | null> {
    const totalScore = sector.scoreA + sector.scoreB;
    
    return await AuditProgram.findByIdAndUpdate(
      id,
      {
        $push: {
          sectors: {
            ...sector,
            totalScore,
            status: 'scheduled',
          },
        },
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Atualizar setor do programa
   */
  async updateSector(
    id: string,
    sectorIndex: number,
    data: Partial<{
      name: string;
      processes: string[];
      importance: 'critical' | 'standard';
      scoreA: number;
      scoreB: number;
      frequency: 'annual' | 'semiannual' | 'quarterly';
      lastAuditDate: Date;
      nextAuditDate: Date;
      status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      auditPlanId: string;
    }>
  ): Promise<IAuditProgram | null> {
    const program = await AuditProgram.findById(id);
    if (!program) return null;
    
    if (sectorIndex < 0 || sectorIndex >= program.sectors.length) {
      throw new Error('Setor não encontrado');
    }
    
    const sector = program.sectors[sectorIndex];
    Object.assign(sector, data);
    
    // Recalcular totalScore se scoreA ou scoreB foram alterados
    if (data.scoreA !== undefined || data.scoreB !== undefined) {
      sector.totalScore = (data.scoreA ?? sector.scoreA) + (data.scoreB ?? sector.scoreB);
    }
    
    program.markModified('sectors');
    program.updatedAt = new Date();
    await program.save();
    
    return program.toObject();
  }

  /**
   * Adicionar auditoria de fornecedor
   */
  async addSupplierAudit(
    id: string,
    supplierAudit: {
      supplierName: string;
      supplierId?: string;
      auditDate: Date;
      scope: string;
    }
  ): Promise<IAuditProgram | null> {
    return await AuditProgram.findByIdAndUpdate(
      id,
      {
        $push: {
          supplierAudits: {
            ...supplierAudit,
            status: 'scheduled',
          },
        },
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Atualizar auditoria de fornecedor
   */
  async updateSupplierAudit(
    id: string,
    supplierIndex: number,
    data: Partial<{
      supplierName: string;
      supplierId: string;
      auditDate: Date;
      scope: string;
      status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      auditPlanId: string;
    }>
  ): Promise<IAuditProgram | null> {
    const program = await AuditProgram.findById(id);
    if (!program) return null;
    
    if (supplierIndex < 0 || supplierIndex >= program.supplierAudits.length) {
      throw new Error('Auditoria de fornecedor não encontrada');
    }
    
    const supplierAudit = program.supplierAudits[supplierIndex];
    Object.assign(supplierAudit, data);
    
    program.markModified('supplierAudits');
    program.updatedAt = new Date();
    await program.save();
    
    return program.toObject();
  }

  /**
   * Atualizar auditoria externa
   */
  async updateExternalAudit(
    id: string,
    data: Partial<{
      plannedDate: Date;
      certificationBody: string;
      scope: string;
      status: 'not_planned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      auditPlanId: string;
    }>
  ): Promise<IAuditProgram | null> {
    const program = await AuditProgram.findById(id);
    if (!program) return null;
    
    Object.assign(program.externalAudit, data);
    program.markModified('externalAudit');
    program.updatedAt = new Date();
    await program.save();
    
    return program.toObject();
  }

  /**
   * Adicionar atividade ao programa
   */
  async addActivity(
    id: string,
    activity: {
      name: string;
      description: string;
      scheduledDate: Date;
    }
  ): Promise<IAuditProgram | null> {
    return await AuditProgram.findByIdAndUpdate(
      id,
      {
        $push: {
          otherActivities: {
            ...activity,
            status: 'pending',
          },
        },
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Atualizar atividade
   */
  async updateActivity(
    id: string,
    activityIndex: number,
    data: Partial<{
      name: string;
      description: string;
      scheduledDate: Date;
      status: 'pending' | 'in_progress' | 'completed';
      completedAt: Date;
    }>
  ): Promise<IAuditProgram | null> {
    const program = await AuditProgram.findById(id);
    if (!program) return null;
    
    if (activityIndex < 0 || activityIndex >= program.otherActivities.length) {
      throw new Error('Atividade não encontrada');
    }
    
    const activity = program.otherActivities[activityIndex];
    Object.assign(activity, data);
    
    program.markModified('otherActivities');
    program.updatedAt = new Date();
    await program.save();
    
    return program.toObject();
  }

  /**
   * Excluir programa (soft delete)
   */
  async delete(id: string): Promise<IAuditProgram | null> {
    return await AuditProgram.findByIdAndUpdate(
      id,
      {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /**
   * Obter estatísticas do programa
   */
  async getStatistics(id: string): Promise<any> {
    const program = await AuditProgram.findById(id);
    if (!program) return null;
    
    const totalSectors = program.sectors.length;
    const completedSectors = program.sectors.filter(s => s.status === 'completed').length;
    const inProgressSectors = program.sectors.filter(s => s.status === 'in_progress').length;
    const scheduledSectors = program.sectors.filter(s => s.status === 'scheduled').length;
    
    const totalSupplierAudits = program.supplierAudits.length;
    const completedSupplierAudits = program.supplierAudits.filter(s => s.status === 'completed').length;
    
    return {
      sectors: {
        total: totalSectors,
        completed: completedSectors,
        inProgress: inProgressSectors,
        scheduled: scheduledSectors,
        completionRate: totalSectors > 0 ? (completedSectors / totalSectors) * 100 : 0,
      },
      supplierAudits: {
        total: totalSupplierAudits,
        completed: completedSupplierAudits,
        completionRate: totalSupplierAudits > 0 ? (completedSupplierAudits / totalSupplierAudits) * 100 : 0,
      },
      externalAudit: {
        status: program.externalAudit.status,
        plannedDate: program.externalAudit.plannedDate,
      },
      otherActivities: {
        total: program.otherActivities.length,
        completed: program.otherActivities.filter(a => a.status === 'completed').length,
      },
    };
  }

  /**
   * Gerar próximas auditorias baseado no programa
   */
  async generateNextAudits(id: string): Promise<any> {
    const program = await AuditProgram.findById(id);
    if (!program) return null;
    
    const nextAudits = [];
    
    // Para cada setor, calcular próxima auditoria
    for (const sector of program.sectors) {
      if (sector.status === 'completed' && sector.nextAuditDate) {
        nextAudits.push({
          type: 'sector',
          name: sector.name,
          date: sector.nextAuditDate,
          frequency: sector.frequency,
        });
      } else if (sector.status === 'scheduled' && sector.nextAuditDate) {
        nextAudits.push({
          type: 'sector',
          name: sector.name,
          date: sector.nextAuditDate,
          frequency: sector.frequency,
        });
      }
    }
    
    // Próximas auditorias de fornecedores
    const nextSupplierAudits = program.supplierAudits
      .filter(s => s.status === 'scheduled')
      .sort((a, b) => a.auditDate.getTime() - b.auditDate.getTime());
    
    for (const supplier of nextSupplierAudits) {
      nextAudits.push({
        type: 'supplier',
        name: supplier.supplierName,
        date: supplier.auditDate,
      });
    }
    
    // Auditoria externa
    if (program.externalAudit.status === 'scheduled' && program.externalAudit.plannedDate) {
      nextAudits.push({
        type: 'external',
        name: 'Auditoria Externa',
        date: program.externalAudit.plannedDate,
        certificationBody: program.externalAudit.certificationBody,
      });
    }
    
    // Ordenar por data
    nextAudits.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return nextAudits;
  }
}

export const auditProgramService = new AuditProgramService();