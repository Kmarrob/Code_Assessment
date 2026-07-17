"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.logger = void 0;
var winston_1 = require("winston");
var env_js_1 = require("../config/env.js");
var levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
var colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
winston_1.default.addColors(colors);
var developmentFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf(function (_a) {
    var timestamp = _a.timestamp, level = _a.level, message = _a.message, meta = __rest(_a, ["timestamp", "level", "message"]);
    var metaString = Object.keys(meta).length > 0 ? "\n".concat(JSON.stringify(meta, null, 2)) : '';
    return "[".concat(timestamp, "] ").concat(level, ": ").concat(message).concat(metaString);
}));
var productionFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
var format = env_js_1.config.NODE_ENV === 'production' ? productionFormat : developmentFormat;
exports.logger = winston_1.default.createLogger({
    levels: levels,
    level: env_js_1.config.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format,
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
var httpLogger = function (req, res, next) {
    var start = Date.now();
    res.on('finish', function () {
        var duration = Date.now() - start;
        var method = req.method, originalUrl = req.originalUrl, ip = req.ip;
        var statusCode = res.statusCode;
        exports.logger.http("".concat(method, " ").concat(originalUrl, " ").concat(statusCode, " - ").concat(duration, "ms - ").concat(ip));
    });
    next();
};
exports.httpLogger = httpLogger;
