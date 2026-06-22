import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class AuthController {
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map