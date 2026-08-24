import mongoose, { Schema } from 'mongoose';

export interface IAuditPlanScope {
  controls: string[]; // IDs dos controles ISO 27001
  processes: string[]; // Processos a serem auditados
  areas: string[]; // Áreas/departamentos
}

export interface IAuditPlanTeam {
  leadAuditor: string; // User ID
  auditors: string[]; // User IDs
  observers: string[]; // User IDs
  specialists?: string[]; // Especialistas convidados
}

export interface IAuditPlanPeriod {
  startDate: Date;
  endDate: Date;
  estimatedDays: number;
}

export interface IAuditPlan {
  _id: string;

  // Identificação
  title: string;
  description: string;
  code: string; // AUD-2026-001

  // Empresa
  companyId: string;

  // Programa de auditoria
  programId?: string;

  // Escopo
  scope: IAuditPlanScope;

  // Equipe
  team: IAuditPlanTeam;

  // Período
  period: IAuditPlanPeriod;

  // Critérios
  criteria: string[];

  // Status
  status:
    | 'draft'
    | 'submitted'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'in_progress'
    | 'completed'
    | 'cancelled';

  // Aprovação
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;

  // Execução
  startedAt?: Date;
  completedAt?: Date;
  completedBy?: string;

  // Observações
  observations?: string;

  // Metadados
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditPlanSchema = new Schema<IAuditPlan>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    companyId: {
      type: String,
      required: true,
      index: true,
    },

    programId: {
      type: String,
      index: true,
    },

    scope: {
      controls: {
        type: [String],
        default: [],
      },

      processes: {
        type: [String],
        default: [],
      },

      areas: {
        type: [String],
        default: [],
      },
    },

    team: {
      leadAuditor: {
        type: String,
        required: true,
      },

      auditors: {
        type: [String],
        default: [],
      },

      observers: {
        type: [String],
        default: [],
      },

      specialists: {
        type: [String],
        default: [],
      },
    },

    period: {
      startDate: {
        type: Date,
        required: true,
      },

      endDate: {
        type: Date,
        required: true,
      },

      estimatedDays: {
        type: Number,
        required: true,
        min: 1,
      },
    },

    criteria: {
      type: [String],
      required: true,
      default: [],
    },

    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'pending_approval',
        'approved',
        'rejected',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'draft',
      index: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    approvedBy: {
      type: String,
    },

    approvedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    completedBy: {
      type: String,
    },

    observations: {
      type: String,
      trim: true,
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
// ÍNDICES
// ============================================================

AuditPlanSchema.index({
  companyId: 1,
  status: 1,
});

AuditPlanSchema.index(
  {
    companyId: 1,
    code: 1,
  },
  {
    unique: true,
  }
);

AuditPlanSchema.index({
  'period.startDate': 1,
  'period.endDate': 1,
});

// ============================================================
// VIRTUAL ID
// ============================================================

AuditPlanSchema.virtual('id').get(function () {
  return this._id.toString();
});

// ============================================================
// VALIDAÇÕES
// ============================================================

AuditPlanSchema.pre('validate', function (next) {
  if (
    this.team &&
    this.createdBy &&
    this.team.leadAuditor &&
    this.createdBy === this.team.leadAuditor
  ) {
    return next(
      new Error(
        'O Auditor Líder não pode ser a mesma pessoa que criou o plano de auditoria'
      )
    );
  }

  if (
    this.period &&
    this.period.startDate &&
    this.period.endDate &&
    this.period.startDate > this.period.endDate
  ) {
    return next(
      new Error(
        'A data inicial da auditoria não pode ser posterior à data final'
      )
    );
  }

  next();
});

// ============================================================
// SOFT DELETE
// ============================================================

AuditPlanSchema.pre('find', function () {
  this.where({
    deletedAt: null,
  });
});

AuditPlanSchema.pre('findOne', function () {
  this.where({
    deletedAt: null,
  });
});

AuditPlanSchema.pre('findOneAndUpdate', function () {
  this.where({
    deletedAt: null,
  });
});

AuditPlanSchema.pre('findOneAndDelete', function () {
  this.where({
    deletedAt: null,
  });
});

// ============================================================
// MODEL
// ============================================================

export const AuditPlan = mongoose.model<IAuditPlan>(
  'AuditPlan',
  AuditPlanSchema
);