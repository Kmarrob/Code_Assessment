import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { IJWTPayload, AuthenticatedRequest, UserRole } from '../types/index.js';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.split(' ')[1] as string;
    
    const decoded = jwt.verify(token, config.JWT_SECRET) as IJWTPayload;
    
    const user = await User.findById(decoded.userId).select('+refreshToken');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Usuário inativo',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).userId = user._id.toString();
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno na autenticação',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado: permissão insuficiente',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

export function authorizeSelfOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = (req as AuthenticatedRequest).user;
  const targetUserId = req.params.id;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (user.role === UserRole.ADMIN || user._id.toString() === targetUserId) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'Acesso negado: você só pode acessar seus próprios dados',
    statusCode: 403,
    timestamp: new Date().toISOString(),
  });
}
