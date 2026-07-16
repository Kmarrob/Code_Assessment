// backend/src/services/AuthService.ts
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { IJWTPayload, UserRole, IUser } from '../types/index.js';
import { AppError, AuthenticationError } from '../middleware/errorHandler.js';
import { TokenService } from './TokenService.js';
import { CompanyService } from './CompanyService.js';

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
    plan?: 'basic' | 'pro' | 'enterprise';
  }): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email: userData.email }).select('_id').lean();
      if (existingUser) {
        throw new AppError('Email já está em uso', 400);
      }

      // Se um plano foi selecionado, o plano padrão será basic
      const userPlan = userData.plan || 'basic';

      // Criar empresa se o nome foi fornecido
      let companyId = null;
      if (userData.company) {
        const planConfig = {
          maxUsers: userPlan === 'enterprise' ? 10 : userPlan === 'pro' ? 4 : 3,
        };

        const companyData = {
          name: userData.company,
          plan: userPlan,
          status: 'active',
          maxUsers: planConfig.maxUsers,
          maxControls: 93,
        };

        const company = await Company.create(companyData);
        companyId = company._id;
        logger.info(`🏢 Empresa criada: ${userData.company} (ID: ${companyId}) - Plano: ${userPlan}`);

        // 🔴 ATRIBUIR OS 93 CONTROLES AUTOMATICAMENTE
        try {
          const result = await CompanyService.assignAllControls(companyId.toString());
          logger.info(`📋 ${result.assigned} controles atribuídos à empresa ${userData.company}`);
        } catch (assignError) {
          logger.error(`❌ Erro ao atribuir controles à empresa ${userData.company}:`, assignError);
          // Não interrompe o fluxo de registro
        }
      }

      const user = new User({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        company: userData.company,
        department: userData.department,
        role: userData.role || UserRole.USER,
        isActive: true,
        companyId: companyId,
        metadata: {
          selectedPlan: userPlan,
        },
      });

      await user.save();

      logger.info(`👤 Novo usuário registrado: ${user.email} (${user.role}) - Plano: ${userPlan}`);
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

      const user = await User.findOne({ email })
        .select('+password _id name email role company companyId department isActive refreshToken passwordChangedAt')
        .exec();

      if (!user) {
        logger.warn(`❌ Usuário não encontrado: ${email}`);
        throw new AuthenticationError('Email ou senha inválidos');
      }

      if (!user.isActive) {
        logger.warn(`❌ Usuário inativo: ${email}`);
        throw new AuthenticationError('Usuário inativo');
      }

      const isPasswordValid = await user.comparePassword(password);

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
        companyId: user.companyId,
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
      .select('_id name email role company companyId department isActive lastLogin')
      .lean()
      .exec() as Promise<IUser | null>;
  }

  static async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email })
      .select('_id name email role company companyId department isActive lastLogin')
      .lean()
      .exec() as Promise<IUser | null>;
  }
}