"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.withDatabaseRetry = withDatabaseRetry;
const database_js_1 = require("../config/database.js");
const logger_js_1 = require("../utils/logger.js");
const errorHandler_js_1 = require("./errorHandler.js");
async function checkDatabaseHealth(req, _res, next) {
    try {
        const isConnected = database_js_1.db.getConnectionState();
        if (!isConnected) {
            logger_js_1.logger.warn(`Database not connected, attempting reconnect for request: ${req.method} ${req.path}`);
            try {
                await database_js_1.db.connect();
                logger_js_1.logger.info(`Database reconnected successfully for request: ${req.method} ${req.path}`);
                return next();
            }
            catch (reconnectError) {
                logger_js_1.logger.error('Failed to reconnect database:', reconnectError);
                const isCriticalRoute = req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin');
                if (isCriticalRoute) {
                    const error = new errorHandler_js_1.AppError('Serviço temporariamente indisponível. Tente novamente mais tarde.', 503, true, undefined, 'DATABASE_UNAVAILABLE');
                    return next(error);
                }
                next();
            }
        }
        else {
            next();
        }
    }
    catch (error) {
        logger_js_1.logger.error('Database health check error:', error);
        next(error);
    }
}
function withDatabaseRetry(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            if (error instanceof Error &&
                (error.message.includes('MongoNetworkError') ||
                    error.message.includes('MongoTimeoutError') ||
                    error.message.includes('ECONNREFUSED'))) {
                logger_js_1.logger.warn(`Database error in handler, attempting reconnect: ${error.message}`);
                try {
                    await database_js_1.db.connect();
                    logger_js_1.logger.info('Database reconnected, retrying handler');
                    await handler(req, res, next);
                }
                catch (reconnectError) {
                    logger_js_1.logger.error('Failed to reconnect after database error:', reconnectError);
                    next(error);
                }
            }
            else {
                next(error);
            }
        }
    };
}
//# sourceMappingURL=databaseHealth.js.map