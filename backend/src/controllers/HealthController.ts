// backend/src/controllers/HealthController.ts
import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { databaseCircuitBreaker, externalApiCircuitBreaker } from '../utils/circuitBreaker.js';
import mongoose from 'mongoose';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: {
      status: 'up' | 'down' | 'degraded';
      connected: boolean;
      readyState: number;
      reconnectAttempts: number;
      latency?: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    circuitBreakers: {
      database: {
        state: string;
        failureCount: number;
        successCount: number;
      };
      externalApi: {
        state: string;
        failureCount: number;
        successCount: number;
      };
    };
  };
  uptimeFormatted: string;
}

export class HealthController {
  private static startTime = Date.now();

  static async basic(_req: Request, res: Response): Promise<void> {
    const isConnected = db.getConnectionState();
    const status = isConnected ? 'ok' : 'degraded';

    res.json({
      status,
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: isConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    });
  }

  static async detailed(_req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      let dbStatus: 'up' | 'down' | 'degraded' = 'up';
      let dbLatency = 0;

      try {
        if (mongoose.connection.db) {
          await mongoose.connection.db.admin().ping();
          dbLatency = Date.now() - startTime;
          dbStatus = dbLatency > 100 ? 'degraded' : 'up';
        } else {
          dbStatus = 'down';
          logger.warn('Health check - Database connection not available');
        }
      } catch (error) {
        dbStatus = 'down';
        logger.error('Health check - Database ping failed:', error);
      }

      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal / 1024 / 1024;
      const usedMemory = memoryUsage.heapUsed / 1024 / 1024;

      let dbStats;
      try {
        dbStats = db.getStats();
      } catch (error) {
        dbStats = { reconnectAttempts: 0 };
        logger.warn('Health check - Could not get database stats:', error);
      }

      const dbCircuitState = databaseCircuitBreaker.getState();
      const externalCircuitState = externalApiCircuitBreaker.getState();

      const response: HealthCheckResponse = {
        status: dbStatus === 'down' ? 'unhealthy' : dbStatus === 'degraded' ? 'degraded' : 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: {
            status: dbStatus,
            connected: db.getConnectionState(),
            readyState: mongoose.connection.readyState || 0,
            reconnectAttempts: dbStats?.reconnectAttempts || 0,
            latency: dbLatency,
          },
          memory: {
            used: Math.round(usedMemory * 100) / 100,
            total: Math.round(totalMemory * 100) / 100,
            percentage: Math.round((usedMemory / totalMemory) * 100),
          },
          circuitBreakers: {
            database: {
              state: dbCircuitState,
              failureCount: databaseCircuitBreaker.getStats().failureCount,
              successCount: databaseCircuitBreaker.getStats().successCount,
            },
            externalApi: {
              state: externalCircuitState,
              failureCount: externalApiCircuitBreaker.getStats().failureCount,
              successCount: externalApiCircuitBreaker.getStats().successCount,
            },
          },
        },
        uptimeFormatted: this.formatUptime(process.uptime()),
      };

      const statusCode = response.status === 'unhealthy' ? 503 : response.status === 'degraded' ? 200 : 200;
      res.status(statusCode).json(response);

    } catch (error) {
      logger.error('Health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  }

  static async readiness(_req: Request, res: Response): Promise<void> {
    const isConnected = db.getConnectionState();
    const isReady = isConnected && mongoose.connection.readyState === 1;

    if (isReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  }

  static async liveness(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ status: 'alive' });
  }

  private static formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}