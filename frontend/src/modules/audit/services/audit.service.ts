import api from '../../../services/api';
import {
  AuditPlan,
  AuditChecklist,
  AuditFinding,
  AuditEvidence,
  AuditActionPlan,
  AuditReport,
  AuditStats,
  AuditFindingStats,
  AuditChecklistStats,
  AuditFilters,
  AuditFindingFilters,
  CreateAuditPlanDTO,
  UpdateAuditPlanDTO,
  CreateAuditFindingDTO,
  UpdateAuditFindingDTO,
  CreateAuditActionPlanDTO,
  UpdateAuditActionPlanDTO,
  CreateAuditReportDTO,
  UpdateAuditReportDTO,
} from '../types/audit.types';

const BASE_URL = '/internal-audit';

export const auditService = {
  // ============================================================
  // PLANOS DE AUDITORIA
  // ============================================================

  /**
   * Criar um novo plano de auditoria
   */
  async createPlan(data: CreateAuditPlanDTO): Promise<AuditPlan> {
    const response = await api.post(`${BASE_URL}/plans`, data);
    return response.data.data;
  },

  /**
   * Listar planos de auditoria com filtros opcionais
   */
  async listPlans(filters?: AuditFilters): Promise<AuditPlan[]> {
    const response = await api.get(`${BASE_URL}/plans`, { params: filters });
    return response.data.data;
  },

  /**
   * Buscar um plano por ID
   */
  async getPlan(id: string): Promise<AuditPlan> {
    const response = await api.get(`${BASE_URL}/plans/${id}`);
    return response.data.data;
  },

  /**
   * Atualizar um plano existente
   */
  async updatePlan(id: string, data: UpdateAuditPlanDTO): Promise<AuditPlan> {
    const response = await api.put(`${BASE_URL}/plans/${id}`, data);
    return response.data.data;
  },

  /**
   * Enviar plano para aprovação
   */
  async submitPlan(id: string): Promise<AuditPlan> {
    const response = await api.post(`${BASE_URL}/plans/${id}/submit`);
    return response.data.data;
  },

  /**
   * Aprovar plano (apenas Auditor Líder)
   */
  async approvePlan(id: string): Promise<AuditPlan> {
    const response = await api.post(`${BASE_URL}/plans/${id}/approve`);
    return response.data.data;
  },

  /**
   * Rejeitar plano
   */
  async rejectPlan(id: string, reason: string): Promise<AuditPlan> {
    const response = await api.post(`${BASE_URL}/plans/${id}/reject`, { reason });
    return response.data.data;
  },

  /**
   * Iniciar auditoria
   */
  async startPlan(id: string): Promise<AuditPlan> {
    const response = await api.post(`${BASE_URL}/plans/${id}/start`);
    return response.data.data;
  },

  /**
   * Concluir auditoria
   */
  async completePlan(id: string): Promise<AuditPlan> {
    const response = await api.post(`${BASE_URL}/plans/${id}/complete`);
    return response.data.data;
  },

  /**
   * Cancelar plano
   */
  async cancelPlan(id: string): Promise<AuditPlan> {
    const response = await api.post(`${BASE_URL}/plans/${id}/cancel`);
    return response.data.data;
  },

  /**
   * Excluir plano (apenas se estiver em draft)
   */
  async deletePlan(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/plans/${id}`);
  },

  /**
   * Obter estatísticas dos planos
   */
  async getPlanStats(): Promise<AuditStats> {
    const response = await api.get(`${BASE_URL}/plans/stats`);
    return response.data.data;
  },

  // ============================================================
  // CHECKLISTS
  // ============================================================

  /**
   * Listar checklists por plano
   */
  async listChecklists(planId: string): Promise<AuditChecklist[]> {
    const response = await api.get(`${BASE_URL}/checklists/plan/${planId}`);
    return response.data.data;
  },

  /**
   * Buscar checklist por plano e controle
   */
  async getChecklist(planId: string, controlId: string): Promise<AuditChecklist> {
    const response = await api.get(`${BASE_URL}/checklists/plan/${planId}/control/${controlId}`);
    return response.data.data;
  },

  /**
   * Atualizar checklist
   */
  async updateChecklist(id: string, questions: AuditChecklist['questions']): Promise<AuditChecklist> {
    const response = await api.put(`${BASE_URL}/checklists/${id}`, { questions });
    return response.data.data;
  },

  /**
   * Concluir checklist
   */
  async completeChecklist(id: string): Promise<AuditChecklist> {
    const response = await api.post(`${BASE_URL}/checklists/${id}/complete`);
    return response.data.data;
  },

  /**
   * Obter estatísticas do checklist
   */
  async getChecklistStats(planId: string): Promise<AuditChecklistStats> {
    const response = await api.get(`${BASE_URL}/checklists/plan/${planId}/stats`);
    return response.data.data;
  },

  // ============================================================
  // NÃO CONFORMIDADES (FINDINGS)
  // ============================================================

  /**
   * Criar uma não conformidade
   */
  async createFinding(planId: string, data: CreateAuditFindingDTO): Promise<AuditFinding> {
    const response = await api.post(`${BASE_URL}/findings/plan/${planId}`, data);
    return response.data.data;
  },

  /**
   * Listar não conformidades por plano
   */
  async listFindings(planId: string, filters?: AuditFindingFilters): Promise<AuditFinding[]> {
    const response = await api.get(`${BASE_URL}/findings/plan/${planId}`, { params: filters });
    return response.data.data;
  },

  /**
   * Listar todas as não conformidades (com filtros)
   */
  async findAllFindings(filters?: AuditFindingFilters): Promise<AuditFinding[]> {
    const response = await api.get(`${BASE_URL}/findings`, { params: filters });
    return response.data.data;
  },

  /**
   * Buscar uma não conformidade por ID
   */
  async getFinding(id: string): Promise<AuditFinding> {
    const response = await api.get(`${BASE_URL}/findings/${id}`);
    return response.data.data;
  },

  /**
   * Atualizar uma não conformidade
   */
  async updateFinding(id: string, data: UpdateAuditFindingDTO): Promise<AuditFinding> {
    const response = await api.put(`${BASE_URL}/findings/${id}`, data);
    return response.data.data;
  },

  /**
   * Enviar NC para validação
   */
  async submitFinding(id: string): Promise<AuditFinding> {
    const response = await api.post(`${BASE_URL}/findings/${id}/submit`);
    return response.data.data;
  },

  /**
   * Validar NC (fechar/reabrir)
   */
  async validateFinding(id: string, status: 'closed' | 'reopened', comment?: string): Promise<AuditFinding> {
    const response = await api.post(`${BASE_URL}/findings/${id}/validate`, { status, comment });
    return response.data.data;
  },

  /**
   * Obter estatísticas das não conformidades
   */
  async getFindingStats(planId: string): Promise<AuditFindingStats> {
    const response = await api.get(`${BASE_URL}/findings/plan/${planId}/stats`);
    return response.data.data;
  },

  /**
   * Excluir uma não conformidade (apenas se estiver aberta)
   */
  async deleteFinding(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/findings/${id}`);
  },

  // ============================================================
  // PLANOS DE AÇÃO
  // ============================================================

  /**
   * Criar um plano de ação
   */
  async createAction(data: CreateAuditActionPlanDTO): Promise<AuditActionPlan> {
    const response = await api.post(`${BASE_URL}/actions`, data);
    return response.data.data;
  },

  /**
   * Listar planos de ação por NC
   */
  async listActionsByFinding(findingId: string): Promise<AuditActionPlan[]> {
    const response = await api.get(`${BASE_URL}/actions/finding/${findingId}`);
    return response.data.data;
  },

  /**
   * Listar planos de ação por responsável
   */
  async listActionsByResponsible(responsible: string): Promise<AuditActionPlan[]> {
    const response = await api.get(`${BASE_URL}/actions/responsible/${responsible}`);
    return response.data.data;
  },

  /**
   * Buscar um plano de ação por ID
   */
  async getAction(id: string): Promise<AuditActionPlan> {
    const response = await api.get(`${BASE_URL}/actions/${id}`);
    return response.data.data;
  },

  /**
   * Atualizar um plano de ação
   */
  async updateAction(id: string, data: UpdateAuditActionPlanDTO): Promise<AuditActionPlan> {
    const response = await api.put(`${BASE_URL}/actions/${id}`, data);
    return response.data.data;
  },

  /**
   * Iniciar execução do plano de ação
   */
  async startAction(id: string): Promise<AuditActionPlan> {
    const response = await api.post(`${BASE_URL}/actions/${id}/start`);
    return response.data.data;
  },

  /**
   * Concluir plano de ação
   */
  async completeAction(id: string, evidenceIds?: string[]): Promise<AuditActionPlan> {
    const response = await api.post(`${BASE_URL}/actions/${id}/complete`, { evidenceIds });
    return response.data.data;
  },

  /**
   * Validar plano de ação
   */
  async validateAction(id: string, status: 'completed' | 'rejected', comment?: string): Promise<AuditActionPlan> {
    const response = await api.post(`${BASE_URL}/actions/${id}/validate`, { status, comment });
    return response.data.data;
  },

  // ============================================================
  // EVIDÊNCIAS
  // ============================================================

  /**
   * Upload de evidência
   */
  async uploadEvidence(
    auditPlanId: string,
    file: File,
    findingId?: string,
    description?: string
  ): Promise<AuditEvidence> {
    const formData = new FormData();
    formData.append('auditPlanId', auditPlanId);
    if (findingId) formData.append('findingId', findingId);
    if (description) formData.append('description', description);
    formData.append('file', file);

    const response = await api.post(`${BASE_URL}/evidence/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  /**
   * Listar evidências por plano
   */
  async listEvidenceByPlan(planId: string): Promise<AuditEvidence[]> {
    const response = await api.get(`${BASE_URL}/evidence/plan/${planId}`);
    return response.data.data;
  },

  /**
   * Listar evidências por NC
   */
  async listEvidenceByFinding(findingId: string): Promise<AuditEvidence[]> {
    const response = await api.get(`${BASE_URL}/evidence/finding/${findingId}`);
    return response.data.data;
  },

  /**
   * Buscar evidência por ID
   */
  async getEvidence(id: string): Promise<AuditEvidence> {
    const response = await api.get(`${BASE_URL}/evidence/${id}`);
    return response.data.data;
  },

  /**
   * Excluir evidência
   */
  async deleteEvidence(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/evidence/${id}`);
  },

  // ============================================================
  // RELATÓRIOS
  // ============================================================

  /**
   * Criar um relatório
   */
  async createReport(data: CreateAuditReportDTO): Promise<AuditReport> {
    const response = await api.post(`${BASE_URL}/reports`, data);
    return response.data.data;
  },

  /**
   * Listar relatórios
   */
  async listReports(planId?: string): Promise<AuditReport[]> {
    const response = await api.get(`${BASE_URL}/reports`, { params: { auditPlanId: planId } });
    return response.data.data;
  },

  /**
   * Buscar relatório por ID
   */
  async getReport(id: string): Promise<AuditReport> {
    const response = await api.get(`${BASE_URL}/reports/${id}`);
    return response.data.data;
  },

  /**
   * Atualizar relatório
   */
  async updateReport(id: string, data: UpdateAuditReportDTO): Promise<AuditReport> {
    const response = await api.put(`${BASE_URL}/reports/${id}`, data);
    return response.data.data;
  },

  /**
   * Enviar relatório para revisão
   */
  async submitReport(id: string): Promise<AuditReport> {
    const response = await api.post(`${BASE_URL}/reports/${id}/submit`);
    return response.data.data;
  },

  /**
   * Aprovar relatório
   */
  async approveReport(id: string): Promise<AuditReport> {
    const response = await api.post(`${BASE_URL}/reports/${id}/approve`);
    return response.data.data;
  },

  /**
   * Rejeitar relatório
   */
  async rejectReport(id: string, reason: string): Promise<AuditReport> {
    const response = await api.post(`${BASE_URL}/reports/${id}/reject`, { reason });
    return response.data.data;
  },

  /**
   * Excluir um relatório (apenas se estiver em draft)
   */
  async deleteReport(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/reports/${id}`);
  },

  /**
   * Gerar relatório automaticamente
   */
  async generateReport(planId: string): Promise<AuditReport> {
    const response = await api.post(`${BASE_URL}/reports/plan/${planId}/generate`);
    return response.data.data;
  },

  // ============================================================
  // 🆕 NOVO (v46.0) - RISCOS
  // ============================================================

  /**
   * Listar riscos por plano de auditoria
   */
  async listRisksByPlan(planId: string): Promise<any[]> {
    const response = await api.get(`${BASE_URL}/risks/plan/${planId}`);
    return response.data.data;
  },

  /**
   * Buscar um risco por ID
   */
  async getRisk(id: string): Promise<any> {
    const response = await api.get(`${BASE_URL}/risks/${id}`);
    return response.data.data;
  },

  /**
   * Criar um novo risco
   */
  async createRisk(planId: string, data: any): Promise<any> {
    const response = await api.post(`${BASE_URL}/risks`, { ...data, auditPlanId: planId });
    return response.data.data;
  },

  /**
   * Atualizar um risco existente
   */
  async updateRisk(id: string, data: any): Promise<any> {
    const response = await api.put(`${BASE_URL}/risks/${id}`, data);
    return response.data.data;
  },

  /**
   * Excluir um risco
   */
  async deleteRisk(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/risks/${id}`);
  },

  // ============================================================
  // 🆕 NOVO (v46.0) - SoA (Statement of Applicability)
  // ============================================================

  /**
   * Buscar SoA por plano de auditoria
   */
  async getSoAByPlan(planId: string): Promise<any> {
    const response = await api.get(`${BASE_URL}/soa/plan/${planId}`);
    return response.data.data;
  },

  /**
   * Atualizar um controle da SoA
   */
  async updateSoAControl(soaId: string, clause: string, data: any): Promise<any> {
    const response = await api.put(`${BASE_URL}/soa/${soaId}/control/${clause}`, data);
    return response.data.data;
  },

  /**
   * Exportar SoA (Excel/PDF)
   */
  async exportSoA(soaId: string): Promise<Blob> {
    const response = await api.get(`${BASE_URL}/soa/${soaId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ============================================================
  // 🆕 NOVO (v46.0) - PROGRAMA DE AUDITORIA
  // ============================================================

  /**
   * Buscar programa por plano de auditoria
   */
  async getProgramByPlan(planId: string): Promise<any> {
    const response = await api.get(`${BASE_URL}/program/plan/${planId}`);
    return response.data.data;
  },

  /**
   * Criar uma atividade no programa
   */
  async createProgramActivity(programId: string, data: any): Promise<any> {
    const response = await api.post(`${BASE_URL}/program/${programId}/activity`, data);
    return response.data.data;
  },

  /**
   * Atualizar uma atividade do programa
   */
  async updateProgramActivity(programId: string, activityId: string, data: any): Promise<any> {
    const response = await api.put(`${BASE_URL}/program/${programId}/activity/${activityId}`, data);
    return response.data.data;
  },

  /**
   * Excluir uma atividade do programa
   */
  async deleteProgramActivity(programId: string, activityId: string): Promise<void> {
    await api.delete(`${BASE_URL}/program/${programId}/activity/${activityId}`);
  },

  // ============================================================
  // 🆕 NOVO (v46.0) - REVISÃO DOCUMENTAL
  // ============================================================

  /**
   * Buscar revisão documental por plano de auditoria
   */
  async getDocumentReviewByPlan(planId: string): Promise<any> {
    const response = await api.get(`${BASE_URL}/document-review/plan/${planId}`);
    return response.data.data;
  },

  /**
   * Atualizar um documento da revisão documental
   */
  async updateDocumentReview(reviewId: string, clause: string, data: any): Promise<any> {
    const response = await api.put(`${BASE_URL}/document-review/${reviewId}/document/${clause}`, data);
    return response.data.data;
  },

  /**
   * Concluir a revisão documental
   */
  async completeDocumentReview(reviewId: string): Promise<any> {
    const response = await api.post(`${BASE_URL}/document-review/${reviewId}/complete`);
    return response.data.data;
  },

  // ============================================================
  // 🆕 NOVO (v47.0) - RESPOSTAS DOS USUÁRIOS POR PLANO
  // ============================================================

  /**
   * Buscar respostas dos usuários para um plano de auditoria
   * Esta rota retorna todas as respostas dos usuários para os controles
   * que fazem parte do escopo do plano.
   */
  async getResponsesByPlan(planId: string): Promise<any[]> {
    const response = await api.get(`${BASE_URL}/plans/${planId}/responses`);
    return response.data.data;
  },
};