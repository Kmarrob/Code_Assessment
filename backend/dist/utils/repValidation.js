"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repResponseSchema = exports.repRevokeControlSchema = exports.repInactivateUserSchema = exports.repUpdateUserSchema = exports.repListUsersSchema = exports.repAssignControlsSchema = exports.repCreateUserSchema = void 0;
// backend/src/utils/repValidation.ts
const zod_1 = require("zod");
// ============================================
// ESQUEMAS DE VALIDAÇÃO PARA REP (PREPOSTO)
// ============================================
// Schema para criação de usuário pelo preposto
exports.repCreateUserSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
    email: zod_1.z.string()
        .email('Email inválido')
        .min(5, 'Email muito curto')
        .max(255, 'Email muito longo'),
    // 🔴 CORRIGIDO: Tornar senha opcional (sistema gera automaticamente)
    password: zod_1.z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
        .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
        .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial')
        .optional(), // 🔴 TORNADO OPCIONAL
    company: zod_1.z.string().max(100).optional(),
    department: zod_1.z.string().max(100).optional(),
});
// Schema para atribuição de controles
exports.repAssignControlsSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'ID do usuário é obrigatório'),
    controlIds: zod_1.z.array(zod_1.z.string()).min(1, 'Pelo menos um controle deve ser selecionado'),
});
// Schema para listagem de usuários do preposto
exports.repListUsersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    search: zod_1.z.string().max(100).optional(),
    status: zod_1.z.enum(['all', 'active', 'inactive']).default('all'),
});
// Schema para atualização de usuário pelo preposto
exports.repUpdateUserSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
        .optional(),
    department: zod_1.z.string()
        .max(100, 'Departamento deve ter no máximo 100 caracteres')
        .optional(),
});
// Schema para inativação de usuário
exports.repInactivateUserSchema = zod_1.z.object({
    reason: zod_1.z.enum(['Desligado', 'Mudou de setor', 'Outros'], {
        errorMap: () => ({ message: 'Motivo inválido. Use: Desligado, Mudou de setor ou Outros' })
    }),
    description: zod_1.z.string()
        .min(0, 'Descrição deve ter no mínimo 5 caracteres')
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .optional()
        .refine((val) => {
        // Se motivo for "Outros", descrição é obrigatória
        return true; // Validação feita no controller
    }, { message: 'Descrição é obrigatória quando motivo for "Outros"' }),
});
// Schema para revogação de controle
exports.repRevokeControlSchema = zod_1.z.object({
    confirmRevoke: zod_1.z.boolean({
        required_error: 'Confirmação de revogação é obrigatória',
        invalid_type_error: 'confirmRevoke deve ser true ou false',
    }).refine(val => val === true, {
        message: 'Você deve confirmar a revogação do controle',
    }),
    newUserId: zod_1.z.string()
        .optional()
        .refine((val) => {
        // Se fornecido, deve ser uma string válida (não vazia)
        return !val || val.length > 0;
    }, { message: 'ID do usuário destino inválido' }),
});
// Schema para resposta de controle
exports.repResponseSchema = zod_1.z.object({
    assignmentId: zod_1.z.string().min(1, 'ID da atribuição é obrigatório'),
    maturityLevel: zod_1.z.enum(['N/A', '0', '1', '2']),
    scenarioDescription: zod_1.z.string().optional(),
    evidence: zod_1.z.string().optional(),
    observations: zod_1.z.string().optional(),
});
//# sourceMappingURL=repValidation.js.map