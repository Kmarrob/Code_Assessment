"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_js_1 = require("../types/index.js");
const logger_js_1 = require("../utils/logger.js");
const PasswordPolicy_js_1 = require("../services/PasswordPolicy.js");
const userSchema = new mongoose_1.Schema({
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
        unique: true, // Mantido aqui, removido do bloco inferior de índices manuais redundantes
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
        type: String,
        required: false, // Senha opcional (gerada automaticamente)
        minlength: [8, 'Senha deve ter pelo menos 8 caracteres'],
        select: false,
    },
    role: {
        type: String,
        enum: Object.values(index_js_1.UserRole),
        default: index_js_1.UserRole.USER,
    },
    company: {
        type: String,
        trim: true,
        maxlength: [100, 'Empresa deve ter no máximo 100 caracteres'],
    },
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: false,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    consultantId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    mustChangePassword: {
        type: Boolean,
        default: false,
    },
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
}, {
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
});
// ============================================
// MÉTODOS
// ============================================
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        if (!this.password) {
            logger_js_1.logger.warn('🔍 comparePassword: password é undefined ou null');
            return false;
        }
        const cleanHash = this.password.trim();
        const cleanPassword = candidatePassword.trim();
        logger_js_1.logger.info(`🔍 comparePassword - Senha fornecida: ${cleanPassword}`);
        logger_js_1.logger.info(`🔍 comparePassword - Hash armazenado (limpo): ${cleanHash}`);
        const result = await bcryptjs_1.default.compare(cleanPassword, cleanHash);
        logger_js_1.logger.info(`🔍 comparePassword - Resultado da comparação: ${result}`);
        return result;
    }
    catch (error) {
        logger_js_1.logger.error('Error comparing passwords:', error);
        return false;
    }
};
userSchema.methods.needsPasswordChange = function () {
    if (!this.passwordChangedAt)
        return true;
    return PasswordPolicy_js_1.passwordPolicy.isExpired(this.passwordChangedAt);
};
// ============================================
// MIDDLEWARES
// ============================================
userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        if (!this.password) {
            return next(new Error('Senha não fornecida para modificação'));
        }
        const isAlreadyHashed = this.password.startsWith('$2a$') ||
            this.password.startsWith('$2b$') ||
            this.password.startsWith('$2y$');
        if (isAlreadyHashed) {
            logger_js_1.logger.info(`🔍 pre-save - Senha já hasheada, pulando hash`);
            return next();
        }
        const cleanPassword = this.password.trim();
        logger_js_1.logger.info(`🔍 pre-save - Validando senha em texto plano: ${cleanPassword}`);
        const validation = PasswordPolicy_js_1.passwordPolicy.validate(cleanPassword, {
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
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(cleanPassword, salt);
        logger_js_1.logger.info(`🔍 pre-save - Hash gerado: ${this.password}`);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.pre('save', async function (next) {
    try {
        const UserModel = mongoose_1.default.model('User');
        const existingUser = await UserModel.findOne({
            email: this.email,
            _id: { $ne: this._id },
        });
        if (existingUser) {
            throw new Error('Email já está em uso');
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// ÍNDICES (Limpos de duplicidades com propriedades diretas do Schema)
// ============================================
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
userSchema.index({ inactivatedBy: 1 });
userSchema.index({ inactivationReason: 1 });
userSchema.index({ mustChangePassword: 1 });
// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
userSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};
userSchema.statics.findByRole = function (role) {
    return this.find({ role, isActive: true });
};
userSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId, isActive: true });
};
userSchema.statics.findByCreator = function (createdBy) {
    return this.find({ createdBy, isActive: true });
};
userSchema.statics.findByConsultant = function (consultantId) {
    return this.find({ consultantId, isActive: true });
};
userSchema.statics.findConsultants = function () {
    return this.find({ role: 'consultant', isActive: true });
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map