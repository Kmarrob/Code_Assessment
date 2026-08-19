import mongoose, { Schema } from 'mongoose';

export interface IAuditChecklistQuestion {
  question: string;
  answer: 'C' | 'NC' | 'OB' | 'OM' | 'NA' | '--'; // Conforme, Não Conforme, Observação, Oportunidade, Não Aplicável, Não Respondido
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

  // Perguntas do checklist
  questions: IAuditChecklistQuestion[];

  // Estatísticas do checklist
  statistics: {
    total: number;
    conforme: number;
    nonConforme: number;
    observacao: number;
    oportunidade: number;
    naoAplicavel: number;
  };

  // Status
  status: 'pending' | 'in_progress' | 'completed';
  completedBy?: string;
  completedAt?: Date;

  // Metadados
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditChecklistSchema = new Schema<IAuditChecklist>(
  {
    auditPlanId: { type: String, required: true, index: true },
    controlId: { type: String, required: true, index: true },

    questions: [
      {
        question: { type: String, required: true },
        answer: {
          type: String,
          enum: ['C', 'NC', 'OB', 'OM', 'NA', '--'],
          default: '--',
        },
        observations: { type: String, default: '' },
        evidenceIds: [{ type: String }],
        responsible: { type: String, required: true },
        answeredAt: { type: Date },
        answeredBy: { type: String },
      },
    ],

    statistics: {
      total: { type: Number, default: 0 },
      conforme: { type: Number, default: 0 },
      nonConforme: { type: Number, default: 0 },
      observacao: { type: Number, default: 0 },
      oportunidade: { type: Number, default: 0 },
      naoAplicavel: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    completedBy: { type: String },
    completedAt: { type: Date },

    createdBy: { type: String, required: true },
    updatedBy: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices compostos
AuditChecklistSchema.index({ auditPlanId: 1, controlId: 1 }, { unique: true });
AuditChecklistSchema.index({ auditPlanId: 1, status: 1 });

// Virtual
AuditChecklistSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Middleware para soft delete
AuditChecklistSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditChecklistSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

// Método para atualizar estatísticas
AuditChecklistSchema.methods.updateStatistics = function () {
  const stats = {
    total: this.questions.length,
    conforme: 0,
    nonConforme: 0,
    observacao: 0,
    oportunidade: 0,
    naoAplicavel: 0,
  };

  this.questions.forEach((q: any) => {
    switch (q.answer) {
      case 'C': stats.conforme++; break;
      case 'NC': stats.nonConforme++; break;
      case 'OB': stats.observacao++; break;
      case 'OM': stats.oportunidade++; break;
      case 'NA': stats.naoAplicavel++; break;
      case '--': break;
    }
  });

  this.statistics = stats;

  // Verificar se todas as perguntas foram respondidas
  const allAnswered = this.questions.every((q: any) => q.answer !== '--');
  if (allAnswered && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
};

export const AuditChecklist = mongoose.model<IAuditChecklist>('AuditChecklist', AuditChecklistSchema);
