import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
/**
 * Middleware para validação de schemas Zod
 * @param schema - Schema Zod para validação
 * @param source - Fonte dos dados a serem validados ('body', 'query', 'params')
 */
export declare const validateSchema: (schema: AnyZodObject, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para validação de schemas Zod com suporte para múltiplas fontes
 */
export declare const validateSchemaMulti: (schemas: {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
}) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validateSchema.d.ts.map