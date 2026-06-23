"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// backend/src/services/AuthService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = require("../models/User.js");
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
const index_js_1 = require("../types/index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const TokenService_js_1 = require("./TokenService.js");
class AuthService {
    static generateTokens(userId, email, role) {
        const payload = { id: userId, email, role };
        const accessToken = jsonwebtoken_1.default.sign(payload, env_js_1.config.JWT_SECRET, {
            expiresIn: env_js_1.config.JWT_ACCESS_EXPIRES_IN,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, env_js_1.config.JWT_REFRESH_SECRET, {
            expiresIn: env_js_1.config.JWT_REFRESH_EXPIRES_IN,
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: parseInt(env_js_1.config.JWT_ACCESS_EXPIRES_IN) * 60,
        };
    }
    static async register(userData) {
        try {
            const existingUser = await User_js_1.User.findOne({ email: userData.email }).select('_id').lean();
            if (existingUser) {
                throw new errorHandler_js_1.AppError('Email já está em uso', 400);
            }
            const user = new User_js_1.User({
                ...userData,
                role: userData.role || index_js_1.UserRole.USER,
                isActive: true,
            });
            await user.save();
            logger_js_1.logger.info(`Novo usuário registrado: ${user.email} (${user.role})`);
            return user;
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao registrar usuário:', error);
            throw new errorHandler_js_1.AppError('Erro ao registrar usuário', 500);
        }
    }
    static async login(email, password) {
        try {
            const user = await User_js_1.User.findOne({ email })
                .select('_id name email password role company department isActive refreshToken')
                .exec();
            if (!user) {
                throw new errorHandler_js_1.AuthenticationError('Email ou senha inválidos');
            }
            if (!user.isActive) {
                throw new errorHandler_js_1.AuthenticationError('Usuário inativo');
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new errorHandler_js_1.AuthenticationError('Email ou senha inválidos');
            }
            user.lastLogin = new Date();
            await user.save();
            const tokens = AuthService.generateTokens(user._id.toString(), user.email, user.role);
            user.refreshToken = tokens.refreshToken;
            await user.save();
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                company: user.company,
                department: user.department,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin,
                passwordChangedAt: user.passwordChangedAt,
            };
            return { user: userResponse, tokens };
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao fazer login:', error);
            throw new errorHandler_js_1.AppError('Erro ao fazer login', 500);
        }
    }
    static async refreshToken(refreshToken) {
        try {
            if (TokenService_js_1.TokenService.isTokenRevoked(refreshToken)) {
                throw new errorHandler_js_1.AuthenticationError('Refresh token revogado');
            }
            const decoded = TokenService_js_1.TokenService.verifyToken(refreshToken, env_js_1.config.JWT_REFRESH_SECRET);
            const user = await User_js_1.User.findById(decoded.id)
                .select('_id email role refreshToken isActive')
                .exec();
            if (!user || !user.isActive) {
                throw new errorHandler_js_1.AuthenticationError('Usuário inválido ou inativo');
            }
            if (user.refreshToken !== refreshToken) {
                throw new errorHandler_js_1.AuthenticationError('Refresh token inválido');
            }
            await TokenService_js_1.TokenService.revokeToken(refreshToken, 'Refresh token rotation');
            const tokens = AuthService.generateTokens(user._id.toString(), user.email, user.role);
            user.refreshToken = tokens.refreshToken;
            await user.save();
            return tokens;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errorHandler_js_1.AuthenticationError('Refresh token inválido');
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errorHandler_js_1.AuthenticationError('Refresh token expirado');
            }
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao renovar token:', error);
            throw new errorHandler_js_1.AppError('Erro ao renovar token', 500);
        }
    }
    static async logout(userId) {
        try {
            const user = await User_js_1.User.findById(userId);
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
            }
            await TokenService_js_1.TokenService.revokeAllUserTokens(userId);
            user.refreshToken = undefined;
            await user.save();
            logger_js_1.logger.info(`Usuário deslogado com revogação de tokens: ${user.email}`);
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao fazer logout:', error);
            throw new errorHandler_js_1.AppError('Erro ao fazer logout', 500);
        }
    }
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User_js_1.User.findById(userId).select('+password');
            if (!user) {
                throw new errorHandler_js_1.AppError('Usuário não encontrado', 404);
            }
            const isPasswordValid = await user.comparePassword(currentPassword);
            if (!isPasswordValid) {
                throw new errorHandler_js_1.AppError('Senha atual incorreta', 400);
            }
            user.password = newPassword;
            await user.save();
            user.refreshToken = undefined;
            await user.save();
            logger_js_1.logger.info(`Senha alterada para: ${user.email}`);
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao alterar senha:', error);
            throw new errorHandler_js_1.AppError('Erro ao alterar senha', 500);
        }
    }
    static async getUserById(userId) {
        return User_js_1.User.findById(userId)
            .select('_id name email role company department isActive lastLogin')
            .lean()
            .exec();
    }
    static async getUserByEmail(email) {
        return User_js_1.User.findOne({ email })
            .select('_id name email role company department isActive lastLogin')
            .lean()
            .exec();
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map