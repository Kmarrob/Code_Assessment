"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogMiddleware = securityLogMiddleware;
const securityLogger_js_1 = require("../utils/securityLogger.js");
/**
 * Middleware para logging de todas as requisições autenticadas
 */
function securityLogMiddleware(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    // Registrar a requisição no objeto para uso posterior
    req._security = {
        ip,
        userAgent,
        startTime: Date.now(),
    };
    // Interceptar resposta para logging
    const originalSend = res.send;
    res.send = function (body) {
        const statusCode = res.statusCode;
        const isError = statusCode >= 400;
        // Log apenas para erros (já que ações específicas são logadas nos controllers)
        if (isError) {
            const securityData = req._security;
            securityLogger_js_1.SecurityLogger.log({
                eventType: securityLogger_js_1.SecurityEventType.ACCESS_DENIED,
                timestamp: new Date(),
                userId: req.userId,
                email: req.user?.email,
                ip: securityData?.ip || ip,
                userAgent: securityData?.userAgent || userAgent,
                success: false,
                message: `Requisição com erro: ${statusCode} - ${req.method} ${req.path}`,
                details: { statusCode, path: req.path, method: req.method },
            });
        }
        res.send = originalSend;
        return originalSend.call(this, body);
    };
    next();
}
//# sourceMappingURL=securityLog.js.map