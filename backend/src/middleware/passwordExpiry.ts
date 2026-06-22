// backend/src/middleware/passwordExpiry.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

export async function checkPasswordExpiry(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;
    
    if (!user) {
      return next();
    }

    // Verificar se o método existe e se a senha expirou
    // O método needsPasswordChange está definido no schema do User
    if (typeof user.needsPasswordChange === 'function' && user.needsPasswordChange()) {
      const isPasswordChangeRoute = req.path === '/profile' && req.method === 'PUT';
      
      if (!isPasswordChangeRoute) {
        logger.warn(`Senha expirada para usuário: ${user.email}`);
        res.status(403).json({
          success: false,
          message: 'Sua senha expirou. Por favor, troque sua senha.',
          data: {
            requiresPasswordChange: true,
          },
          statusCode: 403,
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    next();
  } catch (error) {
    logger.error('Erro ao verificar expiração de senha:', error);
    next(error);
  }
}