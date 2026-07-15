import { UserRole, IUser } from '../types/index.js';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class AuthService {
    static generateTokens(userId: string, email: string, role: UserRole): AuthTokens;
    static register(userData: {
        name: string;
        email: string;
        password: string;
        company?: string;
        department?: string;
        role?: UserRole;
        plan?: 'basic' | 'pro' | 'enterprise';
    }): Promise<IUser>;
    static login(email: string, password: string): Promise<{
        user: IUser;
        tokens: AuthTokens;
    }>;
    static refreshToken(refreshToken: string): Promise<AuthTokens>;
    static logout(userId: string): Promise<void>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static getUserById(userId: string): Promise<IUser | null>;
    static getUserByEmail(email: string): Promise<IUser | null>;
}
//# sourceMappingURL=AuthService.d.ts.map