import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { IJWTPayload, UserRole, IUser } from '../types/index.js';
import { AppError, AuthenticationError } from '../middleware/errorHandler.js';
import { TokenService } from './TokenService.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  static generateTokens(userId: string, email: string, role: UserRole): AuthTokens {
    const payload: IJWTPayload = { id: userId, email, role };

    const accessToken = jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      payload,
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(config.JWT_ACCESS_EXPIRES_IN) * 60,
    };
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
    company?: string;
    department?: string;
    role?: UserRole;
  }): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email: userData.email }).select('_id').lean();
      if (existingUser) {
        throw new AppError('Email já está em uso', 400);
      }

      const user = new User({
        ...userData,
        role: userData.role || UserRole.USER,
        isActive: true,
      });

      await user.save();

      logger.info(`Novo usuário registrado: ${user.email} (${user.role})`);
      return user;

    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao registrar usuário:', error);
      throw new AppError('Erro ao registrar usuário', 500);
    }
  }

  static async login(email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    try {
      logger.info(`🔍 Tentando login para: ${email}`);

      // 🔴 CORREÇÃO CRÍTICA: Adicionado '+password' para forçar a busca do campo que está com select: false
      const user = await User.findOne({ email })
        .select('+password _id name email role company department isActive refreshToken passwordChangedAt')
        .exec();

      if (!user) {
        logger.warn(`❌ Usuário não encontrado: ${email}`);
        throw new AuthenticationError('Email ou senha inválidos');
      }

      if (!user.isActive) {
        logger.warn(`❌ Usuário inativo: ${email}`);
        throw new AuthenticationError('Usuário inativo');
      }

      logger.info(`🔍 Hash da senha no banco: ${user.password}`);

      const isPasswordValid = await user.comparePassword(password);
      logger.info(`🔍 Resultado da comparação: ${isPasswordValid}`);

      if (!isPasswordValid) {
        logger.warn(`❌ Senha inválida para: ${email}`);
        throw new AuthenticationError('Email ou senha inválidos');
      }

      user.lastLogin = new Date();
      await user.save();

      const tokens = AuthService.generateTokens(
        user._id.toString(),
        user.email,
        user.role
      );

      user.refreshToken = tokens.refreshToken;
      await user.save();

      const userResponse: IUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        company: user.company,
        department: user.department,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        passwordChangedAt: user.passwordChangedAt,
      };

      logger.info(`✅ Login bem-sucedido: ${email}`);
      return { user: userResponse, tokens };

    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao fazer login:', error);
      throw new AppError('Erro ao fazer login', 500);
    }
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      if (TokenService.isTokenRevoked(refreshToken)) {
        throw new AuthenticationError('Refresh token revogado');
      }

      const decoded = TokenService.verifyToken(refreshToken, config.JWT_REFRESH_SECRET);

      const user = await User.findById(decoded.id)
        .select('_id email role refreshToken isActive')
        .exec();

      if (!user || !user.isActive) {
        throw new AuthenticationError('Usuário inválido ou inativo');
      }

      if (user.refreshToken !== refreshToken) {
        throw new AuthenticationError('Refresh token inválido');
      }

      await TokenService.revokeToken(refreshToken, 'Refresh token rotation');

      const tokens = AuthService.generateTokens(
        user._id.toString(),
        user.email,
        user.role
      );

      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Refresh token inválido');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expirado');
      }
      if (error instanceof AppError) throw error;
      logger.error('Erro ao renovar token:', error);
      throw new AppError('Erro ao renovar token', 500);
    }
  }

  static async logout(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      await TokenService.revokeAllUserTokens(userId);

      user.refreshToken = undefined;
      await user.save();

      logger.info(`Usuário deslogado com revogação de tokens: ${user.email}`);

    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao fazer logout:', error);
      throw new AppError('Erro ao fazer logout', 500);
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new AppError('Senha atual incorreta', 400);
      }

      user.password = newPassword;
      await user.save();

      user.refreshToken = undefined;
      await user.save();

      logger.info(`Senha alterada para: ${user.email}`);

    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao alterar senha:', error);
      throw new AppError('Erro ao alterar senha', 500);
    }
  }

  static async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId)
      .select('_id name email role company department isActive lastLogin')
      .lean()
      .exec() as Promise<IUser | null>;
  }

  static async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email })
      .select('_id name email role company department isActive lastLogin')
      .lean()
      .exec() as Promise<IUser | null>;
  }
}