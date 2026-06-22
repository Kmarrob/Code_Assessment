"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = exports.GracefulShutdown = void 0;
const logger_js_1 = require("./logger.js");
const database_js_1 = require("../config/database.js");
const defaultConfig = {
    timeout: 30000,
    forceTimeout: 5000,
    retryDelay: 1000,
    maxRetries: 3,
};
class GracefulShutdown {
    server = null;
    config;
    isShuttingDown = false;
    constructor(config = {}) {
        this.config = { ...defaultConfig, ...config };
    }
    register(server) {
        this.server = server;
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
        process.on('SIGINT', () => this.shutdown('SIGINT'));
        process.on('SIGHUP', () => this.shutdown('SIGHUP'));
        process.on('uncaughtException', (error) => {
            logger_js_1.logger.error('Uncaught exception:', error);
            this.shutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason) => {
            logger_js_1.logger.error('Unhandled rejection:', reason);
            this.shutdown('unhandledRejection');
        });
        logger_js_1.logger.info('Graceful shutdown handlers registered');
    }
    async shutdown(signal) {
        if (this.isShuttingDown) {
            logger_js_1.logger.warn('Shutdown already in progress, waiting...');
            return;
        }
        this.isShuttingDown = true;
        logger_js_1.logger.info(`⚠️ Received ${signal}, starting graceful shutdown...`);
        try {
            await this.stopAcceptingConnections();
            await this.waitForConnections();
            await this.closeDatabase();
            logger_js_1.logger.info('✅ Graceful shutdown completed successfully');
            process.exit(0);
        }
        catch (error) {
            logger_js_1.logger.error('❌ Error during graceful shutdown:', error);
            logger_js_1.logger.warn(`Force shutdown after ${this.config.forceTimeout}ms`);
            setTimeout(() => {
                process.exit(1);
            }, this.config.forceTimeout);
        }
    }
    stopAcceptingConnections() {
        return new Promise((resolve) => {
            if (!this.server) {
                resolve();
                return;
            }
            this.server.close(() => {
                logger_js_1.logger.info('📡 Server stopped accepting new connections');
                resolve();
            });
            setTimeout(() => {
                logger_js_1.logger.warn('⚠️ Server close timeout, forcing...');
                resolve();
            }, this.config.timeout);
        });
    }
    waitForConnections() {
        return new Promise((resolve) => {
            const waitTime = 2000;
            logger_js_1.logger.info(`⏳ Waiting ${waitTime}ms for connections to finish...`);
            setTimeout(resolve, waitTime);
        });
    }
    async closeDatabase() {
        let attempts = 0;
        let lastError = null;
        while (attempts < this.config.maxRetries) {
            try {
                logger_js_1.logger.info(`📦 Closing database connection (attempt ${attempts + 1}/${this.config.maxRetries})...`);
                await database_js_1.db.disconnect();
                logger_js_1.logger.info('📦 Database connection closed successfully');
                return;
            }
            catch (error) {
                lastError = error;
                attempts++;
                logger_js_1.logger.warn(`Database disconnect attempt ${attempts} failed:`, error);
                if (attempts < this.config.maxRetries) {
                    await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        throw new Error(`Failed to close database after ${this.config.maxRetries} attempts: ${lastError?.message}`);
    }
    isShuttingDownNow() {
        return this.isShuttingDown;
    }
}
exports.GracefulShutdown = GracefulShutdown;
exports.gracefulShutdown = new GracefulShutdown();
//# sourceMappingURL=shutdown.js.map