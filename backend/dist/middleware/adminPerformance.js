"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPerformanceMiddleware = adminPerformanceMiddleware;
exports.getAdminMetrics = getAdminMetrics;
exports.adminMetricsHandler = adminMetricsHandler;
exports.resetAdminMetrics = resetAdminMetrics;
const logger_js_1 = require("../utils/logger.js");
let adminMetrics = {
    totalRequests: 0,
    totalDuration: 0,
    avgDuration: 0,
    errorRate: 0,
    statusCodes: {},
    endpoints: {},
};
function adminPerformanceMiddleware(req, res, next) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    const originalSend = res.send;
    res.send = function (body) {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const statusCode = res.statusCode;
        const metric = {
            timestamp: new Date(),
            userId: req.userId,
            email: req.user?.email,
            method: req.method,
            path: req.path,
            statusCode,
            duration,
            memoryUsage: {
                rss: endMemory.rss - startMemory.rss,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            },
        };
        if (duration > 1000 || statusCode >= 400) {
            logger_js_1.logger.http(`[ADMIN-PERFORMANCE] ${req.method} ${req.path} ${statusCode} - ${duration}ms`, metric);
        }
        updateAdminMetrics(metric);
        res.send = originalSend;
        return originalSend.call(this, body);
    };
    next();
}
function updateAdminMetrics(metric) {
    adminMetrics.totalRequests++;
    adminMetrics.totalDuration += metric.duration;
    adminMetrics.avgDuration = adminMetrics.totalDuration / adminMetrics.totalRequests;
    adminMetrics.statusCodes[metric.statusCode] = (adminMetrics.statusCodes[metric.statusCode] || 0) + 1;
    const endpointKey = `${metric.method} ${metric.path}`;
    if (!adminMetrics.endpoints[endpointKey]) {
        adminMetrics.endpoints[endpointKey] = { count: 0, avgDuration: 0 };
    }
    const endpoint = adminMetrics.endpoints[endpointKey];
    endpoint.count++;
    endpoint.avgDuration = ((endpoint.avgDuration * (endpoint.count - 1)) + metric.duration) / endpoint.count;
    const errorCount = adminMetrics.statusCodes[500] || 0;
    adminMetrics.errorRate = errorCount / adminMetrics.totalRequests;
}
function getAdminMetrics() {
    return { ...adminMetrics };
}
function adminMetricsHandler(req, res) {
    res.json({
        success: true,
        data: {
            metrics: getAdminMetrics(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        },
    });
}
function resetAdminMetrics() {
    adminMetrics = {
        totalRequests: 0,
        totalDuration: 0,
        avgDuration: 0,
        errorRate: 0,
        statusCodes: {},
        endpoints: {},
    };
}
//# sourceMappingURL=adminPerformance.js.map