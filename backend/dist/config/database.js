"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.Database = void 0;
// backend/src/config/database.ts
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
const logger_js_1 = require("../utils/logger.js");
const retry_js_1 = require("../utils/retry.js");
const circuitBreaker_js_1 = require("../utils/circuitBreaker.js");
const timeout_js_1 = require("../middleware/timeout.js");
class Database {
    static instance;
    isConnected = false;
    reconnectAttempts = 0;
    maxReconnectAttempts = 10;
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.isConnected) {
            logger_js_1.logger.info('📦 Database already connected');
            return;
        }
        try {
            const options = {
                dbName: env_js_1.config.MONGODB_DB_NAME,
                autoIndex: env_js_1.config.NODE_ENV !== 'production',
                maxPoolSize: 10,
                minPoolSize: 2,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4,
                retryWrites: true,
                retryReads: true,
            };
            await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                await (0, retry_js_1.retryDatabase)(async () => {
                    await (0, timeout_js_1.withDbTimeout)(async () => {
                        await mongoose_1.default.connect(env_js_1.config.MONGODB_URI, options);
                    }, 'MongoDB connection');
                }, 'MongoDB connection');
            });
            this.isConnected = true;
            this.reconnectAttempts = 0;
            logger_js_1.logger.info('📦 MongoDB connected successfully');
            // =====================================================
            // DIAGNÓSTICO (NÃO ALTERA O FUNCIONAMENTO DO SISTEMA)
            // =====================================================
            logger_js_1.logger.info(`📍 Mongo URI.......: ${env_js_1.config.MONGODB_URI}`);
            logger_js_1.logger.info(`📍 DB configurado..: ${env_js_1.config.MONGODB_DB_NAME}`);
            logger_js_1.logger.info(`📍 DB conectado....: ${mongoose_1.default.connection.name}`);
            logger_js_1.logger.info(`📍 Collection Plan.: ${mongoose_1.default.connection.collection('plans').collectionName}`);
            // =====================================================
            this.setupEventHandlers();
        }
        catch (error) {
            logger_js_1.logger.error('❌ Failed to connect to MongoDB:', error);
            throw error;
        }
    }
    setupEventHandlers() {
        mongoose_1.default.connection.on('error', (error) => {
            logger_js_1.logger.error('❌ MongoDB connection error:', error);
            this.isConnected = false;
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_js_1.logger.warn('⚠️ MongoDB disconnected');
            this.isConnected = false;
            this.attemptReconnect();
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_js_1.logger.info('🔄 MongoDB reconnected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });
        mongoose_1.default.connection.on('connected', () => {
            logger_js_1.logger.info('📦 MongoDB connection established');
        });
        mongoose_1.default.connection.on('close', () => {
            logger_js_1.logger.warn('📦 MongoDB connection closed');
            this.isConnected = false;
        });
    }
    async attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger_js_1.logger.error(`❌ Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
        logger_js_1.logger.info(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        setTimeout(async () => {
            try {
                await this.connect();
            }
            catch (error) {
                logger_js_1.logger.error(`❌ Reconnect attempt ${this.reconnectAttempts} failed:`, error);
                this.attemptReconnect();
            }
        }, delay);
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            logger_js_1.logger.info('📦 MongoDB disconnected successfully');
        }
        catch (error) {
            logger_js_1.logger.error('❌ Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
    getConnectionState() {
        return this.isConnected;
    }
    getStats() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            readyState: mongoose_1.default.connection.readyState,
        };
    }
}
exports.Database = Database;
exports.db = Database.getInstance();
//# sourceMappingURL=database.js.map