import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';
import {
  AuditPlan,
  AuditChecklist,
  AuditFinding,
  AuditActionPlan,
  AuditReport,
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

// ============================================================
// QUERY KEYS
// ============================================================

export const auditKeys = {
  all: ['audit'] as const,
  plans: () => [...auditKeys.all, 'plans'] as const,
  plan: (id: string) => [...auditKeys.plans(), id] as const,
  plansStats: () => [...auditKeys.all, 'plans-stats'] as const,
  checklists: (planId: string) => [...auditKeys.all, 'checklists', planId] as const,
  checklist: (planId: string, controlId: string) => [...auditKeys.checklists(planId), controlId] as const,
  checklistStats: (planId: string) => [...auditKeys.all, 'checklists-stats', planId] as const,
  findings: (planId: string) => [...auditKeys.all, 'findings', planId] as const,
  finding: (id: string) => [...auditKeys.all, 'finding', id] as const,
  findingStats: (planId: string) => [...auditKeys.all, 'findings-stats', planId] as const,
  actions: (findingId: string) => [...auditKeys.all, 'actions', findingId] as const,
  action: (id: string) => [...auditKeys.all, 'action', id] as const,
  evidence: (planId: string) => [...auditKeys.all, 'evidence', planId] as const,
  reports: (planId?: string) => [...auditKeys.all, 'reports', planId] as const,
  report: (id: string) => [...auditKeys.all, 'report', id] as const,
  // 🆕 NOVO (v46.0) - Query Keys para funcionalidades adicionais
  risks: (planId: string) => [...auditKeys.all, 'risks', planId] as const,
  risk: (id: string) => [...auditKeys.all, 'risk', id] as const,
  soa: (planId: string) => [...auditKeys.all, 'soa', planId] as const,
  program: (planId: string) => [...auditKeys.all, 'program', planId] as const,
  documentReview: (planId: string) => [...auditKeys.all, 'document-review', planId] as const,
};

// ============================================================
// HOOKS — PLANOS
// ============================================================

export function usePlans(filters?: AuditFilters) {
  return useQuery({
    queryKey: auditKeys.plans(),
    queryFn: () => auditService.listPlans(filters),
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: auditKeys.plan(id),
    queryFn: () => auditService.getPlan(id),
    enabled: !!id,
  });
}

export function usePlanStats() {
  return useQuery({
    queryKey: auditKeys.plansStats(),
    queryFn: () => auditService.getPlanStats(),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAuditPlanDTO) => auditService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.plans() });
      queryClient.invalidateQueries({ queryKey: auditKeys.plansStats() });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuditPlanDTO }) =>
      auditService.updatePlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.plans() });
      queryClient.invalidateQueries({ queryKey: auditKeys.plan(variables.id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.plansStats() });
    },
  });
}

export function useSubmitPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.submitPlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.plans() });
      queryClient.invalidateQueries({ queryKey: auditKeys.plan(id) });
    },
  });
}

export function useApprovePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.approvePlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.plans() });
      queryClient.invalidateQueries({ queryKey: auditKeys.plan(id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.plansStats() });
    },
  });
}

export function useRejectPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      auditService.rejectPlan(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.plans() });
      queryClient.invalidateQueries({ queryKey: auditKeys.plan(id) });
    },
  });
}

export function useStartPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.startPlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.plans() });
      queryClient.invalidateQueries({ queryKey: auditKeys.plan(id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.plansStats() });
    },
  });
}

export function useCompletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.completePlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.plans() });
      queryClient.invalidateQueries({ queryKey: auditKeys.plan(id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.plansStats() });
    },
  });
}

export function useCancelPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.cancelPlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.plans() });
      queryClient.invalidateQueries({ queryKey: auditKeys.plan(id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.plansStats() });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.plans() });
      queryClient.invalidateQueries({ queryKey: auditKeys.plansStats() });
    },
  });
}

// ============================================================
// HOOKS — CHECKLISTS
// ============================================================

export function useChecklists(planId: string) {
  return useQuery({
    queryKey: auditKeys.checklists(planId),
    queryFn: () => auditService.listChecklists(planId),
    enabled: !!planId,
  });
}

export function useChecklist(planId: string, controlId: string) {
  return useQuery({
    queryKey: auditKeys.checklist(planId, controlId),
    queryFn: () => auditService.getChecklist(planId, controlId),
    enabled: !!planId && !!controlId,
  });
}

export function useChecklistStats(planId: string) {
  return useQuery({
    queryKey: auditKeys.checklistStats(planId),
    queryFn: () => auditService.getChecklistStats(planId),
    enabled: !!planId,
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, questions }: { id: string; questions: any[] }) =>
      auditService.updateChecklist(id, questions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.checklists('') });
    },
  });
}

export function useCompleteChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.completeChecklist(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.checklists('') });
    },
  });
}

// ============================================================
// HOOKS — NÃO CONFORMIDADES (FINDINGS)
// ============================================================

export function useFindings(planId: string, filters?: AuditFindingFilters) {
  return useQuery({
    queryKey: auditKeys.findings(planId),
    queryFn: () => auditService.listFindings(planId, filters),
    enabled: !!planId,
  });
}

export function useFinding(id: string) {
  return useQuery({
    queryKey: auditKeys.finding(id),
    queryFn: () => auditService.getFinding(id),
    enabled: !!id,
  });
}

export function useFindingStats(planId: string) {
  return useQuery({
    queryKey: auditKeys.findingStats(planId),
    queryFn: () => auditService.getFindingStats(planId),
    enabled: !!planId,
  });
}

export function useCreateFinding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: CreateAuditFindingDTO }) =>
      auditService.createFinding(planId, data),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.findings(planId) });
      queryClient.invalidateQueries({ queryKey: auditKeys.findingStats(planId) });
    },
  });
}

export function useUpdateFinding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuditFindingDTO }) =>
      auditService.updateFinding(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.finding(id) });
    },
  });
}

export function useSubmitFinding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.submitFinding(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.finding(id) });
    },
  });
}

export function useValidateFinding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: 'closed' | 'reopened'; comment?: string }) =>
      auditService.validateFinding(id, status, comment),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.finding(id) });
    },
  });
}

export function useDeleteFinding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.deleteFinding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.findings('') });
      queryClient.invalidateQueries({ queryKey: auditKeys.findingStats('') });
    },
  });
}

// ============================================================
// HOOKS — PLANOS DE AÇÃO
// ============================================================

export function useActionsByFinding(findingId: string) {
  return useQuery({
    queryKey: auditKeys.actions(findingId),
    queryFn: () => auditService.listActionsByFinding(findingId),
    enabled: !!findingId,
  });
}

export function useAction(id: string) {
  return useQuery({
    queryKey: auditKeys.action(id),
    queryFn: () => auditService.getAction(id),
    enabled: !!id,
  });
}

export function useCreateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAuditActionPlanDTO) => auditService.createAction(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.actions(data.findingId) });
    },
  });
}

export function useUpdateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuditActionPlanDTO }) =>
      auditService.updateAction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.action(id) });
    },
  });
}

export function useStartAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.startAction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.action(id) });
    },
  });
}

export function useCompleteAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, evidenceIds }: { id: string; evidenceIds?: string[] }) =>
      auditService.completeAction(id, evidenceIds),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.action(id) });
    },
  });
}

export function useValidateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: 'completed' | 'rejected'; comment?: string }) =>
      auditService.validateAction(id, status, comment),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.action(id) });
    },
  });
}

// ============================================================
// HOOKS — EVIDÊNCIAS
// ============================================================

export function useEvidenceByPlan(planId: string) {
  return useQuery({
    queryKey: auditKeys.evidence(planId),
    queryFn: () => auditService.listEvidenceByPlan(planId),
    enabled: !!planId,
  });
}

export function useUploadEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ auditPlanId, file, findingId, description }: { auditPlanId: string; file: File; findingId?: string; description?: string }) =>
      auditService.uploadEvidence(auditPlanId, file, findingId, description),
    onSuccess: (_, { auditPlanId }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.evidence(auditPlanId) });
    },
  });
}

export function useDeleteEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.deleteEvidence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.evidence('') });
    },
  });
}

// ============================================================
// HOOKS — RELATÓRIOS
// ============================================================

export function useReports(planId?: string) {
  return useQuery({
    queryKey: auditKeys.reports(planId),
    queryFn: () => auditService.listReports(planId),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: auditKeys.report(id),
    queryFn: () => auditService.getReport(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAuditReportDTO) => auditService.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.reports() });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuditReportDTO }) =>
      auditService.updateReport(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.report(id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.reports() });
    },
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.submitReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.report(id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.reports() });
    },
  });
}

export function useApproveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.approveReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.report(id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.reports() });
    },
  });
}

export function useRejectReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      auditService.rejectReport(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.report(id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.reports() });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.reports() });
    },
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => auditService.generateReport(planId),
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.reports(planId) });
      queryClient.invalidateQueries({ queryKey: auditKeys.reports() });
    },
  });
}

// ============================================================
// 🆕 NOVO (v46.0) - HOOKS — RISCOS
// ============================================================

export function useRisksByPlan(planId: string) {
  return useQuery({
    queryKey: auditKeys.risks(planId),
    queryFn: () => auditService.listRisksByPlan(planId),
    enabled: !!planId,
  });
}

export function useRisk(id: string) {
  return useQuery({
    queryKey: auditKeys.risk(id),
    queryFn: () => auditService.getRisk(id),
    enabled: !!id,
  });
}

export function useCreateRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: any }) =>
      auditService.createRisk(planId, data),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.risks(planId) });
    },
  });
}

export function useUpdateRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      auditService.updateRisk(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.risk(id) });
    },
  });
}

export function useDeleteRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditService.deleteRisk(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.risks('') });
    },
  });
}

// ============================================================
// 🆕 NOVO (v46.0) - HOOKS — SoA (Statement of Applicability)
// ============================================================

export function useSoAByPlan(planId: string) {
  return useQuery({
    queryKey: auditKeys.soa(planId),
    queryFn: () => auditService.getSoAByPlan(planId),
    enabled: !!planId,
  });
}

export function useUpdateSoAControl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ soaId, clause, data }: { soaId: string; clause: string; data: any }) =>
      auditService.updateSoAControl(soaId, clause, data),
    onSuccess: (_, { soaId }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.soa('') });
    },
  });
}

export function useExportSoA() {
  return useMutation({
    mutationFn: (soaId: string) => auditService.exportSoA(soaId),
  });
}

// ============================================================
// 🆕 NOVO (v46.0) - HOOKS — PROGRAMA DE AUDITORIA
// ============================================================

export function useProgramByPlan(planId: string) {
  return useQuery({
    queryKey: auditKeys.program(planId),
    queryFn: () => auditService.getProgramByPlan(planId),
    enabled: !!planId,
  });
}

export function useCreateProgramActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, data }: { programId: string; data: any }) =>
      auditService.createProgramActivity(programId, data),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.program(programId) });
    },
  });
}

export function useUpdateProgramActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, activityId, data }: { programId: string; activityId: string; data: any }) =>
      auditService.updateProgramActivity(programId, activityId, data),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.program(programId) });
    },
  });
}

export function useDeleteProgramActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, activityId }: { programId: string; activityId: string }) =>
      auditService.deleteProgramActivity(programId, activityId),
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.program(programId) });
    },
  });
}

// ============================================================
// 🆕 NOVO (v46.0) - HOOKS — REVISÃO DOCUMENTAL
// ============================================================

export function useDocumentReviewByPlan(planId: string) {
  return useQuery({
    queryKey: auditKeys.documentReview(planId),
    queryFn: () => auditService.getDocumentReviewByPlan(planId),
    enabled: !!planId,
  });
}

export function useUpdateDocumentReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, clause, data }: { reviewId: string; clause: string; data: any }) =>
      auditService.updateDocumentReview(reviewId, clause, data),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.documentReview('') });
    },
  });
}

export function useCompleteDocumentReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => auditService.completeDocumentReview(reviewId),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: auditKeys.documentReview('') });
    },
  });
}