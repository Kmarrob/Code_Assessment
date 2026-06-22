"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const env_js_1 = require("./config/env.js");
const database_js_1 = require("./config/database.js");
const logger_js_1 = require("./utils/logger.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const rateLimit_js_1 = require("./middleware/rateLimit.js");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const admin_js_1 = __importDefault(require("./routes/admin.js"));
const cache_js_1 = require("./middleware/cache.js");
const SitemapController_js_1 = require("./controllers/SitemapController.js");
const adminPerformance_js_1 = require("./middleware/adminPerformance.js");
const auth_js_2 = require("./middleware/auth.js");
const index_js_1 = require("./types/index.js");
const app = (0, express_1.default)();
app.use((0, compression_1.default)({
    level: 6,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
    threshold: 1024,
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", env_js_1.config.CORS_ORIGIN],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
}));
app.use((0, cors_1.default)({
    origin: env_js_1.config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
    optionsSuccessStatus: 200,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger_js_1.httpLogger);
app.use(rateLimit_js_1.publicRateLimiter);
app.use('/api/auth', auth_js_1.default);
app.use('/api/admin', admin_js_1.default);
app.get('/health', cache_js_1.noCache, (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env_js_1.config.NODE_ENV,
        database: database_js_1.db.getConnectionState() ? 'connected' : 'disconnected',
    });
});
// SEO Routes
app.get('/sitemap.xml', SitemapController_js_1.SitemapController.generate);
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /login
Disallow: /register
Disallow: /admin
Disallow: /profile
Disallow: /api

Sitemap: https://code-assessment.com/sitemap.xml

Crawl-delay: 2

User-agent: Googlebot
Allow: /
Disallow: /login
Disallow: /register
Disallow: /admin
Disallow: /profile
Disallow: /api

User-agent: Bingbot
Allow: /
Disallow: /login
Disallow: /register
Disallow: /admin
Disallow: /profile
Disallow: /api
`);
});
// Admin Metrics (protegido)
app.get('/admin/metrics', auth_js_2.authenticate, (0, auth_js_2.authorize)(index_js_1.UserRole.ADMIN), adminPerformance_js_1.adminMetricsHandler);
app.use(errorHandler_js_1.notFoundHandler);
app.use(errorHandler_js_1.errorHandler);
const PORT = env_js_1.config.PORT;
async function startServer() {
    try {
        await database_js_1.db.connect();
        app.listen(PORT, () => {
            logger_js_1.logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
            logger_js_1.logger.info(`🔧 Ambiente: ${env_js_1.config.NODE_ENV}`);
            logger_js_1.logger.info(`🔒 Segurança ativa: Helmet, CORS, Rate Limit`);
            logger_js_1.logger.info(`📦 Compressão: Gzip/Brotli ativa`);
            logger_js_1.logger.info(`❤️ Health check: http://localhost:${PORT}/health`);
            logger_js_1.logger.info(`🗺️ Sitemap: http://localhost:${PORT}/sitemap.xml`);
            logger_js_1.logger.info(`🤖 Robots: http://localhost:${PORT}/robots.txt`);
            logger_js_1.logger.info(`📊 Admin Metrics: http://localhost:${PORT}/admin/metrics`);
        });
    }
    catch (error) {
        logger_js_1.logger.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', async () => {
    logger_js_1.logger.info('SIGTERM signal received: closing HTTP server');
    await database_js_1.db.disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_js_1.logger.info('SIGINT signal received: closing HTTP server');
    await database_js_1.db.disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=server.js.map