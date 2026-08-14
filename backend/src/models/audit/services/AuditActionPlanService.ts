import { AuditActionPlan } from '../models/AuditActionPlan';
import { AuditFinding } from '../models/AuditFinding';
import { IAuditActionPlan, CreateAuditActionPlanDTO, UpdateAuditActionPlanDTO } from '../types/audit.types';

export class AuditActionPlanService {
  // ============================================================
  // CRIAR PLANO DE AÇÃO
  // ============================================================
  async create(data: CreateAuditActionPlanDTO, createdBy: string): Promise<IAuditActionPlan> {
    // Verificar se a NC existe
    const finding = await AuditFinding.findById(data.findingId);
    if (!finding) throw new Error('NC não encontrada');

    // Verificar se a NC está aberta
    if (finding.status === 'closed') {
      throw new Error('Não é possível criar plano de ação para NC fechada');
    }

    const actionPlan = new AuditActionPlan({
      ...data,
      createdBy,
      status: 'pending',
    });

    await actionPlan.save();

    // Atualizar status da NC para in_progress
    finding.status = 'in_progress';
    await finding.save();

    // TODO: Enviar notificação para o responsável
    return actionPlan.toObject();
  }

  // ============================================================
  // LISTAR PLANOS DE AÇÃO POR NC
  // ============================================================
  async findByFindingId(findingId: string): Promise<IAuditActionPlan[]> {
    return AuditActionPlan.find({ findingId }).sort({ createdAt: -1 }).lean();
  }

  // ============================================================
  // LISTAR PLANOS DE AÇÃO POR RESPONSÁVEL
  // ============================================================
  async findByResponsible(responsible: string): Promise<IAuditActionPlan[]> {
    return AuditActionPlan.find({ responsible }).sort({ deadline: 1 }).lean();
  }

  // ============================================================
  // BUSCAR PLANO DE AÇÃO POR ID
  // ============================================================
  async findById(id: string): Promise<IAuditActionPlan | null> {
    return AuditActionPlan.findById(id).lean();
  }

  // ============================================================
  // ATUALIZAR PLANO DE AÇÃO
  // ============================================================
  async update(id: string, data: UpdateAuditActionPlanDTO, userId: string): Promise<IAuditActionPlan | null> {
    const actionPlan = await AuditActionPlan.findById(id);
    if (!actionPlan) throw new Error('Plano de ação não encontrado');

    // Apenas o responsável ou criador pode editar
    if (actionPlan.responsible !== userId && actionPlan.createdBy !== userId) {
      throw new Error('Apenas o responsável ou o criador pode editar este plano de ação');
    }

    if (actionPlan.status === 'completed' || actionPlan.status === 'rejected') {
      throw new Error('Não é possível editar um plano de ação concluído ou rejeitado');
    }

    Object.assign(actionPlan, data);
    await actionPlan.save();

    return actionPlan.toObject();
  }

  // ============================================================
  // MARCAR COMO EM ANDAMENTO
  // ============================================================
  async startProgress(id: string, userId: string): Promise<IAuditActionPlan | null> {
    const actionPlan = await AuditActionPlan.findById(id);
    if (!actionPlan) throw new Error('Plano de ação não encontrado');

    if (actionPlan.responsible !== userId) {
      throw new Error('Apenas o responsável pode iniciar a execução do plano de ação');
    }

    if (actionPlan.status !== 'pending') {
      throw new Error('Apenas planos de ação pendentes podem ser iniciados');
    }

    actionPlan.status = 'in_progress';
    await actionPlan.save();

    return actionPlan.toObject();
  }

  // ============================================================
  // MARCAR COMO CONCLUÍDO
  // ============================================================
  async complete(id: string, userId: string, evidenceIds?: string[]): Promise<IAuditActionPlan | null> {
    const actionPlan = await AuditActionPlan.findById(id);
    if (!actionPlan) throw new Error('Plano de ação não encontrado');

    if (actionPlan.responsible !== userId) {
      throw new Error('Apenas o responsável pode concluir o plano de ação');
    }

    if (actionPlan.status === 'completed') {
      throw new Error('Plano de ação já está concluído');
    }

    actionPlan.status = 'completed';
    if (evidenceIds) {
      actionPlan.evidenceIds = [...actionPlan.evidenceIds, ...evidenceIds];
    }
    await actionPlan.save();

    // Atualizar status da NC para pending_validation
    await AuditFinding.findByIdAndUpdate(
      actionPlan.findingId,
      { status: 'pending_validation' }
    );

    // TODO: Enviar notificação para o auditor
    return actionPlan.toObject();
  }

  // ============================================================
  // VALIDAR PLANO DE AÇÃO (AUDITOR)
  // ============================================================
  async validate(id: string, validatorId: string, status: 'completed' | 'rejected', comment?: string): Promise<IAuditActionPlan | null> {
    const actionPlan = await AuditActionPlan.findById(id);
    if (!actionPlan) throw new Error('Plano de ação não encontrado');

    // Verificar se o validador é o auditor da NC
    // TODO: Verificar permissões

    if (actionPlan.status !== 'completed') {
      throw new Error('Apenas planos de ação concluídos podem ser validados');
    }

    actionPlan.status = status;
    actionPlan.validatedBy = validatorId;
    actionPlan.validatedAt = new Date();
    if (comment) {
      actionPlan.validationComment = comment;
    }
    await actionPlan.save();

    // Se aprovado, fechar a NC
    if (status === 'completed') {
      await AuditFinding.findByIdAndUpdate(
        actionPlan.findingId,
        { status: 'closed' }
      );
    }

    // Se rejeitado, reabrir a NC
    if (status === 'rejected') {
      await AuditFinding.findByIdAndUpdate(
        actionPlan.findingId,
        { status: 'open' }
      );
    }

    return actionPlan.toObject();
  }
}