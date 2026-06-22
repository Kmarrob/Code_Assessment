"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableError = exports.DatabaseError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const logger_js_1 = require("../utils/logger.js");
const env_js_1 = require("../config/env.js");
const securityLogger_js_1 = require("../utils/securityLogger.js");
const mongoose_1 = __importDefault(require("mongoose"));
// ============================================
// ERROS PERSONALIZADOS
// ============================================
class AppError extends Error {
    statusCode;
    isOperational;
    errors;
    code;
    constructor(message, statusCode = 500, isOperational = true, errors, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    // Mantido o overload original
    constructor(errors) {
        if (typeof errors === 'string') {
            super(errors, 400, true, undefined, 'VALIDATION_ERROR');
        }
        else {
            super('Erro de validação', 400, true, errors, 'VALIDATION_ERROR');
        }
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Usuário não autenticado') {
        super(message, 401, true, undefined, 'AUTHENTICATION_ERROR');
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Acesso negado') {
        super(message, 403, true, undefined, 'AUTHORIZATION_ERROR');
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(resource, id) {
        const message = id
            ? `${resource} com ID ${id} não encontrado`
            : `${resource} não encontrado`;
        super(message, 404, true, undefined, 'NOT_FOUND_ERROR');
    }
}
exports.NotFoundError = NotFoundError;
class DatabaseError extends AppError {
    constructor(message = 'Erro no banco de dados') {
        super(message, 500, true, undefined, 'DATABASE_ERROR');
    }
}
exports.DatabaseError = DatabaseError;
class ServiceUnavailableError extends AppError {
    constructor(message = 'Serviço indisponível') {
        super(message, 503, true, undefined, 'SERVICE_UNAVAILABLE');
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
// ============================================
// MAPEAMENTO DE ERROS
// ============================================
function mapMongoDBError(error) {
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        const errors = {};
        for (const [key, value] of Object.entries(error.errors)) {
            errors[key] = [value.message];
        }
        return new ValidationError(errors);
    }
    if (error instanceof mongoose_1.default.Error.CastError) {
        return new AppError(`ID inválido: ${error.value}`, 400, true, undefined, 'INVALID_ID');
    }
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'campo';
        return new AppError(`Valor duplicado para ${field}`, 409, true, undefined, 'DUPLICATE_KEY');
    }
    if (error.name === 'MongoNetworkError') {
        return new ServiceUnavailableError('Falha na conexão com o banco de dados');
    }
    return new DatabaseError(error.message);
}
function mapJWTError(error) {
    if (error.name === 'TokenExpiredError') {
        return new AuthenticationError('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
        return new AuthenticationError('Token inválido');
    }
    return new AuthenticationError('Erro na autenticação');
}
// ============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================
function errorHandler(err, req, res, next // Mantido para compatibilidade
) {
    let error = err;
    // Mapear erros específicos
    if (err instanceof mongoose_1.default.Error) {
        error = mapMongoDBError(err);
    }
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        error = mapJWTError(err);
    }
    else if (!(err instanceof AppError)) {
        error = new AppError(err.message || 'Erro interno do servidor', 500, false, undefined, 'UNKNOWN_ERROR');
    }
    // Log detalhado
    const logData = {
        eventType: 'ERROR',
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
        stack: env_js_1.config.NODE_ENV !== 'production' ? error.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.userId,
        userAgent: req.headers['user-agent'],
        body: env_js_1.config.NODE_ENV !== 'production' ? req.body : undefined,
        query: env_js_1.config.NODE_ENV !== 'production' ? req.query : undefined,
        params: env_js_1.config.NODE_ENV !== 'production' ? req.params : undefined,
    };
    // Log de erro de segurança
    if (error.statusCode === 401 || error.statusCode === 403) {
        // Usando o enum correto ou fallback para string
        const eventType = error.statusCode === 401
            ? (securityLogger_js_1.SecurityEventType.LOGIN_FAILED || 'LOGIN_FAILED')
            : (securityLogger_js_1.SecurityEventType.ACCESS_DENIED || 'ACCESS_DENIED');
        securityLogger_js_1.SecurityLogger.log({
            eventType: eventType,
            timestamp: new Date(),
            userId: req.userId,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            success: false,
            message: error.message,
            details: { statusCode: error.statusCode, code: error.code },
        });
    }
    if (error.isOperational) {
        logger_js_1.logger.warn(`[OPERATIONAL ERROR] ${error.message}`, logData);
    }
    else {
        logger_js_1.logger.error(`[CRITICAL ERROR] ${error.message}`, logData);
    }
    // Resposta
    const response = {
        success: false,
        message: error.message,
        errors: error.errors,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
        path: req.path,
        ...(env_js_1.config.NODE_ENV !== 'production' && {
            stack: error.stack,
        }),
    };
    res.status(error.statusCode).json(response);
    // Chamar next para garantir que o fluxo continue (se necessário)
    // Em alguns frameworks, é necessário chamar next para erros não tratados
    // Mantido para compatibilidade
    if (next) {
        next();
    }
}
// ============================================
// MIDDLEWARE DE ROTAS NÃO ENCONTRADAS
// ============================================
function notFoundHandler(req, res, next) {
    const error = new AppError(`Rota ${req.method} ${req.path} não encontrada`, 404, true, undefined, 'ROUTE_NOT_FOUND');
    next(error);
}
//# sourceMappingURL=errorHandler.js.map