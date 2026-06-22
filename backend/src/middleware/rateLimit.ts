// backend/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

// ============================================
// RATE LIMITERS POR ENDPOINT
// ============================================

// 1. Login - Restrito (5 tentativas / 15 min)
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

// 2. Register - Moderado (10 tentativas / 1 hora)
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

// 3. Refresh Token - Restrito (10 tentativas / 15 min)
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

// 4. APIs Autenticadas - Médio (100 tentativas / 1 minuto)
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
    return config.NODE_ENV === 'development' && (req as any).user?.role === 'admin';
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

// 5. APIs Públicas - Leve (50 tentativas / 1 minuto)
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

// 6. Health Check - Sem limite
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

// 7. Rate Limiter para rotas sensíveis
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

// 8. Admin - AUMENTADO PARA DESENVOLVIMENTO
export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minuto (era 1 hora)
  max: 100,  // 100 tentativas (era 20)
  message: {
    success: false,
    message: 'Muitas tentativas de operações. Tente novamente em 1 minuto.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
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
    max: options.max || 100,
    message: {
      success: false,
      message: options.message || 'Muitas requisições. Tente novamente mais tarde.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: options.skip,
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