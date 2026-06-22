// backend/src/middleware/databaseHealth.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { AppError } from './errorHandler.js';

export async function checkDatabaseHealth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isConnected = db.getConnectionState();

    if (!isConnected) {
      logger.warn(`Database not connected, attempting reconnect for request: ${req.method} ${req.path}`);
      
      try {
        await db.connect();
        logger.info(`Database reconnected successfully for request: ${req.method} ${req.path}`);
        return next();
      } catch (reconnectError) {
        logger.error('Failed to reconnect database:', reconnectError);
        
        const isCriticalRoute = req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin');
        
        if (isCriticalRoute) {
          const error = new AppError(
            'Serviço temporariamente indisponível. Tente novamente mais tarde.',
            503,
            true,
            undefined,
            'DATABASE_UNAVAILABLE'
          );
          return next(error);
        }
        
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    logger.error('Database health check error:', error);
    next(error);
  }
}

export function withDatabaseRetry(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof Error && 
          (error.message.includes('MongoNetworkError') ||
           error.message.includes('MongoTimeoutError') ||
           error.message.includes('ECONNREFUSED'))) {
        
        logger.warn(`Database error in handler, attempting reconnect: ${error.message}`);
        
        try {
          await db.connect();
          logger.info('Database reconnected, retrying handler');
          await handler(req, res, next);
        } catch (reconnectError) {
          logger.error('Failed to reconnect after database error:', reconnectError);
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
}