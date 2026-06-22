// backend/src/config/database.ts
import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';
import { retryDatabase } from '../utils/retry.js';
import { databaseCircuitBreaker } from '../utils/circuitBreaker.js';
import { withDbTimeout } from '../middleware/timeout.js';

export class Database {
  private static instance: Database;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('📦 Database already connected');
      return;
    }

    try {
      const options: mongoose.ConnectOptions = {
        dbName: config.MONGODB_DB_NAME,
        autoIndex: config.NODE_ENV !== 'production',
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        retryReads: true,
      };

      await databaseCircuitBreaker.execute(async () => {
        await retryDatabase(async () => {
          await withDbTimeout(async () => {
            await mongoose.connect(config.MONGODB_URI, options);
          }, 'MongoDB connection');
        }, 'MongoDB connection');
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      logger.info('📦 MongoDB connected successfully');
      
      this.setupEventHandlers();
      
    } catch (error) {
      logger.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
      this.isConnected = false;
      this.attemptReconnect();
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    mongoose.connection.on('connected', () => {
      logger.info('📦 MongoDB connection established');
    });

    mongoose.connection.on('close', () => {
      logger.warn('📦 MongoDB connection closed');
      this.isConnected = false;
    });
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`❌ Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }

    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    logger.info(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error(`❌ Reconnect attempt ${this.reconnectAttempts} failed:`, error);
        this.attemptReconnect();
      }
    }, delay);
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('📦 MongoDB disconnected successfully');
    } catch (error) {
      logger.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionState(): boolean {
    return this.isConnected;
  }

  public getStats(): {
    isConnected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    readyState: number;
  } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      readyState: mongoose.connection.readyState,
    };
  }
}

export const db = Database.getInstance();
