import { z } from 'zod';

// ============================================================
// AUDIT CONTROL QUESTION — SCHEMAS ZOD — v50.2.8
// ============================================================
//
// Validações dos endpoints REST de AuditControlQuestion.
//
// Segue o mesmo padrão já adotado em audit.schemas.ts para
// AuditQuestion (create / update / filters / delete).
//
// Coleção nova e isolada — não altera nenhum schema existente.
//
// 🔧 v50.2.8 — Adicionado o campo controlDescription (descrição
// oficial do controle ISO 27001 Anexo A) nos schemas de create
// e update. Sem isso, o TypeScript do service não reconhece o
// campo e o build quebra.
// ============================================================

// ============================================================
// CREATE
// ============================================================

export const createAuditControlQuestionSchema = z.object({
  controlId: z
    .string({ required_error: 'O código do controle é obrigatório' })
    .trim()
    .min(1, 'O código do controle é obrigatório')
    .max(20, 'O código do controle deve ter no máximo 20 caracteres'),

  controlName: z
    .string({ required_error: 'O nome do controle é obrigatório' })
    .trim()
    .min(1, 'O nome do controle é obrigatório')
    .max(300, 'O nome do controle deve ter no máximo 300 caracteres'),

  controlGroup: z
    .string()
    .trim()
    .max(200, 'O grupo deve ter no máximo 200 caracteres')
    .optional()
    .default(''),

  // 🔧 v50.2.8 — Descrição oficial do controle (ISO 27001 Anexo A)
  controlDescription: z
    .string()
    .trim()
    .max(4000, 'A descrição do controle deve ter no máximo 4000 caracteres')
    .optional()
    .default(''),

  text: z
    .string({ required_error: 'O texto da pergunta é obrigatório' })
    .trim()
    .min(5, 'O texto da pergunta deve ter no mínimo 5 caracteres')
    .max(2000, 'O texto da pergunta deve ter no máximo 2000 caracteres'),

  objective: z
    .string()
    .trim()
    .max(2000, 'O objetivo deve ter no máximo 2000 caracteres')
    .optional()
    .default(''),

  guidance: z
    .string()
    .trim()
    .max(4000, 'A orientação deve ter no máximo 4000 caracteres')
    .optional()
    .default(''),

  evidenceExpected: z
    .string()
    .trim()
    .max(1000, 'A evidência esperada deve ter no máximo 1000 caracteres')
    .optional()
    .default(''),

  order: z
    .number({ required_error: 'A ordem é obrigatória' })
    .int('A ordem deve ser um número inteiro')
    .min(1, 'A ordem deve ser no mínimo 1')
    .optional()
    .default(1),

  active: z
    .boolean()
    .optional()
    .default(true),
});

// ============================================================
// UPDATE
// ============================================================

export const updateAuditControlQuestionSchema = z.object({
  controlId: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .optional(),

  controlName: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .optional(),

  controlGroup: z
    .string()
    .trim()
    .max(200)
    .optional(),

  // 🔧 v50.2.8 — Descrição oficial do controle (ISO 27001 Anexo A)
  controlDescription: z
    .string()
    .trim()
    .max(4000)
    .optional(),

  text: z
    .string()
    .trim()
    .min(5)
    .max(2000)
    .optional(),

  objective: z
    .string()
    .trim()
    .max(2000)
    .optional(),

  guidance: z
    .string()
    .trim()
    .max(4000)
    .optional(),

  evidenceExpected: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  order: z
    .number()
    .int()
    .min(1)
    .optional(),

  active: z
    .boolean()
    .optional(),
});

// ============================================================
// FILTROS
// ============================================================

/**
 * Filtros aceitos em GET /control-questions.
 *
 * `active` aceita tanto boolean quanto string 'true'/'false'
 * (query params sempre chegam como string).
 */
export const auditControlQuestionFiltersSchema = z.object({
  controlId: z
    .string()
    .trim()
    .min(1)
    .optional(),

  controlGroup: z
    .string()
    .trim()
    .min(1)
    .optional(),

  active: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (typeof value === 'boolean') return value;
      return value === 'true';
    }),

  search: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional(),
});

// ============================================================
// DELETE
// ============================================================

export const deleteAuditControlQuestionSchema = z.object({
  id: z
    .string({ required_error: 'O ID é obrigatório' })
    .trim()
    .min(1, 'O ID é obrigatório'),
});

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type CreateAuditControlQuestionInput = z.infer<
  typeof createAuditControlQuestionSchema
>;

export type UpdateAuditControlQuestionInput = z.infer<
  typeof updateAuditControlQuestionSchema
>;

export type AuditControlQuestionFiltersInput = z.infer<
  typeof auditControlQuestionFiltersSchema
>;

// ============================================================
// DEFAULT EXPORT
// ============================================================
//
// Mantém o padrão do módulo de auditoria, onde os schemas são
// agrupados em um objeto default export para facilitar import.

export default {
  createAuditControlQuestionSchema,
  updateAuditControlQuestionSchema,
  auditControlQuestionFiltersSchema,
  deleteAuditControlQuestionSchema,
};