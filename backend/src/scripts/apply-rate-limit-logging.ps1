# scripts/apply-rate-limit-logging.ps1
# Script para implementar Rate Limiting e Logging (Pilar 2 - Parte 2/4)

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
Write-Host "║     CODE_ASSESSMENT - RATE LIMITING E LOGGING (PILAR 2)      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: RATE LIMITING
# ============================================
Write-Step "PARTE 1/2: RATE LIMITING EXPANDIDO"

Write-Info "Atualizando rateLimit.ts..."
@'
// backend/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

// ============================================
// RATE LIMITERS POR ENDPOINT
// ============================================

// 1. Login - Restrito (5 tentativas / 15 min)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.NODE_ENV === 'test',
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} - Login attempt`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
});

// 2. Register - Moderado (10 tentativas / 1 hora)
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} - Registration attempt`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
});

// 3. Refresh Token - Restrito (10 tentativas / 15 min)
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Muitas tentativas de refresh. Tente novamente em 15 minutos.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. APIs Autenticadas - Médio (100 tentativas / 1 minuto)
export const authenticatedRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 1 minuto.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return config.NODE_ENV === 'development' && req.user?.role === 'admin';
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for authenticated user: ${req.user?.email || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente em 1 minuto.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
});

// 5. APIs Públicas - Leve (50 tentativas / 1 minuto)
export const publicRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 1 minuto.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 6. Health Check - Sem limite
export const healthRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Muitas requisições de health check.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => true,
});

// 7. Rate Limiter para rotas sensíveis
export const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Muitas tentativas em operações sensíveis. Tente novamente em 1 hora.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export function createRateLimiter(options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skip?: (req: any) => boolean;
}) {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 100,
    message: {
      success: false,
      message: options.message || 'Muitas requisições. Tente novamente mais tarde.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: options.skip,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: options.message || 'Muitas requisições. Tente novamente mais tarde.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      });
    },
  });
}
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\rateLimit.ts" -Encoding UTF8
Write-Success "rateLimit.ts atualizado"

# ============================================
# PARTE 2: LOGGING DE SEGURANÇA
# ============================================
Write-Step "PARTE 2/2: LOGGING DE SEGURANÇA"

# 2.1 - Security Logger
Write-Info "Criando securityLogger.ts..."
@'
// backend/src/utils/securityLogger.ts
import { logger } from './logger.js';

export enum SecurityEventType {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  REGISTER_ATTEMPT = 'REGISTER_ATTEMPT',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILED = 'REGISTER_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_CHANGE_SUCCESS = 'PASSWORD_CHANGE_SUCCESS',
  PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCESS_DENIED = 'ACCESS_DENIED',
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  BRUTE_FORCE_DETECTED = 'BRUTE_FORCE_DETECTED',
  SQL_INJECTION_DETECTED = 'SQL_INJECTION_DETECTED',
  XSS_DETECTED = 'XSS_DETECTED',
}

export interface SecurityLog {
  eventType: SecurityEventType;
  timestamp: Date;
  userId?: string;
  email?: string;
  role?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  message?: string;
  details?: Record<string, any>;
}

export class SecurityLogger {
  static log(event: SecurityLog): void {
    const logData = {
      eventType: event.eventType,
      timestamp: event.timestamp || new Date(),
      userId: event.userId,
      email: event.email,
      role: event.role,
      ip: event.ip,
      userAgent: event.userAgent,
      success: event.success,
      message: event.message,
      details: event.details,
    };

    if (event.success) {
      logger.info(`[SECURITY] ${event.eventType}`, logData);
    } else {
      logger.warn(`[SECURITY] ${event.eventType} - FAILED`, logData);
    }
  }

  static loginAttempt(email: string, ip: string, userAgent: string, success: boolean, reason?: string): void {
    this.log({
      eventType: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILED,
      timestamp: new Date(),
      email,
      ip,
      userAgent,
      success,
      message: reason,
      details: { attemptType: 'login' },
    });
  }

  static registerAttempt(email: string, ip: string, userAgent: string, success: boolean, reason?: string): void {
    this.log({
      eventType: success ? SecurityEventType.REGISTER_SUCCESS : SecurityEventType.REGISTER_FAILED,
      timestamp: new Date(),
      email,
      ip,
      userAgent,
      success,
      message: reason,
      details: { attemptType: 'register' },
    });
  }

  static passwordChange(userId: string, email: string, ip: string, userAgent: string, success: boolean, reason?: string): void {
    this.log({
      eventType: success ? SecurityEventType.PASSWORD_CHANGE_SUCCESS : SecurityEventType.PASSWORD_CHANGE_FAILED,
      timestamp: new Date(),
      userId,
      email,
      ip,
      userAgent,
      success,
      message: reason,
      details: { operation: 'password_change' },
    });
  }

  static tokenRefresh(email: string, ip: string, userAgent: string, success: boolean, reason?: string): void {
    this.log({
      eventType: success ? SecurityEventType.TOKEN_REFRESH : SecurityEventType.TOKEN_REFRESH_FAILED,
      timestamp: new Date(),
      email,
      ip,
      userAgent,
      success,
      message: reason,
      details: { operation: 'token_refresh' },
    });
  }

  static accessDenied(userId: string, email: string, resource: string, ip: string, reason: string): void {
    this.log({
      eventType: SecurityEventType.ACCESS_DENIED,
      timestamp: new Date(),
      userId,
      email,
      ip,
      success: false,
      message: `Acesso negado ao recurso: ${resource}`,
      details: { resource, reason },
    });
  }

  static suspiciousActivity(email: string, ip: string, userAgent: string, details: Record<string, any>): void {
    this.log({
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      timestamp: new Date(),
      email,
      ip,
      userAgent,
      success: false,
      message: 'Atividade suspeita detectada',
      details,
    });
  }

  static bruteForceDetected(ip: string, attempts: number, email?: string): void {
    this.log({
      eventType: SecurityEventType.BRUTE_FORCE_DETECTED,
      timestamp: new Date(),
      email,
      ip,
      success: false,
      message: `Ataque de força bruta detectado - ${attempts} tentativas`,
      details: { attempts, ip },
    });
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\utils\securityLogger.ts" -Encoding UTF8
Write-Success "securityLogger.ts criado"

# 2.2 - Security Log Middleware
Write-Info "Criando securityLog.ts..."
@'
// backend/src/middleware/securityLog.ts
import { Request, Response, NextFunction } from 'express';
import { SecurityLogger, SecurityEventType } from '../utils/securityLogger.js';

export function securityLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const originalSend = res.send;
  
  res.send = function(body: any): any {
    const statusCode = res.statusCode;
    const isSuccess = statusCode >= 200 && statusCode < 300;
    const isError = statusCode >= 400;

    res.send = originalSend;
    return originalSend.call(this, body);
  };

  (req as any)._security = {
    ip,
    userAgent,
    startTime: Date.now(),
  };

  next();
}
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\securityLog.ts" -Encoding UTF8
Write-Success "securityLog.ts criado"

# 2.3 - Atualizar rotas
Write-Info "Atualizando auth.ts..."
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

const router = Router();

// Rotas públicas
router.post('/register', registerRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
router.post('/refresh-token', refreshRateLimiter, AuthController.refreshToken);

// Rotas autenticadas
router.use(authenticate);

router.post('/logout', authenticatedRateLimiter, AuthController.logout);
router.get('/profile', authenticatedRateLimiter, AuthController.getProfile);
router.put('/profile', sensitiveRateLimiter, AuthController.updateProfile);

// Rotas admin
router.get(
  '/users', 
  authorize(UserRole.ADMIN), 
  authenticatedRateLimiter, 
  AuthController.listUsers
);

router.get(
  '/users/:id', 
  authorize(UserRole.ADMIN), 
  authenticatedRateLimiter, 
  AuthController.getUserById
);

export default router;
'@ | Out-File -FilePath "$BaseDir\backend\src\routes\auth.ts" -Encoding UTF8
Write-Success "auth.ts atualizado"

# 2.4 - Script de monitoramento
Write-Info "Criando monitor-security.ps1..."
@'
# scripts/monitor-security.ps1
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SECURITY LOG MONITOR - CODE_ASSESSMENT                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
$logFile = "$BaseDir\backend\logs\combined.log"

if (Test-Path $logFile) {
    Write-Host "📋 Últimos eventos de segurança:" -ForegroundColor Yellow
    Write-Host ""
    
    Select-String -Path $logFile -Pattern "SECURITY" | Select-Object -Last 20 | ForEach-Object {
        $line = $_.Line
        if ($line -match "FAILED") {
            Write-Host $line -ForegroundColor Red
        } elseif ($line -match "SUCCESS") {
            Write-Host $line -ForegroundColor Green
        } elseif ($line -match "SUSPICIOUS|BRUTE_FORCE|ACCESS_DENIED") {
            Write-Host $line -ForegroundColor Magenta
        } else {
            Write-Host $line -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "📊 Estatísticas de segurança:" -ForegroundColor Yellow
    
    $events = Select-String -Path $logFile -Pattern "SECURITY" | ForEach-Object { $_.Line }
    
    $loginSuccess = ($events | Select-String "LOGIN_SUCCESS").Count
    $loginFailed = ($events | Select-String "LOGIN_FAILED").Count
    $accessDenied = ($events | Select-String "ACCESS_DENIED").Count
    $suspicious = ($events | Select-String "SUSPICIOUS|BRUTE_FORCE").Count
    
    Write-Host "  ✅ Logins bem-sucedidos: $loginSuccess" -ForegroundColor Green
    Write-Host "  ❌ Logins falhos: $loginFailed" -ForegroundColor Red
    Write-Host "  🚫 Acessos negados: $accessDenied" -ForegroundColor Yellow
    Write-Host "  ⚠️ Atividades suspeitas: $suspicious" -ForegroundColor Magenta
    
} else {
    Write-Host "⚠️ Arquivo de log não encontrado." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "ℹ️ Para monitorar logs em tempo real:" -ForegroundColor Cyan
Write-Host "   Get-Content -Path '$logFile' -Wait | Select-String 'SECURITY'" -ForegroundColor White
'@ | Out-File -FilePath "$BaseDir\scripts\monitor-security.ps1" -Encoding UTF8
Write-Success "monitor-security.ps1 criado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ RATE LIMITING E LOGGING APLICADOS!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • backend/src/middleware/rateLimit.ts (atualizado)"
Write-Info "  • backend/src/utils/securityLogger.ts"
Write-Info "  • backend/src/middleware/securityLog.ts"
Write-Info "  • backend/src/routes/auth.ts (atualizado)"
Write-Info "  • scripts/monitor-security.ps1"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Monitore os logs: .\scripts\monitor-security.ps1" -ForegroundColor White
Write-Info "  3. Teste o rate limiting: faça 5 tentativas de login erradas" -ForegroundColor White

Write-Success "🎉 Parte 2/4 concluída com sucesso!"