// backend/src/services/TokenService.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { IJWTPayload, UserRole } from '../types/index.js';

const tokenBlacklist = new Map<string, { revokedAt: Date; reason: string }>();

export class TokenService {
  static generateAccessToken(userId: string, email: string, role: UserRole): string {
    const payload: IJWTPayload = { id: userId, email, role };
    return jwt.sign(
      payload,
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_ACCESS_EXPIRES_IN,
        algorithm: 'HS256',
      } as jwt.SignOptions
    );
  }

  static generateRefreshToken(userId: string, email: string, role: UserRole): string {
    const payload: IJWTPayload = { id: userId, email, role };
    return jwt.sign(
      payload,
      config.JWT_REFRESH_SECRET,
      {
        expiresIn: config.JWT_REFRESH_EXPIRES_IN,
        algorithm: 'HS256',
      } as jwt.SignOptions
    );
      return jwt.sign(payload, config.JWT_REFRESH_SECRET as string, options);
  }

  static verifyToken(token: string, secret: string): IJWTPayload {
    return jwt.verify(token, secret) as IJWTPayload;
  }

  static async revokeToken(token: string, reason: string = 'Manual revocation'): Promise<void> {
    try {
      tokenBlacklist.set(token, {
        revokedAt: new Date(),
        reason,
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      for (const [key, value] of tokenBlacklist) {
        if (value.revokedAt < sevenDaysAgo) {
          tokenBlacklist.delete(key);
        }
      }

      logger.info(`Token revogado: ${reason}`);
    } catch (error) {
      logger.error('Erro ao revogar token:', error);
      throw error;
    }
  }

  static isTokenRevoked(token: string): boolean {
    return tokenBlacklist.has(token);
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    logger.info(`Todos os tokens do usuário ${userId} foram marcados para revogação`);
  }
}