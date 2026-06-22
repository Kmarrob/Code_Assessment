# scripts/apply-performance-part1.ps1
# Script para implementar Velocidade & Performance - Parte 1/4 (Otimização de Queries e Índices)

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
)

$ErrorActionPreference = 'Stop'

# Cores
$Colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Blue'
    Step = 'Magenta'
}

function Write-Step {
    param($Message)
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
    Write-Host "║ $Message" -ForegroundColor $Colors.Header
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Colors.Header
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Colors.Info
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - VELOCIDADE & PERFORMANCE (PILAR 5)   ║" -ForegroundColor Cyan
Write-Host "║     PARTE 1/4 - BACKEND - OTIMIZAÇÃO DE QUERIES E ÍNDICES  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: AUTH CONTROLLER COM PROJEÇÕES
# ============================================
Write-Step "PARTE 1/3: AUTH CONTROLLER COM PROJEÇÕES"

Write-Info "Atualizando AuthController.ts..."
@'
// backend/src/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';
import { logger } from '../utils/logger.js';
import { validate, registerSchema, loginSchema, refreshTokenSchema, updateProfileSchema } from '../utils/validation.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(registerSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      const user = await AuthService.register(validation.data);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: { user },
        statusCode: 201,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(loginSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      const { email, password } = validation.data;
      const { user, tokens } = await AuthService.login(email, password);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user,
          tokens,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(refreshTokenSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      const tokens = await AuthService.refreshToken(validation.data.refreshToken);

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: { tokens },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      await AuthService.logout(userId);

      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      res.json({
        success: true,
        data: { user },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const validation = validate(updateProfileSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      const { name, company, department, currentPassword, newPassword } = validation.data;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      if (name) user.name = name;
      if (company) user.company = company;
      if (department) user.department = department;

      if (currentPassword && newPassword) {
        await AuthService.changePassword(userId, currentPassword, newPassword);
      }

      await user.save();

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, role, isActive, search } = req.query;

      const filter: any = {};
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('_id name email role company department isActive lastLoginAt createdAt')
          .lean()
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      res.json({
        success: true,
        data: { users },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrevious: Number(page) > 1,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id)
        .select('_id name email role company department isActive lastLoginAt createdAt')
        .lean();

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      res.json({
        success: true,
        data: { user },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\controllers\AuthController.ts" -Encoding UTF8
Write-Success "AuthController.ts atualizado"

# ============================================
# PARTE 2: AUTH SERVICE OTIMIZADO
# ============================================
Write-Step "PARTE 2/3: AUTH SERVICE OTIMIZADO"

Write-Info "Atualizando AuthService.ts..."
@'
// backend/src/services/AuthService.ts
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
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
    const payload: IJWTPayload = { userId, email, role };
    
    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    });
    
    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    });
    
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
      const existingUser = await User.findOne({ email }).select('_id').lean();
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
      const user = await User.findOne({ email })
        .select('_id name email password role company department isActive refreshToken')
        .exec();

      if (!user) {
        throw new AuthenticationError('Email ou senha inválidos');
      }

      if (!user.isActive) {
        throw new AuthenticationError('Usuário inativo');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Email ou senha inválidos');
      }

      user.lastLoginAt = new Date();
      await user.save();

      const tokens = AuthService.generateTokens(
        user._id.toString(),
        user.email,
        user.role
      );

      user.refreshToken = tokens.refreshToken;
      await user.save();

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        department: user.department,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as IUser;

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
      
      const user = await User.findById(decoded.userId)
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
      .select('_id name email role company department isActive lastLoginAt')
      .lean()
      .exec();
  }

  static async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email })
      .select('_id name email role company department isActive lastLoginAt')
      .lean()
      .exec();
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\services\AuthService.ts" -Encoding UTF8
Write-Success "AuthService.ts atualizado"

# ============================================
# PARTE 3: USER MODEL COM ÍNDICES
# ============================================
Write-Step "PARTE 3/3: USER MODEL COM ÍNDICES COMPOSTOS"

Write-Info "Atualizando User.ts com índices..."
@'
// backend/src/models/User.ts
import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { passwordPolicy } from '../services/PasswordPolicy.js';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [8, 'Senha deve ter pelo menos 8 caracteres'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Empresa deve ter no máximo 100 caracteres'],
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Departamento deve ter no máximo 100 caracteres'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    passwordHistory: {
      type: [String],
      default: [],
      select: false,
    },
    passwordExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.passwordHistory;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ============================================
// ÍNDICES SIMPLES
// ============================================
userSchema.index({ email: 1 }, { unique: true });

// ============================================
// ÍNDICES COMPOSTOS
// ============================================
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ company: 1, department: 1 });
userSchema.index({ passwordExpiresAt: 1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ name: 'text', email: 'text' });

// ============================================
// MÉTODOS
// ============================================
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    return false;
  }
};

userSchema.methods.needsPasswordChange = function(): boolean {
  if (!this.passwordChangedAt) return true;
  return passwordPolicy.isExpired(this.passwordChangedAt);
};

// ============================================
// MIDDLEWARES
// ============================================
userSchema.pre<IUser>('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const validation = passwordPolicy.validate(this.password, {
      name: this.name,
      email: this.email,
    });

    if (!validation.valid) {
      throw new Error(`Senha inválida: ${validation.errors.join(', ')}`);
    }

    if (this.isModified('password') && this.passwordHistory) {
      this.passwordHistory.push('previous_hash_placeholder');
      if (this.passwordHistory.length > 5) {
        this.passwordHistory.shift();
      }
    }

    this.passwordChangedAt = new Date();
    this.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.pre<IUser>('save', async function (next) {
  try {
    const existingUser = await mongoose.models.User.findOne({
      email: this.email,
      _id: { $ne: this._id },
    });
    
    if (existingUser) {
      throw new Error('Email já está em uso');
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role, isActive: true });
};

userSchema.statics.ensureIndexes = async function() {
  try {
    await this.createIndexes();
    logger.info('✅ Índices do User criados/verificados com sucesso');
  } catch (error) {
    logger.error('❌ Erro ao criar índices do User:', error);
    throw error;
  }
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
'@ | Out-File -FilePath "$BaseDir\backend\src\models\User.ts" -Encoding UTF8
Write-Success "User.ts atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 1/4 CONCLUÍDA!"

Write-Success "Arquivos atualizados:"
Write-Info "  • backend/src/controllers/AuthController.ts"
Write-Info "  • backend/src/services/AuthService.ts"
Write-Info "  • backend/src/models/User.ts"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Projeções estritas com .select()" -ForegroundColor White
Write-Info "  ✅ .lean() para queries que não precisam de documentos Mongoose" -ForegroundColor White
Write-Info "  ✅ Índices compostos para consultas frequentes" -ForegroundColor White
Write-Info "  ✅ Índice de texto para busca por nome/email" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Teste listagem de usuários: GET /api/auth/users" -ForegroundColor White

Write-Success "🎉 Parte 1/4 concluída com sucesso!"