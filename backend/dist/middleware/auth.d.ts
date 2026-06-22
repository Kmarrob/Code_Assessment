import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/index.js';
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function authorize(...allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function authorizeSelfOrAdmin(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map