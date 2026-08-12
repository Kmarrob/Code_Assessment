"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_js_1 = require("../services/AuthService.js");
const validation_js_1 = require("../utils/validation.js");
const User_js_1 = require("../models/User.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
const AuditService_js_1 = require("../services/AuditService.js");
class AuthController {
    static async register(req, res, next) {
        try {
            const validation = (0, validation_js_1.validate)(validation_js_1.registerSchema, req.body);
            if (!validation.success) {
                throw new errorHandler_js_1.ValidationError(validation.errors || {});
            }
            // Garantir que role seja do tipo correto
            const userData = {
                ...validation.data,
                role: validation.data.role,
            };
            const user = await AuthService_js_1.AuthService.register(userData);
            // 🔐 AUDITORIA: Registro de Usuário com sucesso
            await AuditService_js_1.AuditService.logUserRegister(user._id?.toString() || user.id || '', user.email, user.companyId?.toString() || '', user.company || '', req, true);
            res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: { user },
                statusCode: 201,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            // 🔐 AUDITORIA: Falha no Registro de Usuário
            await AuditService_js_1.AuditService.logUserRegister('', req.body?.email || 'desconhecido', '', req.body?.company || '', req, false, error instanceof Error ? error.message : 'Erro no registro');
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const validation = (0, validation_js_1.validate)(validation_js_1.loginSchema, req.body);
            if (!validation.success) {
                throw new errorHandler_js_1.ValidationError(validation.errors || {});
            }
            const { email, password } = validation.data;
            const { user, tokens } = await AuthService_js_1.AuthService.login(email, password);
            // 🔐 AUDITORIA: Login realizado com sucesso
            await AuditService_js_1.AuditService.logLogin(user._id?.toString() || user.id || '', user.email, req, true);
            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    user,
                    tokens,
                },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            // 🔐 AUDITORIA: Falha de Login
            await AuditService_js_1.AuditService.logLogin('', req.body?.email || 'desconhecido', req, false, error instanceof Error ? error.message : 'Falha na autenticação');
            next(error);
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const validation = (0, validation_js_1.validate)(validation_js_1.refreshTokenSchema, req.body);
            if (!validation.success) {
                throw new errorHandler_js_1.ValidationError(validation.errors || {});
            }
            const tokens = await AuthService_js_1.AuthService.refreshToken(validation.data.refreshToken);
            res.json({
                success: true,
                message: 'Token renovado com sucesso',
                data: { tokens },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            await AuthService_js_1.AuthService.logout(userId);
            // 🔐 AUDITORIA: Logout realizado com sucesso
            await AuditService_js_1.AuditService.logLogout(userId, req.user?.email || 'desconhecido', req);
            res.json({
                success: true,
                message: 'Logout realizado com sucesso',
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            res.json({
                success: true,
                data: { user },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new errorHandler_js_1.AppError('Usuário não autenticado', 401);
            }
            const validation = (0, validation_js_1.validate)(validation_js_1.updateProfileSchema, req.body);
            if (!validation.success) {
                throw new errorHandler_js_1.ValidationError(validation.errors || {});
            }
            const { name, company, department, currentPassword, newPassword } = validation.data;
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
            }
            const changes = {};
            if (name && name !== user.name) {
                changes.name = { before: user.name, after: name };
                user.name = name;
            }
            if (company && company !== user.company) {
                changes.company = { before: user.company, after: company };
                user.company = company;
            }
            if (department && department !== user.department) {
                changes.department = { before: user.department, after: department };
                user.department = department;
            }
            if (currentPassword && newPassword) {
                await AuthService_js_1.AuthService.changePassword(userId, currentPassword, newPassword);
                changes.password = 'alterada';
            }
            await user.save();
            // 🔐 AUDITORIA: Atualização de perfil
            await AuditService_js_1.AuditService.logUserUpdate(userId, user.email, userId, user.email, changes, req, true);
            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                data: { user },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            // 🔐 AUDITORIA: Falha na atualização de perfil
            if (req.userId && req.user?.email) {
                await AuditService_js_1.AuditService.logUserUpdate(req.userId, req.user.email, req.userId, req.user.email, req.body, req, false, error instanceof Error ? error.message : 'Erro ao atualizar perfil');
            }
            next(error);
        }
    }
    static async listUsers(req, res, next) {
        try {
            const { page = 1, limit = 10, role, isActive, search } = req.query;
            const filter = {};
            if (role)
                filter.role = role;
            if (isActive !== undefined)
                filter.isActive = isActive === 'true';
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ];
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [users, total] = await Promise.all([
                User_js_1.User.find(filter)
                    .select('_id name email role company department isActive lastLoginAt createdAt')
                    .lean()
                    .skip(skip)
                    .limit(Number(limit))
                    .sort({ createdAt: -1 }),
                User_js_1.User.countDocuments(filter),
            ]);
            const totalPages = Math.ceil(total / Number(limit));
            res.json({
                success: true,
                data: { users },
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages,
                    hasNext: Number(page) < totalPages,
                    hasPrevious: Number(page) > 1,
                },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User_js_1.User.findById(id)
                .select('_id name email role company department isActive lastLoginAt createdAt')
                .lean();
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
            }
            res.json({
                success: true,
                data: { user },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 🔴 NOVO: Validar token de redefinição de senha
     * POST /auth/validate-reset-token
     */
    static async validateResetToken(req, res, next) {
        try {
            const { token } = req.body;
            if (!token) {
                throw new errorHandler_js_1.AppError('Token é obrigatório', 400);
            }
            // Verificar se o usuário existe com este token
            const user = await User_js_1.User.findOne({
                _id: token,
                isActive: true
            });
            if (!user) {
                throw new errorHandler_js_1.AppError('Token inválido ou usuário não encontrado', 404);
            }
            res.json({
                success: true,
                message: 'Token válido',
                data: { userId: user._id },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * 🔴 NOVO: Redefinir senha
     * POST /auth/reset-password
     */
    static async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            if (!token) {
                throw new errorHandler_js_1.AppError('Token é obrigatório', 400);
            }
            if (!newPassword) {
                throw new errorHandler_js_1.AppError('Nova senha é obrigatória', 400);
            }
            // Validar senha
            if (newPassword.length < 8) {
                throw new errorHandler_js_1.AppError('Senha deve ter no mínimo 8 caracteres', 400);
            }
            if (!/[A-Z]/.test(newPassword)) {
                throw new errorHandler_js_1.AppError('Senha deve conter pelo menos 1 letra maiúscula', 400);
            }
            if (!/[a-z]/.test(newPassword)) {
                throw new errorHandler_js_1.AppError('Senha deve conter pelo menos 1 letra minúscula', 400);
            }
            if (!/[0-9]/.test(newPassword)) {
                throw new errorHandler_js_1.AppError('Senha deve conter pelo menos 1 número', 400);
            }
            if (!/[^A-Za-z0-9]/.test(newPassword)) {
                throw new errorHandler_js_1.AppError('Senha deve conter pelo menos 1 caractere especial', 400);
            }
            // Buscar usuário pelo token (ID)
            const user = await User_js_1.User.findById(token).select('+password');
            if (!user) {
                throw new errorHandler_js_1.AppError('Token inválido ou usuário não encontrado', 404);
            }
            // 🔴 CORREÇÃO CRÍTICA: Passamos o texto plano. O userSchema.pre('save') cuidará do hash de forma única.
            user.password = newPassword;
            user.mustChangePassword = false;
            user.passwordChangedAt = new Date();
            await user.save();
            logger_js_1.logger.info(`Senha redefinida para o usuário: ${user.email}`);
            // 🔐 AUDITORIA: Redefinição de senha realizada com sucesso
            await AuditService_js_1.AuditService.logPasswordReset(user._id.toString(), user.email, user._id.toString(), user.email, req, true);
            res.json({
                success: true,
                message: 'Senha redefinida com sucesso',
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            // 🔐 AUDITORIA: Falha na redefinição de senha
            if (req.body?.token) {
                await AuditService_js_1.AuditService.logPasswordReset(req.body.token, 'desconhecido', req.body.token, 'desconhecido', req, false, error instanceof Error ? error.message : 'Erro ao redefinir senha');
            }
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map