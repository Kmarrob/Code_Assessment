import mongoose, { Schema } from 'mongoose';

// ============================================================
// AUDIT CHECKLIST — v50.1
// ============================================================
//
// Este arquivo agora convive com DOIS tipos de pergunta:
//
//   1. IAuditChecklistQuestion  → pergunta do ASSESSMENT
//      (o que o usuário respondeu sobre o controle)
//      — mantida INTACTA, sem alteração.
//
//   2. IAuditChecklistAuditQuestion → pergunta de AUDITORIA
//      (roteiro do auditor por controle, vindo de
//      AuditControlQuestion)
//      — NOVA interface, adicionada nesta versão.
//
// Os dois arrays são independentes. Cada um tem sua própria
// estatística. O campo `statistics` original continua medindo
// APENAS as perguntas do Assessment.
//
// Nada existente foi removido ou reescrito.
// ============================================================

// ============================================================
// 1. PERGUNTA DO ASSESSMENT (INTACTA)
// ============================================================

export interface IAuditChecklistQuestion {
  question: string;

  /**
   * C  = Conforme
   * NC = Não Conforme
   * OB = Observação
   * OM = Oportunidade
   * NA = Não Aplicável
   * -- = Não Respondido
   */
  answer:
    | 'C'
    | 'NC'
    | 'OB'
    | 'OM'
    | 'NA'
    | '--';

  observations: string;

  evidenceIds: string[];

  responsible: string;

  answeredAt?: Date;

  answeredBy?: string;
}

// ============================================================
// 🆕 v50.1 — 2. PERGUNTA DE AUDITORIA POR CONTROLE
// ============================================================
//
// Cada pergunta de auditoria tem:
//   - texto, guia, evidência esperada (snapshot do AuditControlQuestion
//     no momento da geração do checklist)
//   - resposta do auditor (C/NC/OB/OM/NA/--)
//   - observação
//   - evidências anexadas
//   - quem respondeu e quando
//
// O snapshot evita que mudanças posteriores em AuditControlQuestion
// alterem checklists já iniciados.
// ============================================================

export interface IAuditChecklistAuditQuestion {
  /**
   * ID original da AuditControlQuestion no momento da geração.
   * Usado apenas para rastreabilidade.
   */
  sourceQuestionId?: string;

  /**
   * Texto da pergunta de auditoria (snapshot).
   */
  text: string;

  /**
   * Objetivo da pergunta (snapshot).
   */
  objective?: string;

  /**
   * Orientação ao auditor (snapshot).
   */
  guidance?: string;

  /**
   * Evidência esperada (snapshot).
   */
  evidenceExpected?: string;

  /**
   * Ordem de exibição dentro do controle.
   */
  order: number;

  /**
   * Resposta do auditor.
   * Mesmo enum das perguntas do Assessment.
   */
  answer:
    | 'C'
    | 'NC'
    | 'OB'
    | 'OM'
    | 'NA'
    | '--';

  /**
   * Observação do auditor para esta pergunta.
   */
  observations: string;

  /**
   * IDs das evidências anexadas pelo auditor.
   */
  evidenceIds: string[];

  answeredAt?: Date;

  answeredBy?: string;
}

// ============================================================
// ESTATÍSTICAS DE AUDITORIA (NOVO)
// ============================================================

export interface IAuditChecklistAuditStatistics {
  total: number;
  conforme: number;
  nonConforme: number;
  observacao: number;
  oportunidade: number;
  naoAplicavel: number;
}

// ============================================================
// INTERFACE PRINCIPAL — AuditChecklist
// ============================================================

export interface IAuditChecklist {
  _id: string;

  auditPlanId: string;

  controlId: string; // 5.1, 6.2, etc.

  // ============================================================
  // PERGUNTAS DO ASSESSMENT (INTACTO)
  // ============================================================

  questions: IAuditChecklistQuestion[];

  // ============================================================
  // 🆕 v50.1 — PERGUNTAS DE AUDITORIA (NOVO)
  // ============================================================

  /**
   * Perguntas de auditoria do controle (vindas de
   * AuditControlQuestion no momento da geração).
   *
   * Opcional: checklists antigos não têm este campo.
   */
  auditQuestions?: IAuditChecklistAuditQuestion[];

  // ============================================================
  // 🆕 v50.1 — CONSTATAÇÃO FINAL DO CONTROLE (NOVO)
  // ============================================================

  /**
   * Constatação final consolidada do controle.
   * O auditor marca após revisar todas as perguntas de auditoria.
   */
  finalConclusion?:
    | 'C'
    | 'NC'
    | 'OB'
    | 'OM'
    | 'NA'
    | '--';

  /**
   * Observação geral do controle.
   */
  finalObservation?: string;

  /**
   * Evidências anexadas à constatação final.
   */
  finalEvidenceIds?: string[];

  /**
   * Justificativa (obrigatória se não houver evidência final).
   */
  finalJustification?: string;

  // ============================================================
  // ESTATÍSTICAS DO CHECKLIST (INTACTO)
  // ============================================================

  statistics: {
    total: number;
    conforme: number;
    nonConforme: number;
    observacao: number;
    oportunidade: number;
    naoAplicavel: number;
  };

  // ============================================================
  // 🆕 v50.1 — ESTATÍSTICAS DE AUDITORIA (NOVO)
  // ============================================================

  /**
   * Estatísticas das perguntas de auditoria.
   * Separada das estatísticas do Assessment.
   */
  auditStatistics?: IAuditChecklistAuditStatistics;

  // ============================================================
  // STATUS (INTACTO)
  // ============================================================

  status:
    | 'pending'
    | 'in_progress'
    | 'completed';

  completedBy?: string;

  completedAt?: Date;

  // ============================================================
  // METADADOS (INTACTO)
  // ============================================================

  createdBy: string;

  updatedBy?: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date;
}

// ============================================================
// SCHEMA: PERGUNTA DO ASSESSMENT (INTACTO)
// ============================================================

const AuditChecklistQuestionSchema =
  new Schema(
    {
      question: {
        type: String,
        required: true,
        trim: true,
      },

      answer: {
        type: String,

        enum: [
          'C',
          'NC',
          'OB',
          'OM',
          'NA',
          '--',
        ],

        default: '--',
      },

      observations: {
        type: String,
        default: '',
      },

      evidenceIds: {
        type: [String],
        default: [],
      },

      responsible: {
        type: String,
        required: true,
      },

      answeredAt: {
        type: Date,
      },

      answeredBy: {
        type: String,
      },
    },
    {
      _id: false,
    }
  );

// ============================================================
// 🆕 v50.1 — SCHEMA: PERGUNTA DE AUDITORIA (NOVO)
// ============================================================

const AuditChecklistAuditQuestionSchema =
  new Schema(
    {
      sourceQuestionId: {
        type: String,
        default: '',
      },

      text: {
        type: String,
        required: true,
        trim: true,
      },

      objective: {
        type: String,
        default: '',
      },

      guidance: {
        type: String,
        default: '',
      },

      evidenceExpected: {
        type: String,
        default: '',
      },

      order: {
        type: Number,
        default: 1,
        min: 1,
      },

      answer: {
        type: String,

        enum: [
          'C',
          'NC',
          'OB',
          'OM',
          'NA',
          '--',
        ],

        default: '--',
      },

      observations: {
        type: String,
        default: '',
      },

      evidenceIds: {
        type: [String],
        default: [],
      },

      answeredAt: {
        type: Date,
      },

      answeredBy: {
        type: String,
      },
    },
    {
      _id: false,
    }
  );

// ============================================================
// SCHEMA PRINCIPAL — AuditChecklist
// ============================================================

const AuditChecklistSchema =
  new Schema<IAuditChecklist>(
    {
      auditPlanId: {
        type: String,
        required: true,
        index: true,
      },

      controlId: {
        type: String,
        required: true,
        index: true,
      },

      // ============================================================
      // PERGUNTAS DO ASSESSMENT (INTACTO)
      // ============================================================

      questions: {
        type: [
          AuditChecklistQuestionSchema,
        ],

        default: [],
      },

      // ============================================================
      // 🆕 v50.1 — PERGUNTAS DE AUDITORIA (NOVO)
      // ============================================================

      auditQuestions: {
        type: [
          AuditChecklistAuditQuestionSchema,
        ],

        default: [],
      },

      // ============================================================
      // 🆕 v50.1 — CONSTATAÇÃO FINAL DO CONTROLE (NOVO)
      // ============================================================

      finalConclusion: {
        type: String,

        enum: [
          'C',
          'NC',
          'OB',
          'OM',
          'NA',
          '--',
        ],

        default: '--',
      },

      finalObservation: {
        type: String,
        default: '',
      },

      finalEvidenceIds: {
        type: [String],
        default: [],
      },

      finalJustification: {
        type: String,
        default: '',
      },

      // ============================================================
      // ESTATÍSTICAS DO CHECKLIST (INTACTO)
      // ============================================================

      statistics: {
        total: {
          type: Number,
          default: 0,
        },

        conforme: {
          type: Number,
          default: 0,
        },

        nonConforme: {
          type: Number,
          default: 0,
        },

        observacao: {
          type: Number,
          default: 0,
        },

        oportunidade: {
          type: Number,
          default: 0,
        },

        naoAplicavel: {
          type: Number,
          default: 0,
        },
      },

      // ============================================================
      // 🆕 v50.1 — ESTATÍSTICAS DE AUDITORIA (NOVO)
      // ============================================================

      auditStatistics: {
        total: {
          type: Number,
          default: 0,
        },

        conforme: {
          type: Number,
          default: 0,
        },

        nonConforme: {
          type: Number,
          default: 0,
        },

        observacao: {
          type: Number,
          default: 0,
        },

        oportunidade: {
          type: Number,
          default: 0,
        },

        naoAplicavel: {
          type: Number,
          default: 0,
        },
      },

      // ============================================================
      // STATUS (INTACTO)
      // ============================================================

      status: {
        type: String,

        enum: [
          'pending',
          'in_progress',
          'completed',
        ],

        default: 'pending',

        index: true,
      },

      completedBy: {
        type: String,
      },

      completedAt: {
        type: Date,
      },

      // ============================================================
      // METADADOS (INTACTO)
      // ============================================================

      createdBy: {
        type: String,
        required: true,
      },

      updatedBy: {
        type: String,
      },

      deletedAt: {
        type: Date,
        default: null,
        index: true,
      },
    },
    {
      timestamps: true,

      toJSON: {
        virtuals: true,
      },

      toObject: {
        virtuals: true,
      },
    }
  );

// ============================================================
// ÍNDICES COMPOSTOS
// ============================================================

AuditChecklistSchema.index(
  {
    auditPlanId: 1,
    controlId: 1,
  },
  {
    unique: true,
  }
);

AuditChecklistSchema.index({
  auditPlanId: 1,
  status: 1,
});

AuditChecklistSchema.index({
  auditPlanId: 1,
  deletedAt: 1,
});

// ============================================================
// VIRTUAL ID
// ============================================================

AuditChecklistSchema.virtual(
  'id'
).get(function () {
  return this._id.toString();
});

// ============================================================
// SOFT DELETE
// ============================================================

AuditChecklistSchema.pre(
  'find',
  function () {
    this.where({
      deletedAt: null,
    });
  }
);

AuditChecklistSchema.pre(
  'findOne',
  function () {
    this.where({
      deletedAt: null,
    });
  }
);

AuditChecklistSchema.pre(
  'findOneAndUpdate',
  function () {
    this.where({
      deletedAt: null,
    });
  }
);

AuditChecklistSchema.pre(
  'findOneAndDelete',
  function () {
    this.where({
      deletedAt: null,
    });
  }
);

// ============================================================
// MÉTODO PARA ATUALIZAR ESTATÍSTICAS
// ============================================================
//
// Este método é o ÚNICO ponto que sofreu alteração funcional
// (aditiva). Agora ele:
//   1. Contabiliza as perguntas do Assessment (como antes).
//   2. Contabiliza as perguntas de auditoria (novo).
//   3. Verifica se o checklist pode ser concluído.
//
// REGRA DE CONCLUSÃO (atualizada):
//   - Se o checklist TEM perguntas de auditoria:
//       → considerar apenas elas para a conclusão
//       (o Assessment é contexto, não roteiro).
//   - Se NÃO TEM perguntas de auditoria:
//       → manter comportamento anterior (só Assessment).
//
// Isso preserva os checklists antigos que ainda não têm
// perguntas de auditoria.
// ============================================================

AuditChecklistSchema.methods.updateStatistics =
  function () {
    // ---- 1. Estatísticas do ASSESSMENT ----

    const stats = {
      total:
        this.questions.length,

      conforme: 0,

      nonConforme: 0,

      observacao: 0,

      oportunidade: 0,

      naoAplicavel: 0,
    };

    this.questions.forEach(
      (question: IAuditChecklistQuestion) => {
        switch (
          question.answer
        ) {
          case 'C':
            stats.conforme++;
            break;

          case 'NC':
            stats.nonConforme++;
            break;

          case 'OB':
            stats.observacao++;
            break;

          case 'OM':
            stats.oportunidade++;
            break;

          case 'NA':
            stats.naoAplicavel++;
            break;

          case '--':
            break;

          default:
            break;
        }
      }
    );

    this.statistics =
      stats;

    // ---- 2. Estatísticas das PERGUNTAS DE AUDITORIA (novo) ----

    const auditQs = this.auditQuestions || [];

    const auditStats = {
      total: auditQs.length,
      conforme: 0,
      nonConforme: 0,
      observacao: 0,
      oportunidade: 0,
      naoAplicavel: 0,
    };

    auditQs.forEach(
      (q: IAuditChecklistAuditQuestion) => {
        switch (q.answer) {
          case 'C':
            auditStats.conforme++;
            break;

          case 'NC':
            auditStats.nonConforme++;
            break;

          case 'OB':
            auditStats.observacao++;
            break;

          case 'OM':
            auditStats.oportunidade++;
            break;

          case 'NA':
            auditStats.naoAplicavel++;
            break;

          case '--':
            break;

          default:
            break;
        }
      }
    );

    this.auditStatistics = auditStats;

    // ---- 3. Verificação de conclusão ----

    const hasAuditQuestions =
      auditQs.length > 0;

    let allAnswered = false;

    if (hasAuditQuestions) {
      // Se existem perguntas de auditoria, elas são o critério
      // de conclusão (o Assessment é apenas contexto).

      allAnswered = auditQs.every(
        (q: IAuditChecklistAuditQuestion) =>
          q.answer !== '--'
      );
    } else {
      // Comportamento anterior (só Assessment).

      allAnswered =
        this.questions.length > 0 &&
        this.questions.every(
          (q: IAuditChecklistQuestion) =>
            q.answer !== '--'
        );
    }

    if (allAnswered) {
      this.status = 'completed';

      if (!this.completedAt) {
        this.completedAt =
          new Date();
      }
    } else {
      this.completedAt =
        undefined;

      this.completedBy =
        undefined;

      const hasAnyAnswer = hasAuditQuestions
        ? auditQs.some(
            (q: IAuditChecklistAuditQuestion) =>
              q.answer !== '--'
          )
        : this.questions.some(
            (q: IAuditChecklistQuestion) =>
              q.answer !== '--'
          );

      this.status =
        hasAnyAnswer
          ? 'in_progress'
          : 'pending';
    }
  };

// ============================================================
// EXPORTAÇÃO DO MODEL
// ============================================================

export const AuditChecklist =
  mongoose.model<IAuditChecklist>(
    'AuditChecklist',
    AuditChecklistSchema
  );