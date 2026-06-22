// backend/src/middleware/sanitizeAdmin.ts
import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../utils/validation.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware para sanitizar inputs das rotas admin
 * Previne NoSQL Injection e ataques de injeção
 */
export function sanitizeAdminInputs(req: Request, res: Response, next: NextFunction): void {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeInput(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(req.query)) {
        sanitized[key] = sanitizeInput(value);
      }
      req.query = sanitized as any;
    }

    if (req.params && typeof req.params === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(req.params)) {
        sanitized[key] = sanitizeInput(value);
      }
      req.params = sanitized as any;
    }

    next();
  } catch (error) {
    logger.error('Erro na sanitização de inputs admin:', error);
    next(error);
  }
}

/**
 * Middleware específico para sanitizar apenas campos sensíveis
 */
export function sanitizeSensitiveFields(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    const sensitiveFields = ['name', 'email', 'company', 'department', 'search'];
    
    for (const field of sensitiveFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeInput(req.body[field]);
      }
    }
  }
  next();
}