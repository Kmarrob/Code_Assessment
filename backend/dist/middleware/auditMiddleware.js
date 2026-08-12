"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditHttpMiddleware = void 0;
const AuditService_js_1 = require("../services/AuditService.js");
const auditHttpMiddleware = (req, res, next) => {
    // Ignora chamadas estáticas, health checks ou requisições OPTIONS
    if (req.path.startsWith('/health') ||
        req.path.startsWith('/assets') ||
        req.method === 'OPTIONS') {
        return next();
    }
    const startTime = Date.now();
    res.on('finish', async () => {
        try {
            const user = req.user;
            const duration = Date.now() - startTime;
            const success = res.statusCode >= 200 && res.statusCode < 400;
            // Determina a categoria de auditoria com base no caminho da API
            let category = 'system';
            if (req.path.includes('/auth'))
                category = 'auth';
            else if (req.path.includes('/users') || req.path.includes('/admin/users'))
                category = 'user';
            else if (req.path.includes('/companies') || req.path.includes('/company'))
                category = 'company';
            else if (req.path.includes('/governance'))
                category = 'governance';
            else if (req.path.includes('/controls') || req.path.includes('/rep/assign'))
                category = 'control';
            else if (req.path.includes('/reports') || req.path.includes('/report'))
                category = 'report';
            else if (req.path.includes('/payments') || req.path.includes('/checkout'))
                category = 'payment';
            // Define o nome da ação (ex: GET_API_ADMIN_USERS)
            const action = `${req.method}_${req.path.replace(/\//g, '_').toUpperCase()}`;
            await AuditService_js_1.AuditService.log({
                userId: user?.id || user?._id,
                userEmail: user?.email || 'Anônimo/Sistema',
                userName: user?.name,
                userRole: user?.role,
                companyId: user?.companyId,
                action: action,
                category,
                level: success ? 'info' : res.statusCode >= 500 ? 'error' : 'warning',
                resource: req.path.split('/')[2] || 'System',
                resourceId: req.params?.id,
                details: {
                    query: req.query,
                    params: req.params,
                    body: sanitizeBody(req.body),
                },
                success,
                errorMessage: success ? undefined : `HTTP Status ${res.statusCode}`,
                duration,
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
                userAgent: req.headers['user-agent'] || '',
                method: req.method,
                path: req.path,
            });
        }
        catch (err) {
            console.error('Erro ao gravar log de auditoria automático:', err);
        }
    });
    next();
};
exports.auditHttpMiddleware = auditHttpMiddleware;
// Oculta senhas e dados confidenciais do payload gravado
function sanitizeBody(body) {
    if (!body || typeof body !== 'object')
        return body;
    const sanitized = { ...body };
    if (sanitized.password)
        sanitized.password = '[REDACTED]';
    if (sanitized.token)
        sanitized.token = '[REDACTED]';
    if (sanitized.creditCard)
        sanitized.creditCard = '[REDACTED]';
    return sanitized;
}
//# sourceMappingURL=auditMiddleware.js.map