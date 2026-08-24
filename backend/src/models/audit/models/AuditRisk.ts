import mongoose, { Schema } from 'mongoose';

export interface IAuditRisk {
  _id: string;
  companyId: string;
  auditPlanId?: string;
  id: string;

  // Dados do risco
  description: string;
  eventOrAsset: string;
  owner: string;
  threat: string;
  vulnerability: string;
  existingControl: string;

  // Avaliação
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskClassification: string;

  // Tratamento
  treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid';
  treatmentPlan: string;

  // Pós-tratamento
  probabilityAfter: 1 | 2 | 3 | 4 | 5;
  impactAfter: 1 | 2 | 3 | 4 | 5;
  residualRisk: 'low' | 'medium' | 'high' | 'critical';

  // Status
  status: 'identified' | 'analyzed' | 'treated' | 'monitored' | 'closed';
  treatmentDeadline?: Date;
  treatedAt?: Date;
  treatedBy?: string;

  // Metadados
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Calcula o nível de risco com base na probabilidade
 * e no impacto.
 */
function calculateRiskLevel(
  probability: number,
  impact: number
): 'low' | 'medium' | 'high' | 'critical' {
  const score = probability * impact;

  if (score <= 4) return 'low';
  if (score <= 9) return 'medium';
  if (score <= 16) return 'high';

  return 'critical';
}

const AuditRiskSchema = new Schema<IAuditRisk>(
  {
    /**
     * TENANT ISOLATION
     *
     * Este campo identifica a empresa proprietária do risco.
     *
     * IMPORTANTE:
     * O controller deve sempre obter este valor a partir do
     * usuário autenticado e nunca confiar somente no valor
     * enviado pelo frontend.
     */
    companyId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    /**
     * Plano de auditoria ao qual o risco está vinculado.
     *
     * Também pertence indiretamente ao tenant através do
     * AuditPlan.
     */
    auditPlanId: {
      type: String,
      index: true,
      trim: true,
    },

    /**
     * Identificador funcional do risco.
     *
     * Exemplo:
     * R-001
     * R-002
     *
     * ATENÇÃO:
     * Não utilizar unique: true aqui.
     *
     * A unicidade deve ser composta por:
     * companyId + id
     *
     * permitindo:
     *
     * Empresa A → R-001
     * Empresa B → R-001
     */
    id: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================================
    // DADOS DO RISCO
    // ==========================================================

    description: {
      type: String,
      required: true,
      trim: true,
    },

    eventOrAsset: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: String,
      required: true,
      trim: true,
    },

    threat: {
      type: String,
      required: true,
      trim: true,
    },

    vulnerability: {
      type: String,
      required: true,
      trim: true,
    },

    existingControl: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================================
    // AVALIAÇÃO
    // ==========================================================

    probability: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },

    impact: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },

    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },

    riskClassification: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================================
    // TRATAMENTO
    // ==========================================================

    treatment: {
      type: String,
      enum: ['accept', 'mitigate', 'transfer', 'avoid'],
      required: true,
    },

    treatmentPlan: {
      type: String,
      required: true,
    },

    // ==========================================================
    // RISCO RESIDUAL
    // ==========================================================

    probabilityAfter: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },

    impactAfter: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },

    residualRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },

    // ==========================================================
    // STATUS
    // ==========================================================

    status: {
      type: String,
      enum: [
        'identified',
        'analyzed',
        'treated',
        'monitored',
        'closed',
      ],
      default: 'identified',
    },

    treatmentDeadline: {
      type: Date,
    },

    treatedAt: {
      type: Date,
    },

    treatedBy: {
      type: String,
    },

    // ==========================================================
    // AUDITORIA
    // ==========================================================

    createdBy: {
      type: String,
      required: true,
    },

    updatedBy: {
      type: String,
      required: true,
    },

    deletedAt: {
      type: Date,
      default: null,
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

/**
 * Identificador funcional único dentro da empresa.
 *
 * Permite:
 *
 * Empresa A → R-001
 * Empresa B → R-001
 *
 * mas impede:
 *
 * Empresa A → R-001
 * Empresa A → R-001
 */
AuditRiskSchema.index(
  {
    companyId: 1,
    id: 1,
  },
  {
    unique: true,
  }
);

/**
 * Consultas por empresa e status.
 */
AuditRiskSchema.index({
  companyId: 1,
  status: 1,
});

/**
 * Consultas por empresa e nível de risco.
 */
AuditRiskSchema.index({
  companyId: 1,
  riskLevel: 1,
});

/**
 * Consultas por empresa e plano de auditoria.
 */
AuditRiskSchema.index({
  companyId: 1,
  auditPlanId: 1,
});

/**
 * Consultas de riscos ativos.
 */
AuditRiskSchema.index({
  companyId: 1,
  deletedAt: 1,
});

// ============================================================
// SOFT DELETE
// ============================================================

/**
 * Impede que riscos excluídos logicamente sejam retornados
 * pelas consultas normais.
 */
AuditRiskSchema.pre('find', function () {
  this.where({
    deletedAt: null,
  });
});

AuditRiskSchema.pre('findOne', function () {
  this.where({
    deletedAt: null,
  });
});

AuditRiskSchema.pre('findOneAndUpdate', function () {
  this.where({
    deletedAt: null,
  });
});

// ============================================================
// CÁLCULO AUTOMÁTICO DO RISCO
// ============================================================

AuditRiskSchema.pre('save', function (next) {
  /**
   * Risco inerente.
   */
  this.riskLevel = calculateRiskLevel(
    this.probability,
    this.impact
  );

  /**
   * Risco residual.
   */
  this.residualRisk = calculateRiskLevel(
    this.probabilityAfter,
    this.impactAfter
  );

  next();
});

// ============================================================
// MODEL
// ============================================================

export const AuditRisk = mongoose.model<IAuditRisk>(
  'AuditRisk',
  AuditRiskSchema
);