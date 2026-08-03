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
// 🆕 NOVO (v40) - Importar Company para buscar o plano
const Company_js_1 = require("../models/Company.js");
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
        // 🔧 CORREÇÃO RESILIENTE: Suporta 'id', 'userId' ou '_id' no payload do JWT
        const targetUserId = decoded.id || decoded.userId || decoded._id;
        if (!targetUserId) {
            res.status(401).json({
                success: false,
                message: 'Payload do token inválido',
                statusCode: 401,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const user = await User_js_1.User.findById(targetUserId).select('+refreshToken');
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
        // 🆕 NOVO (v40) - Buscar o plano da empresa do usuário
        let plan = 'basic';
        if (user.companyId) {
            try {
                const company = await Company_js_1.Company.findById(user.companyId);
                if (company) {
                    plan = company.plan || 'basic';
                }
            }
            catch (error) {
                logger_js_1.logger.warn(`⚠️ Não foi possível buscar plano para empresa ${user.companyId}:`, error);
            }
        }
        // 🆕 CORREÇÃO (v41.1) - Adicionar 'id' explicitamente ao objeto user
        // para garantir que o campo id esteja disponível em todo o sistema
        req.user = {
            ...user.toObject(),
            id: user._id.toString(), // 🔧 CORREÇÃO: Mapear _id para id
            plan: plan,
        };
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
        // 🔴 CORREÇÃO RESILIENTE: Garante que "rep", "REP", "admin" e "ADMIN" correspondam perfeitamente
        const userRoleLower = user.role ? user.role.toLowerCase() : '';
        const isAllowed = allowedRoles.some(role => role && role.toLowerCase() === userRoleLower);
        if (!isAllowed) {
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
    const userRoleLower = user.role ? user.role.toLowerCase() : '';
    if (userRoleLower === 'admin' || user._id.toString() === targetUserId) {
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