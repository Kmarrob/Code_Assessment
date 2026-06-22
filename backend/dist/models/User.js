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
// backend/src/models/User.ts
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
        enum: Object.values(index_js_1.UserRole),
        default: index_js_1.UserRole.USER,
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
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            delete ret.password;
            delete ret.refreshToken;
            delete ret.passwordHistory;
            // Removido delete ret.__v;
            return ret;
        },
    },
});
// ============================================
// MÉTODOS
// ============================================
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
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
        const validation = PasswordPolicy_js_1.passwordPolicy.validate(this.password, {
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
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
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
// ÍNDICES
// ============================================
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ company: 1, department: 1 });
userSchema.index({ name: 'text', email: 'text' });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ passwordExpiresAt: 1 });
// ============================================
// MÉTODOS ESTÁTICOS
// ============================================
userSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};
userSchema.statics.findByRole = function (role) {
    return this.find({ role, isActive: true });
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map