// backend/src/utils/adminValidation.ts
import { z } from 'zod';

export const adminPasswordSchema = z
  .string()
  .min(12, 'Senha deve ter pelo menos 12 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial');

export const adminEmailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(255, 'Email muito longo')
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido');

export const adminNameSchema = z
  .string()
  .min(3, 'Nome deve ter pelo menos 3 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

export const adminRoleSchema = z.enum(['admin', 'rep', 'consultant', 'user']);

// ============================================
// ID DA EMPRESA - VALIDAÇÃO CORRIGIDA
// Aceita string vazia e converte para undefined
// ============================================
const companyIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID da empresa inválido')
  .optional()
  .nullable()
  .or(z.literal(''))  // <-- ACEITAR STRING VAZIA
  .transform(val => val === '' ? undefined : val);  // <-- CONVERTER PARA UNDEFINED

export const adminCreateUserSchema = z.object({
  name: adminNameSchema,
  email: adminEmailSchema,
  password: adminPasswordSchema,
  role: adminRoleSchema.default('user'),
  company: z.string().max(100).optional().nullable(),
  companyId: companyIdSchema,
  department: z.string().max(100).optional().nullable(),
});

export const adminUpdateUserSchema = z.object({
  name: adminNameSchema.optional(),
  email: adminEmailSchema.optional(),
  role: adminRoleSchema.optional(),
  company: z.string().max(100).optional().nullable(),
  companyId: companyIdSchema,
  department: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const adminListUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  role: adminRoleSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  companyId: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
});

export const adminResetPasswordSchema = z.object({
  password: adminPasswordSchema,
});