import { Request, Response, NextFunction } from 'express';
/**
 * Middleware global para sanitizar todos os inputs
 * Previne NoSQL Injection e ataques de injeção
 */
export declare function sanitizeRequestBody(req: Request, _res: Response, next: NextFunction): void;
export declare function sanitizeQueryParams(req: Request, _res: Response, next: NextFunction): void;
export declare function sanitizeUrlParams(req: Request, _res: Response, next: NextFunction): void;
export declare function sanitizeAll(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=sanitize.d.ts.map