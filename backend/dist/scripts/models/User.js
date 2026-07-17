"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = require("mongoose");
var bcryptjs_1 = require("bcryptjs");
var index_js_1 = require("../types/index.js");
var logger_js_1 = require("../utils/logger.js");
var PasswordPolicy_js_1 = require("../services/PasswordPolicy.js");
var userSchema = new mongoose_1.Schema({
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
        transform: function (_, ret) {
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
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function () {
        var cleanHash, cleanPassword, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!this.password) {
                        logger_js_1.logger.warn('🔍 comparePassword: password é undefined ou null');
                        return [2 /*return*/, false];
                    }
                    cleanHash = this.password.trim();
                    cleanPassword = candidatePassword.trim();
                    logger_js_1.logger.info("\uD83D\uDD0D comparePassword - Senha fornecida: ".concat(cleanPassword));
                    logger_js_1.logger.info("\uD83D\uDD0D comparePassword - Hash armazenado (limpo): ".concat(cleanHash));
                    return [4 /*yield*/, bcryptjs_1.default.compare(cleanPassword, cleanHash)];
                case 1:
                    result = _a.sent();
                    logger_js_1.logger.info("\uD83D\uDD0D comparePassword - Resultado da compara\u00E7\u00E3o: ".concat(result));
                    return [2 /*return*/, result];
                case 2:
                    error_1 = _a.sent();
                    logger_js_1.logger.error('Error comparing passwords:', error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
};
userSchema.methods.needsPasswordChange = function () {
    if (!this.passwordChangedAt)
        return true;
    return PasswordPolicy_js_1.passwordPolicy.isExpired(this.passwordChangedAt);
};
// ============================================
// MIDDLEWARES
// ============================================
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function () {
        var isAlreadyHashed, cleanPassword, validation, salt, _a, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    if (!this.isModified('password')) {
                        return [2 /*return*/, next()];
                    }
                    if (!this.password) {
                        return [2 /*return*/, next(new Error('Senha não fornecida para modificação'))];
                    }
                    isAlreadyHashed = this.password.startsWith('$2a$') ||
                        this.password.startsWith('$2b$') ||
                        this.password.startsWith('$2y$');
                    if (isAlreadyHashed) {
                        logger_js_1.logger.info("\uD83D\uDD0D pre-save - Senha j\u00E1 hasheada, pulando hash");
                        return [2 /*return*/, next()];
                    }
                    cleanPassword = this.password.trim();
                    logger_js_1.logger.info("\uD83D\uDD0D pre-save - Validando senha em texto plano: ".concat(cleanPassword));
                    validation = PasswordPolicy_js_1.passwordPolicy.validate(cleanPassword, {
                        name: this.name,
                        email: this.email,
                    });
                    if (!validation.valid) {
                        throw new Error("Senha inv\u00E1lida: ".concat(validation.errors.join(', ')));
                    }
                    if (this.passwordHistory) {
                        this.passwordHistory.push('previous_hash_placeholder');
                        if (this.passwordHistory.length > 5) {
                            this.passwordHistory.shift();
                        }
                    }
                    this.passwordChangedAt = new Date();
                    this.passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, bcryptjs_1.default.genSalt(12)];
                case 1:
                    salt = _b.sent();
                    _a = this;
                    return [4 /*yield*/, bcryptjs_1.default.hash(cleanPassword, salt)];
                case 2:
                    _a.password = _b.sent();
                    logger_js_1.logger.info("\uD83D\uDD0D pre-save - Hash gerado: ".concat(this.password));
                    next();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    next(error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function () {
        var UserModel, existingUser, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    UserModel = mongoose_1.default.model('User');
                    return [4 /*yield*/, UserModel.findOne({
                            email: this.email,
                            _id: { $ne: this._id },
                        })];
                case 1:
                    existingUser = _a.sent();
                    if (existingUser) {
                        throw new Error('Email já está em uso');
                    }
                    next();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    next(error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
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
    return this.find({ role: role, isActive: true });
};
userSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId: companyId, isActive: true });
};
userSchema.statics.findByCreator = function (createdBy) {
    return this.find({ createdBy: createdBy, isActive: true });
};
userSchema.statics.findByConsultant = function (consultantId) {
    return this.find({ consultantId: consultantId, isActive: true });
};
userSchema.statics.findConsultants = function () {
    return this.find({ role: 'consultant', isActive: true });
};
exports.User = mongoose_1.default.model('User', userSchema);
