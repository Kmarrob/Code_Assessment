/**
 * Classe base para erros da aplicação
 * Permite diferenciar erros operacionais de erros de programação
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly details?: any;
    constructor(message: string, statusCode?: number, isOperational?: boolean, details?: any);
}
/**
 * Erro de validação (400)
 */
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
/**
 * Erro de não autorizado (401)
 */
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
/**
 * Erro de proibido (403)
 */
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
/**
 * Erro de não encontrado (404)
 */
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
/**
 * Erro de conflito (409)
 */
export declare class ConflictError extends AppError {
    constructor(message: string, details?: any);
}
/**
 * Erro de requisição inválida (400)
 */
export declare class BadRequestError extends AppError {
    constructor(message: string, details?: any);
}
/**
 * Erro interno do servidor (500)
 */
export declare class InternalServerError extends AppError {
    constructor(message?: string, details?: any);
}
/**
 * Função para tratar erros de forma padronizada
 */
export declare const handleError: (error: any) => AppError;
//# sourceMappingURL=errors.d.ts.map