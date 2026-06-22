import { IJWTPayload, UserRole } from '../types/index.js';
export declare class TokenService {
    static generateAccessToken(userId: string, email: string, role: UserRole): string;
    static generateRefreshToken(userId: string, email: string, role: UserRole): string;
    static verifyToken(token: string, secret: string): IJWTPayload;
    static revokeToken(token: string, reason?: string): Promise<void>;
    static isTokenRevoked(token: string): boolean;
    static revokeAllUserTokens(userId: string): Promise<void>;
}
//# sourceMappingURL=TokenService.d.ts.map