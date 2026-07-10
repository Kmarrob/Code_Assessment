"use strict";
// backend/src/utils/errors.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.InternalServerError = exports.BadRequestError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
/**
 * Classe base para erros da aplicação
 * Permite diferenciar erros operacionais de erros de programação
 */
class AppError extends Error {
    statusCode;
    isOperational;
    details;
    constructor(message, statusCode = 500, isOperational = true, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        // Captura o stack trace corretamente
        Error.captureStackTrace(this, this.constructor);
        // Define o nome da classe para melhor identificação
        this.name = this.constructor.name;
    }
}
exports.AppError = AppError;
/**
 * Erro de validação (400)
 */
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, true, details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/**
 * Erro de não autorizado (401)
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Não autorizado') {
        super(message, 401, true);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * Erro de proibido (403)
 */
class ForbiddenError extends AppError {
    constructor(message = 'Acesso proibido') {
        super(message, 403, true);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * Erro de não encontrado (404)
 */
class NotFoundError extends AppError {
    constructor(message = 'Recurso não encontrado') {
        super(message, 404, true);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Erro de conflito (409)
 */
class ConflictError extends AppError {
    constructor(message, details) {
        super(message, 409, true, details);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
/**
 * Erro de requisição inválida (400)
 */
class BadRequestError extends AppError {
    constructor(message, details) {
        super(message, 400, true, details);
        this.name = 'BadRequestError';
    }
}
exports.BadRequestError = BadRequestError;
/**
 * Erro interno do servidor (500)
 */
class InternalServerError extends AppError {
    constructor(message = 'Erro interno do servidor', details) {
        super(message, 500, false, details);
        this.name = 'InternalServerError';
    }
}
exports.InternalServerError = InternalServerError;
/**
 * Função para tratar erros de forma padronizada
 */
const handleError = (error) => {
    // Se já for um AppError, retorna ele mesmo
    if (error instanceof AppError) {
        return error;
    }
    // Erros do Mongoose (validação)
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors || {}).map((err) => err.message);
        return new ValidationError(messages.join(', '), error.errors);
    }
    // Erros do Mongoose (duplicidade)
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        return new ConflictError(`O valor fornecido para "${field}" já está em uso`, error.keyValue);
    }
    // Erros do Mongoose (cast)
    if (error.name === 'CastError') {
        return new BadRequestError(`ID inválido: ${error.value}`);
    }
    // Erros JWT
    if (error.name === 'JsonWebTokenError') {
        return new UnauthorizedError('Token inválido');
    }
    if (error.name === 'TokenExpiredError') {
        return new UnauthorizedError('Token expirado');
    }
    // Erro desconhecido
    console.error('Erro não tratado:', error);
    return new InternalServerError('Ocorreu um erro inesperado', error);
};
exports.handleError = handleError;
//# sourceMappingURL=errors.js.map