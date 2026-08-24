import mongoose, { Schema } from 'mongoose';

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

export interface IAuditChecklist {
  _id: string;

  auditPlanId: string;

  controlId: string; // 5.1, 6.2, etc.

  // ============================================================
  // PERGUNTAS DO CHECKLIST
  // ============================================================

  questions: IAuditChecklistQuestion[];

  // ============================================================
  // ESTATÍSTICAS DO CHECKLIST
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
  // STATUS
  // ============================================================

  status:
    | 'pending'
    | 'in_progress'
    | 'completed';

  completedBy?: string;

  completedAt?: Date;

  // ============================================================
  // METADADOS
  // ============================================================

  createdBy: string;

  updatedBy?: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date;
}

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
      // PERGUNTAS
      // ============================================================

      questions: {
        type: [
          AuditChecklistQuestionSchema,
        ],

        default: [],
      },

      // ============================================================
      // ESTATÍSTICAS
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
      // STATUS
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
      // METADADOS
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

AuditChecklistSchema.methods.updateStatistics =
  function () {
    const stats = {
      total:
        this.questions.length,

      conforme: 0,

      nonConforme: 0,

      observacao: 0,

      oportunidade: 0,

      naoAplicavel: 0,
    };

    // ==========================================================
    // CONTABILIZAR RESPOSTAS
    // ==========================================================

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

    // ==========================================================
    // VERIFICAR RESPOSTAS
    // ==========================================================

    const allAnswered =
      this.questions.length > 0 &&
      this.questions.every(
        (
          question: IAuditChecklistQuestion
        ) =>
          question.answer !==
          '--'
      );

    // ==========================================================
    // CHECKLIST CONCLUÍDO
    // ==========================================================

    if (allAnswered) {
      this.status =
        'completed';

      if (!this.completedAt) {
        this.completedAt =
          new Date();
      }
    } else {
      // Se ainda existem perguntas
      // não respondidas, o checklist
      // não pode permanecer concluído.

      this.completedAt =
        undefined;

      this.completedBy =
        undefined;

      const hasAnsweredQuestion =
        this.questions.some(
          (
            question: IAuditChecklistQuestion
          ) =>
            question.answer !==
            '--'
        );

      this.status =
        hasAnsweredQuestion
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