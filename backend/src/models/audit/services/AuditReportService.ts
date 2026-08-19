import { AuditReport } from '../models/AuditReport';
import { AuditFinding } from '../models/AuditFinding';
import { AuditPlan } from '../models/AuditPlan';
import { IAuditReport, CreateAuditReportDTO, UpdateAuditReportDTO, AuditReportFilters, IAuditReportFinding } from '../types/audit.types';

/**
 * Mapeia documento do MongoDB para IAuditReport com id
 */
function mapToIAuditReport(doc: any): IAuditReport {
  if (!doc) return null as any;
  return {
    id: doc._id.toString(),
    ...doc,
  };
}

/**
 * Mapeia array de documentos para IAuditReport[]
 */
function mapToIAuditReportArray(docs: any[]): IAuditReport[] {
  if (!docs) return [];
  return docs.map(doc => mapToIAuditReport(doc));
}

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
      recommendations: data.recommendations || [],
    });

    await report.save();
    return mapToIAuditReport(report.toObject());
  }

  // ============================================================
  // LISTAR RELATÓRIOS
  // ============================================================
  async findAll(filters: AuditReportFilters): Promise<IAuditReport[]> {
    const query: any = {};

    if (filters.auditPlanId) query.auditPlanId = filters.auditPlanId;
    if (filters.status) query.status = filters.status;
    if (filters.createdBy) query.createdBy = filters.createdBy;

    const docs = await AuditReport.find(query).sort({ createdAt: -1 }).lean();
    return mapToIAuditReportArray(docs);
  }

  // ============================================================
  // BUSCAR RELATÓRIO POR ID
  // ============================================================
  async findById(id: string): Promise<IAuditReport | null> {
    const doc = await AuditReport.findById(id).lean();
    if (!doc) return null;
    return mapToIAuditReport(doc);
  }

  // ============================================================
  // BUSCAR RELATÓRIO POR PLANO
  // ============================================================
  async findByPlanId(auditPlanId: string): Promise<IAuditReport[]> {
    const docs = await AuditReport.find({ auditPlanId }).sort({ createdAt: -1 }).lean();
    return mapToIAuditReportArray(docs);
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

    return mapToIAuditReport(report.toObject());
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
    return mapToIAuditReport(report.toObject());
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
    return mapToIAuditReport(report.toObject());
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
    return mapToIAuditReport(report.toObject());
  }

  // ============================================================
  // GERAR RELATÓRIO AUTOMÁTICO
  // ============================================================
  async generateAutoReport(planId: string): Promise<IAuditReport> {
    const plan = await AuditPlan.findById(planId);
    if (!plan) throw new Error('Plano não encontrado');

    const findings = await AuditFinding.find({ auditPlanId: planId });

    // Converter findings para IAuditReportFinding[]
    const reportFindings: IAuditReportFinding[] = findings.map(f => ({
      id: f._id.toString(),
      number: f.number || '',
      type: f.type as any,
      title: f.title,
      description: f.description,
      area: f.area,
      process: f.process,
      clause: f.clause,
      status: f.status,
      evidenceIds: f.evidenceIds || [],
      actionPlanIds: (f as any).actionPlanIds || [],
      createdBy: f.createdBy,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    })) as unknown as IAuditReportFinding[];

    const summary = `Auditoria realizada no período de ${new Date(plan.period.startDate).toLocaleDateString('pt-BR')} a ${new Date(plan.period.endDate).toLocaleDateString('pt-BR')}`;
    const conclusion = this.generateConclusion(findings);
    const recommendations = this.generateRecommendations(findings);

    // Verificar se já existe um relatório para este plano
    const existingReport = await AuditReport.findOne({ auditPlanId: planId });

    if (existingReport) {
      // Atualizar o relatório existente
      existingReport.summary = summary;
      existingReport.conclusion = conclusion;
      (existingReport as any).recommendations = recommendations;
      existingReport.findings = reportFindings as any;
      await existingReport.save();
      return mapToIAuditReport(existingReport.toObject());
    }

    const report = await this.create({
      auditPlanId: planId,
      summary,
      conclusion,
      recommendations,
      findings: reportFindings,
    }, plan.team.leadAuditor);

    return report;
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

  // ============================================================
  // GERAR RECOMENDAÇÕES
  // ============================================================
  private generateRecommendations(findings: any[]): string[] {
    const recommendations: string[] = [];

    const ncA = findings.filter(f => f.type === 'nc_a' && f.status !== 'closed');
    const ncB = findings.filter(f => f.type === 'nc_b' && f.status !== 'closed');

    if (ncA.length > 0) {
      recommendations.push(`Corrigir ${ncA.length} não conformidade(s) maior(es) com prioridade crítica`);
    }

    if (ncB.length > 0) {
      recommendations.push(`Corrigir ${ncB.length} não conformidade(s) menor(es) com prioridade alta`);
    }

    if (findings.some(f => f.type === 'observation' && f.status !== 'closed')) {
      recommendations.push('Considerar as observações registradas para melhoria contínua');
    }

    if (findings.some(f => f.type === 'opportunity' && f.status !== 'closed')) {
      recommendations.push('Avaliar as oportunidades de melhoria identificadas');
    }

    if (recommendations.length === 0) {
      recommendations.push('Manter as práticas atuais e monitorar continuamente o SGSI');
    }

    return recommendations;
  }
}
