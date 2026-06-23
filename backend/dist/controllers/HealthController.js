"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const database_js_1 = require("../config/database.js");
const logger_js_1 = require("../utils/logger.js");
const env_js_1 = require("../config/env.js");
const circuitBreaker_js_1 = require("../utils/circuitBreaker.js");
const mongoose_1 = __importDefault(require("mongoose"));
class HealthController {
    static startTime = Date.now();
    static async basic(_req, res) {
        const isConnected = database_js_1.db.getConnectionState();
        const status = isConnected ? 'ok' : 'degraded';
        res.json({
            status,
            timestamp: new Date().toISOString(),
            environment: env_js_1.config.NODE_ENV,
            database: isConnected ? 'connected' : 'disconnected',
            uptime: process.uptime(),
        });
    }
    static async detailed(_req, res) {
        try {
            const startTime = Date.now();
            let dbStatus = 'up';
            let dbLatency = 0;
            try {
                if (mongoose_1.default.connection.db) {
                    await mongoose_1.default.connection.db.admin().ping();
                    dbLatency = Date.now() - startTime;
                    dbStatus = dbLatency > 100 ? 'degraded' : 'up';
                }
                else {
                    dbStatus = 'down';
                    logger_js_1.logger.warn('Health check - Database connection not available');
                }
            }
            catch (error) {
                dbStatus = 'down';
                logger_js_1.logger.error('Health check - Database ping failed:', error);
            }
            const memoryUsage = process.memoryUsage();
            const totalMemory = memoryUsage.heapTotal / 1024 / 1024;
            const usedMemory = memoryUsage.heapUsed / 1024 / 1024;
            let dbStats;
            try {
                dbStats = database_js_1.db.getStats();
            }
            catch (error) {
                dbStats = { reconnectAttempts: 0 };
                logger_js_1.logger.warn('Health check - Could not get database stats:', error);
            }
            const dbCircuitState = circuitBreaker_js_1.databaseCircuitBreaker.getState();
            const externalCircuitState = circuitBreaker_js_1.externalApiCircuitBreaker.getState();
            const response = {
                status: dbStatus === 'down' ? 'unhealthy' : dbStatus === 'degraded' ? 'degraded' : 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: env_js_1.config.NODE_ENV,
                version: process.env.npm_package_version || '1.0.0',
                services: {
                    database: {
                        status: dbStatus,
                        connected: database_js_1.db.getConnectionState(),
                        readyState: mongoose_1.default.connection.readyState || 0,
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
                            failureCount: circuitBreaker_js_1.databaseCircuitBreaker.getStats().failureCount,
                            successCount: circuitBreaker_js_1.databaseCircuitBreaker.getStats().successCount,
                        },
                        externalApi: {
                            state: externalCircuitState,
                            failureCount: circuitBreaker_js_1.externalApiCircuitBreaker.getStats().failureCount,
                            successCount: circuitBreaker_js_1.externalApiCircuitBreaker.getStats().successCount,
                        },
                    },
                },
                uptimeFormatted: this.formatUptime(process.uptime()),
            };
            const statusCode = response.status === 'unhealthy' ? 503 : response.status === 'degraded' ? 200 : 200;
            res.status(statusCode).json(response);
        }
        catch (error) {
            logger_js_1.logger.error('Health check error:', error);
            res.status(500).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Health check failed',
            });
        }
    }
    static async readiness(_req, res) {
        const isConnected = database_js_1.db.getConnectionState();
        const isReady = isConnected && mongoose_1.default.connection.readyState === 1;
        if (isReady) {
            res.status(200).json({ status: 'ready' });
        }
        else {
            res.status(503).json({ status: 'not ready' });
        }
    }
    static async liveness(_req, res) {
        res.status(200).json({ status: 'alive' });
    }
    static formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const parts = [];
        if (days > 0)
            parts.push(`${days}d`);
        if (hours > 0)
            parts.push(`${hours}h`);
        if (minutes > 0)
            parts.push(`${minutes}m`);
        parts.push(`${secs}s`);
        return parts.join(' ');
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=HealthController.js.map