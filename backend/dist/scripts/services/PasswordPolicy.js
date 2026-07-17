"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordPolicy = exports.PasswordPolicy = exports.defaultPasswordPolicy = void 0;
// backend/src/services/PasswordPolicy.ts
var zod_1 = require("zod");
exports.defaultPasswordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
    historySize: 5,
    preventCommonPasswords: true,
    preventPersonalInfo: true,
};
var commonPasswords = [
    '123456', 'password', '12345678', 'qwerty', '123456789',
    '12345', '1234', '111111', '1234567', 'dragon',
    '123123', 'baseball', 'abc123', 'football', 'monkey',
    'letmein', 'shadow', 'master', '666666', 'qwertyuiop',
    '123321', 'mustang', '1234567890', 'michael', '654321',
];
var PasswordPolicy = /** @class */ (function () {
    function PasswordPolicy(config) {
        if (config === void 0) { config = exports.defaultPasswordPolicy; }
        this.config = config;
    }
    PasswordPolicy.prototype.validate = function (password, userInfo) {
        var errors = [];
        if (password.length < this.config.minLength) {
            errors.push("Senha deve ter pelo menos ".concat(this.config.minLength, " caracteres"));
        }
        if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Senha deve conter pelo menos 1 letra maiúscula');
        }
        if (this.config.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Senha deve conter pelo menos 1 letra minúscula');
        }
        if (this.config.requireNumbers && !/[0-9]/.test(password)) {
            errors.push('Senha deve conter pelo menos 1 número');
        }
        if (this.config.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
            errors.push('Senha deve conter pelo menos 1 caractere especial');
        }
        if (this.config.preventCommonPasswords) {
            var normalized = password.toLowerCase();
            if (commonPasswords.includes(normalized)) {
                errors.push('Senha é muito comum. Escolha uma senha mais segura');
            }
        }
        if (this.config.preventPersonalInfo && userInfo) {
            if (userInfo.name) {
                var nameParts = userInfo.name.toLowerCase().split(' ');
                for (var _i = 0, nameParts_1 = nameParts; _i < nameParts_1.length; _i++) {
                    var part = nameParts_1[_i];
                    if (part.length > 2 && password.toLowerCase().includes(part)) {
                        errors.push('Senha não deve conter seu nome');
                        break;
                    }
                }
            }
            if (userInfo.email) {
                var emailLocal = userInfo.email.split('@')[0];
                if (emailLocal && password.toLowerCase().includes(emailLocal.toLowerCase())) {
                    errors.push('Senha não deve conter seu email');
                }
            }
        }
        if (/(.)\1{3,}/.test(password)) {
            errors.push('Senha não deve ter mais de 3 caracteres repetidos consecutivamente');
        }
        var sequences = ['123456', 'abcdef', 'qwerty', 'asdfgh', 'zxcvbn'];
        for (var _a = 0, sequences_1 = sequences; _a < sequences_1.length; _a++) {
            var seq = sequences_1[_a];
            if (password.toLowerCase().includes(seq)) {
                errors.push('Senha não deve conter sequências comuns (ex: 123456, abcdef)');
                break;
            }
        }
        return {
            valid: errors.length === 0,
            errors: errors,
        };
    };
    PasswordPolicy.prototype.getZodSchema = function () {
        var schema = zod_1.z.string().min(this.config.minLength);
        if (this.config.requireUppercase) {
            schema = schema.regex(/[A-Z]/, 'Deve conter letra maiúscula');
        }
        if (this.config.requireLowercase) {
            schema = schema.regex(/[a-z]/, 'Deve conter letra minúscula');
        }
        if (this.config.requireNumbers) {
            schema = schema.regex(/[0-9]/, 'Deve conter número');
        }
        if (this.config.requireSpecialChars) {
            schema = schema.regex(/[^A-Za-z0-9]/, 'Deve conter caractere especial');
        }
        return schema;
    };
    PasswordPolicy.prototype.isExpired = function (lastChangedAt) {
        var maxAgeMs = this.config.maxAge * 24 * 60 * 60 * 1000;
        return Date.now() - lastChangedAt.getTime() > maxAgeMs;
    };
    PasswordPolicy.prototype.isReused = function (_newPassword, _passwordHistory) {
        // Em produção, comparar hashes das senhas anteriores
        return false;
    };
    return PasswordPolicy;
}());
exports.PasswordPolicy = PasswordPolicy;
exports.passwordPolicy = new PasswordPolicy(exports.defaultPasswordPolicy);
