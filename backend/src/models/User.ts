// backend/src/models/User.ts
import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { passwordPolicy } from '../services/PasswordPolicy.js';

// Interface para o documento estendendo de forma compatível com IUser
export interface IUserDocument extends IUser, Document {
  password: string; // Mantido obrigatório para manter compatibilidade estrita com a interface IUser
  refreshToken?: string;
  passwordHistory?: string[];
  passwordExpiresAt?: Date;
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
    if (!this.password) return false;
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

userSchema.pre<IUserDocument>('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    if (!this.password) {
      return next(new Error('Senha não fornecida para modificação'));
    }

    const validation = passwordPolicy.validate(this.password, {
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
    this.password = await bcrypt.hash(this.password, salt);
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