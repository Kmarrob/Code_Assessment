import { Request, Response, NextFunction } from 'express';
/**
 * Middleware para sanitizar inputs das rotas admin
 * Previne NoSQL Injection e ataques de injeção
 */
export declare function sanitizeAdminInputs(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware específico para sanitizar apenas campos sensíveis
 */
export declare function sanitizeSensitiveFields(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=sanitizeAdmin.d.ts.map