// backend/src/utils/shutdown.ts
import { Server } from 'http';
import { logger } from './logger.js';
import { db } from '../config/database.js';

export interface ShutdownConfig {
  timeout: number;
  forceTimeout: number;
  retryDelay: number;
  maxRetries: number;
}

const defaultConfig: ShutdownConfig = {
  timeout: 30000,
  forceTimeout: 5000,
  retryDelay: 1000,
  maxRetries: 3,
};

export class GracefulShutdown {
  private server: Server | null = null;
  private config: ShutdownConfig;
  private isShuttingDown = false;

  constructor(config: Partial<ShutdownConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  register(server: Server): void {
    this.server = server;

    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGHUP', () => this.shutdown('SIGHUP'));

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      this.shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', reason);
      this.shutdown('unhandledRejection');
    });

    logger.info('Graceful shutdown handlers registered');
  }

  async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress, waiting...');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`⚠️ Received ${signal}, starting graceful shutdown...`);

    try {
      await this.stopAcceptingConnections();
      await this.waitForConnections();
      await this.closeDatabase();

      logger.info('✅ Graceful shutdown completed successfully');
      process.exit(0);

    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);
      
      logger.warn(`Force shutdown after ${this.config.forceTimeout}ms`);
      setTimeout(() => {
        process.exit(1);
      }, this.config.forceTimeout);
    }
  }

  private stopAcceptingConnections(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        logger.info('📡 Server stopped accepting new connections');
        resolve();
      });

      setTimeout(() => {
        logger.warn('⚠️ Server close timeout, forcing...');
        resolve();
      }, this.config.timeout);
    });
  }

  private waitForConnections(): Promise<void> {
    return new Promise((resolve) => {
      const waitTime = 2000;
      logger.info(`⏳ Waiting ${waitTime}ms for connections to finish...`);
      setTimeout(resolve, waitTime);
    });
  }

  private async closeDatabase(): Promise<void> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.config.maxRetries) {
      try {
        logger.info(`📦 Closing database connection (attempt ${attempts + 1}/${this.config.maxRetries})...`);
        await db.disconnect();
        logger.info('📦 Database connection closed successfully');
        return;
      } catch (error) {
        lastError = error as Error;
        attempts++;
        logger.warn(`Database disconnect attempt ${attempts} failed:`, error);
        
        if (attempts < this.config.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    throw new Error(`Failed to close database after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  isShuttingDownNow(): boolean {
    return this.isShuttingDown;
  }
}

export const gracefulShutdown = new GracefulShutdown();
