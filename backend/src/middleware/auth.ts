import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { IJWTPayload, AuthenticatedRequest, UserRole } from '../types/index.js';

// 🆕 NOVO (v40) - Importar Company para buscar o plano
import { Company } from '../models/Company.js';

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
    
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
    // 🔧 CORREÇÃO RESILIENTE: Suporta 'id', 'userId' ou '_id' no payload do JWT
    const targetUserId = decoded.id || decoded.userId || decoded._id;

    if (!targetUserId) {
      res.status(401).json({
        success: false,
        message: 'Payload do token inválido',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const user = await User.findById(targetUserId).select('+refreshToken');
    
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

    // 🆕 NOVO (v40) - Buscar o plano da empresa do usuário
    let plan = 'basic';
    if (user.companyId) {
      try {
        const company = await Company.findById(user.companyId);
        if (company) {
          plan = company.plan || 'basic';
        }
      } catch (error) {
        logger.warn(`⚠️ Não foi possível buscar plano para empresa ${user.companyId}:`, error);
      }
    }

    // 🆕 CORREÇÃO (v41.1) - Adicionar 'id' explicitamente ao objeto user
    // para garantir que o campo id esteja disponível em todo o sistema
    (req as AuthenticatedRequest).user = {
      ...user.toObject(),
      id: user._id.toString(),  // 🔧 CORREÇÃO: Mapear _id para id
      plan: plan,
    } as any;
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

    // 🔴 CORREÇÃO RESILIENTE: Garante que "rep", "REP", "admin" e "ADMIN" correspondam perfeitamente
    const userRoleLower = user.role ? user.role.toLowerCase() : '';
    const isAllowed = allowedRoles.some(role => role && role.toLowerCase() === userRoleLower);

    if (!isAllowed) {
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

  const userRoleLower = user.role ? user.role.toLowerCase() : '';
  if (userRoleLower === 'admin' || user._id.toString() === targetUserId) {
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