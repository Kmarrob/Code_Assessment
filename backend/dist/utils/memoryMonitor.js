"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryMonitor = exports.MemoryMonitor = void 0;
const logger_js_1 = require("./logger.js");
const memoryAlerts = [];
const MEMORY_LIMITS = {
    warning: 0.7,
    critical: 0.85,
};
class MemoryMonitor {
    intervalId = null;
    isMonitoring = false;
    start(intervalMs = 60000) {
        if (this.isMonitoring) {
            logger_js_1.logger.warn('Memory monitor already running');
            return;
        }
        this.isMonitoring = true;
        this.intervalId = setInterval(() => {
            this.checkMemory();
        }, intervalMs);
        logger_js_1.logger.info(`🧠 Memory monitor started (interval: ${intervalMs}ms)`);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isMonitoring = false;
            logger_js_1.logger.info('🧠 Memory monitor stopped');
        }
    }
    checkMemory() {
        const memory = process.memoryUsage();
        const heapUsedMB = memory.heapUsed / 1024 / 1024;
        const heapTotalMB = memory.heapTotal / 1024 / 1024;
        const rssMB = memory.rss / 1024 / 1024;
        const usageRatio = memory.heapUsed / memory.heapTotal;
        logger_js_1.logger.debug(`🧠 Memory usage: ${heapUsedMB.toFixed(1)}MB / ${heapTotalMB.toFixed(1)}MB (${(usageRatio * 100).toFixed(1)}%)`);
        if (usageRatio >= MEMORY_LIMITS.critical) {
            const alert = {
                timestamp: new Date(),
                type: 'critical',
                heapUsed: memory.heapUsed,
                heapTotal: memory.heapTotal,
                rss: memory.rss,
                threshold: MEMORY_LIMITS.critical,
                message: `Critical memory usage: ${(usageRatio * 100).toFixed(1)}%`,
            };
            memoryAlerts.push(alert);
            logger_js_1.logger.error(`🔴 ${alert.message} - Used: ${heapUsedMB.toFixed(1)}MB / Total: ${heapTotalMB.toFixed(1)}MB, RSS: ${rssMB.toFixed(1)}MB`);
            if (global.gc) {
                logger_js_1.logger.warn('🔄 Forcing garbage collection...');
                global.gc();
            }
        }
        else if (usageRatio >= MEMORY_LIMITS.warning) {
            const alert = {
                timestamp: new Date(),
                type: 'warning',
                heapUsed: memory.heapUsed,
                heapTotal: memory.heapTotal,
                rss: memory.rss,
                threshold: MEMORY_LIMITS.warning,
                message: `High memory usage: ${(usageRatio * 100).toFixed(1)}%`,
            };
            memoryAlerts.push(alert);
            logger_js_1.logger.warn(`🟡 ${alert.message} - Used: ${heapUsedMB.toFixed(1)}MB / Total: ${heapTotalMB.toFixed(1)}MB`);
        }
        if (memoryAlerts.length > 100) {
            memoryAlerts.splice(0, memoryAlerts.length - 100);
        }
    }
    getStats() {
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
                arrayBuffers: Math.round(memory.arrayBuffers / 1024 / 1024 * 100) / 100,
            },
            alerts: memoryAlerts.slice(-20),
            alertCount: alerts,
        };
    }
    getHandler() {
        return (_req, res) => {
            const stats = this.getStats();
            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString(),
            });
        };
    }
}
exports.MemoryMonitor = MemoryMonitor;
exports.memoryMonitor = new MemoryMonitor();
//# sourceMappingURL=memoryMonitor.js.map