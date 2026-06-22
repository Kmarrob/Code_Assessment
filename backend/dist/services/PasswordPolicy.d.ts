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
export declare const defaultPasswordPolicy: PasswordPolicyConfig;
export declare class PasswordPolicy {
    private config;
    constructor(config?: PasswordPolicyConfig);
    validate(password: string, userInfo?: {
        name?: string;
        email?: string;
    }): {
        valid: boolean;
        errors: string[];
    };
    getZodSchema(): z.ZodSchema;
    isExpired(lastChangedAt: Date): boolean;
    isReused(_newPassword: string, _passwordHistory: string[]): boolean;
}
export declare const passwordPolicy: PasswordPolicy;
//# sourceMappingURL=PasswordPolicy.d.ts.map