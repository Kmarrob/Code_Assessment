// backend/src/middleware/adminPerformance.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

interface AdminPerformanceMetrics {
  timestamp: Date;
  userId?: string;
  email?: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

let adminMetrics = {
  totalRequests: 0,
  totalDuration: 0,
  avgDuration: 0,
  errorRate: 0,
  statusCodes: {} as Record<number, number>,
  endpoints: {} as Record<string, { count: number; avgDuration: number }>,
};

export function adminPerformanceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  const originalSend = res.send;

  res.send = function(body: any): any {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    const statusCode = res.statusCode;

    const metric: AdminPerformanceMetrics = {
      timestamp: new Date(),
      userId: (req as any).userId,
      email: (req as any).user?.email,
      method: req.method,
      path: req.path,
      statusCode,
      duration,
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      },
    };

    if (duration > 1000 || statusCode >= 400) {
      logger.http(`[ADMIN-PERFORMANCE] ${req.method} ${req.path} ${statusCode} - ${duration}ms`, metric);
    }

    updateAdminMetrics(metric);

    res.send = originalSend;
    return originalSend.call(this, body);
  };

  next();
}

function updateAdminMetrics(metric: AdminPerformanceMetrics): void {
  adminMetrics.totalRequests++;
  adminMetrics.totalDuration += metric.duration;
  adminMetrics.avgDuration = adminMetrics.totalDuration / adminMetrics.totalRequests;

  adminMetrics.statusCodes[metric.statusCode] = (adminMetrics.statusCodes[metric.statusCode] || 0) + 1;

  const endpointKey = `${metric.method} ${metric.path}`;
  if (!adminMetrics.endpoints[endpointKey]) {
    adminMetrics.endpoints[endpointKey] = { count: 0, avgDuration: 0 };
  }
  const endpoint = adminMetrics.endpoints[endpointKey];
  endpoint.count++;
  endpoint.avgDuration = ((endpoint.avgDuration * (endpoint.count - 1)) + metric.duration) / endpoint.count;

  const errorCount = adminMetrics.statusCodes[500] || 0;
  adminMetrics.errorRate = errorCount / adminMetrics.totalRequests;
}

export function getAdminMetrics(): typeof adminMetrics {
  return { ...adminMetrics };
}

export function adminMetricsHandler(_req: Request, res: Response): void {
  res.json({
    success: true,
    data: {
      metrics: getAdminMetrics(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}

export function resetAdminMetrics(): void {
  adminMetrics = {
    totalRequests: 0,
    totalDuration: 0,
    avgDuration: 0,
    errorRate: 0,
    statusCodes: {},
    endpoints: {},
  };
}