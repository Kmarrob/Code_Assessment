// backend/src/services/PasswordPolicy.ts
import { z } from 'zod';

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
  historySize: number;
  preventCommonPasswords: boolean;
  preventPersonalInfo: boolean;
}

export const defaultPasswordPolicy: PasswordPolicyConfig = {
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

const commonPasswords = [
  '123456', 'password', '12345678', 'qwerty', '123456789',
  '12345', '1234', '111111', '1234567', 'dragon',
  '123123', 'baseball', 'abc123', 'football', 'monkey',
  'letmein', 'shadow', 'master', '666666', 'qwertyuiop',
  '123321', 'mustang', '1234567890', 'michael', '654321',
];

export class PasswordPolicy {
  private config: PasswordPolicyConfig;

  constructor(config: PasswordPolicyConfig = defaultPasswordPolicy) {
    this.config = config;
  }

  validate(password: string, userInfo?: { name?: string; email?: string }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < this.config.minLength) {
      errors.push(`Senha deve ter pelo menos ${this.config.minLength} caracteres`);
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
      const normalized = password.toLowerCase();
      if (commonPasswords.includes(normalized)) {
        errors.push('Senha é muito comum. Escolha uma senha mais segura');
      }
    }

    if (this.config.preventPersonalInfo && userInfo) {
      if (userInfo.name) {
        const nameParts = userInfo.name.toLowerCase().split(' ');
        for (const part of nameParts) {
          if (part.length > 2 && password.toLowerCase().includes(part)) {
            errors.push('Senha não deve conter seu nome');
            break;
          }
        }
      }
      if (userInfo.email) {
        const emailLocal = userInfo.email.split('@')[0];
        if (emailLocal && password.toLowerCase().includes(emailLocal.toLowerCase())) {
          errors.push('Senha não deve conter seu email');
        }
      }
    }

    if (/(.)\1{3,}/.test(password)) {
      errors.push('Senha não deve ter mais de 3 caracteres repetidos consecutivamente');
    }

    const sequences = ['123456', 'abcdef', 'qwerty', 'asdfgh', 'zxcvbn'];
    for (const seq of sequences) {
      if (password.toLowerCase().includes(seq)) {
        errors.push('Senha não deve conter sequências comuns (ex: 123456, abcdef)');
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getZodSchema(): z.ZodSchema {
    let schema = z.string().min(this.config.minLength);
    
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
  }

  isExpired(lastChangedAt: Date): boolean {
    const maxAgeMs = this.config.maxAge * 24 * 60 * 60 * 1000;
    return Date.now() - lastChangedAt.getTime() > maxAgeMs;
  }

  isReused(_newPassword: string, _passwordHistory: string[]): boolean {
    // Em produção, comparar hashes das senhas anteriores
    return false;
  }
}

export const passwordPolicy = new PasswordPolicy(defaultPasswordPolicy);