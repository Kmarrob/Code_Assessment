// backend/src/middleware/validateSchema.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

/**
 * Middleware para validação de schemas Zod
 * @param schema - Schema Zod para validação
 * @param source - Fonte dos dados a serem validados ('body', 'query', 'params')
 */
export const validateSchema = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validatedData = await schema.parseAsync(data);
      req[source] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        return next(new AppError('Erro de validação', 400, true, { errors }));
      }
      next(error);
    }
  };
};

/**
 * Middleware para validação de schemas Zod com suporte para múltiplas fontes
 */
export const validateSchemaMulti = (schemas: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        return next(new AppError('Erro de validação', 400, true, { errors }));
      }
      next(error);
    }
  };
};