import { Request, Response, NextFunction } from 'express';
declare let adminMetrics: {
    totalRequests: number;
    totalDuration: number;
    avgDuration: number;
    errorRate: number;
    statusCodes: Record<number, number>;
    endpoints: Record<string, {
        count: number;
        avgDuration: number;
    }>;
};
export declare function adminPerformanceMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function getAdminMetrics(): typeof adminMetrics;
export declare function adminMetricsHandler(req: Request, res: Response): void;
export declare function resetAdminMetrics(): void;
export {};
//# sourceMappingURL=adminPerformance.d.ts.map