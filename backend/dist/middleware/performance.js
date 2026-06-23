"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMiddleware = performanceMiddleware;
exports.getPerformanceMetrics = getPerformanceMetrics;
exports.performanceMetricsHandler = performanceMetricsHandler;
exports.resetMetrics = resetMetrics;
const logger_js_1 = require("../utils/logger.js");
let metrics = {
    totalRequests: 0,
    totalDuration: 0,
    avgDuration: 0,
    errorRate: 0,
    statusCodes: {},
    endpoints: {},
};
function performanceMiddleware(req, res, next) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    req._startTime = startTime;
    const originalSend = res.send;
    res.send = function (body) {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const statusCode = res.statusCode;
        const metric = {
            timestamp: new Date(),
            method: req.method,
            path: req.path,
            statusCode,
            duration,
            memoryUsage: {
                rss: endMemory.rss - startMemory.rss,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                external: endMemory.external - startMemory.external,
            },
            userId: req.userId,
            ip: req.ip,
        };
        if (duration > 1000 || statusCode >= 400) {
            logger_js_1.logger.http(`[PERFORMANCE] ${req.method} ${req.path} ${statusCode} - ${duration}ms`, metric);
        }
        updateMetrics(metric);
        res.send = originalSend;
        return originalSend.call(this, body);
    };
    next();
}
function updateMetrics(metric) {
    metrics.totalRequests++;
    metrics.totalDuration += metric.duration;
    metrics.avgDuration = metrics.totalDuration / metrics.totalRequests;
    metrics.statusCodes[metric.statusCode] = (metrics.statusCodes[metric.statusCode] || 0) + 1;
    const endpointKey = `${metric.method} ${metric.path}`;
    if (!metrics.endpoints[endpointKey]) {
        metrics.endpoints[endpointKey] = { count: 0, avgDuration: 0 };
    }
    const endpoint = metrics.endpoints[endpointKey];
    endpoint.count++;
    endpoint.avgDuration = ((endpoint.avgDuration * (endpoint.count - 1)) + metric.duration) / endpoint.count;
    const errorCount = metrics.statusCodes[500] || 0;
    metrics.errorRate = errorCount / metrics.totalRequests;
}
function getPerformanceMetrics() {
    return { ...metrics };
}
function performanceMetricsHandler(_req, res) {
    res.json({
        success: true,
        data: {
            metrics: getPerformanceMetrics(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        },
    });
}
function resetMetrics() {
    metrics = {
        totalRequests: 0,
        totalDuration: 0,
        avgDuration: 0,
        errorRate: 0,
        statusCodes: {},
        endpoints: {},
    };
}
//# sourceMappingURL=performance.js.map