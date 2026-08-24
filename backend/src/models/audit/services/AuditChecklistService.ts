import { AuditChecklist } from '../models/AuditChecklist';
import { AuditPlan } from '../models/AuditPlan';
import {
  IAuditChecklist,
  IAuditChecklistQuestion,
  IAuditChecklistItem,
} from '../types/audit.types';
import { Response } from '../../Response';
import { Assignment } from '../../Assignment';
import { Types } from 'mongoose';

/**
 * ============================================================
 * MAPEAMENTO DE DOCUMENTOS
 * ============================================================
 */

/**
 * Mapeia documento do MongoDB para IAuditChecklist com id.
 */
function mapToIAuditChecklist(doc: any): IAuditChecklist {
  if (!doc) return null as any;

  return {
    id: doc._id.toString(),
    ...doc,
  };
}

/**
 * Mapeia array de documentos para IAuditChecklist[].
 */
function mapToIAuditChecklistArray(docs: any[]): IAuditChecklist[] {
  if (!docs) return [];

  return docs.map((doc) => mapToIAuditChecklist(doc));
}

/**
 * ============================================================
 * NORMALIZAÇÃO DE RESPOSTAS
 * ============================================================
 */

/**
 * Converte respostas legadas/frontend para o padrão utilizado
 * pelo modelo AuditChecklist.
 *
 * Valores suportados:
 *
 * C  = Conforme
 * NC = Não Conforme
 * OB = Observação
 * OM = Oportunidade
 * NA = Não Aplicável
 * -- = Não respondido
 *
 * Também mantém compatibilidade com os valores legados:
 *
 * conforme
 * nao_conforme
 * observacao
 * oportunidade
 * nao_aplicavel
 */
function mapAnswer(
  answer: any
): IAuditChecklistQuestion['answer'] {
  switch (answer) {
    case 'C':
    case 'conforme':
      return 'C';

    case 'NC':
    case 'nao_conforme':
      return 'NC';

    case 'OB':
    case 'observacao':
      return 'OB';

    case 'OM':
    case 'oportunidade':
      return 'OM';

    case 'NA':
    case 'nao_aplicavel':
      return 'NA';

    case '--':
    case undefined:
    case null:
    case '':
      return '--';

    default:
      return '--';
  }
}

/**
 * ============================================================
 * MATURIDADE → RESPOSTA DE AUDITORIA
 * ============================================================
 */

/**
 * Converte maturityLevel do usuário para resposta do checklist.
 *
 * Nível 2 (Implementado)
 *   → C (Conforme)
 *
 * Nível 1 (Parcial)
 *   → OB (Observação)
 *
 * Nível 0 (Não Implementado)
 *   → NC (Não Conforme)
 */
function mapMaturityToChecklistAnswer(
  maturityLevel: string
): IAuditChecklistQuestion['answer'] {
  switch (maturityLevel) {
    case '2':
      return 'C';

    case '1':
      return 'OB';

    case '0':
      return 'NC';

    default:
      return '--';
  }
}

/**
 * ============================================================
 * LABEL DE MATURIDADE
 * ============================================================
 */

/**
 * Retorna o label do nível de maturidade.
 */
function getMaturityLabel(
  maturityLevel: string
): string {
  switch (maturityLevel) {
    case '2':
      return 'Implementado';

    case '1':
      return 'Parcial';

    case '0':
      return 'Não Implementado';

    default:
      return 'Não respondido';
  }
}

/**
 * ============================================================
 * NORMALIZAÇÃO DE IDS
 * ============================================================
 */

/**
 * Normaliza um identificador para comparação.
 *
 * O sistema trabalha com IDs que podem chegar como:
 *
 * - string
 * - ObjectId
 * - valores serializados
 */
function normalizeId(value: any): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (
    typeof value === 'object' &&
    value._id
  ) {
    return value._id.toString();
  }

  return String(value);
}

/**
 * ============================================================
 * EXTRAÇÃO DE CONTROL ID
 * ============================================================
 */

/**
 * Obtém o ID do controle de uma atribuição.
 *
 * Mantém compatibilidade com estruturas diferentes que possam
 * existir no histórico do sistema.
 */
function getAssignmentControlId(
  assignment: any
): string {
  if (!assignment) {
    return '';
  }

  if (assignment.control?.id) {
    return normalizeId(assignment.control.id);
  }

  if (assignment.controlId) {
    return normalizeId(assignment.controlId);
  }

  if (assignment.control?._id) {
    return normalizeId(assignment.control._id);
  }

  return '';
}

/**
 * ============================================================
 * EXTRAÇÃO DO ID DA ATRIBUIÇÃO NA RESPOSTA
 * ============================================================
 */

/**
 * Obtém o assignmentId armazenado em uma resposta.
 */
function getResponseAssignmentId(
  response: any
): string {
  if (!response) {
    return '';
  }

  return normalizeId(response.assignmentId);
}

/**
 * ============================================================
 * EXTRAÇÃO DO USUÁRIO DA ATRIBUIÇÃO
 * ============================================================
 */

/**
 * Obtém o ID do usuário responsável pela atribuição.
 */
function getAssignmentUserId(
  assignment: any
): string {
  if (!assignment) {
    return '';
  }

  if (assignment.userId) {
    return normalizeId(assignment.userId);
  }

  if (assignment.user?._id) {
    return normalizeId(assignment.user._id);
  }

  if (assignment.user?._id?.toString) {
    return assignment.user._id.toString();
  }

  return '';
}

/**
 * ============================================================
 * COMPARAÇÃO DE PERGUNTAS
 * ============================================================
 */

/**
 * Normaliza texto para comparação.
 *
 * Isso permite identificar a mesma pergunta mesmo quando
 * existem pequenas diferenças de espaçamento.
 */
function normalizeQuestionText(
  value: any
): string {
  if (!value) {
    return '';
  }

  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Verifica se duas perguntas representam a mesma pergunta.
 */
function questionsMatch(
  checklistQuestion: any,
  sourceQuestion: any
): boolean {
  if (!checklistQuestion || !sourceQuestion) {
    return false;
  }

  const checklistText =
    normalizeQuestionText(
      checklistQuestion.question
    );

  const sourceText =
    normalizeQuestionText(
      sourceQuestion.text
    );

  if (!checklistText || !sourceText) {
    return false;
  }

  return checklistText === sourceText;
}

/**
 * ============================================================
 * SERVIÇO DE CHECKLIST
 * ============================================================
 */

export class AuditChecklistService {

  // ============================================================
  // BUSCAR CHECKLIST POR PLANO E CONTROLE
  // ============================================================

  async findByPlanAndControl(
    auditPlanId: string,
    controlId: string
  ): Promise<IAuditChecklist | null> {

    const doc =
      await AuditChecklist.findOne({
        auditPlanId,
        controlId,
      }).lean();

    if (!doc) {
      return null;
    }

    return mapToIAuditChecklist(doc);
  }

  // ============================================================
  // LISTAR CHECKLISTS POR PLANO
  // ============================================================

  async findByPlanId(
    auditPlanId: string
  ): Promise<IAuditChecklist[]> {

    const docs =
      await AuditChecklist.find({
        auditPlanId,
      }).lean();

    return mapToIAuditChecklistArray(
      docs
    );
  }

  // ============================================================
  // POPULAR CHECKLIST COM RESPOSTAS DOS USUÁRIOS
  // ============================================================

  async populateWithUserResponses(
    auditPlanId: string,
    controlId: string,
    userId: string
  ): Promise<IAuditChecklist | null> {

    /**
     * ----------------------------------------------------------
     * 1. VALIDAR PLANO
     * ----------------------------------------------------------
     */

    const plan =
      await AuditPlan.findById(
        auditPlanId
      );

    if (!plan) {
      throw new Error(
        'Plano de auditoria não encontrado'
      );
    }

    /**
     * ----------------------------------------------------------
     * 2. VALIDAR CHECKLIST
     * ----------------------------------------------------------
     */

    const checklist =
      await AuditChecklist.findOne({
        auditPlanId,
        controlId,
      });

    if (!checklist) {
      throw new Error(
        `Checklist não encontrado para o controle ${controlId}`
      );
    }

    /**
     * ----------------------------------------------------------
     * 3. BUSCAR ATRIBUIÇÕES DO CONTROLE
     * ----------------------------------------------------------
     *
     * O controle é utilizado como primeiro filtro.
     *
     * Não alteramos a regra existente de buscar as
     * atribuições relacionadas ao controle.
     */

    const assignments =
      await Assignment.find({
        'control.id': controlId,
      }).lean();

    if (assignments.length === 0) {

      console.log(
        `ℹ️ Nenhuma atribuição encontrada para o controle ${controlId}`
      );

      return mapToIAuditChecklist(
        checklist.toObject()
      );
    }

    /**
     * ----------------------------------------------------------
     * 4. LIMITAR ÀS ATRIBUIÇÕES VÁLIDAS
     * ----------------------------------------------------------
     *
     * Preserva a estrutura existente, mas elimina possíveis
     * atribuições que não possuam um identificador válido.
     */

    const validAssignments: any[] =
  assignments.filter(
    (assignment: any) =>
      normalizeId(assignment?._id)
  );

    if (
      validAssignments.length === 0
    ) {

      console.log(
        `ℹ️ Nenhuma atribuição válida encontrada para o controle ${controlId}`
      );

      return mapToIAuditChecklist(
        checklist.toObject()
      );
    }

    /**
     * ----------------------------------------------------------
     * 5. BUSCAR RESPOSTAS
     * ----------------------------------------------------------
     */

    const assignmentIds =
      validAssignments.map(
        (assignment: any) =>
          normalizeId(assignment._id)
      );

    const responses =
      await Response.find({
        assignmentId: {
          $in: assignmentIds,
        },
      }).lean();

    /**
     * ----------------------------------------------------------
     * 6. CRIAR MAPA assignmentId → response
     * ----------------------------------------------------------
     */

    const responseMap =
      new Map<string, any>();

    responses.forEach(
      (response: any) => {

        const assignmentId =
          getResponseAssignmentId(
            response
          );

        if (!assignmentId) {
          return;
        }

        responseMap.set(
          assignmentId,
          response
        );
      }
    );

    /**
     * ----------------------------------------------------------
     * 7. MAPA DAS ATRIBUIÇÕES POR CONTROLE
     * ----------------------------------------------------------
     */

    const controlAssignments =
      validAssignments.filter(
        (assignment: any) => {

          const assignmentControlId =
            getAssignmentControlId(
              assignment
            );

          return (
            assignmentControlId ===
            normalizeId(controlId)
          );
        }
      );

    /**
     * ----------------------------------------------------------
     * 8. ATUALIZAR PERGUNTAS
     * ----------------------------------------------------------
     *
     * IMPORTANTE:
     *
     * O código anterior podia associar a primeira resposta
     * disponível a qualquer pergunta do checklist.
     *
     * Aqui preservamos a funcionalidade de população, mas
     * tentamos estabelecer correspondência real entre:
     *
     * pergunta do checklist
     *       ↓
     * atribuição
     *       ↓
     * resposta
     *
     * Quando a estrutura da atribuição possuir pergunta,
     * utilizamos essa informação.
     *
     * Caso contrário, mantemos compatibilidade com a estrutura
     * anterior.
     */

    let updatedCount = 0;

    for (
      let i = 0;
      i < checklist.questions.length;
      i++
    ) {

      const question =
        checklist.questions[i];

      if (!question) {
        continue;
      }

      /**
       * Se a pergunta já foi respondida, não sobrescrever.
       */
      if (
        question.answer !== '--'
      ) {
        continue;
      }

      /**
       * --------------------------------------------------------
       * TENTATIVA 1
       * --------------------------------------------------------
       *
       * Encontrar uma atribuição cuja pergunta corresponda
       * explicitamente à pergunta do checklist.
       */

      let matchedAssignment:
        any = null;

      for (
        const assignment
        of controlAssignments
      ) {

        const assignmentQuestion =
          assignment.question ||
          assignment.questionText ||
          assignment.controlQuestion;

        if (
          assignmentQuestion &&
          questionsMatch(
            question,
            {
              text:
                assignmentQuestion,
            }
          )
        ) {

          matchedAssignment =
            assignment;

          break;
        }
      }

      /**
       * --------------------------------------------------------
       * TENTATIVA 2
       * --------------------------------------------------------
       *
       * Caso a estrutura antiga não tenha a pergunta vinculada
       * à atribuição, utilizamos uma atribuição que possua
       * resposta válida.
       *
       * Isso mantém compatibilidade com o comportamento
       * existente do sistema.
       */

      if (!matchedAssignment) {

        for (
          const assignment
          of controlAssignments
        ) {

          const assignmentId =
            normalizeId(
              assignment._id
            );

          const response =
            responseMap.get(
              assignmentId
            );

          if (
            response &&
            response.maturityLevel !==
              undefined &&
            response.maturityLevel !==
              null
          ) {

            matchedAssignment =
              assignment;

            break;
          }
        }
      }

      /**
       * Se nenhuma atribuição foi encontrada, continuar.
       */

      if (!matchedAssignment) {
        continue;
      }

      /**
       * --------------------------------------------------------
       * 9. OBTER RESPOSTA
       * --------------------------------------------------------
       */

      const assignmentId =
        normalizeId(
          matchedAssignment._id
        );

      const response =
        responseMap.get(
          assignmentId
        );

      if (
        !response ||
        response.maturityLevel ===
          undefined ||
        response.maturityLevel ===
          null
      ) {
        continue;
      }

      /**
       * --------------------------------------------------------
       * 10. MAPEAR MATURIDADE
       * --------------------------------------------------------
       */

      const maturityLevel =
        String(
          response.maturityLevel
        );

      const answer =
        mapMaturityToChecklistAnswer(
          maturityLevel
        );

      /**
       * Se a maturidade não for reconhecida,
       * não alteramos a pergunta.
       */

      if (answer === '--') {
        continue;
      }

      /**
       * --------------------------------------------------------
       * 11. OBSERVAÇÕES
       * --------------------------------------------------------
       */

      const observations =
        response.scenarioDescription ||
        `Cenário identificado: ${getMaturityLabel(
          maturityLevel
        )}`;

      /**
       * --------------------------------------------------------
       * 12. RESPONSÁVEL
       * --------------------------------------------------------
       */

      const responsible =
        getAssignmentUserId(
          matchedAssignment
        );

      /**
       * --------------------------------------------------------
       * 13. ATUALIZAR PERGUNTA
       * --------------------------------------------------------
       */

      checklist.questions[i] = {
        ...question,
        answer,
        observations,
        responsible,
        answeredAt:
          response.updatedAt ||
          response.submittedAt ||
          new Date(),
        answeredBy:
          userId,
      };

      updatedCount++;
    }

    /**
     * ----------------------------------------------------------
     * 14. ATUALIZAR ESTATÍSTICAS
     * ----------------------------------------------------------
     */

    const checklistDocument =
      checklist as any;

    if (
      typeof checklistDocument.updateStatistics ===
      'function'
    ) {

      checklistDocument.updateStatistics();
    } else {

      /**
       * Fallback para compatibilidade.
       *
       * Caso o método não esteja disponível por algum motivo,
       * calculamos as estatísticas diretamente.
       */

      const statistics = {
        total:
          checklist.questions.length,

        conforme: 0,

        nonConforme: 0,

        observacao: 0,

        oportunidade: 0,

        naoAplicavel: 0,
      };

      checklist.questions.forEach(
        (question: any) => {

          switch (
            question.answer
          ) {

            case 'C':
              statistics.conforme++;
              break;

            case 'NC':
              statistics.nonConforme++;
              break;

            case 'OB':
              statistics.observacao++;
              break;

            case 'OM':
              statistics.oportunidade++;
              break;

            case 'NA':
              statistics.naoAplicavel++;
              break;

            case '--':
              break;
          }
        }
      );

      checklist.statistics =
        statistics;

      const allAnswered =
        checklist.questions.length > 0 &&
        checklist.questions.every(
          (question: any) =>
            question.answer !== '--'
        );

      if (
        allAnswered &&
        checklist.status !==
          'completed'
      ) {

        checklist.status =
          'completed';

        checklist.completedAt =
          new Date();
      }
    }

    /**
     * ----------------------------------------------------------
     * 15. STATUS
     * ----------------------------------------------------------
     *
     * Caso existam respostas, mas ainda existam perguntas não
     * respondidas, o checklist deve ficar em andamento.
     */

    const hasAnsweredQuestions =
      checklist.questions.some(
        (question: any) =>
          question.answer !== '--'
      );

    const hasUnansweredQuestions =
      checklist.questions.some(
        (question: any) =>
          question.answer === '--'
      );

    if (
      hasAnsweredQuestions &&
      hasUnansweredQuestions &&
      checklist.status !==
        'completed'
    ) {

      checklist.status =
        'in_progress';
    }

    checklist.updatedBy =
      userId;

    await checklist.save();

    console.log(
      `✅ Checklist populado: ${updatedCount} perguntas atualizadas para o controle ${controlId}`
    );

    return mapToIAuditChecklist(
      checklist.toObject()
    );
  }

  // ============================================================
  // POPULAR TODOS OS CHECKLISTS DE UM PLANO
  // ============================================================

  async populateAllChecklists(
    auditPlanId: string,
    userId: string
  ): Promise<number> {

    const checklists =
      await AuditChecklist.find({
        auditPlanId,
      });

    if (
      checklists.length === 0
    ) {

      throw new Error(
        `Nenhum checklist encontrado para o plano ${auditPlanId}`
      );
    }

    let populatedCount = 0;

    for (
      const checklist
      of checklists
    ) {

      const result =
        await this.populateWithUserResponses(
          auditPlanId,
          checklist.controlId,
          userId
        );

      if (result) {
        populatedCount++;
      }
    }

    console.log(
      `✅ ${populatedCount} checklists populados para o plano ${auditPlanId}`
    );

    return populatedCount;
  }

  // ============================================================
  // ATUALIZAR CHECKLIST
  // ============================================================

  async updateChecklist(
    id: string,
    questions: IAuditChecklistItem[],
    userId: string
  ): Promise<IAuditChecklist | null> {

    const checklist =
      await AuditChecklist.findById(
        id
      );

    if (!checklist) {
      throw new Error(
        'Checklist não encontrado'
      );
    }

    /**
     * ----------------------------------------------------------
     * VERIFICAR PLANO
     * ----------------------------------------------------------
     */

    const plan =
      await AuditPlan.findById(
        checklist.auditPlanId
      );

    if (!plan) {
      throw new Error(
        'Plano de auditoria não encontrado'
      );
    }

    /**
     * ----------------------------------------------------------
     * VERIFICAR EQUIPE
     * ----------------------------------------------------------
     */

    const isTeamMember =
      plan.team.leadAuditor ===
        userId ||
      plan.team.auditors.includes(
        userId
      );

    if (!isTeamMember) {
      throw new Error(
        'Apenas membros da equipe de auditoria podem atualizar o checklist'
      );
    }

    /**
     * ----------------------------------------------------------
     * VERIFICAR STATUS DO PLANO
     * ----------------------------------------------------------
     *
     * Não bloqueamos rascunho aqui para preservar o
     * comportamento existente.
     *
     * A autorização continua sendo baseada na equipe.
     */

    /**
     * ----------------------------------------------------------
     * CONVERTER QUESTÕES
     * ----------------------------------------------------------
     *
     * Mantemos compatibilidade com IAuditChecklistItem,
     * incluindo os valores legados.
     */

    const questionsMapped:
      IAuditChecklistQuestion[] =
      questions.map(
        (q) => ({
          question:
            q.question,

          answer:
            mapAnswer(
              q.answer
            ),

          observations:
            q.observations ||
            '',

          evidenceIds:
            q.evidenceIds ||
            [],

          responsible:
            q.responsible ||
            userId,

          answeredAt:
            q.answeredAt ||
            undefined,

          answeredBy:
            q.answeredBy ||
            userId,
        })
      );

    /**
     * ----------------------------------------------------------
     * ATUALIZAR CHECKLIST
     * ----------------------------------------------------------
     */

    checklist.questions =
      questionsMapped;

    checklist.updatedAt =
      new Date();

    checklist.updatedBy =
      userId;

    /**
     * ----------------------------------------------------------
     * ATUALIZAR ESTATÍSTICAS
     * ----------------------------------------------------------
     */

    const checklistDocument =
      checklist as any;

    if (
      typeof checklistDocument.updateStatistics ===
      'function'
    ) {

      checklistDocument.updateStatistics();

    } else {

      const statistics = {
        total:
          checklist.questions.length,

        conforme: 0,

        nonConforme: 0,

        observacao: 0,

        oportunidade: 0,

        naoAplicavel: 0,
      };

      checklist.questions.forEach(
        (question: any) => {

          switch (
            question.answer
          ) {

            case 'C':
              statistics.conforme++;
              break;

            case 'NC':
              statistics.nonConforme++;
              break;

            case 'OB':
              statistics.observacao++;
              break;

            case 'OM':
              statistics.oportunidade++;
              break;

            case 'NA':
              statistics.naoAplicavel++;
              break;

            case '--':
              break;
          }
        }
      );

      checklist.statistics =
        statistics;

      const allAnswered =
        checklist.questions.length > 0 &&
        checklist.questions.every(
          (question: any) =>
            question.answer !== '--'
        );

      if (
        allAnswered
      ) {

        checklist.status =
          'completed';

        checklist.completedAt =
          new Date();

        checklist.completedBy =
          userId;

      } else if (
        checklist.questions.some(
          (question: any) =>
            question.answer !== '--'
        )
      ) {

        checklist.status =
          'in_progress';
      }
    }

    await checklist.save();

    return mapToIAuditChecklist(
      checklist.toObject()
    );
  }

  // ============================================================
  // MARCAR CHECKLIST COMO CONCLUÍDO
  // ============================================================

  async complete(
    id: string,
    userId: string
  ): Promise<IAuditChecklist | null> {

    const checklist =
      await AuditChecklist.findById(
        id
      );

    if (!checklist) {
      throw new Error(
        'Checklist não encontrado'
      );
    }

    /**
     * ----------------------------------------------------------
     * VERIFICAR PLANO
     * ----------------------------------------------------------
     */

    const plan =
      await AuditPlan.findById(
        checklist.auditPlanId
      );

    if (!plan) {
      throw new Error(
        'Plano de auditoria não encontrado'
      );
    }

    /**
     * ----------------------------------------------------------
     * VERIFICAR EQUIPE
     * ----------------------------------------------------------
     */

    const isTeamMember =
      plan.team.leadAuditor ===
        userId ||
      plan.team.auditors.includes(
        userId
      );

    if (!isTeamMember) {
      throw new Error(
        'Apenas membros da equipe de auditoria podem concluir o checklist'
      );
    }

    /**
     * ----------------------------------------------------------
     * VALIDAR RESPOSTAS
     * ----------------------------------------------------------
     *
     * Não permitimos concluir silenciosamente um checklist
     * completamente vazio.
     *
     * Entretanto, preservamos a possibilidade de conclusão
     * explícita pelo auditor.
     */

    const hasQuestions =
      checklist.questions.length >
      0;

    if (!hasQuestions) {
      throw new Error(
        'Não é possível concluir um checklist sem perguntas'
      );
    }

    /**
     * ----------------------------------------------------------
     * ATUALIZAR ESTADO
     * ----------------------------------------------------------
     */

    checklist.status =
      'completed';

    checklist.completedBy =
      userId;

    checklist.completedAt =
      new Date();

    checklist.updatedBy =
      userId;

    /**
     * ----------------------------------------------------------
     * ATUALIZAR ESTATÍSTICAS
     * ----------------------------------------------------------
     */

    const checklistDocument =
      checklist as any;

    if (
      typeof checklistDocument.updateStatistics ===
      'function'
    ) {

      checklistDocument.updateStatistics();

      /**
       * O método updateStatistics pode alterar o status
       * dependendo das respostas. Como a ação explícita
       * deste método é concluir, restauramos completed.
       */

      checklist.status =
        'completed';

      checklist.completedBy =
        userId;

      checklist.completedAt =
        new Date();
    }

    await checklist.save();

    return mapToIAuditChecklist(
      checklist.toObject()
    );
  }

  // ============================================================
  // ESTATÍSTICAS DO CHECKLIST
  // ============================================================

  async getStats(
    auditPlanId: string
  ): Promise<any> {

    const total =
      await AuditChecklist.countDocuments({
        auditPlanId,
      });

    const completed =
      await AuditChecklist.countDocuments({
        auditPlanId,
        status: 'completed',
      });

    const inProgress =
      await AuditChecklist.countDocuments({
        auditPlanId,
        status: 'in_progress',
      });

    const pending =
      await AuditChecklist.countDocuments({
        auditPlanId,
        status: 'pending',
      });

    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate:
        total > 0
          ? (completed / total) * 100
          : 0,
    };
  }
}