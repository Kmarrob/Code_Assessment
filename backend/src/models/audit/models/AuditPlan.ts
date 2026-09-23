import mongoose, { Schema } from 'mongoose';

// ============================================================
// INTERFACES
// ============================================================

export interface IAuditExcludedControl {
  controlId: string;        // ID do controle ISO 27001 excluído
  reason: string;           // Justificativa obrigatória (min 20 chars)
  excludedBy: string;       // User ID de quem excluiu
  excludedAt: Date;         // Data da exclusão
  approvedBy?: string;      // User ID do REP que aprovou a exclusão
  approvedAt?: Date;        // Data da aprovação da exclusão
}

export interface IAuditPlanScope {
  mode: 'all' | 'custom';              // 'all' = cobertura total (padrão), 'custom' = seleção manual
  controls: string[];                  // IDs dos controles ISO 27001 efetivos
  excludedControls: IAuditExcludedControl[]; // Controles excluídos com justificativa
  processes: string[];                 // Processos a serem auditados
  areas: string[];                     // Áreas/departamentos
  totalAvailableControls: number;      // Snapshot do total de controles disponíveis na empresa
}

// ============================================================
// 🆕 v49.1 — IAuditPlanTeam EXPANDIDO
// ============================================================
//
// MOTIVO:
//   A versão anterior salvava apenas os IDs dos auditores
//   (ex.: 'manual_1790110055011' ou ObjectId do User). Ao exibir
//   o card do plano, o frontend só conseguia mostrar o ID bruto,
//   pois não tinha o nome.
//
//   Agora salvamos TAMBÉM nome e email de cada membro,
//   mantendo os IDs como fonte de verdade para autorização
//   e segregação de funções.
//
// COMPATIBILIDADE:
//   Todos os campos novos são OPCIONAIS (?). Planos antigos
//   continuam válidos — o frontend faz fallback para o ID
//   quando o nome não está disponível.
//
// ============================================================

export interface IAuditPlanTeam {
  // ---- Campos originais (INALTERADOS) ----
  leadAuditor: string;         // User ID
  auditors: string[];          // User IDs
  observers: string[];         // User IDs
  specialists?: string[];      // Especialistas convidados

  // ---- 🆕 v49.1 — Nomes e emails resolvidos ----
  leadAuditorName?: string;
  leadAuditorEmail?: string;
  auditorNames?: string[];     // Alinhado por índice com `auditors`
  auditorEmails?: string[];    // Alinhado por índice com `auditors`
  observerNames?: string[];    // Alinhado por índice com `observers`
  observerEmails?: string[];   // Alinhado por índice com `observers`
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

// ============================================================
// SCHEMA
// ============================================================

const AuditExcludedControlSchema = new Schema<IAuditExcludedControl>(
  {
    controlId: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: [20, 'A justificativa da exclusão deve ter no mínimo 20 caracteres'],
    },

    excludedBy: {
      type: String,
      required: true,
    },

    excludedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    approvedBy: {
      type: String,
    },

    approvedAt: {
      type: Date,
    },
  },
  {
    _id: false,
  }
);

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
      mode: {
        type: String,
        enum: ['all', 'custom'],
        default: 'all',
        required: true,
      },

      controls: {
        type: [String],
        default: [],
      },

      excludedControls: {
        type: [AuditExcludedControlSchema],
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

      totalAvailableControls: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // ============================================================
    // 🆕 v49.1 — TEAM EXPANDIDO
    // ============================================================
    //
    // Adicionados os campos de nome e email. Todos opcionais,
    // para manter compatibilidade com planos criados antes
    // desta versão.
    //
    // REGRA DE OURO: nenhum campo foi removido. Apenas
    // adicionamos novos campos de metadados (nome/email).
    //
    // ============================================================
    team: {
      // ---- Campos originais (INALTERADOS) ----
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

      // ---- 🆕 v49.1 — Nomes e emails resolvidos ----
      leadAuditorName: {
        type: String,
        trim: true,
        default: '',
      },

      leadAuditorEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
      },

      auditorNames: {
        type: [String],
        default: [],
      },

      auditorEmails: {
        type: [String],
        default: [],
      },

      observerNames: {
        type: [String],
        default: [],
      },

      observerEmails: {
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

AuditPlanSchema.index({
  'scope.mode': 1,
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
//
// NOTA (v49.1): as validações abaixo foram PRESERVADAS
// integralmente. Nenhuma regra foi removida ou relaxada.
// Os novos campos de nome/email não interferem em nenhuma
// das regras abaixo (R1 a R8), pois operam sobre os IDs
// (leadAuditor, auditors, observers) e não sobre os nomes.
//
// ============================================================

AuditPlanSchema.pre('validate', function (next) {
  // ----------------------------------------------------------
  // R1 — Segregação de funções: Criador ≠ Auditor Líder
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // R2 — Período: startDate ≤ endDate
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // R3 — Modo 'all' exige cobertura total declarada
  // ----------------------------------------------------------
  if (this.scope && this.scope.mode === 'all') {
    if (
      !this.scope.totalAvailableControls ||
      this.scope.totalAvailableControls <= 0
    ) {
      return next(
        new Error(
          'Modo "all" requer que totalAvailableControls seja maior que zero. ' +
          'Este campo registra o snapshot do total de controles da empresa.'
        )
      );
    }

    // Cada exclusão no modo 'all' precisa ter justificativa válida
    if (
      this.scope.excludedControls &&
      this.scope.excludedControls.length > 0
    ) {
      for (const excluded of this.scope.excludedControls) {
        if (!excluded.controlId || excluded.controlId.trim() === '') {
          return next(
            new Error(
              'Toda exclusão de controle deve ter um controlId válido'
            )
          );
        }

        if (!excluded.reason || excluded.reason.trim().length < 20) {
          return next(
            new Error(
              `A justificativa de exclusão do controle ${excluded.controlId} deve ter no mínimo 20 caracteres`
            )
          );
        }

        if (!excluded.excludedBy) {
          return next(
            new Error(
              `A exclusão do controle ${excluded.controlId} deve registrar quem excluiu (excludedBy)`
            )
          );
        }
      }

      // Não pode excluir mais controles do que existem
      if (
        this.scope.excludedControls.length >
        this.scope.totalAvailableControls
      ) {
        return next(
          new Error(
            'O número de controles excluídos não pode ser maior que o total disponível'
          )
        );
      }

      // Não pode excluir TODOS os controles
      const effectiveControls =
        this.scope.totalAvailableControls -
        this.scope.excludedControls.length;

      if (effectiveControls <= 0) {
        return next(
          new Error(
            'Não é permitido excluir todos os controles. A auditoria deve ter pelo menos 1 controle em escopo'
          )
        );
      }
    }
  }

  // ----------------------------------------------------------
  // R4 — Modo 'custom' exige pelo menos 1 controle selecionado
  // ----------------------------------------------------------
  if (this.scope && this.scope.mode === 'custom') {
    if (!this.scope.controls || this.scope.controls.length === 0) {
      return next(
        new Error(
          'Modo "custom" requer que pelo menos 1 controle seja selecionado em scope.controls'
        )
      );
    }

    // Em modo 'custom', não faz sentido ter excludedControls
    if (
      this.scope.excludedControls &&
      this.scope.excludedControls.length > 0
    ) {
      return next(
        new Error(
          'Modo "custom" não permite excludedControls. Use o modo "all" para excluir controles com justificativa.'
        )
      );
    }
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