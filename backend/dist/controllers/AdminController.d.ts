import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class AdminController {
    static listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static reactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static listUsersFallback(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AdminController.d.ts.map