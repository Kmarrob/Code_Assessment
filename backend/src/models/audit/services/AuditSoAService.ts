import { AuditSoA, IAuditSoA, IAuditSoAControl } from '../models/AuditSoA';
import { AuditQuestion } from '../models/AuditQuestion';

export class AuditSoAService {
  /**
   * Criar nova Declaração de Aplicabilidade
   */
  async create(data: Partial<IAuditSoA>): Promise<IAuditSoA> {
    const soa = new AuditSoA(data);
    
    // Inicializar controles a partir das perguntas existentes
    if (!data.controls || data.controls.length === 0) {
      const questions = await AuditQuestion.find().distinct('controlId');
      const controls = questions.map((controlId: string) => ({
        clause: controlId,
        title: this.getControlTitle(controlId),
        objective: this.getControlObjective(controlId),
        motivators: {
          business: false,
          risk: false,
          legal: false,
          contract: false,
        },
        applicable: true,
        implemented: false,
      }));
      soa.controls = controls;
    }
    
    if (typeof soa.updateStatistics === 'function') {
      soa.updateStatistics();
    }
    await soa.save();
    return soa.toObject();
  }

  /**
   * Buscar SoA por ID
   */
  async findById(id: string): Promise<IAuditSoA | null> {
    const doc = await AuditSoA.findById(id).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      ...doc,
    } as IAuditSoA;
  }

  /**
   * Buscar SoA por empresa
   */
  async findByCompany(companyId: string, options?: { status?: string }): Promise<IAuditSoA[]> {
    const query: any = { companyId };
    if (options?.status) {
      query.status = options.status;
    }
    const docs = await AuditSoA.find(query).sort({ version: -1 }).lean();
    return docs.map(doc => ({
      id: doc._id.toString(),
      ...doc,
    })) as IAuditSoA[];
  }

  /**
   * Buscar SoA ativa por empresa
   */
  async findActiveByCompany(companyId: string): Promise<IAuditSoA | null> {
    const doc = await AuditSoA.findOne({ companyId, status: 'approved' })
      .sort({ version: -1 })
      .lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      ...doc,
    } as IAuditSoA;
  }

  /**
   * Atualizar SoA
   */
  async update(id: string, data: Partial<IAuditSoA>): Promise<IAuditSoA | null> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    Object.assign(soa, data);
    if (typeof soa.updateStatistics === 'function') {
      soa.updateStatistics();
    }
    soa.updatedAt = new Date();
    await soa.save();
    
    return soa.toObject();
  }

  /**
   * Atualizar um controle específico da SoA
   */
  async updateControl(
    id: string,
    clause: string,
    data: Partial<IAuditSoAControl>
  ): Promise<IAuditSoA | null> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    const controlIndex = soa.controls.findIndex(c => c.clause === clause);
    if (controlIndex === -1) {
      throw new Error(`Controle ${clause} não encontrado`);
    }
    
    const control = soa.controls[controlIndex];
    if (!control) {  // ✅ CORREÇÃO: verificar se control existe
      throw new Error(`Controle ${clause} não encontrado`);
    }
    
    Object.assign(control, data);
    soa.markModified('controls');
    if (typeof soa.updateStatistics === 'function') {
      soa.updateStatistics();
    }
    soa.updatedAt = new Date();
    await soa.save();
    
    return soa.toObject();
  }

  /**
   * Aprovar SoA
   */
  async approve(id: string, approvedBy: string): Promise<IAuditSoA | null> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    soa.status = 'approved';
    soa.approvedBy = approvedBy;
    soa.approvedAt = new Date();
    soa.updatedAt = new Date();
    await soa.save();
    
    return soa.toObject();
  }

  /**
   * Arquivar SoA
   */
  async archive(id: string): Promise<IAuditSoA | null> {
    const doc = await AuditSoA.findByIdAndUpdate(
      id,
      {
        status: 'archived',
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      ...doc,
    } as IAuditSoA;
  }

  /**
   * Excluir SoA (soft delete)
   */
  async delete(id: string): Promise<IAuditSoA | null> {
    const doc = await AuditSoA.findByIdAndUpdate(
      id,
      {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      ...doc,
    } as IAuditSoA;
  }

  /**
   * Obter estatísticas da SoA
   */
  async getStatistics(id: string): Promise<any> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    return {
      total: soa.statistics?.total || 0,
      applicable: soa.statistics?.applicable || 0,
      notApplicable: soa.statistics?.notApplicable || 0,
      implemented: soa.statistics?.implemented || 0,
      notImplemented: soa.statistics?.notImplemented || 0,
      byCategory: soa.statistics?.byCategory || { organizational: 0, people: 0, physical: 0, technological: 0 },
      implementationRate: soa.statistics?.applicable > 0 
        ? (soa.statistics.implemented / soa.statistics.applicable) * 100 
        : 0,
    };
  }

  /**
   * Exportar SoA para formato de planilha
   */
  async exportToSpreadsheet(id: string): Promise<any> {
    const soa = await AuditSoA.findById(id);
    if (!soa) return null;
    
    return soa.controls.map(control => ({
      'Cláusula ISO 27002': control.clause,
      'Título': control.title,
      'Objetivo de controle': control.objective,
      'Motivador - Negócio': control.motivators.business ? 'Sim' : 'Não',
      'Motivador - Risco': control.motivators.risk ? 'Sim' : 'Não',
      'Motivador - Jurídico': control.motivators.legal ? 'Sim' : 'Não',
      'Motivador - Contrato': control.motivators.contract ? 'Sim' : 'Não',
      'É aplicável?': control.applicable ? 'Sim' : 'Não',
      'Data da última avaliação': control.lastAssessmentDate?.toLocaleDateString() || '',
      'Por que não é aplicável?': control.justification || '',
      'Implementado?': control.implemented ? 'Sim' : 'Não',
      'Data de implementação': control.implementationDate?.toLocaleDateString() || '',
      'Responsável': control.responsible || '',
      'Evidência': control.evidence || '',
    }));
  }

  // ============================================================
  // MÉTODOS AUXILIARES (getControlTitle, getControlObjective)
  // ============================================================
  // ... manter os mesmos métodos auxiliares que já existem ...
  // (getControlTitle e getControlObjective com todos os 93 controles)

  private getControlTitle(clause: string): string {
    // ... manter o código existente ...
  }

  private getControlObjective(clause: string): string {
    // ... manter o código existente ...
  }
}

export const auditSoAService = new AuditSoAService();