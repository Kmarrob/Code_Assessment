"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRequestBody = sanitizeRequestBody;
exports.sanitizeQueryParams = sanitizeQueryParams;
exports.sanitizeUrlParams = sanitizeUrlParams;
exports.sanitizeAll = sanitizeAll;
const validation_js_1 = require("../utils/validation.js");
/**
 * Middleware global para sanitizar todos os inputs
 * Previne NoSQL Injection e ataques de injeção
 */
function sanitizeRequestBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = (0, validation_js_1.sanitizeInput)(req.body);
    }
    next();
}
function sanitizeQueryParams(req, res, next) {
    if (req.query && typeof req.query === 'object') {
        // req.query é imutável, então criamos um novo objeto
        const sanitized = {};
        for (const [key, value] of Object.entries(req.query)) {
            sanitized[key] = (0, validation_js_1.sanitizeInput)(value);
        }
        req.query = sanitized;
    }
    next();
}
function sanitizeUrlParams(req, res, next) {
    if (req.params && typeof req.params === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(req.params)) {
            sanitized[key] = (0, validation_js_1.sanitizeInput)(value);
        }
        req.params = sanitized;
    }
    next();
}
// Middleware combinado
function sanitizeAll(req, res, next) {
    sanitizeRequestBody(req, res, () => {
        sanitizeQueryParams(req, res, () => {
            sanitizeUrlParams(req, res, next);
        });
    });
}
//# sourceMappingURL=sanitize.js.map