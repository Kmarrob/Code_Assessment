"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminResetPasswordSchema = exports.adminListUsersSchema = exports.adminUpdateUserSchema = exports.adminCreateUserSchema = exports.adminRoleSchema = exports.adminNameSchema = exports.adminEmailSchema = exports.adminPasswordSchema = void 0;
// backend/src/utils/adminValidation.ts
const zod_1 = require("zod");
exports.adminPasswordSchema = zod_1.z
    .string()
    .min(12, 'Senha deve ter pelo menos 12 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial');
exports.adminEmailSchema = zod_1.z
    .string()
    .email('Email inválido')
    .min(5, 'Email muito curto')
    .max(255, 'Email muito longo')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido');
exports.adminNameSchema = zod_1.z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');
exports.adminRoleSchema = zod_1.z.enum(['admin', 'rep', 'consultant', 'user']);
// ============================================
// ID DA EMPRESA - VALIDAÇÃO CORRIGIDA
// Aceita string vazia e converte para undefined
// ============================================
const companyIdSchema = zod_1.z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'ID da empresa inválido')
    .optional()
    .nullable()
    .or(zod_1.z.literal('')) // <-- ACEITAR STRING VAZIA
    .transform(val => val === '' ? undefined : val); // <-- CONVERTER PARA UNDEFINED
exports.adminCreateUserSchema = zod_1.z.object({
    name: exports.adminNameSchema,
    email: exports.adminEmailSchema,
    password: exports.adminPasswordSchema,
    role: exports.adminRoleSchema.default('user'),
    company: zod_1.z.string().max(100).optional().nullable(),
    companyId: companyIdSchema,
    department: zod_1.z.string().max(100).optional().nullable(),
});
exports.adminUpdateUserSchema = zod_1.z.object({
    name: exports.adminNameSchema.optional(),
    email: exports.adminEmailSchema.optional(),
    role: exports.adminRoleSchema.optional(),
    company: zod_1.z.string().max(100).optional().nullable(),
    companyId: companyIdSchema,
    department: zod_1.z.string().max(100).optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
});
exports.adminListUsersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    role: exports.adminRoleSchema.optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(100).optional(),
    company: zod_1.z.string().max(100).optional(),
    companyId: zod_1.z.string().max(100).optional(),
    department: zod_1.z.string().max(100).optional(),
});
exports.adminResetPasswordSchema = zod_1.z.object({
    password: exports.adminPasswordSchema,
});
//# sourceMappingURL=adminValidation.js.map