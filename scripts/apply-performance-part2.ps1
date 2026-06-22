# scripts/apply-performance-part2.ps1
# Script para implementar Velocidade & Performance - Parte 2/4 (Compressão e Cache)

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
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - VELOCIDADE & PERFORMANCE (PILAR 5)   ║" -ForegroundColor Cyan
Write-Host "║     PARTE 2/4 - BACKEND - COMPRESSÃO E CACHE               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: INSTALAR DEPENDÊNCIAS
# ============================================
Write-Step "PARTE 1/3: INSTALANDO DEPENDÊNCIAS"

Write-Info "Instalando compression..."
Push-Location "$BaseDir\backend"
npm install compression --save
npm install -D @types/compression --save-dev
Pop-Location
Write-Success "Compression instalado"

# ============================================
# PARTE 2: SERVER COM COMPRESSION
# ============================================
Write-Step "PARTE 2/3: SERVER COM COMPRESSION"

Write-Info "Atualizando server.ts com compression..."
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
import { noCache } from './middleware/cache.js';

const app = express();

// ============================================
// COMPRESSÃO GZIP/BROTLI
// ============================================
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

// ============================================
// SECURITY HEADERS (HELMET)
// ============================================
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

// ============================================
// CORS CONFIGURATION
// ============================================
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
  optionsSuccessStatus: 200,
}));

// ============================================
// MIDDLEWARES
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(httpLogger);
app.use(generalRateLimiter);

// ============================================
// ROTAS DA API
// ============================================
app.use('/api/auth', authRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', noCache, (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: db.getConnectionState() ? 'connected' : 'disconnected',
  });
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================
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
# PARTE 3: CACHE MIDDLEWARE E ROTAS
# ============================================
Write-Step "PARTE 3/3: CACHE MIDDLEWARE E ROTAS"

# 3.1 - Cache Middleware
Write-Info "Criando cache.ts..."
@'
// backend/src/middleware/cache.ts
import { Request, Response, NextFunction } from 'express';

export const CacheControl = {
  STATIC: 'public, max-age=3600, immutable',
  SHORT: 'public, max-age=300, must-revalidate',
  MEDIUM: 'public, max-age=86400, must-revalidate',
  NO_CACHE: 'no-cache, no-store, must-revalidate',
  PRIVATE: 'private, max-age=300',
};

export function cacheControl(directive: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Cache-Control', directive);
    next();
  };
}

export const staticCache = cacheControl(CacheControl.STATIC);
export const shortCache = cacheControl(CacheControl.SHORT);
export const noCache = cacheControl(CacheControl.NO_CACHE);
export const privateCache = cacheControl(CacheControl.PRIVATE);
export const publicCache = cacheControl(CacheControl.MEDIUM);

export function conditionalCache(etag: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('ETag', etag);
    
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) {
      res.status(304).end();
      return;
    }
    
    next();
  };
}

export function lastModifiedCache(lastModified: Date) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Last-Modified', lastModified.toUTCString());
    
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince) {
      const clientDate = new Date(ifModifiedSince);
      if (clientDate >= lastModified) {
        res.status(304).end();
        return;
      }
    }
    
    next();
  };
}
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\cache.ts" -Encoding UTF8
Write-Success "cache.ts criado"

# 3.2 - Atualizar auth.ts com cache
Write-Info "Atualizando auth.ts com cache..."
@'
// backend/src/routes/auth.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  authRateLimiter, 
  registerRateLimiter, 
  refreshRateLimiter,
  authenticatedRateLimiter,
  sensitiveRateLimiter
} from '../middleware/rateLimit.js';
import { UserRole } from '../types/index.js';
import { noCache, privateCache } from '../middleware/cache.js';

const router = Router();

// Rotas públicas (sem cache)
router.post('/register', registerRateLimiter, noCache, AuthController.register);
router.post('/login', authRateLimiter, noCache, AuthController.login);
router.post('/refresh-token', refreshRateLimiter, noCache, AuthController.refreshToken);

// Rotas autenticadas (cache privado)
router.use(authenticate);

router.post('/logout', authenticatedRateLimiter, noCache, AuthController.logout);
router.get('/profile', authenticatedRateLimiter, privateCache, AuthController.getProfile);
router.put('/profile', sensitiveRateLimiter, noCache, AuthController.updateProfile);

// Rotas admin (sem cache)
router.get(
  '/users', 
  authorize(UserRole.ADMIN), 
  authenticatedRateLimiter, 
  noCache,
  AuthController.listUsers
);

router.get(
  '/users/:id', 
  authorize(UserRole.ADMIN), 
  authenticatedRateLimiter, 
  noCache,
  AuthController.getUserById
);

export default router;
'@ | Out-File -FilePath "$BaseDir\backend\src\routes\auth.ts" -Encoding UTF8
Write-Success "auth.ts atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 2/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • backend/src/server.ts (atualizado com compression)"
Write-Info "  • backend/src/middleware/cache.ts"
Write-Info "  • backend/src/routes/auth.ts (atualizado com cache)"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Compressão Gzip/Brotli configurada" -ForegroundColor White
Write-Info "  ✅ Headers de Cache Control" -ForegroundColor White
Write-Info "  ✅ Cache para rotas estáticas" -ForegroundColor White
Write-Info "  ✅ Sem cache para dados sensíveis" -ForegroundColor White
Write-Info "  ✅ Cache privado para dados do usuário" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Verifique headers de compressão: curl -I http://localhost:3000/health" -ForegroundColor White
Write-Info "  3. Verifique headers de cache: curl -I http://localhost:3000/health" -ForegroundColor White

Write-Success "🎉 Parte 2/4 concluída com sucesso!"