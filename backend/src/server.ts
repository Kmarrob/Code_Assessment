// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env.js';
import { db } from './config/database.js';
import { logger, httpLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { publicRateLimiter, adminRateLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import repRoutes from './routes/rep.routes.js';
import userRoutes from './routes/user.routes.js';
import consultantRoutes from './routes/consultant.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import documentRoutes from './routes/document.routes.js'; // 🔴 NOVO
import reportRoutes from './routes/report.routes.js'; // 🔴 NOVO (v17)
import recommendationRoutes from './routes/recommendation.routes.js'; // 🔴 NOVO (v19)
import planRoutes from './routes/plan.routes.js'; // 🔴 NOVO (v26) - Rotas de planos
import './services/EmailService.js';
import { noCache } from './middleware/cache.js';
import { SitemapController } from './controllers/SitemapController.js';
import { adminMetricsHandler } from './middleware/adminPerformance.js';
import { authenticate, authorize } from './middleware/auth.js';
import { UserRole } from './types/index.js';
// 🔴 NOVO: Import do AdminController para a rota pública de branding
import { AdminController } from './controllers/AdminController.js';

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
// Processar CORS_ORIGIN como array de origens permitidas
const corsOrigins = config.CORS_ORIGIN.split(',').map(origin => origin.trim());

app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permitir requisições sem origin (health checks, ferramentas, etc.)
    // Render faz health checks sem header Origin
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar se a origem está na lista de permitidas
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit', 'Authorization'],
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(httpLogger);

// ============================================
// CORREÇÃO: Rate Limit com isenção para admin
// ============================================
// Public rate limiter para rotas públicas (menos restritivo)
app.use(publicRateLimiter);

// ============================================
// ROTAS DA API
// ============================================
app.use('/api/auth', authRoutes);
// CORREÇÃO: Rotas admin com adminRateLimiter (admin tem acesso ilimitado)
app.use('/api/admin', adminRateLimiter, adminRoutes);
app.use('/api/rep', repRoutes);
app.use('/api/user', userRoutes);
app.use('/api/consultant', consultantRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes); // 🔴 NOVO - Rotas de documentos
app.use('/api/reports', reportRoutes); // 🔴 NOVO (v17) - Rotas de relatórios
app.use('/api/recommendations', recommendationRoutes); // 🔴 NOVO (v19) - Rotas de recomendações
app.use('/api/plans', planRoutes); // 🔴 NOVO (v26) - Rotas de planos

// ============================================
// ROTA PÚBLICA DE BRANDING (sem autenticação)
// ============================================
app.get('/api/branding/:companyId', noCache, AdminController.getPublicBranding);

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
      logger.info(`📋 Review Routes: http://localhost:${PORT}/api/review`);
      logger.info(`🔔 Notification Routes: http://localhost:${PORT}/api/notifications`);
      logger.info(`📄 Document Routes: http://localhost:${PORT}/api/documents`);
      logger.info(`📊 Report Routes: http://localhost:${PORT}/api/reports`);
      logger.info(`📋 Recommendation Routes: http://localhost:${PORT}/api/recommendations`);
      logger.info(`📋 Plan Routes: http://localhost:${PORT}/api/plans`); // 🔴 NOVO (v26)
      logger.info(`🏷️ Branding Routes: http://localhost:${PORT}/api/branding/:companyId`);
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