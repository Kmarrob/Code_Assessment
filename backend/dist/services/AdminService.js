"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
// backend/src/services/AdminService.ts
const mongoose_1 = require("mongoose");
const User_js_1 = require("../models/User.js");
const logger_js_1 = require("../utils/logger.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const index_js_1 = require("../types/index.js");
const retry_js_1 = require("../utils/retry.js");
const circuitBreaker_js_1 = require("../utils/circuitBreaker.js");
const timeout_js_1 = require("../middleware/timeout.js");
class AdminService {
    static async listUsers(filters = {}, page = 1, limit = 10) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const filter = {};
                        if (filters.role)
                            filter.role = filters.role;
                        if (filters.isActive !== undefined)
                            filter.isActive = filters.isActive;
                        if (filters.company) {
                            filter.company = { $regex: filters.company, $options: 'i' };
                        }
                        if (filters.department) {
                            filter.department = { $regex: filters.department, $options: 'i' };
                        }
                        if (filters.search) {
                            filter.$or = [
                                { name: { $regex: filters.search, $options: 'i' } },
                                { email: { $regex: filters.search, $options: 'i' } },
                            ];
                        }
                        const skip = (page - 1) * limit;
                        const [users, total] = await Promise.all([
                            User_js_1.User.find(filter)
                                .select('_id name email role company department isActive lastLoginAt createdAt')
                                .lean()
                                .skip(skip)
                                .limit(limit)
                                .sort({ createdAt: -1 })
                                .hint({ role: 1, isActive: 1, createdAt: -1 }),
                            User_js_1.User.countDocuments(filter),
                        ]);
                        const totalPages = Math.ceil(total / limit);
                        return {
                            users: users,
                            total,
                            totalPages,
                        };
                    }, 'AdminService.listUsers');
                }, 'AdminService.listUsers');
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao listar usuários:', error);
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            throw new errorHandler_js_1.AppError('Erro ao listar usuários. Tente novamente mais tarde.', 500);
        }
    }
    static async getUserById(userId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                            throw new errorHandler_js_1.AppError('ID de usuário inválido', 400);
                        }
                        const user = await User_js_1.User.findById(userId)
                            .select('_id name email role company department isActive lastLoginAt createdAt')
                            .lean()
                            .exec();
                        if (!user) {
                            throw new errorHandler_js_1.NotFoundError('Usuário', userId);
                        }
                        return user;
                    }, 'AdminService.getUserById');
                }, 'AdminService.getUserById');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao buscar usuário:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar usuário. Tente novamente mais tarde.', 500);
        }
    }
    static async createUser(data) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const existingUser = await User_js_1.User.findOne({ email: data.email });
                        if (existingUser) {
                            throw new errorHandler_js_1.AppError('Email já está em uso', 400);
                        }
                        const user = new User_js_1.User({
                            name: data.name,
                            email: data.email,
                            password: data.password,
                            role: data.role || index_js_1.UserRole.USER,
                            company: data.company,
                            department: data.department,
                            isActive: true,
                        });
                        await user.save();
                        logger_js_1.logger.info(`Usuário criado pelo admin: ${user.email} (${user.role})`);
                        return user.toJSON();
                    }, 'AdminService.createUser');
                }, 'AdminService.createUser');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao criar usuário:', error);
            throw new errorHandler_js_1.AppError('Erro ao criar usuário. Tente novamente mais tarde.', 500);
        }
    }
    static async updateUser(userId, data) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                            throw new errorHandler_js_1.AppError('ID de usuário inválido', 400);
                        }
                        const user = await User_js_1.User.findById(userId);
                        if (!user) {
                            throw new errorHandler_js_1.NotFoundError('Usuário', userId);
                        }
                        if (data.email && data.email !== user.email) {
                            const existingUser = await User_js_1.User.findOne({ email: data.email });
                            if (existingUser) {
                                throw new errorHandler_js_1.AppError('Email já está em uso', 400);
                            }
                            user.email = data.email;
                        }
                        if (data.name)
                            user.name = data.name;
                        if (data.role)
                            user.role = data.role;
                        if (data.company !== undefined)
                            user.company = data.company;
                        if (data.department !== undefined)
                            user.department = data.department;
                        if (data.isActive !== undefined)
                            user.isActive = data.isActive;
                        await user.save();
                        logger_js_1.logger.info(`Usuário atualizado pelo admin: ${user.email}`);
                        return user.toJSON();
                    }, 'AdminService.updateUser');
                }, 'AdminService.updateUser');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao atualizar usuário:', error);
            throw new errorHandler_js_1.AppError('Erro ao atualizar usuário. Tente novamente mais tarde.', 500);
        }
    }
    static async deleteUser(userId) {
        try {
            await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                await (0, retry_js_1.retryDatabase)(async () => {
                    await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                            throw new errorHandler_js_1.AppError('ID de usuário inválido', 400);
                        }
                        const user = await User_js_1.User.findById(userId);
                        if (!user) {
                            throw new errorHandler_js_1.NotFoundError('Usuário', userId);
                        }
                        user.isActive = false;
                        await user.save();
                        logger_js_1.logger.info(`Usuário desativado pelo admin: ${user.email}`);
                    }, 'AdminService.deleteUser');
                }, 'AdminService.deleteUser');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao desativar usuário:', error);
            throw new errorHandler_js_1.AppError('Erro ao desativar usuário. Tente novamente mais tarde.', 500);
        }
    }
    static async reactivateUser(userId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                            throw new errorHandler_js_1.AppError('ID de usuário inválido', 400);
                        }
                        const user = await User_js_1.User.findById(userId);
                        if (!user) {
                            throw new errorHandler_js_1.NotFoundError('Usuário', userId);
                        }
                        user.isActive = true;
                        await user.save();
                        logger_js_1.logger.info(`Usuário reativado pelo admin: ${user.email}`);
                        return user.toJSON();
                    }, 'AdminService.reactivateUser');
                }, 'AdminService.reactivateUser');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao reativar usuário:', error);
            throw new errorHandler_js_1.AppError('Erro ao reativar usuário. Tente novamente mais tarde.', 500);
        }
    }
    static async resetPassword(userId, newPassword) {
        try {
            await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                await (0, retry_js_1.retryDatabase)(async () => {
                    await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                            throw new errorHandler_js_1.AppError('ID de usuário inválido', 400);
                        }
                        const user = await User_js_1.User.findById(userId);
                        if (!user) {
                            throw new errorHandler_js_1.NotFoundError('Usuário', userId);
                        }
                        user.password = newPassword;
                        await user.save();
                        logger_js_1.logger.info(`Senha resetada pelo admin para: ${user.email}`);
                    }, 'AdminService.resetPassword');
                }, 'AdminService.resetPassword');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao resetar senha:', error);
            throw new errorHandler_js_1.AppError('Erro ao resetar senha. Tente novamente mais tarde.', 500);
        }
    }
    static async getDashboardStats() {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const startOfMonth = new Date();
                        startOfMonth.setDate(1);
                        startOfMonth.setHours(0, 0, 0, 0);
                        const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
                            User_js_1.User.countDocuments({}),
                            User_js_1.User.countDocuments({ isActive: true }),
                            User_js_1.User.countDocuments({ createdAt: { $gte: startOfMonth } }),
                        ]);
                        return {
                            totalUsers,
                            activeUsers,
                            newUsersThisMonth,
                        };
                    }, 'AdminService.getDashboardStats');
                }, 'AdminService.getDashboardStats');
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao obter estatísticas:', error);
            throw new errorHandler_js_1.AppError('Erro ao obter estatísticas. Tente novamente mais tarde.', 500);
        }
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=AdminService.js.map