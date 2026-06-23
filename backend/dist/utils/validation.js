"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = exports.nameSchema = exports.emailSchema = exports.passwordSchema = void 0;
exports.validate = validate;
exports.sanitizeInput = sanitizeInput;
exports.sanitizeOutput = sanitizeOutput;
// backend/src/utils/validation.ts
const zod_1 = require("zod");
// ============================================
// VALIDAÇÕES REFORÇADAS
// ============================================
exports.passwordSchema = zod_1.z
    .string()
    .min(12, 'Senha deve ter pelo menos 12 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial');
exports.emailSchema = zod_1.z
    .string()
    .email('Email inválido')
    .min(5, 'Email muito curto')
    .max(255, 'Email muito longo')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido');
exports.nameSchema = zod_1.z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\\s]+$/, 'Nome deve conter apenas letras e espaços');
// ============================================
// ESQUEMAS ATUALIZADOS
// ============================================
exports.registerSchema = zod_1.z.object({
    name: exports.nameSchema,
    email: exports.emailSchema,
    password: exports.passwordSchema,
    company: zod_1.z.string().max(100).optional(),
    department: zod_1.z.string().max(100).optional(),
    role: zod_1.z.enum(['admin', 'rep', 'consultant', 'user']).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().min(1, 'Senha é obrigatória'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(32, 'Refresh token inválido'),
});
exports.updateProfileSchema = zod_1.z.object({
    name: exports.nameSchema.optional(),
    company: zod_1.z.string().max(100).optional(),
    department: zod_1.z.string().max(100).optional(),
    currentPassword: zod_1.z.string().optional(),
    newPassword: exports.passwordSchema.optional(),
}).refine((data) => {
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: 'Senha atual é obrigatória para alterar a senha',
    path: ['currentPassword'],
});
function validate(schema, data) {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = {};
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
function sanitizeInput(input) {
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
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            if (!key.startsWith('$')) {
                sanitized[key] = sanitizeInput(value);
            }
        }
        return sanitized;
    }
    return input;
}
function sanitizeOutput(data) {
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
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitizeOutput(value);
        }
        return sanitized;
    }
    return data;
}
//# sourceMappingURL=validation.js.map