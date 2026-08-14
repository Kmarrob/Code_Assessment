import { AuditReport } from '../models/AuditReport';
import { AuditFinding } from '../models/AuditFinding';
import { AuditPlan } from '../models/AuditPlan';
import { IAuditReport, CreateAuditReportDTO, UpdateAuditReportDTO, AuditReportFilters } from '../types/audit.types';

export class AuditReportService {
  // ============================================================
  // CRIAR RELATÓRIO
  // ============================================================
  async create(data: CreateAuditReportDTO, createdBy: string): Promise<IAuditReport> {
    // Verificar se o plano existe
    const plan = await AuditPlan.findById(data.auditPlanId);
    if (!plan) throw new Error('Plano de auditoria não encontrado');

    // Verificar se o criador faz parte da equipe de auditoria
    const isTeamMember = 
      plan.team.leadAuditor === createdBy || 
      plan.team.auditors.includes(createdBy);

    if (!isTeamMember) {
      throw new Error('Apenas membros da equipe de auditoria podem criar relatórios');
    }

    const report = new AuditReport({
      ...data,
      createdBy,
      status: 'draft',
    });

    await report.save();
    return report.toObject();
  }

  // ============================================================
  // LISTAR RELATÓRIOS
  // ============================================================
  async findAll(filters: AuditReportFilters): Promise<IAuditReport[]> {
    const query: any = {};

    if (filters.auditPlanId) query.auditPlanId = filters.auditPlanId;
    if (filters.status) query.status = filters.status;
    if (filters.createdBy) query.createdBy = filters.createdBy;

    return AuditReport.find(query).sort({ createdAt: -1 }).lean();
  }

  // ============================================================
  // BUSCAR RELATÓRIO POR ID
  // ============================================================
  async findById(id: string): Promise<IAuditReport | null> {
    return AuditReport.findById(id).lean();
  }

  // ============================================================
  // BUSCAR RELATÓRIO POR PLANO
  // ============================================================
  async findByPlanId(auditPlanId: string): Promise<IAuditReport[]> {
    return AuditReport.find({ auditPlanId }).sort({ createdAt: -1 }).lean();
  }

  // ============================================================
  // ATUALIZAR RELATÓRIO
  // ============================================================
  async update(id: string, data: UpdateAuditReportDTO, userId: string): Promise<IAuditReport | null> {
    const report = await AuditReport.findById(id);
    if (!report) throw new Error('Relatório não encontrado');

    // Apenas o criador pode editar relatórios em draft
    if (report.createdBy !== userId) {
      throw new Error('Apenas o criador pode editar este relatório');
    }

    if (report.status !== 'draft') {
      throw new Error('Apenas relatórios em rascunho podem ser editados');
    }

    Object.assign(report, data);
    await report.save();

    return report.toObject();
  }

  // ============================================================
  // ENVIAR RELATÓRIO PARA REVISÃO
  // ============================================================
  async submitForReview(id: string, userId: string): Promise<IAuditReport | null> {
    const report = await AuditReport.findById(id);
    if (!report) throw new Error('Relatório não encontrado');

    if (report.createdBy !== userId) {
      throw new Error('Apenas o criador pode enviar o relatório para revisão');
    }

    if (report.status !== 'draft') {
      throw new Error('Apenas relatórios em rascunho podem ser enviados para revisão');
    }

    report.status = 'pending_review';
    await report.save();

    // TODO: Enviar notificação para o REP
    return report.toObject();
  }

  // ============================================================
  // APROVAR RELATÓRIO
  // ============================================================
  async approve(id: string, approverId: string): Promise<IAuditReport | null> {
    const report = await AuditReport.findById(id);
    if (!report) throw new Error('Relatório não encontrado');

    // Validar: approverId não pode ser o mesmo que createdBy
    if (report.createdBy === approverId) {
      throw new Error('O aprovador não pode ser o mesmo que criou o relatório');
    }

    if (report.status !== 'pending_review') {
      throw new Error('Apenas relatórios em revisão podem ser aprovados');
    }

    report.status = 'approved';
    report.approvedBy = approverId;
    report.approvedAt = new Date();
    await report.save();

    // TODO: Enviar notificação para o criador do relatório
    return report.toObject();
  }

  // ============================================================
  // REJEITAR RELATÓRIO
  // ============================================================
  async reject(id: string, approverId: string, reason: string): Promise<IAuditReport | null> {
    const report = await AuditReport.findById(id);
    if (!report) throw new Error('Relatório não encontrado');

    if (report.createdBy === approverId) {
      throw new Error('O rejeitador não pode ser o mesmo que criou o relatório');
    }

    if (report.status !== 'pending_review') {
      throw new Error('Apenas relatórios em revisão podem ser rejeitados');
    }

    report.status = 'rejected';
    report.rejectionReason = reason;
    await report.save();

    // TODO: Enviar notificação para o criador do relatório com o motivo
    return report.toObject();
  }

  // ============================================================
  // GERAR RELATÓRIO AUTOMÁTICO
  // ============================================================
  async generateAutoReport(planId: string): Promise<IAuditReport> {
    const plan = await AuditPlan.findById(planId);
    if (!plan) throw new Error('Plano não encontrado');

    const findings = await AuditFinding.find({ auditPlanId: planId });

    const summary = `Auditoria realizada no período de ${new Date(plan.period.startDate).toLocaleDateString('pt-BR')} a ${new Date(plan.period.endDate).toLocaleDateString('pt-BR')}`;
    const conclusion = this.generateConclusion(findings);

    // Verificar se já existe um relatório para este plano
    const existingReport = await AuditReport.findOne({ auditPlanId: planId });

    if (existingReport) {
      // Atualizar o relatório existente
      existingReport.summary = summary;
      existingReport.conclusion = conclusion;
      existingReport.findings = findings.map(f => f._id.toString());
      await existingReport.save();
      return existingReport.toObject();
    }

    return this.create({
      auditPlanId: planId,
      summary,
      conclusion,
      recommendations: [],
      findings: findings.map(f => f._id.toString()),
    }, plan.team.leadAuditor);
  }

  // ============================================================
  // GERAR CONCLUSÃO
  // ============================================================
  private generateConclusion(findings: any[]): string {
    const ncA = findings.filter(f => f.type === 'nc_a' && f.status !== 'closed').length;
    const ncB = findings.filter(f => f.type === 'nc_b' && f.status !== 'closed').length;

    if (ncA === 0 && ncB === 0) {
      return 'Sistema de gestão conforme. Nenhuma não conformidade identificada.';
    }

    let conclusion = `Foram identificadas ${ncA} não conformidade(s) maior(es) e ${ncB} não conformidade(s) menor(es). `;

    if (ncA > 0) {
      conclusion += 'Recomenda-se ação imediata para as não conformidades maiores. ';
    }

    return conclusion;
  }
}