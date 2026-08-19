import { AuditChecklist } from '../models/AuditChecklist';
import { AuditPlan } from '../models/AuditPlan';
import { IAuditChecklist, IAuditChecklistQuestion, IAuditChecklistItem } from '../types/audit.types';

/**
 * Mapeia documento do MongoDB para IAuditChecklist com id
 */
function mapToIAuditChecklist(doc: any): IAuditChecklist {
  if (!doc) return null as any;
  return {
    id: doc._id.toString(),
    ...doc,
  };
}

/**
 * Mapeia array de documentos para IAuditChecklist[]
 */
function mapToIAuditChecklistArray(docs: any[]): IAuditChecklist[] {
  if (!docs) return [];
  return docs.map(doc => mapToIAuditChecklist(doc));
}

export class AuditChecklistService {
  // ============================================================
  // BUSCAR CHECKLIST POR PLANO E CONTROLE
  // ============================================================
  async findByPlanAndControl(auditPlanId: string, controlId: string): Promise<IAuditChecklist | null> {
    const doc = await AuditChecklist.findOne({ auditPlanId, controlId }).lean();
    if (!doc) return null;
    return mapToIAuditChecklist(doc);
  }

  // ============================================================
  // LISTAR CHECKLISTS POR PLANO
  // ============================================================
  async findByPlanId(auditPlanId: string): Promise<IAuditChecklist[]> {
    const docs = await AuditChecklist.find({ auditPlanId }).lean();
    return mapToIAuditChecklistArray(docs);
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

    // Converter IAuditChecklistItem para IAuditChecklistQuestion
    const questionsMapped: IAuditChecklistQuestion[] = questions.map(q => ({
      question: q.question,
      answer: q.answer || '--',
      observations: q.observations || '',
      evidenceIds: q.evidenceIds || [],
      responsible: q.responsible || '',
      answeredAt: q.answeredAt || undefined,
      answeredBy: q.answeredBy || undefined,
    }));

    checklist.questions = questionsMapped;
    checklist.updatedAt = new Date();
    await checklist.save();

    return mapToIAuditChecklist(checklist.toObject());
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

    return mapToIAuditChecklist(checklist.toObject());
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