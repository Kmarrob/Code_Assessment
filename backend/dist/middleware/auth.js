"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.authorizeSelfOrAdmin = authorizeSelfOrAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = require("../models/User.js");
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
const index_js_1 = require("../types/index.js");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Token de autenticação não fornecido',
                statusCode: 401,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.config.JWT_SECRET);
        const user = await User_js_1.User.findById(decoded.userId).select('+refreshToken');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Usuário não encontrado',
                statusCode: 401,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Usuário inativo',
                statusCode: 401,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        req.user = user;
        req.userId = user._id.toString();
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expirado',
                statusCode: 401,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Token inválido',
                statusCode: 401,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        logger_js_1.logger.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno na autenticação',
            statusCode: 500,
            timestamp: new Date().toISOString(),
        });
    }
}
function authorize(...allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Usuário não autenticado',
                statusCode: 401,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Acesso negado: permissão insuficiente',
                statusCode: 403,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        next();
    };
}
function authorizeSelfOrAdmin(req, res, next) {
    const user = req.user;
    const targetUserId = req.params.id;
    if (!user) {
        res.status(401).json({
            success: false,
            message: 'Usuário não autenticado',
            statusCode: 401,
            timestamp: new Date().toISOString(),
        });
        return;
    }
    if (user.role === index_js_1.UserRole.ADMIN || user._id.toString() === targetUserId) {
        next();
        return;
    }
    res.status(403).json({
        success: false,
        message: 'Acesso negado: você só pode acessar seus próprios dados',
        statusCode: 403,
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=auth.js.map