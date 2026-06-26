// backend/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

// ============================================
// CORREÇÃO: Função auxiliar para verificar se é admin
// ============================================
function isAdmin(req: any): boolean {
  return req.user && req.user.role === 'admin';
}

// ============================================
// MIDDLEWARES DE RATE LIMIT
// ============================================

export const authRateLimiter = rateLimit({
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
  skip: (_req) => config.NODE_ENV === 'test',
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} - Login attempt`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
});

export const registerRateLimiter = rateLimit({
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
    logger.warn(`Rate limit exceeded for IP: ${req.ip} - Registration attempt`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
});

export const refreshRateLimiter = rateLimit({
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

// ============================================
// CORREÇÃO: authenticatedRateLimiter com isenção para admin
// ============================================

export const authenticatedRateLimiter = rateLimit({
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
    // CORREÇÃO: Admin tem acesso ilimitado
    if (isAdmin(req)) {
      return true;
    }
    // Desenvolvimento também pode ser ignorado
    return config.NODE_ENV === 'development';
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for authenticated user: ${(req as any).user?.email || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente em 1 minuto.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
});

export const publicRateLimiter = rateLimit({
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

export const healthRateLimiter = rateLimit({
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

export const sensitiveRateLimiter = rateLimit({
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

// ============================================
// CORREÇÃO: adminRateLimiter com isenção total para admin
// ============================================

export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => {
    // CORREÇÃO: Admin não tem limite
    if (isAdmin(req)) {
      return Infinity;
    }
    return 100;
  },
  message: {
    success: false,
    message: 'Muitas tentativas de operações. Tente novamente em 1 minuto.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // CORREÇÃO: Pular rate limit para admin
    if (isAdmin(req)) {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for admin operation: ${(req as any).user?.email || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de operações. Tente novamente em 1 minuto.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
});

export function createRateLimiter(options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skip?: (req: any) => boolean;
}) {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: (req) => {
      // CORREÇÃO: Se for admin e não tiver skip específico, permitir ilimitado
      if (isAdmin(req) && !options.skip) {
        return Infinity;
      }
      return options.max || 100;
    },
    message: {
      success: false,
      message: options.message || 'Muitas requisições. Tente novamente mais tarde.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // CORREÇÃO: Admin sempre pula o rate limit
      if (isAdmin(req)) {
        return true;
      }
      return options.skip ? options.skip(req) : false;
    },
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: options.message || 'Muitas requisições. Tente novamente mais tarde.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      });
    },
  });
}