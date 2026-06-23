import { Request, Response, NextFunction } from 'express';
declare let metrics: {
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
export declare function performanceMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function getPerformanceMetrics(): typeof metrics;
export declare function performanceMetricsHandler(_req: Request, res: Response): void;
export declare function resetMetrics(): void;
export {};
//# sourceMappingURL=performance.d.ts.map