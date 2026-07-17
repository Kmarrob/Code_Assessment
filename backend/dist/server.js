"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const rep_routes_js_1 = __importDefault(require("./routes/rep.routes.js"));
const user_routes_js_1 = __importDefault(require("./routes/user.routes.js"));
const consultant_routes_js_1 = __importDefault(require("./routes/consultant.routes.js"));
const review_routes_js_1 = __importDefault(require("./routes/review.routes.js"));
const notification_routes_js_1 = __importDefault(require("./routes/notification.routes.js"));
const document_routes_js_1 = __importDefault(require("./routes/document.routes.js"));
const report_routes_js_1 = __importDefault(require("./routes/report.routes.js"));
const recommendation_routes_js_1 = __importDefault(require("./routes/recommendation.routes.js"));
const plan_routes_js_1 = __importDefault(require("./routes/plan.routes.js"));
const subscription_routes_js_1 = __importDefault(require("./routes/subscription.routes.js"));
const payment_routes_js_1 = __importDefault(require("./routes/payment.routes.js"));
require("./services/EmailService.js");
const cache_js_1 = require("./middleware/cache.js");
const SitemapController_js_1 = require("./controllers/SitemapController.js");
const adminPerformance_js_1 = require("./middleware/adminPerformance.js");
const auth_js_2 = require("./middleware/auth.js");
const index_js_1 = require("./types/index.js");
const AdminController_js_1 = require("./controllers/AdminController.js");
const branding_routes_js_1 = __importDefault(require("./routes/branding.routes.js"));
const analytics_routes_js_1 = __importDefault(require("./routes/analytics.routes.js"));
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
            connectSrc: [
                "'self'",
                "https://cisatool.com.br",
                "https://code-assessment-frontend.onrender.com",
                "https://code-assessment-898z.onrender.com",
                "http://localhost:3000",
                "http://localhost:5173",
                "https://api.code-assessment.com"
            ],
            fontSrc: ["'self'", "https:", "data:"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "https:", "'unsafe-inline'"],
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
// ============================================
// CONFIGURAÇÃO CORS CORRIGIDA - PERMITE REQUISIÇÕES SEM ORIGIN
// ============================================
const corsOrigins = env_js_1.config.CORS_ORIGIN.split(',').map(origin => origin.trim());
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        if (corsOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit', 'Authorization'],
    optionsSuccessStatus: 200,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger_js_1.httpLogger);
// ============================================
// RATE LIMIT
// ============================================
app.use(rateLimit_js_1.publicRateLimiter);
// ============================================
// 🔴 CORRIGIDO: ROTA PÚBLICA DE BRANDING (sem autenticação)
// DEVE VIR ANTES do brandingRoutes para não ser interceptada
// ============================================
app.get('/api/branding/:companyId', cache_js_1.noCache, AdminController_js_1.AdminController.getPublicBranding);
// ============================================
// ROTAS DA API
// ============================================
app.use('/api/auth', auth_js_1.default);
app.use('/api/admin', rateLimit_js_1.adminRateLimiter, admin_js_1.default);
app.use('/api/rep', rep_routes_js_1.default);
app.use('/api/user', user_routes_js_1.default);
app.use('/api/consultant', consultant_routes_js_1.default);
app.use('/api/review', review_routes_js_1.default);
app.use('/api/notifications', notification_routes_js_1.default);
app.use('/api/documents', document_routes_js_1.default);
app.use('/api/reports', report_routes_js_1.default);
app.use('/api/recommendations', recommendation_routes_js_1.default);
app.use('/api/plans', plan_routes_js_1.default);
app.use('/api/subscriptions', subscription_routes_js_1.default);
app.use('/api/payments', payment_routes_js_1.default);
app.use('/api/branding', branding_routes_js_1.default);
app.use('/api/admin/analytics', analytics_routes_js_1.default);
app.get('/health', cache_js_1.noCache, (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env_js_1.config.NODE_ENV,
        database: database_js_1.db.getConnectionState() ? 'connected' : 'disconnected',
    });
});
// SEO Routes
app.get('/sitemap.xml', SitemapController_js_1.SitemapController.generate);
app.get('/robots.txt', (_req, res) => {
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
            logger_js_1.logger.info(`👤 Rep Routes: http://localhost:${PORT}/api/rep`);
            logger_js_1.logger.info(`👤 User Routes: http://localhost:${PORT}/api/user`);
            logger_js_1.logger.info(`👤 Consultant Routes: http://localhost:${PORT}/api/consultant`);
            logger_js_1.logger.info(`📋 Review Routes: http://localhost:${PORT}/api/review`);
            logger_js_1.logger.info(`🔔 Notification Routes: http://localhost:${PORT}/api/notifications`);
            logger_js_1.logger.info(`📄 Document Routes: http://localhost:${PORT}/api/documents`);
            logger_js_1.logger.info(`📊 Report Routes: http://localhost:${PORT}/api/reports`);
            logger_js_1.logger.info(`📋 Recommendation Routes: http://localhost:${PORT}/api/recommendations`);
            logger_js_1.logger.info(`📋 Plan Routes: http://localhost:${PORT}/api/plans`);
            logger_js_1.logger.info(`📋 Subscription Routes: http://localhost:${PORT}/api/subscriptions`);
            logger_js_1.logger.info(`📋 Payment Routes: http://localhost:${PORT}/api/payments`);
            logger_js_1.logger.info(`🏷️ Branding Routes: http://localhost:${PORT}/api/branding`);
            logger_js_1.logger.info(`📊 Analytics Routes: http://localhost:${PORT}/api/admin/analytics`);
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