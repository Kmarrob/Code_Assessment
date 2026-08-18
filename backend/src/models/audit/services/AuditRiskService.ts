import { AuditRisk, IAuditRisk } from '../models/AuditRisk';
import { AuditPlan } from '../models/AuditPlan';

export class AuditRiskService {
  /**
   * Criar novo risco
   */
  async create(data: Partial<IAuditRisk>): Promise<IAuditRisk> {
    // Gerar ID sequencial
    const count = await AuditRisk.countDocuments({ companyId: data.companyId });
    const riskId = `R-${String(count + 1).padStart(3, '0')}`;
    
    const risk = new AuditRisk({
      ...data,
      id: riskId,
    });
    
    return await risk.save();
  }

  /**
   * Buscar risco por ID
   */
  async findById(id: string): Promise<IAuditRisk | null> {
    return await AuditRisk.findById(id).lean();
  }

  /**
   * Buscar risco por ID (identificador único)
   */
  async findByRiskId(companyId: string, riskId: string): Promise<IAuditRisk | null> {
    return await AuditRisk.findOne({ companyId, id: riskId }).lean();
  }

  /**
   * Listar riscos de uma empresa
   */
  async findAllByCompany(
    companyId: string,
    options?: {
      status?: string;
      riskLevel?: string;
      auditPlanId?: string;
      limit?: number;
      skip?: number;
    }
  ): Promise<IAuditRisk[]> {
    const query: any = { companyId };
    
    if (options?.status) {
      query.status = options.status;
    }
    if (options?.riskLevel) {
      query.riskLevel = options.riskLevel;
    }
    if (options?.auditPlanId) {
      query.auditPlanId = options.auditPlanId;
    }
    
    let findQuery = AuditRisk.find(query).sort({ createdAt: -1 });
    
    if (options?.skip) {
      findQuery = findQuery.skip(options.skip);
    }
    if (options?.limit) {
      findQuery = findQuery.limit(options.limit);
    }
    
    return await findQuery.lean();
  }

  /**
   * Atualizar risco
   */
  async update(id: string, data: Partial<IAuditRisk>): Promise<IAuditRisk | null> {
    const risk = await AuditRisk.findById(id);
    if (!risk) return null;
    
    Object.assign(risk, data);
    risk.updatedBy = data.updatedBy || risk.updatedBy;
    risk.updatedAt = new Date();
    await risk.save();
    
    return risk.toObject();
  }

  /**
   * Atualizar avaliação do risco (probabilidade e impacto)
   */
  async updateAssessment(
    id: string,
    data: {
      probability: 1 | 2 | 3 | 4 | 5;
      impact: 1 | 2 | 3 | 4 | 5;
      updatedBy: string;
    }
  ): Promise<IAuditRisk | null> {
    const risk = await AuditRisk.findById(id);
    if (!risk) return null;
    
    risk.probability = data.probability;
    risk.impact = data.impact;
    risk.updatedBy = data.updatedBy;
    risk.updatedAt = new Date();
    await risk.save();
    
    return risk.toObject();
  }

  /**
   * Tratar risco (aplicar tratamento)
   */
  async treatRisk(
    id: string,
    data: {
      treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid';
      treatmentPlan: string;
      probabilityAfter: 1 | 2 | 3 | 4 | 5;
      impactAfter: 1 | 2 | 3 | 4 | 5;
      treatmentDeadline?: Date;
      treatedBy: string;
    }
  ): Promise<IAuditRisk | null> {
    const risk = await AuditRisk.findById(id);
    if (!risk) return null;
    
    risk.treatment = data.treatment;
    risk.treatmentPlan = data.treatmentPlan;
    risk.probabilityAfter = data.probabilityAfter;
    risk.impactAfter = data.impactAfter;
    risk.status = 'treated';
    risk.treatmentDeadline = data.treatmentDeadline;
    risk.treatedAt = new Date();
    risk.treatedBy = data.treatedBy;
    risk.updatedBy = data.treatedBy;
    risk.updatedAt = new Date();
    await risk.save();
    
    return risk.toObject();
  }

  /**
   * Monitorar risco (após tratamento)
   */
  async monitorRisk(
    id: string,
    data: {
      status: 'monitored' | 'closed';
      updatedBy: string;
    }
  ): Promise<IAuditRisk | null> {
    const risk = await AuditRisk.findById(id);
    if (!risk) return null;
    
    risk.status = data.status;
    risk.updatedBy = data.updatedBy;
    risk.updatedAt = new Date();
    await risk.save();
    
    return risk.toObject();
  }

  /**
   * Reabrir risco
   */
  async reopenRisk(
    id: string,
    data: {
      reason: string;
      updatedBy: string;
    }
  ): Promise<IAuditRisk | null> {
    const risk = await AuditRisk.findById(id);
    if (!risk) return null;
    
    risk.status = 'identified';
    risk.updatedBy = data.updatedBy;
    risk.updatedAt = new Date();
    await risk.save();
    
    return risk.toObject();
  }

  /**
   * Excluir risco (soft delete)
   */
  async delete(id: string): Promise<IAuditRisk | null> {
    return await AuditRisk.findByIdAndUpdate(
      id,
      {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /**
   * Obter estatísticas de riscos
   */
  async getStatistics(companyId: string): Promise<any> {
    const total = await AuditRisk.countDocuments({ companyId });
    const byStatus = await AuditRisk.aggregate([
      { $match: { companyId, deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    
    const byRiskLevel = await AuditRisk.aggregate([
      { $match: { companyId, deletedAt: null } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
    ]);
    
    const byTreatment = await AuditRisk.aggregate([
      { $match: { companyId, deletedAt: null } },
      { $group: { _id: '$treatment', count: { $sum: 1 } } },
    ]);
    
    const byResidualRisk = await AuditRisk.aggregate([
      { $match: { companyId, deletedAt: null, status: 'treated' } },
      { $group: { _id: '$residualRisk', count: { $sum: 1 } } },
    ]);
    
    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byRiskLevel: byRiskLevel.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byTreatment: byTreatment.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byResidualRisk: byResidualRisk.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  /**
   * Obter riscos críticos (high e critical)
   */
  async getCriticalRisks(companyId: string): Promise<IAuditRisk[]> {
    return await AuditRisk.find({
      companyId,
      riskLevel: { $in: ['high', 'critical'] },
      status: { $ne: 'closed' },
    }).sort({ riskLevel: -1 }).lean();
  }

  /**
   * Exportar riscos para formato de planilha
   */
  async exportToSpreadsheet(companyId: string): Promise<any> {
    const risks = await AuditRisk.find({ companyId }).sort({ id: 1 }).lean();
    
    return risks.map(risk => ({
      'ID': risk.id,
      'Descrição do Risco': risk.description,
      'Evento ou Ativo': risk.eventOrAsset,
      'Proprietário do Risco': risk.owner,
      'Ameaça': risk.threat,
      'Vulnerabilidade': risk.vulnerability,
      'Controle Existente': risk.existingControl,
      'Probabilidade': risk.probability,
      'Impacto': risk.impact,
      'Nível do Risco': risk.riskLevel,
      'Classificação do Risco': risk.riskClassification,
      'Tratamento': risk.treatment,
      'Plano de Tratamento': risk.treatmentPlan,
      'Probabilidade Após': risk.probabilityAfter,
      'Impacto Após': risk.impactAfter,
      'Risco Residual': risk.residualRisk,
      'Status': risk.status,
      'Prazo': risk.treatmentDeadline?.toLocaleDateString() || '',
    }));
  }
}

export const auditRiskService = new AuditRiskService();