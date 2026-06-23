// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env.js';
import { db } from './config/database.js';
import { logger, httpLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { publicRateLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import repRoutes from './routes/rep.routes.js';
import userRoutes from './routes/user.routes.js';
import consultantRoutes from './routes/consultant.routes.js';
import { noCache } from './middleware/cache.js';
import { SitemapController } from './controllers/SitemapController.js';
import { adminMetricsHandler } from './middleware/adminPerformance.js';
import { authenticate, authorize } from './middleware/auth.js';
import { UserRole } from './types/index.js';

const app = express();

app.use(compression({
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...(config.CORS_ORIGIN ? config.CORS_ORIGIN.split(',').map(o => o.trim()) : ["http://localhost:5173"])],
      fontSrc: ["'self'", "https:", "data:", "fonts.gstatic.com"],
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

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(httpLogger);
app.use(publicRateLimiter);

// ============================================
// ROTAS DA API
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rep', repRoutes);
app.use('/api/user', userRoutes);
app.use('/api/consultant', consultantRoutes);

app.get('/health', noCache, (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: db.getConnectionState() ? 'connected' : 'disconnected',
  });
});

// SEO Routes
app.get('/sitemap.xml', SitemapController.generate);
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
app.get('/admin/metrics', authenticate, authorize(UserRole.ADMIN), adminMetricsHandler);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.PORT;

async function startServer() {
  try {
    await db.connect();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
      logger.info(`🔧 Ambiente: ${config.NODE_ENV}`);
      logger.info(`🔒 Segurança ativa: Helmet, CORS, Rate Limit`);
      logger.info(`📦 Compressão: Gzip/Brotli ativa`);
      logger.info(`❤️ Health check: http://localhost:${PORT}/health`);
      logger.info(`🗺️ Sitemap: http://localhost:${PORT}/sitemap.xml`);
      logger.info(`🤖 Robots: http://localhost:${PORT}/robots.txt`);
      logger.info(`📊 Admin Metrics: http://localhost:${PORT}/admin/metrics`);
      logger.info(`👤 Rep Routes: http://localhost:${PORT}/api/rep`);
      logger.info(`👤 User Routes: http://localhost:${PORT}/api/user`);
      logger.info(`👤 Consultant Routes: http://localhost:${PORT}/api/consultant`);
    });

  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await db.disconnect();
  process.exit(0);
});

startServer();