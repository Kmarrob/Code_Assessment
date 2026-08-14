import { AuditChecklist } from '../models/AuditChecklist';
import { AuditPlan } from '../models/AuditPlan';
import { IAuditChecklist, IAuditChecklistItem } from '../types/audit.types';

export class AuditChecklistService {
  // ============================================================
  // BUSCAR CHECKLIST POR PLANO E CONTROLE
  // ============================================================
  async findByPlanAndControl(auditPlanId: string, controlId: string): Promise<IAuditChecklist | null> {
    return AuditChecklist.findOne({ auditPlanId, controlId }).lean();
  }

  // ============================================================
  // LISTAR CHECKLISTS POR PLANO
  // ============================================================
  async findByPlanId(auditPlanId: string): Promise<IAuditChecklist[]> {
    return AuditChecklist.find({ auditPlanId }).lean();
  }

  // ============================================================
  // ATUALIZAR CHECKLIST
  // ============================================================
  async updateChecklist(
    id: string,
    questions: IAuditChecklistItem[],
    userId: string
  ): Promise<IAuditChecklist | null> {
    const checklist = await AuditChecklist.findById(id);
    if (!checklist) throw new Error('Checklist não encontrado');

    // Verificar se o usuário faz parte da equipe de auditoria
    const plan = await AuditPlan.findById(checklist.auditPlanId);
    if (!plan) throw new Error('Plano de auditoria não encontrado');

    const isTeamMember = 
      plan.team.leadAuditor === userId || 
      plan.team.auditors.includes(userId);

    if (!isTeamMember) {
      throw new Error('Apenas membros da equipe de auditoria podem atualizar o checklist');
    }

    checklist.questions = questions;
    checklist.updatedAt = new Date();
    await checklist.save();

    return checklist.toObject();
  }

  // ============================================================
  // MARCAR CHECKLIST COMO CONCLUÍDO
  // ============================================================
  async complete(id: string, userId: string): Promise<IAuditChecklist | null> {
    const checklist = await AuditChecklist.findById(id);
    if (!checklist) throw new Error('Checklist não encontrado');

    // Verificar se o usuário faz parte da equipe de auditoria
    const plan = await AuditPlan.findById(checklist.auditPlanId);
    if (!plan) throw new Error('Plano de auditoria não encontrado');

    const isTeamMember = 
      plan.team.leadAuditor === userId || 
      plan.team.auditors.includes(userId);

    if (!isTeamMember) {
      throw new Error('Apenas membros da equipe de auditoria podem concluir o checklist');
    }

    checklist.status = 'completed';
    checklist.completedBy = userId;
    checklist.completedAt = new Date();
    await checklist.save();

    return checklist.toObject();
  }

  // ============================================================
  // ESTATÍSTICAS DO CHECKLIST
  // ============================================================
  async getStats(auditPlanId: string): Promise<any> {
    const total = await AuditChecklist.countDocuments({ auditPlanId });
    const completed = await AuditChecklist.countDocuments({ auditPlanId, status: 'completed' });
    const inProgress = await AuditChecklist.countDocuments({ auditPlanId, status: 'in_progress' });
    const pending = await AuditChecklist.countDocuments({ auditPlanId, status: 'pending' });

    return { total, completed, inProgress, pending, completionRate: total > 0 ? (completed / total) * 100 : 0 };
  }
}