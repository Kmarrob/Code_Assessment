# scripts/apply-admin-performance-part1.ps1
# Script para aplicar Parte 1/3 - Backend - Otimização de Queries e Índices

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
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
Write-Host "║     CODE_ASSESSMENT - ADMIN PERFORMANCE (PILAR 5)          ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 1/3 - BACKEND - OTIMIZAÇÃO DE QUERIES E ÍNDICES  ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: USER MODEL COM ÍNDICES
# ============================================
Write-Step "PARTE 1/3: USER MODEL COM ÍNDICES"

Write-Info "Atualizando User.ts..."
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
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ============================================
// ÍNDICES COMPOSTOS PARA ADMIN
// ============================================
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ company: 1, department: 1 });
userSchema.index({ name: 'text', email: 'text' });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ role: 1, company: 1, isActive: 1 });
userSchema.index({ isActive: 1, lastLoginAt: -1 });
userSchema.index({ passwordExpiresAt: 1 });

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
# PARTE 2: ADMIN SERVICE OTIMIZADO
# ============================================
Write-Step "PARTE 2/3: ADMIN SERVICE OTIMIZADO"

Write-Info "Atualizando AdminService.ts..."
@'
// backend/src/services/AdminService.ts
import { Types } from 'mongoose';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { UserRole, IUser } from '../types/index.js';
import { retryDatabase } from '../utils/retry.js';
import { databaseCircuitBreaker } from '../utils/circuitBreaker.js';
import { withDbTimeout } from '../middleware/timeout.js';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company?: string;
  department?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  company?: string;
  department?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  company?: string;
  department?: string;
}

export class AdminService {
  static async listUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: IUser[]; total: number; totalPages: number }> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const filter: any = {};

            if (filters.role) filter.role = filters.role;
            if (filters.isActive !== undefined) filter.isActive = filters.isActive;
            if (filters.company) {
              filter.company = { $regex: filters.company, $options: 'i' };
            }
            if (filters.department) {
              filter.department = { $regex: filters.department, $options: 'i' };
            }

            if (filters.search) {
              filter.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
              ];
            }

            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
              User.find(filter)
                .select('_id name email role company department isActive lastLoginAt createdAt')
                .lean()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .hint({ role: 1, isActive: 1, createdAt: -1 }),
              User.countDocuments(filter),
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
              users: users as IUser[],
              total,
              totalPages,
            };
          }, 'AdminService.listUsers');
        }, 'AdminService.listUsers');
      });
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao listar usuários. Tente novamente mais tarde.', 500);
    }
  }

  static async getUserById(userId: string): Promise<IUser> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId)
              .select('_id name email role company department isActive lastLoginAt createdAt')
              .lean()
              .exec();

            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            return user as IUser;
          }, 'AdminService.getUserById');
        }, 'AdminService.getUserById');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao buscar usuário:', error);
      throw new AppError('Erro ao buscar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async createUser(data: CreateUserData): Promise<IUser> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const existingUser = await User.findOne({ email: data.email });
            if (existingUser) {
              throw new AppError('Email já está em uso', 400);
            }

            const user = new User({
              name: data.name,
              email: data.email,
              password: data.password,
              role: data.role || UserRole.USER,
              company: data.company,
              department: data.department,
              isActive: true,
            });

            await user.save();

            logger.info(`Usuário criado pelo admin: ${user.email} (${user.role})`);

            return user.toJSON() as IUser;
          }, 'AdminService.createUser');
        }, 'AdminService.createUser');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao criar usuário:', error);
      throw new AppError('Erro ao criar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async updateUser(userId: string, data: UpdateUserData): Promise<IUser> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            if (data.email && data.email !== user.email) {
              const existingUser = await User.findOne({ email: data.email });
              if (existingUser) {
                throw new AppError('Email já está em uso', 400);
              }
              user.email = data.email;
            }

            if (data.name) user.name = data.name;
            if (data.role) user.role = data.role;
            if (data.company !== undefined) user.company = data.company;
            if (data.department !== undefined) user.department = data.department;
            if (data.isActive !== undefined) user.isActive = data.isActive;

            await user.save();

            logger.info(`Usuário atualizado pelo admin: ${user.email}`);

            return user.toJSON() as IUser;
          }, 'AdminService.updateUser');
        }, 'AdminService.updateUser');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar usuário:', error);
      throw new AppError('Erro ao atualizar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await databaseCircuitBreaker.execute(async () => {
        await retryDatabase(async () => {
          await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            user.isActive = false;
            await user.save();

            logger.info(`Usuário desativado pelo admin: ${user.email}`);
          }, 'AdminService.deleteUser');
        }, 'AdminService.deleteUser');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao desativar usuário:', error);
      throw new AppError('Erro ao desativar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async reactivateUser(userId: string): Promise<IUser> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            user.isActive = true;
            await user.save();

            logger.info(`Usuário reativado pelo admin: ${user.email}`);

            return user.toJSON() as IUser;
          }, 'AdminService.reactivateUser');
        }, 'AdminService.reactivateUser');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao reativar usuário:', error);
      throw new AppError('Erro ao reativar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async resetPassword(userId: string, newPassword: string): Promise<void> {
    try {
      await databaseCircuitBreaker.execute(async () => {
        await retryDatabase(async () => {
          await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            user.password = newPassword;
            await user.save();

            logger.info(`Senha resetada pelo admin para: ${user.email}`);
          }, 'AdminService.resetPassword');
        }, 'AdminService.resetPassword');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao resetar senha:', error);
      throw new AppError('Erro ao resetar senha. Tente novamente mais tarde.', 500);
    }
  }

  static async getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  }> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
              User.countDocuments({}),
              User.countDocuments({ isActive: true }),
              User.countDocuments({ createdAt: { $gte: startOfMonth } }),
            ]);

            return {
              totalUsers,
              activeUsers,
              newUsersThisMonth,
            };
          }, 'AdminService.getDashboardStats');
        }, 'AdminService.getDashboardStats');
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      throw new AppError('Erro ao obter estatísticas. Tente novamente mais tarde.', 500);
    }
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\services\AdminService.ts" -Encoding UTF8
Write-Success "AdminService.ts atualizado"

# ============================================
# PARTE 3: SCRIPT ENSURE INDEXES
# ============================================
Write-Step "PARTE 3/3: SCRIPT ENSURE INDEXES"

Write-Info "Criando ensure-indexes.ts..."
@'
// backend/src/scripts/ensure-indexes.ts
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';

async function ensureIndexes() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB_NAME,
    });

    logger.info('📦 Conectado ao MongoDB');

    await User.createIndexes();
    logger.info('✅ Índices do User criados/verificados');

    const indexes = await User.collection.indexes();
    logger.info('📋 Índices existentes:');
    indexes.forEach((index) => {
      logger.info(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro ao criar índices:', error);
    process.exit(1);
  }
}

ensureIndexes();
'@ | Out-File -FilePath "$BaseDir\backend\src\scripts\ensure-indexes.ts" -Encoding UTF8
Write-Success "ensure-indexes.ts criado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 1/3 CONCLUÍDA!"

Write-Success "Arquivos atualizados:"
Write-Info "  • backend/src/models/User.ts"
Write-Info "  • backend/src/services/AdminService.ts"
Write-Info "  • backend/src/scripts/ensure-indexes.ts"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Índices compostos para consultas admin" -ForegroundColor White
Write-Info "  ✅ Índice de texto para busca (name + email)" -ForegroundColor White
Write-Info "  ✅ Projeções estritas com .select()" -ForegroundColor White
Write-Info "  ✅ .lean() para queries de listagem" -ForegroundColor White
Write-Info "  ✅ Dashboard stats com queries otimizadas" -ForegroundColor White
Write-Info "  ✅ Script ensure-indexes" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Execute: npx tsx src/scripts/ensure-indexes.ts" -ForegroundColor White
Write-Info "  3. Teste a listagem de usuários com filtros" -ForegroundColor White

Write-Success "🎉 Parte 1/3 concluída com sucesso!"