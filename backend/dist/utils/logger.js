"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_js_1 = require("../config/env.js");
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
winston_1.default.addColors(colors);
const developmentFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
}));
const productionFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const format = env_js_1.config.NODE_ENV === 'production' ? productionFormat : developmentFormat;
exports.logger = winston_1.default.createLogger({
    levels,
    level: env_js_1.config.NODE_ENV === 'production' ? 'info' : 'debug',
    format,
    transports: [
        new winston_1.default.transports.Console({
            handleExceptions: true,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            handleExceptions: true,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
        }),
    ],
    exitOnError: false,
});
const httpLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl, ip } = req;
        const { statusCode } = res;
        exports.logger.http(`${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip}`);
    });
    next();
};
exports.httpLogger = httpLogger;
//# sourceMappingURL=logger.js.map