// backend/src/utils/validation.ts
import { z, ZodError } from 'zod';

// ============================================
// VALIDAÇÕES REFORÇADAS
// ============================================

// 🔴 CORRIGIDO: Senha com mínimo de 8 caracteres
export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial');

export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(255, 'Email muito longo')
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido');

// 🔴 CORRIGIDO: Regex do nameSchema - \\s corrigido para \s
export const nameSchema = z
  .string()
  .min(3, 'Nome deve ter pelo menos 3 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

// ============================================
// ESQUEMAS ATUALIZADOS
// ============================================

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  role: z.enum(['admin', 'rep', 'consultant', 'user']).optional(),
  plan: z.enum(['basic', 'pro', 'enterprise']).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(32, 'Refresh token inválido'),
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
}).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: 'Senha atual é obrigatória para alterar a senha',
    path: ['currentPassword'],
  }
);

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _error: ['Erro inesperado na validação'] } };
  }
}

// ============================================
// SANITIZAÇÃO CORRIGIDA - PRESERVA ARRAYS
// ============================================
export function sanitizeInput(input: any): any {
  // Se for string, sanitizar
  if (typeof input === 'string') {
    let sanitized = input.replace(/\$/g, '');
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    return sanitized;
  }

  // Se for array, sanitizar cada elemento e manter como array
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }

  // Se for objeto, sanitizar cada propriedade
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (!key.startsWith('$')) {
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized;
  }

  return input;
}

export function sanitizeOutput(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeOutput(value);
    }
    return sanitized;
  }

  return data;
}