"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_js_1 = require("../services/AuthService.js");
const validation_js_1 = require("../utils/validation.js");
const User_js_1 = require("../models/User.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
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
            res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: { user },
                statusCode: 201,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
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
            if (name)
                user.name = name;
            if (company)
                user.company = company;
            if (department)
                user.department = department;
            if (currentPassword && newPassword) {
                await AuthService_js_1.AuthService.changePassword(userId, currentPassword, newPassword);
            }
            await user.save();
            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                data: { user },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
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
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map