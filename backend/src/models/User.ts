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
      enum: ['admin', 'rep', 'consultant', 'user'],
      default: 'user',
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Empresa deve ter no máximo 100 caracteres'],
    },
    // ============================================
    // CAMPOS PARA MULTI-TENANCY
    // ============================================
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
    // ============================================
    // CONSULTOR RESPONSÁVEL
    // ============================================
    consultantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      // index: true, // REMOVIDO - índice centralizado abaixo
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
    const UserModel = mongoose.model<IUser>('User');
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
// ÍNDICES - CENTRALIZADOS (SEM DUPLICAÇÃO)
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
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ passwordExpiresAt: 1 });

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

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);