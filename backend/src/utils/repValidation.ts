// backend/src/utils/repValidation.ts
import { z } from 'zod';

// ============================================
// ESQUEMAS DE VALIDAÇÃO PARA REP (PREPOSTO)
// ============================================

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
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial'),
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
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

// Schema para atualização de usuário pelo preposto
export const repUpdateUserSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .optional(),
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

// Schema para resposta de controle
export const repResponseSchema = z.object({
  assignmentId: z.string().min(1, 'ID da atribuição é obrigatório'),
  maturityLevel: z.enum(['N/A', '0', '1', '2']),
  scenarioDescription: z.string().optional(),
  evidence: z.string().optional(),
  observations: z.string().optional(),
});
