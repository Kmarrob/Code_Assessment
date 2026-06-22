// backend/src/middleware/timeout.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { AppError } from './errorHandler.js';

export interface TimeoutConfig {
  defaultTimeout: number;
  routeOverrides?: Record<string, number>;
}

const defaultConfig: TimeoutConfig = {
  defaultTimeout: 30000,
  routeOverrides: {
    '/api/auth/login': 10000,
    '/api/auth/register': 15000,
    '/api/auth/refresh-token': 5000,
    '/api/auth/profile': 10000,
  },
};

export function timeoutMiddleware(
  config: TimeoutConfig = defaultConfig
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let timeoutMs = config.defaultTimeout;
    
    for (const [route, timeout] of Object.entries(config.routeOverrides || {})) {
      if (req.path.startsWith(route)) {
        timeoutMs = timeout;
        break;
      }
    }

    const timeout = setTimeout(() => {
      const error = new AppError(
        `Request timeout after ${timeoutMs}ms`,
        408,
        true,
        undefined,
        'REQUEST_TIMEOUT'
      );
      
      logger.warn(`Timeout em ${req.method} ${req.path} (${timeoutMs}ms)`);
      
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: error.message,
          statusCode: 408,
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }
      
      next(error);
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
}

export function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  context: string = 'operation'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new AppError(
        `Operation ${context} timed out after ${timeoutMs}ms`,
        408,
        true,
        undefined,
        'OPERATION_TIMEOUT'
      ));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

export function withDbTimeout<T>(
  fn: () => Promise<T>,
  context: string = 'database'
): Promise<T> {
  return withTimeout(fn, 15000, context);
}

export function withHttpTimeout<T>(
  fn: () => Promise<T>,
  context: string = 'http'
): Promise<T> {
  return withTimeout(fn, 10000, context);
}
