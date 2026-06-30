// backend/src/utils/errors.ts

/**
 * Classe base para erros da aplicação
 * Permite diferenciar erros operacionais de erros de programação
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, details?: any) {
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

/**
 * Erro de validação (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, details);
    this.name = 'ValidationError';
  }
}

/**
 * Erro de não autorizado (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401, true);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Erro de proibido (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso proibido') {
    super(message, 403, true);
    this.name = 'ForbiddenError';
  }
}

/**
 * Erro de não encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, true);
    this.name = 'NotFoundError';
  }
}

/**
 * Erro de conflito (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, true, details);
    this.name = 'ConflictError';
  }
}

/**
 * Erro de requisição inválida (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, details);
    this.name = 'BadRequestError';
  }
}

/**
 * Erro interno do servidor (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Erro interno do servidor', details?: any) {
    super(message, 500, false, details);
    this.name = 'InternalServerError';
  }
}

/**
 * Função para tratar erros de forma padronizada
 */
export const handleError = (error: any): AppError => {
  // Se já for um AppError, retorna ele mesmo
  if (error instanceof AppError) {
    return error;
  }

  // Erros do Mongoose (validação)
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors || {}).map((err: any) => err.message);
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