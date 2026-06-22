"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeAdminInputs = sanitizeAdminInputs;
exports.sanitizeSensitiveFields = sanitizeSensitiveFields;
const validation_js_1 = require("../utils/validation.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Middleware para sanitizar inputs das rotas admin
 * Previne NoSQL Injection e ataques de injeção
 */
function sanitizeAdminInputs(req, res, next) {
    try {
        if (req.body && typeof req.body === 'object') {
            req.body = (0, validation_js_1.sanitizeInput)(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(req.query)) {
                sanitized[key] = (0, validation_js_1.sanitizeInput)(value);
            }
            req.query = sanitized;
        }
        if (req.params && typeof req.params === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(req.params)) {
                sanitized[key] = (0, validation_js_1.sanitizeInput)(value);
            }
            req.params = sanitized;
        }
        next();
    }
    catch (error) {
        logger_js_1.logger.error('Erro na sanitização de inputs admin:', error);
        next(error);
    }
}
/**
 * Middleware específico para sanitizar apenas campos sensíveis
 */
function sanitizeSensitiveFields(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        const sensitiveFields = ['name', 'email', 'company', 'department', 'search'];
        for (const field of sensitiveFields) {
            if (req.body[field] && typeof req.body[field] === 'string') {
                req.body[field] = (0, validation_js_1.sanitizeInput)(req.body[field]);
            }
        }
    }
    next();
}
//# sourceMappingURL=sanitizeAdmin.js.map