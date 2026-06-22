// backend/src/middleware/performance.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

interface PerformanceMetrics {
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
  userId?: string;
  ip?: string;
}

let metrics: {
  totalRequests: number;
  totalDuration: number;
  avgDuration: number;
  errorRate: number;
  statusCodes: Record<number, number>;
  endpoints: Record<string, { count: number; avgDuration: number }>;
} = {
  totalRequests: 0,
  totalDuration: 0,
  avgDuration: 0,
  errorRate: 0,
  statusCodes: {},
  endpoints: {},
};

export function performanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  (req as any)._startTime = startTime;

  const originalSend = res.send;
  
  res.send = function(body: any): any {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    const statusCode = res.statusCode;

    const metric: PerformanceMetrics = {
      timestamp: new Date(),
      method: req.method,
      path: req.path,
      statusCode,
      duration,
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
      },
      userId: (req as any).userId,
      ip: req.ip,
    };

    if (duration > 1000 || statusCode >= 400) {
      logger.http(`[PERFORMANCE] ${req.method} ${req.path} ${statusCode} - ${duration}ms`, metric);
    }

    updateMetrics(metric);

    res.send = originalSend;
    return originalSend.call(this, body);
  };

  next();
}

function updateMetrics(metric: PerformanceMetrics): void {
  metrics.totalRequests++;
  metrics.totalDuration += metric.duration;
  metrics.avgDuration = metrics.totalDuration / metrics.totalRequests;

  metrics.statusCodes[metric.statusCode] = (metrics.statusCodes[metric.statusCode] || 0) + 1;

  const endpointKey = `${metric.method} ${metric.path}`;
  if (!metrics.endpoints[endpointKey]) {
    metrics.endpoints[endpointKey] = { count: 0, avgDuration: 0 };
  }
  const endpoint = metrics.endpoints[endpointKey];
  endpoint.count++;
  endpoint.avgDuration = ((endpoint.avgDuration * (endpoint.count - 1)) + metric.duration) / endpoint.count;

  const errorCount = metrics.statusCodes[500] || 0;
  metrics.errorRate = errorCount / metrics.totalRequests;
}

export function getPerformanceMetrics(): typeof metrics {
  return { ...metrics };
}

export function performanceMetricsHandler(_req: Request, res: Response): void {
  res.json({
    success: true,
    data: {
      metrics: getPerformanceMetrics(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}

export function resetMetrics(): void {
  metrics = {
    totalRequests: 0,
    totalDuration: 0,
    avgDuration: 0,
    errorRate: 0,
    statusCodes: {},
    endpoints: {},
  };
}