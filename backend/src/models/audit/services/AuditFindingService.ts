import { AuditFinding } from '../models/AuditFinding';
import { AuditPlan } from '../models/AuditPlan';
import { IAuditFinding, CreateAuditFindingDTO, UpdateAuditFindingDTO, AuditFindingFilters } from '../types/audit.types';

export class AuditFindingService {
  // ============================================================
  // CRIAR NC
  // ============================================================
  async create(data: CreateAuditFindingDTO, auditPlanId: string, createdBy: string): Promise<IAuditFinding> {
    // Verificar se o plano existe
    const plan = await AuditPlan.findById(auditPlanId);
    if (!plan) throw new Error('Plano de auditoria não encontrado');

    // Verificar se o criador faz parte da equipe de auditoria
    const isTeamMember = 
      plan.team.leadAuditor === createdBy || 
      plan.team.auditors.includes(createdBy);

    if (!isTeamMember) {
      throw new Error('Apenas membros da equipe de auditoria podem criar NCs');
    }

    // TODO: Verificar se o auditor não está auditando sua própria área
    // await this.validateAuditorNotAuditingOwnArea(createdBy, data.area);

    const finding = new AuditFinding({
      ...data,
      auditPlanId,
      createdBy,
      status: 'open',
    });

    await finding.save();
    return finding.toObject();
  }

  // ============================================================
  // LISTAR NCs POR PLANO
  // ============================================================
  async findByPlanId(auditPlanId: string): Promise<IAuditFinding[]> {
    return AuditFinding.find({ auditPlanId }).sort({ createdAt: -1 }).lean();
  }

  // ============================================================
  // LISTAR NCs COM FILTROS
  // ============================================================
  async findAll(filters: AuditFindingFilters): Promise<IAuditFinding[]> {
    const query: any = {};

    if (filters.auditPlanId) query.auditPlanId = filters.auditPlanId;
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.area) query.area = filters.area;
    if (filters.createdBy) query.createdBy = filters.createdBy;

    return AuditFinding.find(query).sort({ createdAt: -1 }).lean();
  }

  // ============================================================
  // BUSCAR NC POR ID
  // ============================================================
  async findById(id: string): Promise<IAuditFinding | null> {
    return AuditFinding.findById(id).lean();
  }

  // ============================================================
  // ATUALIZAR NC
  // ============================================================
  async update(id: string, data: UpdateAuditFindingDTO, userId: string): Promise<IAuditFinding | null> {
    const finding = await AuditFinding.findById(id);
    if (!finding) throw new Error('NC não encontrada');

    // Apenas o criador pode editar NCs abertas
    if (finding.createdBy !== userId) {
      throw new Error('Apenas o criador pode editar esta NC');
    }

    if (finding.status !== 'open' && finding.status !== 'in_progress') {
      throw new Error('Apenas NCs abertas ou em andamento podem ser editadas');
    }

    Object.assign(finding, data);
    await finding.save();

    return finding.toObject();
  }

  // ============================================================
  // VALIDAR NC (FECHAR/REABRIR)
  // ============================================================
  async validate(id: string, validatorId: string, status: 'closed' | 'reopened', comment?: string): Promise<IAuditFinding | null> {
    const finding = await AuditFinding.findById(id);
    if (!finding) throw new Error('NC não encontrada');

    // Validar: validatorId não pode ser o mesmo que createdBy
    if (finding.createdBy === validatorId) {
      throw new Error('O validador não pode ser o mesmo que criou a NC');
    }

    // Verificar se o validador é REP ou ADMIN ou leadAuditor
    // TODO: Verificar permissões

    if (status === 'closed' && finding.status !== 'pending_validation') {
      throw new Error('Apenas NCs aguardando validação podem ser fechadas');
    }

    if (status === 'reopened' && finding.status !== 'closed') {
      throw new Error('Apenas NCs fechadas podem ser reabertas');
    }

    finding.status = status;
    finding.validatedBy = validatorId;
    finding.validatedAt = new Date();
    await finding.save();

    // TODO: Enviar notificação para o criador da NC
    return finding.toObject();
  }

  // ============================================================
  // ENVIAR NC PARA VALIDAÇÃO
  // ============================================================
  async submitForValidation(id: string, userId: string): Promise<IAuditFinding | null> {
    const finding = await AuditFinding.findById(id);
    if (!finding) throw new Error('NC não encontrada');

    // Apenas o criador pode enviar para validação
    if (finding.createdBy !== userId) {
      throw new Error('Apenas o criador pode enviar esta NC para validação');
    }

    if (finding.status !== 'in_progress') {
      throw new Error('Apenas NCs em andamento podem ser enviadas para validação');
    }

    finding.status = 'pending_validation';
    await finding.save();

    return finding.toObject();
  }

  // ============================================================
  // ESTATÍSTICAS DE NCs
  // ============================================================
  async getStats(auditPlanId: string): Promise<any> {
    const total = await AuditFinding.countDocuments({ auditPlanId });
    const open = await AuditFinding.countDocuments({ auditPlanId, status: { $in: ['open', 'in_progress'] } });
    const closed = await AuditFinding.countDocuments({ auditPlanId, status: 'closed' });
    const ncA = await AuditFinding.countDocuments({ auditPlanId, type: 'nc_a' });
    const ncB = await AuditFinding.countDocuments({ auditPlanId, type: 'nc_b' });
    const pendingValidation = await AuditFinding.countDocuments({ auditPlanId, status: 'pending_validation' });

    return { total, open, closed, ncA, ncB, pendingValidation };
  }

  // ============================================================
  // VALIDAR AUDITOR NÃO AUDITAR PRÓPRIA ÁREA
  // ============================================================
  private async validateAuditorNotAuditingOwnArea(auditorId: string, area: string): Promise<void> {
    // TODO: Buscar a área do auditor e verificar se é a mesma
    // Se for a mesma, lançar erro
  }
}