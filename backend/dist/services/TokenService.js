"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
// backend/src/services/TokenService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
const tokenBlacklist = new Map();
class TokenService {
    static generateAccessToken(userId, email, role) {
        const payload = { id: userId, email, role };
        return jsonwebtoken_1.default.sign(payload, env_js_1.config.JWT_SECRET, {
            expiresIn: env_js_1.config.JWT_ACCESS_EXPIRES_IN,
            algorithm: 'HS256',
        });
    }
    static generateRefreshToken(userId, email, role) {
        const payload = { id: userId, email, role };
        return jsonwebtoken_1.default.sign(payload, env_js_1.config.JWT_REFRESH_SECRET, {
            expiresIn: env_js_1.config.JWT_REFRESH_EXPIRES_IN,
            algorithm: 'HS256',
        });
    }
    static verifyToken(token, secret) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    static async revokeToken(token, reason = 'Manual revocation') {
        try {
            tokenBlacklist.set(token, {
                revokedAt: new Date(),
                reason,
            });
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            for (const [key, value] of tokenBlacklist) {
                if (value.revokedAt < sevenDaysAgo) {
                    tokenBlacklist.delete(key);
                }
            }
            logger_js_1.logger.info(`Token revogado: ${reason}`);
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao revogar token:', error);
            throw error;
        }
    }
    static isTokenRevoked(token) {
        return tokenBlacklist.has(token);
    }
    static async revokeAllUserTokens(userId) {
        for (const [key] of tokenBlacklist) {
            try {
                const decoded = jsonwebtoken_1.default.decode(key);
                if (decoded && decoded.id === userId) {
                    tokenBlacklist.delete(key);
                }
            }
            catch (error) {
                // Ignorar erros de decodificação
            }
        }
        logger_js_1.logger.info(`Todos os tokens do usuário ${userId} foram revogados`);
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=TokenService.js.map