import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: Record<string, string[]>;
    code?: string;
    constructor(message: string, statusCode?: number, isOperational?: boolean, errors?: Record<string, string[]>, code?: string);
}
export declare class ValidationError extends AppError {
    constructor(errors: Record<string, string[]> | string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string, id?: string);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string);
}
export declare class ServiceUnavailableError extends AppError {
    constructor(message?: string);
}
export declare function errorHandler(err: Error | AppError, req: Request, res: Response, _next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map