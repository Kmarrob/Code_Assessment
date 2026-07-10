"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchemaMulti = exports.validateSchema = void 0;
const zod_1 = require("zod");
const errors_js_1 = require("../utils/errors.js");
/**
 * Middleware para validação de schemas Zod
 * @param schema - Schema Zod para validação
 * @param source - Fonte dos dados a serem validados ('body', 'query', 'params')
 */
const validateSchema = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const data = req[source];
            const validatedData = await schema.parseAsync(data);
            req[source] = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));
                return next(new errors_js_1.AppError('Erro de validação', 400, true, { errors }));
            }
            next(error);
        }
    };
};
exports.validateSchema = validateSchema;
/**
 * Middleware para validação de schemas Zod com suporte para múltiplas fontes
 */
const validateSchemaMulti = (schemas) => {
    return async (req, res, next) => {
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
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));
                return next(new errors_js_1.AppError('Erro de validação', 400, true, { errors }));
            }
            next(error);
        }
    };
};
exports.validateSchemaMulti = validateSchemaMulti;
//# sourceMappingURL=validateSchema.js.map