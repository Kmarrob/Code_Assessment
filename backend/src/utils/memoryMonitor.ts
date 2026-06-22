// backend/src/utils/memoryMonitor.ts
import { Request, Response } from 'express';
import { logger } from './logger.js';

interface MemoryAlert {
  timestamp: Date;
  type: 'warning' | 'critical';
  heapUsed: number;
  heapTotal: number;
  rss: number;
  threshold: number;
  message: string;
}

const memoryAlerts: MemoryAlert[] = [];

const MEMORY_LIMITS = {
  warning: 0.7,
  critical: 0.85,
};

export class MemoryMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  start(intervalMs: number = 60000): void {
    if (this.isMonitoring) {
      logger.warn('Memory monitor already running');
      return;
    }

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.checkMemory();
    }, intervalMs);

    logger.info(`🧠 Memory monitor started (interval: ${intervalMs}ms)`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isMonitoring = false;
      logger.info('🧠 Memory monitor stopped');
    }
  }

  private checkMemory(): void {
    const memory = process.memoryUsage();
    const heapUsedMB = memory.heapUsed / 1024 / 1024;
    const heapTotalMB = memory.heapTotal / 1024 / 1024;
    const rssMB = memory.rss / 1024 / 1024;
    const usageRatio = memory.heapUsed / memory.heapTotal;

    logger.debug(`🧠 Memory usage: ${heapUsedMB.toFixed(1)}MB / ${heapTotalMB.toFixed(1)}MB (${(usageRatio * 100).toFixed(1)}%)`);

    if (usageRatio >= MEMORY_LIMITS.critical) {
      const alert: MemoryAlert = {
        timestamp: new Date(),
        type: 'critical',
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        rss: memory.rss,
        threshold: MEMORY_LIMITS.critical,
        message: `Critical memory usage: ${(usageRatio * 100).toFixed(1)}%`,
      };
      memoryAlerts.push(alert);
      logger.error(`🔴 ${alert.message} - Used: ${heapUsedMB.toFixed(1)}MB / Total: ${heapTotalMB.toFixed(1)}MB, RSS: ${rssMB.toFixed(1)}MB`);
      
      if (global.gc) {
        logger.warn('🔄 Forcing garbage collection...');
        global.gc();
      }
    } else if (usageRatio >= MEMORY_LIMITS.warning) {
      const alert: MemoryAlert = {
        timestamp: new Date(),
        type: 'warning',
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        rss: memory.rss,
        threshold: MEMORY_LIMITS.warning,
        message: `High memory usage: ${(usageRatio * 100).toFixed(1)}%`,
      };
      memoryAlerts.push(alert);
      logger.warn(`🟡 ${alert.message} - Used: ${heapUsedMB.toFixed(1)}MB / Total: ${heapTotalMB.toFixed(1)}MB`);
    }

    if (memoryAlerts.length > 100) {
      memoryAlerts.splice(0, memoryAlerts.length - 100);
    }
  }

  getStats(): {
    current: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
      external: number;
      arrayBuffers: number;
    };
    alerts: MemoryAlert[];
    alertCount: { warning: number; critical: number };
  } {
    const memory = process.memoryUsage();
    const alerts = {
      warning: memoryAlerts.filter((a) => a.type === 'warning').length,
      critical: memoryAlerts.filter((a) => a.type === 'critical').length,
    };

    return {
      current: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
        rss: Math.round(memory.rss / 1024 / 1024 * 100) / 100,
        external: Math.round(memory.external / 1024 / 1024 * 100) / 100,
        arrayBuffers: Math.round((memory as any).arrayBuffers / 1024 / 1024 * 100) / 100,
      },
      alerts: memoryAlerts.slice(-20),
      alertCount: alerts,
    };
  }

  getHandler() {
    return (_req: Request, res: Response): void => {
      const stats = this.getStats();
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    };
  }
}

export const memoryMonitor = new MemoryMonitor();