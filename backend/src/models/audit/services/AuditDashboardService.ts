import { AuditPlan } from '../models/AuditPlan';
import { AuditChecklist } from '../models/AuditChecklist';
import { AuditControlQuestion } from '../models/AuditControlQuestion';

// ============================================================
// AUDIT DASHBOARD SERVICE — v50.2.15
// ============================================================
//
// Serviço de agregação de estatísticas para o dashboard de
// auditoria. Consolida dados de planos, checklists e perguntas
// de auditoria em uma única chamada.
//
// NÃO altera nenhuma coleção. Apenas leitura/agregação.
//
// Filtro automático:
//   - ADMIN: vê todos os planos
//   - REP:   vê apenas os planos da sua empresa
//
// ============================================================

export interface AuditDashboardStats {
  kpis: {
    totalPlans: number;
    inProgress: number;
    completed: number;
    approved: number;
    draft: number;
    totalChecklists: number;
    totalAuditQuestions: number;
    totalAnswered: number;
  };

  conclusionDistribution: {
    C: number;
    NC: number;
    OB: number;
    OM: number;
    NA: number;
    pending: number;
  };

  byDomain: {
    domain: string;
    label: string;
    C: number;
    NC: number;
    OB: number;
    OM: number;
    NA: number;
    total: number;
  }[];

  topNonConformities: {
    controlId: string;
    controlName: string;
    NC: number;
    total: number;
  }[];

  progress: {
    totalChecklists: number;
    completedChecklists: number;
    inProgressChecklists: number;
    pendingChecklists: number;
    completionRate: number;
  };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Deriva o domínio a partir do controlId.
 * Ex.: "5.12" → "A.5" | "6.3" → "A.6" | "8.34" → "A.8"
 */
function getDomainFromControlId(controlId: string): string {
  const prefix = String(controlId || '').split('.')[0];
  return `A.${prefix}`;
}

/**
 * Retorna o rótulo legível do domínio.
 */
function getDomainLabel(domain: string): string {
  switch (domain) {
    case 'A.5':
      return 'A.5 Organizacionais';
    case 'A.6':
      return 'A.6 Pessoas';
    case 'A.7':
      return 'A.7 Físicos';
    case 'A.8':
      return 'A.8 Tecnológicos';
    default:
      return domain;
  }
}

// ============================================================
// SERVICE
// ============================================================

export class AuditDashboardService {

  /**
   * Retorna todas as estatísticas agregadas para o dashboard.
   *
   * @param companyId  Se fornecido, filtra apenas pelos planos
   *                   da empresa. Se omitido, considera todos
   *                   (visão do ADMIN).
   * @param planId     Se fornecido, considera apenas um plano
   *                   específico.
   */
  async getDashboardStats(
    companyId?: string,
    planId?: string
  ): Promise<AuditDashboardStats> {

    // ============================================================
    // 1. FILTROS BASE
    // ============================================================

    const planQuery: any = {};

    if (companyId) {
      planQuery.companyId = companyId;
    }

    if (planId) {
      planQuery._id = planId;
    }

    // ============================================================
    // 2. BUSCAR PLANOS
    // ============================================================

    const plans = await AuditPlan.find(planQuery).lean();

    const planIds = plans.map((p: any) => p._id.toString());

    // ============================================================
    // 3. BUSCAR CHECKLISTS DOS PLANOS
    // ============================================================

    const checklists = planIds.length > 0
      ? await AuditChecklist.find({ auditPlanId: { $in: planIds } }).lean()
      : [];

    // ============================================================
    // 4. BUSCAR TOTAL DE PERGUNTAS DE AUDITORIA CADASTRADAS
    // ============================================================

    const totalAuditQuestions = await AuditControlQuestion.countDocuments({
      active: true,
    });

    // ============================================================
    // 5. KPIs
    // ============================================================

    const totalPlans = plans.length;
    const inProgress = plans.filter((p: any) => p.status === 'in_progress').length;
    const completed = plans.filter((p: any) => p.status === 'completed').length;
    const approved = plans.filter((p: any) => p.status === 'approved').length;
    const draft = plans.filter((p: any) => p.status === 'draft').length;

    const totalChecklists = checklists.length;

    // ============================================================
    // 6. DISTRIBUIÇÃO DE CONSTATAÇÕES (C/NC/OB/OM/NA)
    // ============================================================

    const conclusionDistribution = {
      C: 0,
      NC: 0,
      OB: 0,
      OM: 0,
      NA: 0,
      pending: 0,
    };

    let totalAnswered = 0;

    // Mapa para agregação por domínio
    const domainMap = new Map<string, {
      domain: string;
      label: string;
      C: number;
      NC: number;
      OB: number;
      OM: number;
      NA: number;
      total: number;
    }>();

    // Mapa para agregação por controle (para o top NC)
    const controlMap = new Map<string, {
      controlId: string;
      controlName: string;
      NC: number;
      total: number;
    }>();

    // Mapa auxiliar de nomes de controles
    const controlNamesMap = new Map<string, string>();

    for (const checklist of checklists) {
      const controlId = String((checklist as any).controlId || '');
      const controlName = String((checklist as any).controlName || '');

      if (controlId && controlName && !controlNamesMap.has(controlId)) {
        controlNamesMap.set(controlId, controlName);
      }

      const domain = getDomainFromControlId(controlId);

      // Garantir entrada do domínio
      if (!domainMap.has(domain)) {
        domainMap.set(domain, {
          domain,
          label: getDomainLabel(domain),
          C: 0,
          NC: 0,
          OB: 0,
          OM: 0,
          NA: 0,
          total: 0,
        });
      }

      // Garantir entrada do controle
      if (!controlMap.has(controlId)) {
        controlMap.set(controlId, {
          controlId,
          controlName: '',
          NC: 0,
          total: 0,
        });
      }

      const domainEntry = domainMap.get(domain)!;
      const controlEntry = controlMap.get(controlId)!;

      // Considerar as perguntas de auditoria (auditQuestions) se existirem
      const auditQuestions = (checklist as any).auditQuestions || [];

      if (auditQuestions.length > 0) {
        for (const q of auditQuestions) {
          const answer = String(q.answer || '--');

          domainEntry.total++;
          controlEntry.total++;

          switch (answer) {
            case 'C':
              conclusionDistribution.C++;
              domainEntry.C++;
              totalAnswered++;
              break;
            case 'NC':
              conclusionDistribution.NC++;
              domainEntry.NC++;
              controlEntry.NC++;
              totalAnswered++;
              break;
            case 'OB':
              conclusionDistribution.OB++;
              domainEntry.OB++;
              totalAnswered++;
              break;
            case 'OM':
              conclusionDistribution.OM++;
              domainEntry.OM++;
              totalAnswered++;
              break;
            case 'NA':
              conclusionDistribution.NA++;
              domainEntry.NA++;
              totalAnswered++;
              break;
            default:
              conclusionDistribution.pending++;
              break;
          }
        }
      } else {
        // Fallback: considerar questions[] (Assessment)
        const questions = (checklist as any).questions || [];

        for (const q of questions) {
          const answer = String(q.answer || '--');

          domainEntry.total++;
          controlEntry.total++;

          switch (answer) {
            case 'C':
              conclusionDistribution.C++;
              domainEntry.C++;
              totalAnswered++;
              break;
            case 'NC':
              conclusionDistribution.NC++;
              domainEntry.NC++;
              controlEntry.NC++;
              totalAnswered++;
              break;
            case 'OB':
              conclusionDistribution.OB++;
              domainEntry.OB++;
              totalAnswered++;
              break;
            case 'OM':
              conclusionDistribution.OM++;
              domainEntry.OM++;
              totalAnswered++;
              break;
            case 'NA':
              conclusionDistribution.NA++;
              domainEntry.NA++;
              totalAnswered++;
              break;
            default:
              conclusionDistribution.pending++;
              break;
          }
        }
      }
    }

    // ============================================================
    // 7. DISTRIBUIÇÃO POR DOMÍNIO (ordenada)
    // ============================================================

    const byDomain = Array.from(domainMap.values()).sort((a, b) =>
      a.domain.localeCompare(b.domain)
    );

    // ============================================================
    // 8. TOP 10 CONTROLES COM MAIS NC
    // ============================================================

    const topNonConformities = Array.from(controlMap.values())
      .filter((c) => c.NC > 0)
      .map((c) => ({
        ...c,
        controlName: controlNamesMap.get(c.controlId) || c.controlId,
      }))
      .sort((a, b) => b.NC - a.NC || b.total - a.total)
      .slice(0, 10);

    // ============================================================
    // 9. PROGRESSO GERAL
    // ============================================================

    const completedChecklists = checklists.filter(
      (c: any) => c.status === 'completed'
    ).length;

    const inProgressChecklists = checklists.filter(
      (c: any) => c.status === 'in_progress'
    ).length;

    const pendingChecklists = checklists.filter(
      (c: any) => c.status === 'pending'
    ).length;

    const completionRate =
      totalChecklists > 0
        ? Math.round((completedChecklists / totalChecklists) * 100)
        : 0;

    // ============================================================
    // 10. RETORNO
    // ============================================================

    return {
      kpis: {
        totalPlans,
        inProgress,
        completed,
        approved,
        draft,
        totalChecklists,
        totalAuditQuestions,
        totalAnswered,
      },
      conclusionDistribution,
      byDomain,
      topNonConformities,
      progress: {
        totalChecklists,
        completedChecklists,
        inProgressChecklists,
        pendingChecklists,
        completionRate,
      },
    };
  }
}

// ============================================================
// INSTÂNCIA SINGLETON
// ============================================================

export const auditDashboardService = new AuditDashboardService();