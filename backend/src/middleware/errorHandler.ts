// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { SecurityLogger, SecurityEventType } from '../utils/securityLogger.js';
import mongoose from 'mongoose';

// ============================================
// ERROS PERSONALIZADOS
// ============================================

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: Record<string, string[]>;
  public code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: Record<string, string[]>,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  // Mantido o overload original
  constructor(errors: Record<string, string[]> | string) {
    if (typeof errors === 'string') {
      super(errors, 400, true, undefined, 'VALIDATION_ERROR');
    } else {
      super('Erro de validação', 400, true, errors, 'VALIDATION_ERROR');
    }
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Usuário não autenticado') {
    super(message, 401, true, undefined, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, true, undefined, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} com ID ${id} não encontrado`
      : `${resource} não encontrado`;
    super(message, 404, true, undefined, 'NOT_FOUND_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erro no banco de dados') {
    super(message, 500, true, undefined, 'DATABASE_ERROR');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Serviço indisponível') {
    super(message, 503, true, undefined, 'SERVICE_UNAVAILABLE');
  }
}

// ============================================
// MAPEAMENTO DE ERROS
// ============================================

function mapMongoDBError(error: any): AppError {
  if (error instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(error.errors)) {
      errors[key] = [(value as any).message];
    }
    return new ValidationError(errors);
  }

  if (error instanceof mongoose.Error.CastError) {
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

function mapJWTError(error: any): AppError {
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

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction  // Mantido para compatibilidade
): void {
  let error = err as AppError;
  
  // Mapear erros específicos
  if (err instanceof mongoose.Error) {
    error = mapMongoDBError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = mapJWTError(err);
  } else if (!(err instanceof AppError)) {
    error = new AppError(
      err.message || 'Erro interno do servidor',
      500,
      false,
      undefined,
      'UNKNOWN_ERROR'
    );
  }

  // Log detalhado
  const logData = {
    eventType: 'ERROR',
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    stack: config.NODE_ENV !== 'production' ? error.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).userId,
    userAgent: req.headers['user-agent'],
    body: config.NODE_ENV !== 'production' ? req.body : undefined,
    query: config.NODE_ENV !== 'production' ? req.query : undefined,
    params: config.NODE_ENV !== 'production' ? req.params : undefined,
  };

  // Log de erro de segurança
  if (error.statusCode === 401 || error.statusCode === 403) {
    // Usando o enum correto ou fallback para string
    const eventType = error.statusCode === 401 
      ? (SecurityEventType.LOGIN_FAILED || 'LOGIN_FAILED' as SecurityEventType)
      : (SecurityEventType.ACCESS_DENIED || 'ACCESS_DENIED' as SecurityEventType);
    
    SecurityLogger.log({
      eventType: eventType,
      timestamp: new Date(),
      userId: (req as any).userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      success: false,
      message: error.message,
      details: { statusCode: error.statusCode, code: error.code },
    });
  }

  if (error.isOperational) {
    logger.warn(`[OPERATIONAL ERROR] ${error.message}`, logData);
  } else {
    logger.error(`[CRITICAL ERROR] ${error.message}`, logData);
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
    ...(config.NODE_ENV !== 'production' && {
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

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(
    `Rota ${req.method} ${req.path} não encontrada`,
    404,
    true,
    undefined,
    'ROUTE_NOT_FOUND'
  );
  next(error);
}