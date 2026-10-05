import mongoose, { Schema } from 'mongoose';

// ============================================================
// AUDIT CONTROL QUESTION — v50.2
// ============================================================
//
// COLEÇÃO NOVA E ISOLADA.
//
// OBJETIVO:
//   Armazenar as perguntas de auditoria POR CONTROLE do Anexo A
//   (ISO 27001:2022 — controles 5.1 a 8.34), extraídas dos
//   checklists oficiais (Part 2, Part 3, Part 4).
//
// DIFERENÇA EM RELAÇÃO ÀS OUTRAS COLEÇÕES:
//
//   Question (Assessment)
//     → 1 pergunta macro por controle, respondida pelo USUÁRIO
//       da empresa (nível 0/1/2 + comentário + evidência).
//
//   AuditQuestion (SGSI — cláusulas 4-10)
//     → ~160 perguntas por CLÁUSULA, usadas pelo auditor para
//       auditar o SGSI como um todo.
//
//   AuditControlQuestion (ESTA COLEÇÃO)
//     → N perguntas por CONTROLE do Anexo A, usadas pelo auditor
//       como roteiro de investigação dentro de cada controle.
//
// ESCOPO:
//   Somente leitura/gravação nesta coleção. Nenhuma outra
//   coleção é afetada por este modelo.
//
// SEM SEED:
//   O cadastro é 100% manual pelo ADMIN via tela dedicada.
//   Não há script de seed — por decisão explícita do stakeholder.
//
// ============================================================

export interface IAuditControlQuestion {
  _id: mongoose.Types.ObjectId;

  // ============================================================
  // IDENTIFICAÇÃO DO CONTROLE
  // ============================================================

  /**
   * Código ISO do controle (ex.: "5.1", "6.2", "8.34").
   *
   * É o MESMO formato usado em `Control.id` (coleção Control) e
   * em `Question.controlId` (coleção Question).
   *
   * NÃO é ObjectId. A escolha pelo código ISO mantém o padrão
   * já utilizado em todo o sistema e permite o join direto com
   * a coleção Control sem conversões adicionais.
   */
  controlId: string;

  /**
   * Nome do controle (ex.: "Políticas de segurança da informação").
   *
   * Desnormalizado intencionalmente para exibição rápida em
   * telas de listagem e para preservar o histórico caso o nome
   * do controle mude na coleção Control.
   */
  controlName: string;

  /**
   * Grupo/domínio do controle (ex.: "A.5 Organizacionais").
   *
   * Opcional. Usado para agrupamento visual na tela do admin.
   */
  controlGroup?: string;

  /**
   * 🆕 v50.2 — Descrição oficial do controle (texto da ISO 27001).
   *
   * Contém o texto descritivo do controle do Anexo A da ISO
   * 27001:2022 (ex.: "Information security policy and
   * topic-specific policies shall be defined, approved...").
   *
   * Desnormalizado intencionalmente como SNAPSHOT no momento do
   * cadastro: se o controle for editado depois na coleção Control,
   * esta descrição NÃO muda — preserva rastreabilidade histórica.
   *
   * Opcional para manter compatibilidade com perguntas
   * cadastradas antes da v50.2.
   */
  controlDescription?: string;

  // ============================================================
  // CONTEÚDO DA PERGUNTA DE AUDITORIA
  // ============================================================

  /**
   * Texto da pergunta de auditoria.
   *
   * Ex.: "As políticas de SI existem formalmente?"
   *      "Todas as políticas foram aprovadas pela direção?"
   */
  text: string;

  /**
   * Objetivo da pergunta (o que o auditor quer confirmar).
   *
   * Opcional. Orienta o auditor sobre a INTENÇÃO da pergunta.
   */
  objective?: string;

  /**
   * Orientação ao auditor (como investigar).
   *
   * Opcional. Pode conter dicas de entrevista, documentos a
   * solicitar, pessoas a consultar etc.
   */
  guidance?: string;

  /**
   * Evidência esperada para esta pergunta.
   *
   * Opcional. Ex.: "Cópia da política assinada pela direção".
   * Ajuda o auditor a saber o que anexar ao marcar C/NC.
   */
  evidenceExpected?: string;

  // ============================================================
  // CONTROLE DE ORDENAÇÃO E ESTADO
  // ============================================================

  /**
   * Ordem de exibição da pergunta dentro do controle.
   *
   * Começa em 1. Perguntas com o mesmo `order` são ordenadas por
   * `createdAt` como critério de desempate.
   */
  order: number;

  /**
   * Indica se a pergunta está ativa para uso em novos checklists.
   *
   * Soft-disable: perguntas inativas continuam existindo no
   * banco (para preservar checklists antigos que já as usaram),
   * mas não são incluídas em novos checklists.
   */
  active: boolean;

  // ============================================================
  // METADADOS
  // ============================================================

  /**
   * ID do usuário (ADMIN) que cadastrou a pergunta.
   */
  createdBy: string;

  /**
   * ID do usuário que fez a última atualização.
   */
  updatedBy?: string;

  createdAt: Date;
  updatedAt: Date;

  /**
   * Soft delete. Quando preenchido, a pergunta não aparece em
   * listagens normais, mas permanece no banco para fins
   * históricos e de auditoria.
   */
  deletedAt?: Date | null;
}

// ============================================================
// SCHEMA
// ============================================================

const AuditControlQuestionSchema = new Schema<IAuditControlQuestion>(
  {
    // ---- Identificação do controle ----

    controlId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    controlName: {
      type: String,
      required: true,
      trim: true,
    },

    controlGroup: {
      type: String,
      trim: true,
      default: '',
    },

    // 🆕 v50.2 — Descrição oficial do controle (snapshot ISO 27001)
    controlDescription: {
      type: String,
      trim: true,
      default: '',
    },

    // ---- Conteúdo da pergunta ----

    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },

    objective: {
      type: String,
      trim: true,
      default: '',
    },

    guidance: {
      type: String,
      trim: true,
      default: '',
    },

    evidenceExpected: {
      type: String,
      trim: true,
      default: '',
    },

    // ---- Ordenação e estado ----

    order: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ---- Metadados ----

    createdBy: {
      type: String,
      required: true,
    },

    updatedBy: {
      type: String,
      default: '',
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,

    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================
// ÍNDICES
// ============================================================

/**
 * Índice principal: listar perguntas de um controle em ordem.
 *
 * Cobre a query mais frequente da tela do admin e do checklist:
 *   find({ controlId: "5.1", active: true }).sort({ order: 1 })
 */
AuditControlQuestionSchema.index({
  controlId: 1,
  active: 1,
  order: 1,
});

/**
 * Índice para agrupamento por grupo de controle na tela do admin.
 */
AuditControlQuestionSchema.index({
  controlGroup: 1,
  controlId: 1,
  order: 1,
});

/**
 * Índice para soft delete + listagens padrão.
 */
AuditControlQuestionSchema.index({
  deletedAt: 1,
  active: 1,
});

// ============================================================
// VIRTUAL ID
// ============================================================

AuditControlQuestionSchema.virtual('id').get(function () {
  return this._id.toString();
});

// ============================================================
// SOFT DELETE — FILTRO AUTOMÁTICO
// ============================================================
//
// Todas as queries normais ignoram registros com deletedAt
// preenchido. Para acessar registros deletados, é necessário
// usar `.setOptions({ includeDeleted: true })` ou query direta
// com `deletedAt: { $ne: null }`.
//
// Mesmo padrão já adotado em AuditChecklist e demais modelos
// do módulo de auditoria — mantém consistência.

AuditControlQuestionSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

AuditControlQuestionSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

AuditControlQuestionSchema.pre('findOneAndUpdate', function () {
  this.where({ deletedAt: null });
});

AuditControlQuestionSchema.pre('countDocuments', function () {
  this.where({ deletedAt: null });
});

// ============================================================
// EXPORTAÇÃO DO MODEL
// ============================================================

export const AuditControlQuestion =
  mongoose.model<IAuditControlQuestion>(
    'AuditControlQuestion',
    AuditControlQuestionSchema
  );