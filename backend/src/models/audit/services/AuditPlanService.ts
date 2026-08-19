import { AuditPlan } from '../models/AuditPlan';
import { AuditChecklist } from '../models/AuditChecklist';
import { IAuditPlan, CreateAuditPlanDTO, UpdateAuditPlanDTO, AuditFilters } from '../types/audit.types';

/**
 * Mapeia documento do MongoDB para IAuditPlan com id
 */
function mapToIAuditPlan(doc: any): IAuditPlan {
  if (!doc) return null as any;
  return {
    id: doc._id.toString(),
    ...doc,
  };
}

/**
 * Mapeia array de documentos para IAuditPlan[]
 */
function mapToIAuditPlanArray(docs: any[]): IAuditPlan[] {
  if (!docs) return [];
  return docs.map(doc => mapToIAuditPlan(doc));
}

export class AuditPlanService {
  // ============================================================
  // CRIAR PLANO DE AUDITORIA
  // ============================================================
  async create(data: CreateAuditPlanDTO, createdBy: string, companyId: string): Promise<IAuditPlan> {
    // Validar: leadAuditor não pode ser o mesmo que createdBy
    if (data.team.leadAuditor === createdBy) {
      throw new Error('O auditor líder não pode ser o mesmo que criou o plano');
    }

    const plan = new AuditPlan({
      ...data,
      companyId,
      createdBy,
      status: 'draft',
    });

    await plan.save();

    // Gerar checklist automaticamente baseado nos controles selecionados
    if (data.scope.controls && data.scope.controls.length > 0) {
      await this.generateChecklist(plan._id.toString(), data.scope.controls);
    }

    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // GERAR CHECKLIST AUTOMÁTICO
  // ============================================================
  private async generateChecklist(planId: string, controlIds: string[]): Promise<void> {
    // TODO: Buscar perguntas pré-definidas para cada controle
    // Por enquanto, criar checklists vazios para cada controle
    for (const controlId of controlIds) {
      const checklist = new AuditChecklist({
        auditPlanId: planId,
        controlId,
        questions: [],
        status: 'pending',
      });
      await checklist.save();
    }
  }

  // ============================================================
  // LISTAR PLANOS
  // ============================================================
  async findAll(filters: AuditFilters): Promise<IAuditPlan[]> {
    const query: any = {};

    if (filters.companyId) query.companyId = filters.companyId;
    if (filters.status) query.status = filters.status;

    if (filters.leadAuditor) {
      query['team.leadAuditor'] = filters.leadAuditor;
    }

    if (filters.auditor) {
      query['team.auditors'] = { $in: [filters.auditor] };
    }

    if (filters.startDate || filters.endDate) {
      query['period.startDate'] = {};
      if (filters.startDate) query['period.startDate'].$gte = filters.startDate;
      if (filters.endDate) query['period.startDate'].$lte = filters.endDate;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const docs = await AuditPlan.find(query)
      .sort({ 'period.startDate': -1 })
      .lean();

    return mapToIAuditPlanArray(docs);
  }

  // ============================================================
  // BUSCAR PLANO POR ID
  // ============================================================
  async findById(id: string): Promise<IAuditPlan | null> {
    const doc = await AuditPlan.findById(id).lean();
    if (!doc) return null;
    return mapToIAuditPlan(doc);
  }

  // ============================================================
  // ATUALIZAR PLANO
  // ============================================================
  async update(id: string, data: UpdateAuditPlanDTO, userId: string): Promise<IAuditPlan | null> {
    const plan = await AuditPlan.findById(id);
    if (!plan) throw new Error('Plano não encontrado');

    // Apenas REP ou ADMIN pode editar
    // Apenas planos em draft ou pending_approval podem ser editados
    if (plan.status !== 'draft' && plan.status !== 'pending_approval') {
      throw new Error('Apenas planos em rascunho ou aguardando aprovação podem ser editados');
    }

    Object.assign(plan, data);
    await plan.save();

    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // ENVIAR PARA APROVAÇÃO
  // ============================================================
  async submitForApproval(id: string, userId: string): Promise<IAuditPlan | null> {
    const plan = await AuditPlan.findById(id);
    if (!plan) throw new Error('Plano não encontrado');

    if (plan.createdBy !== userId) {
      throw new Error('Apenas o criador do plano pode enviar para aprovação');
    }

    if (plan.status !== 'draft') {
      throw new Error('Apenas planos em rascunho podem ser enviados para aprovação');
    }

    plan.status = 'pending_approval';
    await plan.save();

    // TODO: Enviar notificação para o leadAuditor
    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // APROVAR PLANO
  // ============================================================
  async approve(id: string, approverId: string): Promise<IAuditPlan | null> {
    const plan = await AuditPlan.findById(id);
    if (!plan) throw new Error('Plano não encontrado');

    // Validar: approverId não pode ser o mesmo que createdBy
    if (plan.createdBy === approverId) {
      throw new Error('O aprovador não pode ser o mesmo que criou o plano');
    }

    // Validar: approverId deve ser o leadAuditor do plano
    if (plan.team.leadAuditor !== approverId) {
      throw new Error('Apenas o auditor líder designado pode aprovar o plano');
    }

    if (plan.status !== 'pending_approval') {
      throw new Error('Apenas planos aguardando aprovação podem ser aprovados');
    }

    plan.status = 'approved';
    plan.approvedBy = approverId;
    plan.approvedAt = new Date();
    await plan.save();

    // TODO: Enviar notificação para o criador do plano
    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // REJEITAR PLANO
  // ============================================================
  async reject(id: string, approverId: string, reason: string): Promise<IAuditPlan | null> {
    const plan = await AuditPlan.findById(id);
    if (!plan) throw new Error('Plano não encontrado');

    if (plan.createdBy === approverId) {
      throw new Error('O rejeitador não pode ser o mesmo que criou o plano');
    }

    if (plan.team.leadAuditor !== approverId) {
      throw new Error('Apenas o auditor líder designado pode rejeitar o plano');
    }

    if (plan.status !== 'pending_approval') {
      throw new Error('Apenas planos aguardando aprovação podem ser rejeitados');
    }

    plan.status = 'draft';
    plan.approvedBy = approverId;
    plan.approvedAt = new Date();
    // Armazenar motivo da rejeição em um campo ou usar o campo approvalComment
    await plan.save();

    // TODO: Enviar notificação para o criador do plano com o motivo
    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // CANCELAR PLANO
  // ============================================================
  async cancel(id: string, userId: string): Promise<IAuditPlan | null> {
    const plan = await AuditPlan.findById(id);
    if (!plan) throw new Error('Plano não encontrado');

    // Apenas REP, ADMIN ou leadAuditor pode cancelar
    // TODO: Verificar permissões

    plan.status = 'cancelled';
    await plan.save();

    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // INICIAR AUDITORIA
  // ============================================================
  async startAudit(id: string, userId: string): Promise<IAuditPlan | null> {
    const plan = await AuditPlan.findById(id);
    if (!plan) throw new Error('Plano não encontrado');

    // Verificar se o usuário faz parte da equipe de auditoria
    const isTeamMember = 
      plan.team.leadAuditor === userId || 
      plan.team.auditors.includes(userId);

    if (!isTeamMember) {
      throw new Error('Apenas membros da equipe de auditoria podem iniciar a auditoria');
    }

    if (plan.status !== 'approved') {
      throw new Error('Apenas planos aprovados podem ser iniciados');
    }

    plan.status = 'in_progress';
    await plan.save();

    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // CONCLUIR AUDITORIA
  // ============================================================
  async completeAudit(id: string, userId: string): Promise<IAuditPlan | null> {
    const plan = await AuditPlan.findById(id);
    if (!plan) throw new Error('Plano não encontrado');

    // Verificar se o usuário é o leadAuditor
    if (plan.team.leadAuditor !== userId) {
      throw new Error('Apenas o auditor líder pode concluir a auditoria');
    }

    if (plan.status !== 'in_progress') {
      throw new Error('Apenas auditorias em andamento podem ser concluídas');
    }

    plan.status = 'completed';
    await plan.save();

    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // VERIFICAR PERMISSÃO DE PLANO EMPRESARIAL
  // ============================================================
  async validateEnterpriseAccess(companyId: string): Promise<boolean> {
    // TODO: Verificar se a empresa tem plano Enterprise
    // Por enquanto, retorna true para permitir testes
    return true;
  }

  // ============================================================
  // ESTATÍSTICAS DE AUDITORIA
  // ============================================================
  async getStats(companyId: string): Promise<any> {
    const totalPlans = await AuditPlan.countDocuments({ companyId });
    const approved = await AuditPlan.countDocuments({ companyId, status: 'approved' });
    const inProgress = await AuditPlan.countDocuments({ companyId, status: 'in_progress' });
    const completed = await AuditPlan.countDocuments({ companyId, status: 'completed' });

    return {
      totalPlans,
      approved,
      inProgress,
      completed,
    };
  }
}