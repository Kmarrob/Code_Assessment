# scripts/apply-resilience-part3.ps1
# Script para implementar Resiliência de Conexão (Pilar 3 - Parte 3/4)

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
Write-Host "║     CODE_ASSESSMENT - RESILIÊNCIA (PILAR 3)                 ║" -ForegroundColor Cyan
Write-Host "║     PARTE 3/4 - RESILIÊNCIA DE CONEXÃO                     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: HEALTH CONTROLLER
# ============================================
Write-Step "PARTE 1/3: HEALTH CONTROLLER"

Write-Info "Criando HealthController.ts..."
@'
// backend/src/controllers/HealthController.ts
import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { databaseCircuitBreaker, externalApiCircuitBreaker } from '../utils/circuitBreaker.js';
import mongoose from 'mongoose';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: {
      status: 'up' | 'down' | 'degraded';
      connected: boolean;
      readyState: number;
      reconnectAttempts: number;
      latency?: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    circuitBreakers: {
      database: {
        state: string;
        failureCount: number;
        successCount: number;
      };
      externalApi: {
        state: string;
        failureCount: number;
        successCount: number;
      };
    };
  };
  uptimeFormatted: string;
}

export class HealthController {
  private static startTime = Date.now();

  static async basic(req: Request, res: Response): Promise<void> {
    const isConnected = db.getConnectionState();
    const status = isConnected ? 'ok' : 'degraded';

    res.json({
      status,
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: isConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    });
  }

  static async detailed(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      let dbStatus: 'up' | 'down' | 'degraded' = 'up';
      let dbLatency = 0;

      try {
        await mongoose.connection.db.admin().ping();
        dbLatency = Date.now() - startTime;
        dbStatus = dbLatency > 100 ? 'degraded' : 'up';
      } catch (error) {
        dbStatus = 'down';
        logger.error('Health check - Database ping failed:', error);
      }

      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal / 1024 / 1024;
      const usedMemory = memoryUsage.heapUsed / 1024 / 1024;

      const dbStats = db.getStats();
      const dbCircuitState = databaseCircuitBreaker.getState();
      const externalCircuitState = externalApiCircuitBreaker.getState();

      const response: HealthCheckResponse = {
        status: dbStatus === 'down' ? 'unhealthy' : dbStatus === 'degraded' ? 'degraded' : 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: {
            status: dbStatus,
            connected: db.getConnectionState(),
            readyState: mongoose.connection.readyState,
            reconnectAttempts: dbStats.reconnectAttempts,
            latency: dbLatency,
          },
          memory: {
            used: Math.round(usedMemory * 100) / 100,
            total: Math.round(totalMemory * 100) / 100,
            percentage: Math.round((usedMemory / totalMemory) * 100),
          },
          circuitBreakers: {
            database: {
              state: dbCircuitState,
              failureCount: databaseCircuitBreaker.getStats().failureCount,
              successCount: databaseCircuitBreaker.getStats().successCount,
            },
            externalApi: {
              state: externalCircuitState,
              failureCount: externalApiCircuitBreaker.getStats().failureCount,
              successCount: externalApiCircuitBreaker.getStats().successCount,
            },
          },
        },
        uptimeFormatted: this.formatUptime(process.uptime()),
      };

      const statusCode = response.status === 'unhealthy' ? 503 : response.status === 'degraded' ? 200 : 200;
      res.status(statusCode).json(response);

    } catch (error) {
      logger.error('Health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  }

  static async readiness(req: Request, res: Response): Promise<void> {
    const isConnected = db.getConnectionState();
    const isReady = isConnected && mongoose.connection.readyState === 1;

    if (isReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  }

  static async liveness(req: Request, res: Response): Promise<void> {
    res.status(200).json({ status: 'alive' });
  }

  private static formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\controllers\HealthController.ts" -Encoding UTF8
Write-Success "HealthController.ts criado"

# ============================================
# PARTE 2: DATABASE HEALTH MIDDLEWARE
# ============================================
Write-Step "PARTE 2/3: DATABASE HEALTH MIDDLEWARE"

Write-Info "Criando databaseHealth.ts..."
@'
// backend/src/middleware/databaseHealth.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { AppError } from './errorHandler.js';
import mongoose from 'mongoose';

export async function checkDatabaseHealth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isConnected = db.getConnectionState();

    if (!isConnected) {
      logger.warn(`Database not connected, attempting reconnect for request: ${req.method} ${req.path}`);
      
      try {
        await db.connect();
        logger.info(`Database reconnected successfully for request: ${req.method} ${req.path}`);
        return next();
      } catch (reconnectError) {
        logger.error('Failed to reconnect database:', reconnectError);
        
        const isCriticalRoute = req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin');
        
        if (isCriticalRoute) {
          const error = new AppError(
            'Serviço temporariamente indisponível. Tente novamente mais tarde.',
            503,
            true,
            undefined,
            'DATABASE_UNAVAILABLE'
          );
          return next(error);
        }
        
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    logger.error('Database health check error:', error);
    next(error);
  }
}

export function withDatabaseRetry(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof Error && 
          (error.message.includes('MongoNetworkError') ||
           error.message.includes('MongoTimeoutError') ||
           error.message.includes('ECONNREFUSED'))) {
        
        logger.warn(`Database error in handler, attempting reconnect: ${error.message}`);
        
        try {
          await db.connect();
          logger.info('Database reconnected, retrying handler');
          await handler(req, res, next);
        } catch (reconnectError) {
          logger.error('Failed to reconnect after database error:', reconnectError);
          next(error);
        }
      } else {
        next(error);
      }
    }
  };
}
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\databaseHealth.ts" -Encoding UTF8
Write-Success "databaseHealth.ts criado"

# ============================================
# PARTE 3: GRACEFUL SHUTDOWN
# ============================================
Write-Step "PARTE 3/3: GRACEFUL SHUTDOWN"

Write-Info "Criando shutdown.ts..."
@'
// backend/src/utils/shutdown.ts
import { Server } from 'http';
import { logger } from './logger.js';
import { db } from '../config/database.js';

export interface ShutdownConfig {
  timeout: number;
  forceTimeout: number;
  retryDelay: number;
  maxRetries: number;
}

const defaultConfig: ShutdownConfig = {
  timeout: 30000,
  forceTimeout: 5000,
  retryDelay: 1000,
  maxRetries: 3,
};

export class GracefulShutdown {
  private server: Server | null = null;
  private config: ShutdownConfig;
  private isShuttingDown = false;

  constructor(config: Partial<ShutdownConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  register(server: Server): void {
    this.server = server;

    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGHUP', () => this.shutdown('SIGHUP'));

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      this.shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', reason);
      this.shutdown('unhandledRejection');
    });

    logger.info('Graceful shutdown handlers registered');
  }

  async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress, waiting...');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`⚠️ Received ${signal}, starting graceful shutdown...`);

    try {
      await this.stopAcceptingConnections();
      await this.waitForConnections();
      await this.closeDatabase();

      logger.info('✅ Graceful shutdown completed successfully');
      process.exit(0);

    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);
      
      logger.warn(`Force shutdown after ${this.config.forceTimeout}ms`);
      setTimeout(() => {
        process.exit(1);
      }, this.config.forceTimeout);
    }
  }

  private stopAcceptingConnections(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        logger.info('📡 Server stopped accepting new connections');
        resolve();
      });

      setTimeout(() => {
        logger.warn('⚠️ Server close timeout, forcing...');
        resolve();
      }, this.config.timeout);
    });
  }

  private waitForConnections(): Promise<void> {
    return new Promise((resolve) => {
      const waitTime = 2000;
      logger.info(`⏳ Waiting ${waitTime}ms for connections to finish...`);
      setTimeout(resolve, waitTime);
    });
  }

  private async closeDatabase(): Promise<void> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.config.maxRetries) {
      try {
        logger.info(`📦 Closing database connection (attempt ${attempts + 1}/${this.config.maxRetries})...`);
        await db.disconnect();
        logger.info('📦 Database connection closed successfully');
        return;
      } catch (error) {
        lastError = error as Error;
        attempts++;
        logger.warn(`Database disconnect attempt ${attempts} failed:`, error);
        
        if (attempts < this.config.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    throw new Error(`Failed to close database after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  isShuttingDownNow(): boolean {
    return this.isShuttingDown;
  }
}

export const gracefulShutdown = new GracefulShutdown();
'@ | Out-File -FilePath "$BaseDir\backend\src\utils\shutdown.ts" -Encoding UTF8
Write-Success "shutdown.ts criado"

# ============================================
# ATUALIZAR SERVER.TS
# ============================================
Write-Info "Atualizando server.ts..."
@'
// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { db } from './config/database.js';
import { logger, httpLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import { sanitizeAll } from './middleware/sanitize.js';
import { securityLogMiddleware } from './middleware/securityLog.js';
import { timeoutMiddleware } from './middleware/timeout.js';
import { checkDatabaseHealth } from './middleware/databaseHealth.js';
import { gracefulShutdown } from './utils/shutdown.js';
import { HealthController } from './controllers/HealthController.js';
import { healthRateLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';

const app = express();

// ============================================
// SECURITY HEADERS
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
// CORS
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
app.use(sanitizeAll);
app.use(securityLogMiddleware);
app.use(timeoutMiddleware());
app.use(checkDatabaseHealth);

// ============================================
// HEALTH CHECKS
// ============================================
app.get('/health', healthRateLimiter, HealthController.basic);
app.get('/health/detailed', healthRateLimiter, HealthController.detailed);
app.get('/health/readiness', healthRateLimiter, HealthController.readiness);
app.get('/health/liveness', healthRateLimiter, HealthController.liveness);

// ============================================
// ROTAS
// ============================================
app.use('/api/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = config.PORT;

async function startServer() {
  try {
    await db.connect();
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
      logger.info(`🔧 Ambiente: ${config.NODE_ENV}`);
      logger.info(`🔒 Segurança ativa: Helmet, CORS, Rate Limit, Sanitização`);
      logger.info(`❤️ Health check: http://localhost:${PORT}/health`);
      logger.info(`❤️ Health check detalhado: http://localhost:${PORT}/health/detailed`);
    });

    gracefulShutdown.register(server);

  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
'@ | Out-File -FilePath "$BaseDir\backend\src\server.ts" -Encoding UTF8
Write-Success "server.ts atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 3/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • backend/src/controllers/HealthController.ts"
Write-Info "  • backend/src/middleware/databaseHealth.ts"
Write-Info "  • backend/src/utils/shutdown.ts"
Write-Info "  • backend/src/server.ts (atualizado)"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Teste health básico: curl http://localhost:3000/health" -ForegroundColor White
Write-Info "  3. Teste health detalhado: curl http://localhost:3000/health/detailed" -ForegroundColor White
Write-Info "  4. Teste readiness: curl http://localhost:3000/health/readiness" -ForegroundColor White
Write-Info "  5. Teste liveness: curl http://localhost:3000/health/liveness" -ForegroundColor White
Write-Info "  6. Teste graceful shutdown: pressione Ctrl+C" -ForegroundColor White

Write-Success "🎉 Parte 3/4 concluída com sucesso!"