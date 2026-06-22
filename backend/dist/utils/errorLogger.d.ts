export interface ErrorLogContext {
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    path?: string;
    method?: string;
    body?: any;
    query?: any;
    params?: any;
    statusCode?: number;
    duration?: number;
}
export declare class ErrorLogger {
    static logError(error: Error, context?: ErrorLogContext, isOperational?: boolean): void;
    static logDatabaseError(error: Error, context?: ErrorLogContext): void;
    static logValidationError(error: Error, context?: ErrorLogContext): void;
    static logAuthError(error: Error, context?: ErrorLogContext): void;
    static logAuthzError(error: Error, context?: ErrorLogContext): void;
    static logTimeoutError(error: Error, context?: ErrorLogContext): void;
    static logServiceUnavailableError(error: Error, context?: ErrorLogContext): void;
}
//# sourceMappingURL=errorLogger.d.ts.map