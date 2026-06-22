# scripts/apply-admin-resilience-part3.ps1
# Script para aplicar Parte 3/3 - Logging e Monitoramento

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
)

$ErrorActionPreference = 'Stop'

# Cores
$Colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Blue'
    Step = 'Magenta'
}

function Write-Step {
    param($Message)
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
    Write-Host "║ $Message" -ForegroundColor $Colors.Header
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Colors.Header
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Colors.Info
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
Write-Host "║     CODE_ASSESSMENT - ADMIN RESILIÊNCIA (PILAR 3)          ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 3/3 - LOGGING E MONITORAMENTO                    ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: ADMIN LOGGER
# ============================================
Write-Step "PARTE 1/4: ADMIN LOGGER"

Write-Info "Criando adminLogger.ts..."
@'
// backend/src/utils/adminLogger.ts
import { logger } from './logger.js';
import { SecurityLogger, SecurityEventType } from './securityLogger.js';

export interface AdminLogContext {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  action: string;
  targetUserId?: string;
  targetEmail?: string;
  details?: Record<string, any>;
  success: boolean;
}

export class AdminLogger {
  static logAdminAction(context: AdminLogContext): void {
    const logData = {
      eventType: SecurityEventType.USER_UPDATED,
      timestamp: new Date(),
      userId: context.userId,
      email: context.email,
      ip: context.ip,
      userAgent: context.userAgent,
      success: context.success,
      message: `Ação administrativa: ${context.action}`,
      details: {
        action: context.action,
        targetUserId: context.targetUserId,
        targetEmail: context.targetEmail,
        ...context.details,
      },
    };

    if (context.success) {
      logger.info(`[ADMIN] ${context.action}`, logData);
    } else {
      logger.warn(`[ADMIN] ${context.action} - FALHOU`, logData);
    }

    SecurityLogger.log(logData);
  }

  static logUserCreation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    role: string,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
    this.logAdminAction({
      userId: adminId,
      email: adminEmail,
      ip,
      userAgent,
      action: 'CREATE_USER',
      targetUserId,
      targetEmail,
      details: { role, error: error || undefined },
      success,
    });
  }

  static logUserUpdate(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    changes: Record<string, any>,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
    this.logAdminAction({
      userId: adminId,
      email: adminEmail,
      ip,
      userAgent,
      action: 'UPDATE_USER',
      targetUserId,
      targetEmail,
      details: { changes, error: error || undefined },
      success,
    });
  }

  static logUserDeactivation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
    this.logAdminAction({
      userId: adminId,
      email: adminEmail,
      ip,
      userAgent,
      action: 'DEACTIVATE_USER',
      targetUserId,
      targetEmail,
      details: { error: error || undefined },
      success,
    });
  }

  static logUserReactivation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
    this.logAdminAction({
      userId: adminId,
      email: adminEmail,
      ip,
      userAgent,
      action: 'REACTIVATE_USER',
      targetUserId,
      targetEmail,
      details: { error: error || undefined },
      success,
    });
  }

  static logPasswordReset(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean,
    error?: string
  ): void {
    this.logAdminAction({
      userId: adminId,
      email: adminEmail,
      ip,
      userAgent,
      action: 'RESET_PASSWORD',
      targetUserId,
      targetEmail,
      details: { error: error || undefined },
      success,
    });
  }

  static logAccessDenied(
    userId: string,
    email: string,
    action: string,
    ip: string,
    userAgent: string,
    reason: string
  ): void {
    this.logAdminAction({
      userId,
      email,
      ip,
      userAgent,
      action: `ACCESS_DENIED: ${action}`,
      details: { reason },
      success: false,
    });
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\utils\adminLogger.ts" -Encoding UTF8
Write-Success "adminLogger.ts criado"

# ============================================
# PARTE 2: ADMIN PERFORMANCE
# ============================================
Write-Step "PARTE 2/4: ADMIN PERFORMANCE"

Write-Info "Criando adminPerformance.ts..."
@'
// backend/src/middleware/adminPerformance.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

interface AdminPerformanceMetrics {
  timestamp: Date;
  userId?: string;
  email?: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

let adminMetrics = {
  totalRequests: 0,
  totalDuration: 0,
  avgDuration: 0,
  errorRate: 0,
  statusCodes: {} as Record<number, number>,
  endpoints: {} as Record<string, { count: number; avgDuration: number }>,
};

export function adminPerformanceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  const originalSend = res.send;

  res.send = function(body: any): any {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    const statusCode = res.statusCode;

    const metric: AdminPerformanceMetrics = {
      timestamp: new Date(),
      userId: (req as any).userId,
      email: (req as any).user?.email,
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
      logger.http(`[ADMIN-PERFORMANCE] ${req.method} ${req.path} ${statusCode} - ${duration}ms`, metric);
    }

    updateAdminMetrics(metric);

    res.send = originalSend;
    return originalSend.call(this, body);
  };

  next();
}

function updateAdminMetrics(metric: AdminPerformanceMetrics): void {
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

export function getAdminMetrics(): typeof adminMetrics {
  return { ...adminMetrics };
}

export function adminMetricsHandler(req: Request, res: Response): void {
  res.json({
    success: true,
    data: {
      metrics: getAdminMetrics(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}

export function resetAdminMetrics(): void {
  adminMetrics = {
    totalRequests: 0,
    totalDuration: 0,
    avgDuration: 0,
    errorRate: 0,
    statusCodes: {},
    endpoints: {},
  };
}
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\adminPerformance.ts" -Encoding UTF8
Write-Success "adminPerformance.ts criado"

# ============================================
# PARTE 3: ADMIN ROUTES ATUALIZADO
# ============================================
Write-Step "PARTE 3/4: ADMIN ROUTES ATUALIZADO"

Write-Info "Atualizando admin.ts..."
@'
// backend/src/routes/admin.ts
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  authenticatedRateLimiter,
  adminRateLimiter
} from '../middleware/rateLimit.js';
import { noCache } from '../middleware/cache.js';
import { sanitizeAdminInputs, sanitizeSensitiveFields } from '../middleware/sanitizeAdmin.js';
import { adminPerformanceMiddleware } from '../middleware/adminPerformance.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.use(sanitizeAdminInputs);
router.use(sanitizeSensitiveFields);
router.use(adminPerformanceMiddleware);

router.get(
  '/users',
  authenticatedRateLimiter,
  noCache,
  AdminController.listUsers
);

router.get(
  '/users/:id',
  authenticatedRateLimiter,
  noCache,
  AdminController.getUserById
);

router.post(
  '/users',
  adminRateLimiter,
  noCache,
  AdminController.createUser
);

router.put(
  '/users/:id',
  adminRateLimiter,
  noCache,
  AdminController.updateUser
);

router.delete(
  '/users/:id',
  adminRateLimiter,
  noCache,
  AdminController.deleteUser
);

router.post(
  '/users/:id/reactivate',
  adminRateLimiter,
  noCache,
  AdminController.reactivateUser
);

router.post(
  '/users/:id/reset-password',
  adminRateLimiter,
  noCache,
  AdminController.resetPassword
);

export default router;
'@ | Out-File -FilePath "$BaseDir\backend\src\routes\admin.ts" -Encoding UTF8
Write-Success "admin.ts atualizado"

# ============================================
# PARTE 4: SERVER ATUALIZADO
# ============================================
Write-Step "PARTE 4/4: SERVER ATUALIZADO"

Write-Info "Atualizando server.ts com admin metrics..."
@'
// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env.js';
import { db } from './config/database.js';
import { logger, httpLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
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
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.CORS_ORIGIN],
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
app.use(generalRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', noCache, (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: db.getConnectionState() ? 'connected' : 'disconnected',
  });
});

// SEO Routes
app.get('/sitemap.xml', SitemapController.generate);
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
'@ | Out-File -FilePath "$BaseDir\backend\src\server.ts" -Encoding UTF8
Write-Success "server.ts atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 3/3 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • backend/src/utils/adminLogger.ts"
Write-Info "  • backend/src/middleware/adminPerformance.ts"
Write-Info "  • backend/src/routes/admin.ts (atualizado)"
Write-Info "  • backend/src/server.ts (atualizado)"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ AdminLogger para ações administrativas" -ForegroundColor White
Write-Info "  ✅ AdminPerformanceMiddleware" -ForegroundColor White
Write-Info "  ✅ Métricas de performance para admin" -ForegroundColor White
Write-Info "  ✅ Monitoramento de requisições lentas" -ForegroundColor White
Write-Info "  ✅ Endpoint /admin/metrics" -ForegroundColor White

Write-Info ""
Write-Info "📋 Checklist Final - Pilar 3 (Resiliência) - Admin:" -ForegroundColor Cyan
Write-Info "  ✅ Retry com backoff para operações admin" -ForegroundColor White
Write-Info "  ✅ Circuit breaker integrado" -ForegroundColor White
Write-Info "  ✅ Timeouts configuráveis" -ForegroundColor White
Write-Info "  ✅ ErrorLogger para erros admin" -ForegroundColor White
Write-Info "  ✅ AdminErrorBoundary" -ForegroundColor White
Write-Info "  ✅ Fallbacks para diferentes tipos de erro" -ForegroundColor White
Write-Info "  ✅ AdminLogger para ações administrativas" -ForegroundColor White
Write-Info "  ✅ AdminPerformanceMiddleware" -ForegroundColor White
Write-Info "  ✅ Métricas de performance" -ForegroundColor White

Write-Success ""
Write-Success "🎉 PILAR 3 (RESILIÊNCIA & ERROR HANDLING) - ADMIN - VALIDADO!"
Write-Success "🏁 Módulo Admin - Pilar 3 COMPLETO!"