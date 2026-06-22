// backend/src/middleware/sanitize.ts
import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../utils/validation.js';

/**
 * Middleware global para sanitizar todos os inputs
 * Previne NoSQL Injection e ataques de injeção
 */
export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  next();
}

export function sanitizeQueryParams(req: Request, res: Response, next: NextFunction): void {
  if (req.query && typeof req.query === 'object') {
    // req.query é imutável, então criamos um novo objeto
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(req.query)) {
      sanitized[key] = sanitizeInput(value);
    }
    req.query = sanitized as any;
  }
  next();
}

export function sanitizeUrlParams(req: Request, res: Response, next: NextFunction): void {
  if (req.params && typeof req.params === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(req.params)) {
      sanitized[key] = sanitizeInput(value);
    }
    req.params = sanitized as any;
  }
  next();
}

// Middleware combinado
export function sanitizeAll(req: Request, res: Response, next: NextFunction): void {
  sanitizeRequestBody(req, res, () => {
    sanitizeQueryParams(req, res, () => {
      sanitizeUrlParams(req, res, next);
    });
  });
}