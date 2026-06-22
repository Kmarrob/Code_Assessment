"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutMiddleware = timeoutMiddleware;
exports.withTimeout = withTimeout;
exports.withDbTimeout = withDbTimeout;
exports.withHttpTimeout = withHttpTimeout;
const logger_js_1 = require("../utils/logger.js");
const errorHandler_js_1 = require("./errorHandler.js");
const defaultConfig = {
    defaultTimeout: 30000,
    routeOverrides: {
        '/api/auth/login': 10000,
        '/api/auth/register': 15000,
        '/api/auth/refresh-token': 5000,
        '/api/auth/profile': 10000,
    },
};
function timeoutMiddleware(config = defaultConfig) {
    return (req, res, next) => {
        let timeoutMs = config.defaultTimeout;
        for (const [route, timeout] of Object.entries(config.routeOverrides || {})) {
            if (req.path.startsWith(route)) {
                timeoutMs = timeout;
                break;
            }
        }
        const timeout = setTimeout(() => {
            const error = new errorHandler_js_1.AppError(`Request timeout after ${timeoutMs}ms`, 408, true, undefined, 'REQUEST_TIMEOUT');
            logger_js_1.logger.warn(`Timeout em ${req.method} ${req.path} (${timeoutMs}ms)`);
            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    message: error.message,
                    statusCode: 408,
                    timestamp: new Date().toISOString(),
                    path: req.path,
                });
            }
            next(error);
        }, timeoutMs);
        res.on('finish', () => clearTimeout(timeout));
        res.on('close', () => clearTimeout(timeout));
        next();
    };
}
function withTimeout(fn, timeoutMs, context = 'operation') {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new errorHandler_js_1.AppError(`Operation ${context} timed out after ${timeoutMs}ms`, 408, true, undefined, 'OPERATION_TIMEOUT'));
        }, timeoutMs);
        fn()
            .then((result) => {
            clearTimeout(timeout);
            resolve(result);
        })
            .catch((error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}
function withDbTimeout(fn, context = 'database') {
    return withTimeout(fn, 15000, context);
}
function withHttpTimeout(fn, context = 'http') {
    return withTimeout(fn, 10000, context);
}
//# sourceMappingURL=timeout.js.map