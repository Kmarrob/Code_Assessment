// backend/src/models/User.ts
import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { passwordPolicy } from '../services/PasswordPolicy.js';

// Interface para o documento estendendo de forma compatível com IUser
export interface IUserDocument extends IUser, Document {
  password?: string;
  refreshToken?: string;
  passwordHistory?: string[];
  passwordExpiresAt?: Date;
  // 🔴 ADICIONADO: Campos para inativação
  inactivationReason?: 'Desligado' | 'Mudou de setor' | 'Outros';
  inactivationDescription?: string;
  inactivatedAt?: Date;
  inactivatedBy?: mongoose.Types.ObjectId;
  // 🔴 NOVO: Campo para indicar que o usuário precisa trocar a senha no primeiro acesso
  mustChangePassword?: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  needsPasswordChange(): boolean;
}

const userSchema = new Schema<IUserDocument>(
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
      required: false, // 🔴 CORRIGIDO: Senha opcional (gerada automaticamente)
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
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    consultantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
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
    lastLogin: {
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
    // 🔴 NOVO: Campo para primeiro acesso
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    // 🔴 ADICIONADO: Campos para inativação
    inactivationReason: {
      type: String,
      enum: ['Desligado', 'Mudou de setor', 'Outros'],
      required: false,
    },
    inactivationDescription: {
      type: String,
      maxlength: [500, 'Descrição deve ter no máximo 500 caracteres'],
      required: false,
    },
    inactivatedAt: {
      type: Date,
      required: false,
    },
    inactivatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        if (ret.password) {
          delete ret.password;
        }
        if (ret.refreshToken) {
          delete ret.refreshToken;
        }
        if (ret.passwordHistory) {
          delete ret.passwordHistory;
        }
        return ret;
      },
    },
  }
);

// ============================================
// MÉTODOS
// ============================================

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    if (!this.password) {
      logger.warn('🔍 comparePassword: password é undefined ou null');
      return false;
    }

    // 🔴 CORREÇÃO: Remover quebras de linha e espaços extras
    const cleanHash = this.password.trim();
    const cleanPassword = candidatePassword.trim();

    logger.info(`🔍 comparePassword - Senha fornecida: ${cleanPassword}`);
    logger.info(`🔍 comparePassword - Hash armazenado (limpo): ${cleanHash}`);

    const result = await bcrypt.compare(cleanPassword, cleanHash);

    logger.info(`🔍 comparePassword - Resultado da comparação: ${result}`);

    return result;
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

userSchema.pre<IUserDocument>('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    if (!this.password) {
      return next(new Error('Senha não fornecida para modificação'));
    }

    // 🔴 CORREÇÃO: Verificar se a senha já é um hash bcrypt
    const isAlreadyHashed = this.password.startsWith('$2a$') || 
                            this.password.startsWith('$2b$') || 
                            this.password.startsWith('$2y$');
    
    if (isAlreadyHashed) {
      // Se já está hasheado, não aplicar novamente
      logger.info(`🔍 pre-save - Senha já hasheada, pulando hash`);
      return next();
    }

    // Só aplicar hash se for texto plano
    const cleanPassword = this.password.trim();

    logger.info(`🔍 pre-save - Validando senha em texto plano: ${cleanPassword}`);

    const validation = passwordPolicy.validate(cleanPassword, {
      name: this.name,
      email: this.email,
    });

    if (!validation.valid) {
      throw new Error(`Senha inválida: ${validation.errors.join(', ')}`);
    }

    if (this.passwordHistory) {
      this.passwordHistory.push('previous_hash_placeholder');
      if (this.passwordHistory.length > 5) {
        this.passwordHistory.shift();
      }
    }

    this.passwordChangedAt = new Date();
    this.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(cleanPassword, salt);

    logger.info(`🔍 pre-save - Hash gerado: ${this.password}`);

    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.pre<IUserDocument>('save', async function (next) {
  try {
    const UserModel = mongoose.model<IUserDocument>('User');
    const existingUser = await UserModel.findOne({
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
// ÍNDICES
// ============================================

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ company: 1, department: 1 });
userSchema.index({ companyId: 1 });
userSchema.index({ createdBy: 1 });
userSchema.index({ consultantId: 1 });
userSchema.index({ companyId: 1, role: 1 });
userSchema.index({ consultantId: 1, role: 1 });
userSchema.index({ name: 'text', email: 'text' });
userSchema.index({ lastLogin: -1 });
userSchema.index({ passwordExpiresAt: 1 });
// 🔴 ADICIONADO: Índices para inativação
userSchema.index({ inactivatedBy: 1 });
userSchema.index({ inactivationReason: 1 });
// 🔴 NOVO: Índice para mustChangePassword
userSchema.index({ mustChangePassword: 1 });

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

userSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role, isActive: true });
};

userSchema.statics.findByCompany = function(companyId: string) {
  return this.find({ companyId, isActive: true });
};

userSchema.statics.findByCreator = function(createdBy: string) {
  return this.find({ createdBy, isActive: true });
};

userSchema.statics.findByConsultant = function(consultantId: string) {
  return this.find({ consultantId, isActive: true });
};

userSchema.statics.findConsultants = function() {
  return this.find({ role: 'consultant', isActive: true });
};

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);