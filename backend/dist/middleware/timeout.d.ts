import { Request, Response, NextFunction } from 'express';
export interface TimeoutConfig {
    defaultTimeout: number;
    routeOverrides?: Record<string, number>;
}
export declare function timeoutMiddleware(config?: TimeoutConfig): (req: Request, res: Response, next: NextFunction) => void;
export declare function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number, context?: string): Promise<T>;
export declare function withDbTimeout<T>(fn: () => Promise<T>, context?: string): Promise<T>;
export declare function withHttpTimeout<T>(fn: () => Promise<T>, context?: string): Promise<T>;
//# sourceMappingURL=timeout.d.ts.map