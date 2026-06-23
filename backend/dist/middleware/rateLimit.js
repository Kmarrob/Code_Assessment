"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRateLimiter = exports.sensitiveRateLimiter = exports.healthRateLimiter = exports.publicRateLimiter = exports.authenticatedRateLimiter = exports.refreshRateLimiter = exports.registerRateLimiter = exports.authRateLimiter = void 0;
exports.createRateLimiter = createRateLimiter;
// backend/src/middleware/rateLimit.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (_req) => env_js_1.config.NODE_ENV === 'test',
    handler: (req, res) => {
        logger_js_1.logger.warn(`Rate limit exceeded for IP: ${req.ip} - Login attempt`);
        res.status(429).json({
            success: false,
            message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
            statusCode: 429,
            timestamp: new Date().toISOString(),
        });
    },
});
exports.registerRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_js_1.logger.warn(`Rate limit exceeded for IP: ${req.ip} - Registration attempt`);
        res.status(429).json({
            success: false,
            message: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
            statusCode: 429,
            timestamp: new Date().toISOString(),
        });
    },
});
exports.refreshRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Muitas tentativas de refresh. Tente novamente em 15 minutos.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authenticatedRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Muitas requisições. Tente novamente em 1 minuto.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return env_js_1.config.NODE_ENV === 'development' && req.user?.role === 'admin';
    },
    handler: (req, res) => {
        logger_js_1.logger.warn(`Rate limit exceeded for authenticated user: ${req.user?.email || req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Muitas requisições. Tente novamente em 1 minuto.',
            statusCode: 429,
            timestamp: new Date().toISOString(),
        });
    },
});
exports.publicRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 50,
    message: {
        success: false,
        message: 'Muitas requisições. Tente novamente em 1 minuto.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.healthRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 1000,
    message: {
        success: false,
        message: 'Muitas requisições de health check.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => true,
});
exports.sensitiveRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Muitas tentativas em operações sensíveis. Tente novamente em 1 hora.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.adminRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Muitas tentativas de operações. Tente novamente em 1 minuto.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_js_1.logger.warn(`Rate limit exceeded for admin operation: ${req.user?.email || req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Muitas tentativas de operações. Tente novamente em 1 minuto.',
            statusCode: 429,
            timestamp: new Date().toISOString(),
        });
    },
});
function createRateLimiter(options) {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs || 60 * 1000,
        max: options.max || 100,
        message: {
            success: false,
            message: options.message || 'Muitas requisições. Tente novamente mais tarde.',
            statusCode: 429,
            timestamp: new Date().toISOString(),
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: options.skip,
        handler: (req, res) => {
            logger_js_1.logger.warn(`Rate limit exceeded: ${req.ip}`);
            res.status(429).json({
                success: false,
                message: options.message || 'Muitas requisições. Tente novamente mais tarde.',
                statusCode: 429,
                timestamp: new Date().toISOString(),
            });
        },
    });
}
//# sourceMappingURL=rateLimit.js.map