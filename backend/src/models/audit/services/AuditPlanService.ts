import mongoose from 'mongoose';
import { AuditPlan } from '../models/AuditPlan';
import { AuditChecklist } from '../models/AuditChecklist';
import { Question } from '../../Question';
import { Company } from '../../../models/Company';
import { Control } from '../../../models/Control';
import {
  IAuditPlan,
  CreateAuditPlanDTO,
  UpdateAuditPlanDTO,
  AuditFilters,
} from '../types/audit.types';
import { AuditChecklistService } from './AuditChecklistService';

/**
 * Mapeia documento do MongoDB para IAuditPlan com id.
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
  // MÉTODOS AUXILIARES — FONTE DOS CONTROLES DA EMPRESA
  // ============================================================

  /**
   * Busca os controles atribuídos à empresa.
   *
   * Fonte: Company.assignedControls (ObjectId[] referenciando Control).
   * Quando a empresa é criada, os 93 controles ISO 27001 são
   * atribuídos automaticamente. Este método retorna os IDs
   * desses controles no formato string.
   */
  async getAllCompanyControls(companyId: string): Promise<string[]> {
    if (!companyId) {
      throw new Error('ID da empresa é obrigatório para buscar controles');
    }

    if (!isValidObjectId(companyId)) {
      throw new Error('ID da empresa inválido');
    }

    const company = await Company.findById(companyId)
      .select('assignedControls')
      .lean();

    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    if (
      !company.assignedControls ||
      !Array.isArray(company.assignedControls) ||
      company.assignedControls.length === 0
    ) {
      return [];
    }

    return company.assignedControls.map((controlId) =>
      controlId.toString()
    );
  }

  /**
   * Conta o total de controles atribuídos à empresa.
   */
  async getTotalAvailableControls(companyId: string): Promise<number> {
    const controls = await this.getAllCompanyControls(companyId);
    return controls.length;
  }

  // ============================================================
  // CRIAR PLANO DE AUDITORIA
  // ============================================================

  async create(
    data: CreateAuditPlanDTO,
    createdBy: string,
    companyId: string
  ): Promise<IAuditPlan> {
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

    if (data.team.leadAuditor === createdBy) {
      throw new Error(
        'O auditor líder não pode ser o mesmo que criou o plano'
      );
    }

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

    const estimatedDays =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const teamData = {
      leadAuditor: data.team.leadAuditor,
      auditors: data.team.auditors || [],
      observers: data.team.observers || [],
      specialists:
        (data.team as any).specialists || [],
    };

    const allCompanyControls = await this.getAllCompanyControls(companyId);

    if (allCompanyControls.length === 0) {
      throw new Error(
        'A empresa não possui controles atribuídos. Não é possível criar um plano de auditoria.'
      );
    }

    const requestedMode: 'all' | 'custom' =
      (data.scope as any)?.mode === 'custom' ? 'custom' : 'all';

    let effectiveControls: string[];

    if (requestedMode === 'custom') {
      const requestedControls: string[] = Array.isArray(data.scope?.controls)
        ? (data.scope.controls as unknown[])
            .filter(Boolean)
            .map((c: unknown) => String(c).trim())
        : [];

      if (requestedControls.length === 0) {
        throw new Error(
          'Modo "custom" requer que pelo menos 1 controle seja selecionado em scope.controls'
        );
      }

      const companyControlSet = new Set(allCompanyControls);

      const invalidControls = requestedControls.filter(
        (controlId) => !companyControlSet.has(controlId)
      );

      if (invalidControls.length > 0) {
        throw new Error(
          `Os seguintes controles não estão atribuídos à empresa: ${invalidControls.join(', ')}`
        );
      }

      effectiveControls = [...new Set(requestedControls)];
    } else {
      effectiveControls = [...allCompanyControls];
    }

    // ============================================================
    // PROCESSAR EXCLUSÕES ENVIADAS NO PAYLOAD (OPÇÃO C)
    // ============================================================

    const rawExclusions: Array<{ controlId: string; reason: string }> =
      requestedMode === 'all' &&
      Array.isArray((data.scope as any)?.excludedControls)
        ? (data.scope as any).excludedControls
        : [];

    const processedExclusions: Array<{
      controlId: string;
      reason: string;
      excludedBy: string;
      excludedAt: Date;
      approvedBy?: string;
      approvedAt?: Date;
    }> = [];

    if (rawExclusions.length > 0) {
      const companyControlSet = new Set(allCompanyControls);
      const seenControlIds = new Set<string>();

      for (const raw of rawExclusions) {
        const controlId = String(raw.controlId || '').trim();
        const reason = String(raw.reason || '').trim();

        if (!controlId) {
          throw new Error(
            'Toda exclusão precisa ter um controlId válido'
          );
        }

        if (reason.length < 20) {
          throw new Error(
            `A justificativa da exclusão do controle ${controlId} deve ter no mínimo 20 caracteres`
          );
        }

        if (!companyControlSet.has(controlId)) {
          throw new Error(
            `O controle ${controlId} não está atribuído à empresa`
          );
        }

        if (seenControlIds.has(controlId)) {
          throw new Error(
            `O controle ${controlId} foi enviado em duplicidade nas exclusões`
          );
        }

        seenControlIds.add(controlId);

        processedExclusions.push({
          controlId,
          reason,
          excludedBy: createdBy,
          excludedAt: new Date(),
          approvedBy: undefined,
          approvedAt: undefined,
        });
      }

      const effectiveAfterExclusions =
        allCompanyControls.length - processedExclusions.length;

      if (effectiveAfterExclusions <= 0) {
        throw new Error(
          'Não é permitido excluir todos os controles. A auditoria deve ter pelo menos 1 controle em escopo'
        );
      }

      const excludedIds = new Set(
        processedExclusions.map((e) => e.controlId)
      );

      effectiveControls = effectiveControls.filter(
        (id) => !excludedIds.has(id)
      );
    }

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
        mode: requestedMode,

        controls: effectiveControls,

        excludedControls: processedExclusions,

        processes: data.scope?.processes || [],

        areas: data.scope?.areas || [],

        totalAvailableControls: allCompanyControls.length,
      },

      team: teamData,

      criteria: data.criteria || [],
    });

    await plan.save();

    if (effectiveControls.length > 0) {
      await this.generateChecklist(
        plan._id.toString(),
        effectiveControls,
        createdBy
      );

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

    const uniqueControlIds = [
      ...new Set(
        controlIds
          .filter(Boolean)
          .map((controlId) => String(controlId).trim())
      ),
    ];

    for (const controlId of uniqueControlIds) {
      const existingChecklist =
        await AuditChecklist.findOne({
          auditPlanId: planId,
          controlId,
        });

      if (existingChecklist) {
        continue;
      }

      const sourceQuestions = await Question.find({
        controlId,
        active: true,
      })
        .sort({
          order: 1,
        })
        .lean();

      const questions = sourceQuestions.map(
        (sourceQuestion) => ({
          question: sourceQuestion.text,
          answer: '--' as const,
          observations: '',
          evidenceIds: [],
          responsible: createdBy,
        })
      );

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

    if (filters.companyId) {
      query.companyId = filters.companyId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.leadAuditor) {
      query['team.leadAuditor'] =
        filters.leadAuditor;
    }

    if (filters.auditor) {
      query['team.auditors'] = {
        $in: [filters.auditor],
      };
    }

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

    if (
      plan.status !== 'draft' &&
      plan.status !== 'pending_approval'
    ) {
      throw new Error(
        'Apenas planos em rascunho ou aguardando aprovação podem ser editados'
      );
    }

    delete (data as any).companyId;
    delete (data as any).createdBy;
    delete (data as any).approvedBy;
    delete (data as any).approvedAt;
    delete (data as any).createdAt;
    delete (data as any).updatedAt;
    delete (data as any).deletedAt;
    delete (data as any)._id;
    delete (data as any).id;

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

    if (data.scope) {
      const incomingScope = data.scope as any;

      if (incomingScope.processes !== undefined) {
        plan.scope.processes = incomingScope.processes;
      }

      if (incomingScope.areas !== undefined) {
        plan.scope.areas = incomingScope.areas;
      }

      if (incomingScope.controls !== undefined) {
        if (plan.scope.mode === 'all') {
          throw new Error(
            'O escopo de controles não pode ser alterado manualmente em modo "all". Use excludeControl para justificar exclusões.'
          );
        }

        const allCompanyControls =
          await this.getAllCompanyControls(
            plan.companyId
          );

        const companyControlSet = new Set(allCompanyControls);

        const requestedControls: string[] = Array.isArray(incomingScope.controls)
          ? (incomingScope.controls as unknown[])
              .filter(Boolean)
              .map((c: unknown) => String(c).trim())
          : [];

        const invalidControls = requestedControls.filter(
          (controlId: string) => !companyControlSet.has(controlId)
        );

        if (invalidControls.length > 0) {
          throw new Error(
            `Os seguintes controles não estão atribuídos à empresa: ${invalidControls.join(', ')}`
          );
        }

        plan.scope.controls = [...new Set(requestedControls)];
      }
    }

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

    if (data.criteria !== undefined) {
      plan.criteria = data.criteria;
    }

    if (data.title !== undefined) {
      plan.title = data.title;
    }

    if (data.description !== undefined) {
      plan.description =
        data.description;
    }

    if (
      (data as any).observations !== undefined
    ) {
      (plan as any).observations =
        (data as any).observations;
    }

    if (
      data.status !== undefined &&
      data.status !== plan.status
    ) {
      throw new Error(
        'A alteração de status deve ser realizada por uma operação específica do fluxo de auditoria'
      );
    }

    plan.updatedAt = new Date();

    await plan.save();

    if (
      data.scope &&
      (data.scope as any).controls !== undefined &&
      Array.isArray((data.scope as any).controls) &&
      (data.scope as any).controls.length > 0
    ) {
      await this.generateChecklist(
        plan._id.toString(),
        (data.scope as any).controls,
        userId
      );
    }

    return mapToIAuditPlan(
      plan.toObject()
    );
  }

  // ============================================================
  // EXCLUIR CONTROLE DO ESCOPO (com justificativa)
  // ============================================================

  async excludeControl(
    planId: string,
    controlId: string,
    reason: string,
    userId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(planId)) {
      throw new Error('ID do plano de auditoria inválido');
    }

    if (!controlId || !controlId.trim()) {
      throw new Error('O ID do controle a excluir é obrigatório');
    }

    if (!reason || reason.trim().length < 20) {
      throw new Error(
        'A justificativa da exclusão deve ter no mínimo 20 caracteres'
      );
    }

    if (!userId) {
      throw new Error('O usuário que está excluindo é obrigatório');
    }

    const query: any = { _id: planId };
    if (companyId) {
      query.companyId = companyId;
    }

    const plan = await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    if (plan.status !== 'draft' && plan.status !== 'pending_approval') {
      throw new Error(
        'Apenas planos em rascunho ou aguardando aprovação podem ter controles excluídos'
      );
    }

    if (plan.scope.mode !== 'all') {
      throw new Error(
        'A exclusão de controles só é permitida em planos com modo "all". Em modo "custom", ajuste diretamente scope.controls.'
      );
    }

    const alreadyExcluded = plan.scope.excludedControls.some(
      (e) => e.controlId === controlId
    );

    if (alreadyExcluded) {
      throw new Error('Este controle já está excluído do escopo');
    }

    const isInScope = plan.scope.controls.includes(controlId);

    if (!isInScope) {
      throw new Error(
        'Este controle não está no escopo atual do plano'
      );
    }

    const effectiveAfterExclusion =
      plan.scope.controls.length - 1;

    if (effectiveAfterExclusion <= 0) {
      throw new Error(
        'Não é permitido excluir todos os controles. A auditoria deve ter pelo menos 1 controle em escopo'
      );
    }

    plan.scope.excludedControls.push({
      controlId: controlId.trim(),
      reason: reason.trim(),
      excludedBy: userId,
      excludedAt: new Date(),
      approvedBy: undefined,
      approvedAt: undefined,
    } as any);

    plan.scope.controls = plan.scope.controls.filter(
      (c) => c !== controlId
    );

    plan.updatedAt = new Date();

    await plan.save();

    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // APROVAR EXCLUSÃO DE CONTROLE
  // ============================================================

  async approveExclusion(
    planId: string,
    controlId: string,
    approverId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(planId)) {
      throw new Error('ID do plano de auditoria inválido');
    }

    if (!controlId || !controlId.trim()) {
      throw new Error('O ID do controle é obrigatório');
    }

    if (!approverId) {
      throw new Error('O aprovador é obrigatório');
    }

    const query: any = { _id: planId };
    if (companyId) {
      query.companyId = companyId;
    }

    const plan = await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    if (plan.team.leadAuditor !== approverId) {
      throw new Error(
        'Apenas o Auditor Líder designado pode aprovar exclusões de controle'
      );
    }

    const exclusion = plan.scope.excludedControls.find(
      (e) => e.controlId === controlId
    );

    if (!exclusion) {
      throw new Error('Exclusão não encontrada para este controle');
    }

    if (exclusion.approvedBy) {
      throw new Error('Esta exclusão já foi aprovada');
    }

    exclusion.approvedBy = approverId;
    exclusion.approvedAt = new Date();

    plan.updatedAt = new Date();

    await plan.save();

    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // REJEITAR EXCLUSÃO DE CONTROLE
  // ============================================================

  async rejectExclusion(
    planId: string,
    controlId: string,
    approverId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(planId)) {
      throw new Error('ID do plano de auditoria inválido');
    }

    if (!controlId || !controlId.trim()) {
      throw new Error('O ID do controle é obrigatório');
    }

    if (!approverId) {
      throw new Error('O aprovador é obrigatório');
    }

    const query: any = { _id: planId };
    if (companyId) {
      query.companyId = companyId;
    }

    const plan = await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    if (plan.team.leadAuditor !== approverId) {
      throw new Error(
        'Apenas o Auditor Líder designado pode rejeitar exclusões de controle'
      );
    }

    const exclusionIndex = plan.scope.excludedControls.findIndex(
      (e) => e.controlId === controlId
    );

    if (exclusionIndex === -1) {
      throw new Error('Exclusão não encontrada para este controle');
    }

    plan.scope.excludedControls.splice(exclusionIndex, 1);

    if (!plan.scope.controls.includes(controlId)) {
      plan.scope.controls.push(controlId);
    }

    plan.updatedAt = new Date();

    await plan.save();

    return mapToIAuditPlan(plan.toObject());
  }

  // ============================================================
  // REMOVER EXCLUSÃO DE CONTROLE
  // ============================================================

  async removeExclusion(
    planId: string,
    controlId: string,
    userId: string,
    companyId?: string
  ): Promise<IAuditPlan | null> {
    if (!isValidObjectId(planId)) {
      throw new Error('ID do plano de auditoria inválido');
    }

    if (!controlId || !controlId.trim()) {
      throw new Error('O ID do controle é obrigatório');
    }

    if (!userId) {
      throw new Error('O usuário é obrigatório');
    }

    const query: any = { _id: planId };
    if (companyId) {
      query.companyId = companyId;
    }

    const plan = await AuditPlan.findOne(query);

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    if (plan.status !== 'draft' && plan.status !== 'pending_approval') {
      throw new Error(
        'Apenas planos em rascunho ou aguardando aprovação podem ter exclusões removidas'
      );
    }

    const exclusionIndex = plan.scope.excludedControls.findIndex(
      (e) => e.controlId === controlId
    );

    if (exclusionIndex === -1) {
      throw new Error('Exclusão não encontrada para este controle');
    }

    const exclusion = plan.scope.excludedControls[exclusionIndex];

    if (!exclusion) {
      throw new Error('Exclusão não encontrada para este controle');
    }

    const isAuthor = exclusion.excludedBy === userId;
    const isLeadAuditor = plan.team.leadAuditor === userId;

    if (!isAuthor && !isLeadAuditor) {
      throw new Error(
        'Apenas o autor da exclusão ou o Auditor Líder podem remover esta exclusão'
      );
    }

    plan.scope.excludedControls.splice(exclusionIndex, 1);

    if (!plan.scope.controls.includes(controlId)) {
      plan.scope.controls.push(controlId);
    }

    plan.updatedAt = new Date();

    await plan.save();

    return mapToIAuditPlan(plan.toObject());
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

    if (!plan.team.leadAuditor) {
      throw new Error(
        'O plano precisa possuir um auditor líder designado'
      );
    }

    if (
      !plan.scope ||
      !plan.scope.controls ||
      plan.scope.controls.length === 0
    ) {
      throw new Error(
        'O plano precisa possuir pelo menos um controle no escopo da auditoria'
      );
    }

    if (
      plan.scope.excludedControls &&
      plan.scope.excludedControls.length > 0
    ) {
      const pendingExclusions = plan.scope.excludedControls.filter(
        (e) => !e.approvedBy
      );

      if (pendingExclusions.length > 0) {
        const pendingIds = pendingExclusions
          .map((e) => e.controlId)
          .join(', ');

        throw new Error(
          `Existem ${pendingExclusions.length} exclusão(ões) pendente(s) de aprovação pelo Auditor Líder: ${pendingIds}. ` +
          `Todas as exclusões precisam ser aprovadas antes do envio.`
        );
      }
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

    if (
      plan.createdBy ===
      approverId
    ) {
      throw new Error(
        'O aprovador não pode ser o mesmo que criou o plano'
      );
    }

    if (
      plan.team.leadAuditor !==
      approverId
    ) {
      throw new Error(
        'Apenas o auditor líder designado pode aprovar o plano'
      );
    }

    if (
      plan.status !==
      'pending_approval'
    ) {
      throw new Error(
        'Apenas planos aguardando aprovação podem ser aprovados'
      );
    }

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

    if (
      plan.createdBy ===
      approverId
    ) {
      throw new Error(
        'O rejeitador não pode ser o mesmo que criou o plano'
      );
    }

    if (
      plan.team.leadAuditor !==
      approverId
    ) {
      throw new Error(
        'Apenas o auditor líder designado pode rejeitar o plano'
      );
    }

    if (
      plan.status !==
      'pending_approval'
    ) {
      throw new Error(
        'Apenas planos aguardando aprovação podem ser rejeitados'
      );
    }

    if (!reason || !reason.trim()) {
      throw new Error(
        'O motivo da rejeição é obrigatório'
      );
    }

    plan.status =
      'draft';

    plan.rejectionReason =
      reason.trim();

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

    const canCancel =
      plan.createdBy === userId ||
      plan.team.leadAuditor === userId;

    if (!canCancel) {
      throw new Error(
        'Apenas o criador do plano ou o auditor líder podem cancelar a auditoria'
      );
    }

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

    if (
      plan.status !==
      'approved'
    ) {
      throw new Error(
        'Apenas planos aprovados podem ser iniciados'
      );
    }

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

    if (
      plan.team.leadAuditor !==
      userId
    ) {
      throw new Error(
        'Apenas o auditor líder pode concluir a auditoria'
      );
    }

    if (
      plan.status !==
      'in_progress'
    ) {
      throw new Error(
        'Apenas auditorias em andamento podem ser concluídas'
      );
    }

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