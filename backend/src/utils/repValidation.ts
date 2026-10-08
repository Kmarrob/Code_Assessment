// backend/src/utils/repValidation.ts
import { z } from 'zod';

// ============================================
// ESQUEMAS DE VALIDAÇÃO PARA REP (PREPOSTO)
// ============================================

// ============================================================
// 🆕 v52.1 — ROLES PERMITIDOS PARA O REP CADASTRAR
// ============================================================
//
// MOTIVO:
//   Com a introdução dos roles de auditoria interna
//   (auditor_lead, auditor, observer), o schema de validação
//   do REP precisa aceitar esses valores.
//
// PROBLEMA ANTERIOR:
//   O schema `repCreateUserSchema` NÃO tinha o campo `role`.
//   O Zod faz strip silencioso de campos desconhecidos, então
//   o `role` enviado pelo frontend era REMOVIDO antes de chegar
//   ao service. Resultado: o service usava o padrão `user`.
//
// SOLUÇÃO:
//   Adicionar `role` como campo opcional com enum dos 4 roles
//   permitidos. Assim o Zod preserva o valor e o service
//   o utiliza corretamente.
//
// SEGURANÇA:
//   - O REP NÃO pode criar: rep, admin, consultant.
//   - A whitelist está espelhada aqui E no RepService (defesa em
//     profundidade).
//
// ============================================================

const allowedRolesForRep = [
  'user',
  'auditor_lead',
  'auditor',
  'observer',
] as const;

// Schema para criação de usuário pelo preposto
export const repCreateUserSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email muito curto')
    .max(255, 'Email muito longo'),
  // 🔴 CORRIGIDO: Tornar senha opcional (sistema gera automaticamente)
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial')
    .optional(), // 🔴 TORNADO OPCIONAL
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),

  // ============================================================
  // 🆕 v52.1 — CAMPO ROLE
  // ============================================================
  //
  // Opcional. Se ausente, o service usa `user` como padrão
  // (comportamento antigo — compatibilidade total).
  //
  // Valores aceitos:
  //   - 'user'          → usuário comum
  //   - 'auditor_lead'  → auditor líder
  //   - 'auditor'       → auditor
  //   - 'observer'      → observador
  //
  // Valores rejeitados (por segurança):
  //   - 'admin', 'rep', 'consultant' → Zod lança erro 400.
  //
  // ============================================================
  role: z.enum(allowedRolesForRep, {
    errorMap: () => ({
      message:
        'Role inválido. O preposto pode cadastrar apenas: user, auditor_lead, auditor, observer',
    }),
  }).optional(),
});

// Schema para atribuição de controles
export const repAssignControlsSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  controlIds: z.array(z.string()).min(1, 'Pelo menos um controle deve ser selecionado'),
});

// Schema para listagem de usuários do preposto
export const repListUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
});

// ============================================================
// 🆕 v52.1 — SCHEMA DE ATUALIZAÇÃO DE USUÁRIO
// ============================================================
//
// MOTIVO:
//   O schema anterior NÃO tinha o campo `role`. Isso significa
//   que o REP não podia alterar o role de um usuário existente.
//
// SOLUÇÃO:
//   Adicionar `role` como campo opcional com a mesma whitelist
//   do create.
//
// ============================================================
export const repUpdateUserSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .optional(),
  department: z.string()
    .max(100, 'Departamento deve ter no máximo 100 caracteres')
    .optional(),

  // ============================================================
  // 🆕 v52.1 — CAMPO ROLE (na edição)
  // ============================================================
  role: z.enum(allowedRolesForRep, {
    errorMap: () => ({
      message:
        'Role inválido. O preposto pode atribuir apenas: user, auditor_lead, auditor, observer',
    }),
  }).optional(),
});

// Schema para inativação de usuário
export const repInactivateUserSchema = z.object({
  reason: z.enum(['Desligado', 'Mudou de setor', 'Outros'], {
    errorMap: () => ({ message: 'Motivo inválido. Use: Desligado, Mudou de setor ou Outros' })
  }),
  description: z.string()
    .min(0, 'Descrição deve ter no mínimo 5 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .refine(
      (val) => {
        // Se motivo for "Outros", descrição é obrigatória
        return true; // Validação feita no controller
      },
      { message: 'Descrição é obrigatória quando motivo for "Outros"' }
    ),
});

// Schema para revogação de controle
export const repRevokeControlSchema = z.object({
  confirmRevoke: z.boolean({
    required_error: 'Confirmação de revogação é obrigatória',
    invalid_type_error: 'confirmRevoke deve ser true ou false',
  }).refine(val => val === true, {
    message: 'Você deve confirmar a revogação do controle',
  }),
  newUserId: z.string()
    .optional()
    .refine(
      (val) => {
        // Se fornecido, deve ser uma string válida (não vazia)
        return !val || val.length > 0;
      },
      { message: 'ID do usuário destino inválido' }
    ),
});

// Schema para resposta de controle
export const repResponseSchema = z.object({
  assignmentId: z.string().min(1, 'ID da atribuição é obrigatório'),
  maturityLevel: z.enum(['N/A', '0', '1', '2']),
  scenarioDescription: z.string().optional(),
  evidence: z.string().optional(),
  observations: z.string().optional(),
});