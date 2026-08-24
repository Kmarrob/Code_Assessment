```typescript
import mongoose from 'mongoose';
import { AuditPlan } from '../models/AuditPlan';
import { AuditChecklist } from '../models/AuditChecklist';
import { Question } from '../../Question';
import {
  IAuditPlan,
  CreateAuditPlanDTO,
  UpdateAuditPlanDTO,
  AuditFilters,
} from '../types/audit.types';
import { AuditChecklistService } from './AuditChecklistService';

/**
 * Mapeia documento do MongoDB para IAuditPlan com id.
 *
 * O método mantém os campos existentes do documento e garante
 * que o campo id esteja disponível para o frontend/serviços.
 */
function mapToIAuditPlan(doc: any): IAuditPlan {
  if (!doc) {
    return null as any;
  }

  const object = typeof doc.toObject === 'function'
    ? doc.toObject()
    : doc;

  return {
    ...object,
    id: object._id
      ? object._id.toString()
      : object.id,
  } as IAuditPlan;
}

/**
 * Mapeia array de documentos para IAuditPlan[].
 */
function mapToIAuditPlanArray(docs: any[]): IAuditPlan[] {
  if (!docs) {
    return [];
  }

  return docs.map((doc) => mapToIAuditPlan(doc));
}

/**
 * Valida ObjectId antes de executar operações com MongoDB.
 */
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class AuditPlanService {
  private checklistService: AuditChecklistService;

  constructor() {
    this.checklistService = new AuditChecklistService();
  }

  // ============================================================
  // CRIAR PLANO DE AUDITORIA
  // ============================================================

  async create(
    data: CreateAuditPlanDTO,
    createdBy: string,
    companyId: string
  ): Promise<IAuditPlan> {
    // ============================================================
    // VALIDAÇÕES BÁSICAS
    // ============================================================

    if (!createdBy) {
      throw new Error(
        'O usuário responsável pela criação do plano é obrigatório'
      );
    }

    if (!companyId) {
      throw new Error(
        'A empresa do plano de auditoria é obrigatória'
      );
    }

    if (!data) {
      throw new Error(
        'Os dados do plano de auditoria são obrigatórios'
      );
    }

    if (!data.team) {
      throw new Error(
        'A equipe de auditoria deve ser informada'
      );
    }

    if (!data.team.leadAuditor) {
      throw new Error(
        'O plano precisa possuir um auditor líder designado'
      );
    }

    // ============================================================
    // VALIDAR SEGREGAÇÃO DE FUNÇÕES
    // ============================================================

    if (data.team.leadAuditor === createdBy) {
      throw new Error(
        'O auditor líder não pode ser o mesmo que criou o plano'
      );
    }

    // ============================================================
    // VALIDAR PERÍODO
    // ============================================================

    const startDate = new Date(data.period.startDate);
    const endDate = new Date(data.period.endDate);

    if (Number.isNaN(startDate.getTime())) {
      throw new Error(
        'Data inicial da auditoria inválida'
      );
    }

    if (Number.isNaN(endDate.getTime())) {
      throw new Error(
        'Data final da auditoria inválida'
      );
    }

    if (startDate > endDate) {
      throw new Error(
        'A data inicial da auditoria não pode ser posterior à data final'
      );
    }

    // ============================================================
    // CALCULAR DIAS ESTIMADOS
    // ============================================================

    const estimatedDays =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    // ============================================================
    // NORMALIZAR EQUIPE
    // ============================================================

    const teamData = {
      leadAuditor: data.team.leadAuditor,
      auditors: data.team.auditors || [],
      observers: data.team.observers || [],
      specialists:
        (data.team as any).specialists || [],
    };

    // ============================================================
    // CRIAR PLANO
    // ============================================================

    const plan = new AuditPlan({
      ...data,

      companyId,

      createdBy,

      status: 'draft',

      period: {
        ...data.period,
        startDate,
        endDate,
        estimatedDays,
      },

      scope: {
        controls: data.scope?.controls || [],
        processes: data.scope?.processes || [],
        areas: data.scope?.areas || [],
      },

      team: teamData,

      criteria: data.criteria || [],
    });

    await plan.save();

    // ============================================================
    // GERAR CHECKLIST AUTOMATICAMENTE
    // ============================================================

    if (
      data.scope &&
      data.scope.controls &&
      data.scope.controls.length > 0
    ) {
      await this.generateChecklist(
        plan._id.toString(),
        data.scope.controls,
        createdBy
      );

      // ============================================================
      // POPULAR COM RESPOSTAS EXISTENTES
      // ============================================================

      try {
        const populatedCount =
          await this.checklistService.populateAllChecklists(
            plan._id.toString(),
            createdBy
          );

        console.log(
          `✅ ${populatedCount} checklists populados com respostas dos usuários`
        );
      } catch (populateError) {
        console.error(
          '⚠️ Erro ao popular checklists com respostas dos usuários:',
          populateError
        );

        // Não interromper criação do plano.
      }
    }

    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // GERAR CHECKLIST AUTOMÁTICO
  // ============================================================

  private async generateChecklist(
    planId: string,
    controlIds: string[],
    createdBy: string
  ): Promise<void> {
    if (!controlIds || controlIds.length === 0) {
      return;
    }

    // Remover duplicidades sem alterar a ordem original.
    const uniqueControlIds = [
      ...new Set(
        controlIds
          .filter(Boolean)
          .map((controlId) => String(controlId).trim())
      ),
    ];

    for (const controlId of uniqueControlIds) {
      // ============================================================
      // EVITAR DUPLICAÇÃO DE CHECKLIST
      // ============================================================

      const existingChecklist =
        await AuditChecklist.findOne({
          auditPlanId: planId,
          controlId,
        });

      if (existingChecklist) {
        continue;
      }

      // ============================================================
      // BUSCAR PERGUNTAS DA BIBLIOTECA
      // ============================================================

      const sourceQuestions = await Question.find({
        controlId,
        active: true,
      })
        .sort({
          order: 1,
        })
        .lean();

      // ============================================================
      // GERAR PERGUNTAS DO CHECKLIST
      // ============================================================

      const questions = sourceQuestions.map(
        (sourceQuestion) => ({
          question: sourceQuestion.text,

          answer: '--' as const,

          observations: '',

          evidenceIds: [],

          responsible: createdBy,
        })
      );

      // ============================================================
      // CRIAR CHECKLIST
      // ============================================================

      await AuditChecklist.create({
        auditPlanId: planId,

        controlId,

        questions,

        statistics: {
          total: questions.length,
          conforme: 0,
          nonConforme: 0,
          observacao: 0,
          oportunidade: 0,
          naoAplicavel: 0,
        },

        status: 'pending',

        createdBy,
      });

      console.log(
        `✅ Checklist criado para o controle ${controlId} com ${questions.length} pergunta(s)`
      );
    }
  }

  // ============================================================
  // LISTAR PLANOS
  // ============================================================

  async findAll(
    filters: AuditFilters = {}
  ): Promise<IAuditPlan[]> {
    const query: any = {};

    // ============================================================
    // EMPRESA
    // ============================================================

    if (filters.companyId) {
      query.companyId = filters.companyId;
    }

    // ============================================================
    // STATUS
    // ============================================================

    if (filters.status) {
      query.status = filters.status;
    }

    // ============================================================
    // AUDITOR LÍDER
    // ============================================================

    if (filters.leadAuditor) {
      query['team.leadAuditor'] =
        filters.leadAuditor;
    }

    // ============================================================
    // AUDITOR
    // ============================================================

    if (filters.auditor) {
      query['team.auditors'] = {
        $in: [filters.auditor],
      };
    }

    // ============================================================
    // PERÍODO
    // ============================================================

    if (
      filters.startDate ||
      filters.endDate
    ) {
      if (filters.startDate) {
        query['period.startDate'] = {
          $gte: filters.startDate,
        };
      }

      if (filters.endDate) {
        query['period.endDate'] = {
          $lte: filters.endDate,
        };
      }
    }

    // ============================================================
    // PESQUISA
    // ============================================================

    if (filters.search) {
      const escapedSearch =
        filters.search.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );

      query.$or = [
        {
          title: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
        {
          code: {
            $regex: escapedSearch,
            $options: 'i',
          },
        },
      ];
    }

    // ============================================================
    // CONSULTA
    // ============================================================

    const docs = await AuditPlan.find(query)
      .sort({
        'period.startDate': -1,
      })
      .lean();

    return mapToIAuditPlanArray(docs);
  }

  // ============================================================
  // BUSCAR PLANO POR ID
  // ============================================================

  async findById(
    id: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(id)) {
      throw new Error(
        'ID do plano de auditoria inválido'
      );
    }

    const query: any = {
      _id: id,
    };

    if (companyId) {
      query.companyId = companyId;
    }

    const doc =
      await AuditPlan.findOne(query).lean();

    if (!doc) {
      return null;
    }

    return mapToIAuditPlan(doc);
  }

  // ============================================================
  // ATUALIZAR PLANO
  // ============================================================

  async update(
    id: string,
    data: UpdateAuditPlanDTO,
    userId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(id)) {
      throw new Error(
        'ID do plano de auditoria inválido'
      );
    }

    if (!data) {
      throw new Error(
        'Os dados para atualização são obrigatórios'
      );
    }

    const query: any = {
      _id: id,
    };

    if (companyId) {
      query.companyId = companyId;
    }

    const plan =
      await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error(
        'Plano não encontrado'
      );
    }

    // ============================================================
    // STATUS PERMITIDOS PARA EDIÇÃO
    // ============================================================

    if (
      plan.status !== 'draft' &&
      plan.status !== 'pending_approval'
    ) {
      throw new Error(
        'Apenas planos em rascunho ou aguardando aprovação podem ser editados'
      );
    }

    // ============================================================
    // SEGURANÇA
    // ============================================================

    delete (data as any).companyId;
    delete (data as any).createdBy;
    delete (data as any).approvedBy;
    delete (data as any).approvedAt;
    delete (data as any).createdAt;
    delete (data as any).updatedAt;
    delete (data as any).deletedAt;
    delete (data as any)._id;
    delete (data as any).id;

    // ============================================================
    // SEGREGAÇÃO DE FUNÇÕES
    // ============================================================

    const currentTeam =
      typeof (plan.team as any)?.toObject === 'function'
        ? (plan.team as any).toObject()
        : plan.team;

    const nextTeam = {
      ...(currentTeam || {}),
      ...(data.team || {}),
    };

    if (
      nextTeam.leadAuditor &&
      nextTeam.leadAuditor ===
        plan.createdBy
    ) {
      throw new Error(
        'O auditor líder não pode ser o mesmo que criou o plano'
      );
    }

    // ============================================================
    // PERÍODO
    // ============================================================

    if (data.period) {
      const startDate =
        data.period.startDate
          ? new Date(data.period.startDate)
          : plan.period.startDate;

      const endDate =
        data.period.endDate
          ? new Date(data.period.endDate)
          : plan.period.endDate;

      if (Number.isNaN(startDate.getTime())) {
        throw new Error(
          'Data inicial da auditoria inválida'
        );
      }

      if (Number.isNaN(endDate.getTime())) {
        throw new Error(
          'Data final da auditoria inválida'
        );
      }

      if (startDate > endDate) {
        throw new Error(
          'A data inicial da auditoria não pode ser posterior à data final'
        );
      }

      const estimatedDays =
        Math.ceil(
          (endDate.getTime() -
            startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      Object.assign(plan.period, {
        ...data.period,
        startDate,
        endDate,
        estimatedDays,
      });
    }

    // ============================================================
    // APLICAÇÃO DOS DADOS DO ESCOPO
    // ============================================================

    if (data.scope) {
      plan.scope = {
        ...plan.scope,
        ...data.scope,

        controls:
          data.scope.controls !== undefined
            ? data.scope.controls
            : plan.scope.controls,

        processes:
          data.scope.processes !== undefined
            ? data.scope.processes
            : plan.scope.processes,

        areas:
          data.scope.areas !== undefined
            ? data.scope.areas
            : plan.scope.areas,
      };
    }

    // ============================================================
    // APLICAÇÃO DOS DADOS DA EQUIPE
    // ============================================================

    if (data.team) {
      plan.team = {
        ...plan.team,
        ...data.team,

        observers:
          data.team.observers !== undefined
            ? data.team.observers
            : plan.team.observers || [],

        auditors:
          data.team.auditors !== undefined
            ? data.team.auditors
            : plan.team.auditors || [],

        specialists:
          (data.team as any).specialists !== undefined
            ? (data.team as any).specialists
            : (plan.team as any).specialists || [],
      };
    }

    // ============================================================
    // CRITÉRIOS
    // ============================================================

    if (data.criteria !== undefined) {
      plan.criteria = data.criteria;
    }

    // ============================================================
    // TÍTULO
    // ============================================================

    if (data.title !== undefined) {
      plan.title = data.title;
    }

    // ============================================================
    // DESCRIÇÃO
    // ============================================================

    if (data.description !== undefined) {
      plan.description =
        data.description;
    }

    // ============================================================
    // OBSERVAÇÕES
    // ============================================================

    if (
      (data as any).observations !== undefined
    ) {
      (plan as any).observations =
        (data as any).observations;
    }

    // ============================================================
    // STATUS
    // ============================================================

    // O status não deve ser alterado livremente
    // pelo DTO de edição.
    if (
      data.status !== undefined &&
      data.status !== plan.status
    ) {
      throw new Error(
        'A alteração de status deve ser realizada por uma operação específica do fluxo de auditoria'
      );
    }

    // ============================================================
    // ATUALIZAÇÃO
    // ============================================================

    plan.updatedAt = new Date();

    await plan.save();

    // ============================================================
    // GARANTIR CHECKLISTS DOS NOVOS CONTROLES
    // ============================================================

    if (
      data.scope &&
      data.scope.controls !== undefined &&
      data.scope.controls.length > 0
    ) {
      await this.generateChecklist(
        plan._id.toString(),
        data.scope.controls,
        userId
      );
    }

    return mapToIAuditPlan(
      plan.toObject()
    );
  }

  // ============================================================
  // ENVIAR PARA APROVAÇÃO
  // ============================================================

  async submitForApproval(
    id: string,
    userId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(id)) {
      throw new Error(
        'ID do plano de auditoria inválido'
      );
    }

    const query: any = {
      _id: id,
    };

    if (companyId) {
      query.companyId = companyId;
    }

    const plan =
      await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error(
        'Plano não encontrado'
      );
    }

    // ============================================================
    // SEGREGAÇÃO DE FUNÇÕES
    // ============================================================

    if (plan.createdBy !== userId) {
      throw new Error(
        'Apenas o criador do plano pode enviar para aprovação'
      );
    }

    if (plan.status !== 'draft') {
      throw new Error(
        'Apenas planos em rascunho podem ser enviados para aprovação'
      );
    }

    // ============================================================
    // VALIDAR AUDITOR LÍDER
    // ============================================================

    if (!plan.team.leadAuditor) {
      throw new Error(
        'O plano precisa possuir um auditor líder designado'
      );
    }

    // ============================================================
    // VALIDAR ESCOPO
    // ============================================================

    if (
      !plan.scope ||
      !plan.scope.controls ||
      plan.scope.controls.length === 0
    ) {
      throw new Error(
        'O plano precisa possuir pelo menos um controle no escopo da auditoria'
      );
    }

    plan.status =
      'pending_approval';

    plan.updatedAt =
      new Date();

    await plan.save();

    return mapToIAuditPlan(
      plan.toObject()
    );
  }

  // ============================================================
  // APROVAR PLANO
  // ============================================================

  async approve(
    id: string,
    approverId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(id)) {
      throw new Error(
        'ID do plano de auditoria inválido'
      );
    }

    const query: any = {
      _id: id,
    };

    if (companyId) {
      query.companyId = companyId;
    }

    const plan =
      await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error(
        'Plano não encontrado'
      );
    }

    // ============================================================
    // SEGREGAÇÃO DE FUNÇÕES
    // ============================================================

    if (
      plan.createdBy ===
      approverId
    ) {
      throw new Error(
        'O aprovador não pode ser o mesmo que criou o plano'
      );
    }

    // ============================================================
    // VALIDAR AUDITOR LÍDER
    // ============================================================

    if (
      plan.team.leadAuditor !==
      approverId
    ) {
      throw new Error(
        'Apenas o auditor líder designado pode aprovar o plano'
      );
    }

    // ============================================================
    // VALIDAR STATUS
    // ============================================================

    if (
      plan.status !==
      'pending_approval'
    ) {
      throw new Error(
        'Apenas planos aguardando aprovação podem ser aprovados'
      );
    }

    // ============================================================
    // APROVAR
    // ============================================================

    plan.status =
      'approved';

    plan.approvedBy =
      approverId;

    plan.approvedAt =
      new Date();

    plan.rejectionReason =
      undefined;

    plan.updatedAt =
      new Date();

    await plan.save();

    return mapToIAuditPlan(
      plan.toObject()
    );
  }

  // ============================================================
  // REJEITAR PLANO
  // ============================================================

  async reject(
    id: string,
    approverId: string,
    reason: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(id)) {
      throw new Error(
        'ID do plano de auditoria inválido'
      );
    }

    const query: any = {
      _id: id,
    };

    if (companyId) {
      query.companyId = companyId;
    }

    const plan =
      await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error(
        'Plano não encontrado'
      );
    }

    // ============================================================
    // SEGREGAÇÃO DE FUNÇÕES
    // ============================================================

    if (
      plan.createdBy ===
      approverId
    ) {
      throw new Error(
        'O rejeitador não pode ser o mesmo que criou o plano'
      );
    }

    // ============================================================
    // VALIDAR AUDITOR LÍDER
    // ============================================================

    if (
      plan.team.leadAuditor !==
      approverId
    ) {
      throw new Error(
        'Apenas o auditor líder designado pode rejeitar o plano'
      );
    }

    // ============================================================
    // VALIDAR STATUS
    // ============================================================

    if (
      plan.status !==
      'pending_approval'
    ) {
      throw new Error(
        'Apenas planos aguardando aprovação podem ser rejeitados'
      );
    }

    // ============================================================
    // VALIDAR MOTIVO
    // ============================================================

    if (!reason || !reason.trim()) {
      throw new Error(
        'O motivo da rejeição é obrigatório'
      );
    }

    // ============================================================
    // REJEITAR
    // ============================================================

    plan.status =
      'draft';

    plan.rejectionReason =
      reason.trim();

    // Não registrar aprovação em uma rejeição.
    plan.approvedBy =
      undefined;

    plan.approvedAt =
      undefined;

    plan.updatedAt =
      new Date();

    await plan.save();

    return mapToIAuditPlan(
      plan.toObject()
    );
  }

  // ============================================================
  // CANCELAR PLANO
  // ============================================================

  async cancel(
    id: string,
    userId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(id)) {
      throw new Error(
        'ID do plano de auditoria inválido'
      );
    }

    const query: any = {
      _id: id,
    };

    if (companyId) {
      query.companyId = companyId;
    }

    const plan =
      await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error(
        'Plano não encontrado'
      );
    }

    // ============================================================
    // VALIDAR AUTORIZAÇÃO
    // ============================================================

    const canCancel =
      plan.createdBy === userId ||
      plan.team.leadAuditor === userId;

    if (!canCancel) {
      throw new Error(
        'Apenas o criador do plano ou o auditor líder podem cancelar a auditoria'
      );
    }

    // ============================================================
    // VALIDAR STATUS
    // ============================================================

    if (
      plan.status ===
      'completed'
    ) {
      throw new Error(
        'Uma auditoria concluída não pode ser cancelada'
      );
    }

    if (
      plan.status ===
      'cancelled'
    ) {
      return mapToIAuditPlan(
        plan.toObject()
      );
    }

    // ============================================================
    // CANCELAR
    // ============================================================

    plan.status =
      'cancelled';

    plan.updatedAt =
      new Date();

    await plan.save();

    return mapToIAuditPlan(
      plan.toObject()
    );
  }

  // ============================================================
  // INICIAR AUDITORIA
  // ============================================================

  async startAudit(
    id: string,
    userId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(id)) {
      throw new Error(
        'ID do plano de auditoria inválido'
      );
    }

    const query: any = {
      _id: id,
    };

    if (companyId) {
      query.companyId = companyId;
    }

    const plan =
      await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error(
        'Plano não encontrado'
      );
    }

    // ============================================================
    // VALIDAR EQUIPE
    // ============================================================

    const isTeamMember =
      plan.team.leadAuditor ===
        userId ||
      plan.team.auditors.includes(
        userId
      );

    if (!isTeamMember) {
      throw new Error(
        'Apenas membros da equipe de auditoria podem iniciar a auditoria'
      );
    }

    // ============================================================
    // VALIDAR STATUS
    // ============================================================

    if (
      plan.status !==
      'approved'
    ) {
      throw new Error(
        'Apenas planos aprovados podem ser iniciados'
      );
    }

    // ============================================================
    // INICIAR
    // ============================================================

    plan.status =
      'in_progress';

    plan.startedAt =
      new Date();

    plan.updatedAt =
      new Date();

    await plan.save();

    return mapToIAuditPlan(
      plan.toObject()
    );
  }

  // ============================================================
  // CONCLUIR AUDITORIA
  // ============================================================

  async completeAudit(
    id: string,
    userId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(id)) {
      throw new Error(
        'ID do plano de auditoria inválido'
      );
    }

    const query: any = {
      _id: id,
    };

    if (companyId) {
      query.companyId = companyId;
    }

    const plan =
      await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error(
        'Plano não encontrado'
      );
    }

    // ============================================================
    // VALIDAR AUDITOR LÍDER
    // ============================================================

    if (
      plan.team.leadAuditor !==
      userId
    ) {
      throw new Error(
        'Apenas o auditor líder pode concluir a auditoria'
      );
    }

    // ============================================================
    // VALIDAR STATUS
    // ============================================================

    if (
      plan.status !==
      'in_progress'
    ) {
      throw new Error(
        'Apenas auditorias em andamento podem ser concluídas'
      );
    }

    // ============================================================
    // VERIFICAR CHECKLISTS
    // ============================================================

    const pendingChecklists =
      await AuditChecklist.countDocuments(
        {
          auditPlanId:
            plan._id.toString(),

          status: {
            $ne: 'completed',
          },
        }
      );

    if (pendingChecklists > 0) {
      throw new Error(
        `Não é possível concluir a auditoria enquanto existirem ${pendingChecklists} checklist(s) pendente(s)`
      );
    }

    // ============================================================
    // CONCLUIR
    // ============================================================

    plan.status =
      'completed';

    plan.completedAt =
      new Date();

    plan.completedBy =
      userId;

    plan.updatedAt =
      new Date();

    await plan.save();

    return mapToIAuditPlan(
      plan.toObject()
    );
  }

  // ============================================================
  // VERIFICAR PERMISSÃO DE PLANO EMPRESARIAL
  // ============================================================

  async validateEnterpriseAccess(
    companyId: string
  ): Promise<boolean> {
    /*
     * Mantido conforme implementação original.
     *
     * A validação definitiva deverá ser conectada à regra
     * de assinatura/licenciamento da empresa.
     *
     * NÃO deve ser considerada uma implementação definitiva
     * de controle de acesso.
     */
    return Boolean(companyId);
  }

  // ============================================================
  // ESTATÍSTICAS DE AUDITORIA
  // ============================================================

  async getStats(
    companyId: string
  ): Promise<any> {
    if (!companyId) {
      throw new Error(
        'Empresa é obrigatória para consultar estatísticas'
      );
    }

    const totalPlans =
      await AuditPlan.countDocuments({
        companyId,
      });

    const approved =
      await AuditPlan.countDocuments({
        companyId,
        status: 'approved',
      });

    const inProgress =
      await AuditPlan.countDocuments({
        companyId,
        status: 'in_progress',
      });

    const completed =
      await AuditPlan.countDocuments({
        companyId,
        status: 'completed',
      });

    return {
      totalPlans,
      approved,
      inProgress,
      completed,
    };
  }
}
```
