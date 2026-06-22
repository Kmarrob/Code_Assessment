# scripts/apply-admin-security-part1.ps1
# Script para aplicar Parte 1/3 - Backend - Validação e Sanitização

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
Write-Host "║     CODE_ASSESSMENT - ADMIN SEGURANÇA (PILAR 2)            ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 1/3 - BACKEND - VALIDAÇÃO E SANITIZAÇÃO          ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: SANITIZE ADMIN
# ============================================
Write-Step "PARTE 1/5: SANITIZE ADMIN"

Write-Info "Criando sanitizeAdmin.ts..."
@'
// backend/src/middleware/sanitizeAdmin.ts
import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../utils/validation.js';
import { logger } from '../utils/logger.js';

export function sanitizeAdminInputs(req: Request, res: Response, next: NextFunction): void {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeInput(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeInput(req.query);
    }

    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeInput(req.params);
    }

    next();
  } catch (error) {
    logger.error('Erro na sanitização de inputs admin:', error);
    next(error);
  }
}

export function sanitizeSensitiveFields(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    const sensitiveFields = ['name', 'email', 'company', 'department', 'search'];
    
    for (const field of sensitiveFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeInput(req.body[field]);
      }
    }
  }
  next();
}
'@ | Out-File -FilePath "$BaseDir\backend\src\middleware\sanitizeAdmin.ts" -Encoding UTF8
Write-Success "sanitizeAdmin.ts criado"

# ============================================
# PARTE 2: ADMIN VALIDATION
# ============================================
Write-Step "PARTE 2/5: ADMIN VALIDATION"

Write-Info "Criando adminValidation.ts..."
@'
// backend/src/utils/adminValidation.ts
import { z } from 'zod';

export const adminPasswordSchema = z
  .string()
  .min(12, 'Senha deve ter pelo menos 12 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial');

export const adminEmailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(255, 'Email muito longo')
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido');

export const adminNameSchema = z
  .string()
  .min(3, 'Nome deve ter pelo menos 3 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

export const adminRoleSchema = z.enum(['admin', 'rep', 'consultant', 'user']);

export const adminCreateUserSchema = z.object({
  name: adminNameSchema,
  email: adminEmailSchema,
  password: adminPasswordSchema,
  role: adminRoleSchema.default('user'),
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
});

export const adminUpdateUserSchema = z.object({
  name: adminNameSchema.optional(),
  email: adminEmailSchema.optional(),
  role: adminRoleSchema.optional(),
  company: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const adminListUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  role: adminRoleSchema.optional(),
  isActive: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  search: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
});

export const adminResetPasswordSchema = z.object({
  password: adminPasswordSchema,
});
'@ | Out-File -FilePath "$BaseDir\backend\src\utils\adminValidation.ts" -Encoding UTF8
Write-Success "adminValidation.ts criado"

# ============================================
# PARTE 3: ADMIN CONTROLLER ATUALIZADO
# ============================================
Write-Step "PARTE 3/5: ADMIN CONTROLLER ATUALIZADO"

Write-Info "Atualizando AdminController.ts..."
@'
// backend/src/controllers/AdminController.ts
import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService.js';
import { logger } from '../utils/logger.js';
import { validate } from '../utils/validation.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { SecurityLogger, SecurityEventType } from '../utils/securityLogger.js';
import { 
  adminCreateUserSchema, 
  adminUpdateUserSchema, 
  adminListUsersSchema,
  adminResetPasswordSchema 
} from '../utils/adminValidation.js';

export class AdminController {
  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(adminListUsersSchema, req.query);
      if (!validation.success) {
        SecurityLogger.log({
          eventType: SecurityEventType.ACCESS_DENIED,
          timestamp: new Date(),
          userId: req.userId,
          email: req.user?.email,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          success: false,
          message: 'Tentativa de listagem com filtros inválidos',
          details: { errors: validation.errors },
        });
        throw new ValidationError(validation.errors);
      }

      const { page, limit, role, isActive, search, company, department } = validation.data;

      const result = await AdminService.listUsers(
        { role, isActive, search, company, department },
        page,
        limit
      );

      res.json({
        success: true,
        data: { users: result.users },
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: page < result.totalPages,
          hasPrevious: page > 1,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserById(id);

      res.json({
        success: true,
        data: { user },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(adminCreateUserSchema, req.body);
      if (!validation.success) {
        SecurityLogger.log({
          eventType: SecurityEventType.USER_CREATED,
          timestamp: new Date(),
          userId: req.userId,
          email: req.user?.email,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          success: false,
          message: 'Tentativa de criação com dados inválidos',
          details: { errors: validation.errors },
        });
        throw new ValidationError(validation.errors);
      }

      const user = await AdminService.createUser(validation.data);

      SecurityLogger.log({
        eventType: SecurityEventType.USER_CREATED,
        timestamp: new Date(),
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        success: true,
        message: `Usuário criado: ${user.email} (${user.role})`,
        details: { targetUserId: user._id, targetEmail: user.email, role: user.role },
      });

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: { user },
        statusCode: 201,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const existingUser = await AdminService.getUserById(id);

      const validation = validate(adminUpdateUserSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      if (id === req.userId) {
        if (validation.data.isActive === false) {
          SecurityLogger.log({
            eventType: SecurityEventType.ACCESS_DENIED,
            timestamp: new Date(),
            userId: req.userId,
            email: req.user?.email,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            success: false,
            message: 'Tentativa de desativar a própria conta',
            details: { targetUserId: id },
          });
          throw new AppError('Você não pode desativar sua própria conta', 400);
        }

        if (validation.data.role && validation.data.role !== existingUser.role) {
          SecurityLogger.log({
            eventType: SecurityEventType.ACCESS_DENIED,
            timestamp: new Date(),
            userId: req.userId,
            email: req.user?.email,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            success: false,
            message: 'Tentativa de alterar a própria role',
            details: { targetUserId: id, newRole: validation.data.role },
          });
          throw new AppError('Você não pode alterar sua própria role', 400);
        }
      }

      const user = await AdminService.updateUser(id, validation.data);

      SecurityLogger.log({
        eventType: SecurityEventType.USER_UPDATED,
        timestamp: new Date(),
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        success: true,
        message: `Usuário atualizado: ${user.email}`,
        details: { targetUserId: user._id, targetEmail: user.email, changes: validation.data },
      });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: { user },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (id === req.userId) {
        SecurityLogger.log({
          eventType: SecurityEventType.ACCESS_DENIED,
          timestamp: new Date(),
          userId: req.userId,
          email: req.user?.email,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          success: false,
          message: 'Tentativa de desativar a própria conta',
          details: { targetUserId: id },
        });
        throw new AppError('Você não pode desativar sua própria conta', 400);
      }

      const user = await AdminService.getUserById(id);
      if (!user) {
        throw new NotFoundError('Usuário', id);
      }

      await AdminService.deleteUser(id);

      SecurityLogger.log({
        eventType: SecurityEventType.USER_DELETED,
        timestamp: new Date(),
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        success: true,
        message: `Usuário desativado: ${user.email}`,
        details: { targetUserId: user._id, targetEmail: user.email },
      });

      res.json({
        success: true,
        message: 'Usuário desativado com sucesso',
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async reactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await AdminService.reactivateUser(id);

      SecurityLogger.log({
        eventType: SecurityEventType.USER_UPDATED,
        timestamp: new Date(),
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        success: true,
        message: `Usuário reativado: ${id}`,
        details: { targetUserId: id },
      });

      res.json({
        success: true,
        message: 'Usuário reativado com sucesso',
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const validation = validate(adminResetPasswordSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      await AdminService.resetPassword(id, validation.data.password);

      SecurityLogger.log({
        eventType: SecurityEventType.PASSWORD_CHANGE,
        timestamp: new Date(),
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        success: true,
        message: `Senha resetada para usuário: ${id}`,
        details: { targetUserId: id },
      });

      res.json({
        success: true,
        message: 'Senha resetada com sucesso',
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\controllers\AdminController.ts" -Encoding UTF8
Write-Success "AdminController.ts atualizado"

# ============================================
# PARTE 4: ADMIN ROUTES ATUALIZADO
# ============================================
Write-Step "PARTE 4/5: ADMIN ROUTES ATUALIZADO"

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
import { UserRole } from '../types/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.use(sanitizeAdminInputs);
router.use(sanitizeSensitiveFields);

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
# PARTE 5: RATE LIMIT ATUALIZADO
# ============================================
Write-Step "PARTE 5/5: RATE LIMIT ATUALIZADO"

Write-Info "Atualizando rateLimit.ts..."
@'
// backend/src/middleware/rateLimit.ts (partes adicionadas)
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

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

// Admin Rate Limiter
export const adminRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Muitas tentativas de operações administrativas. Tente novamente em 1 hora.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for admin operation: ${req.user?.email || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de operações administrativas. Tente novamente em 1 hora.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    });
  },
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
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 1/3 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • backend/src/middleware/sanitizeAdmin.ts"
Write-Info "  • backend/src/utils/adminValidation.ts"
Write-Info "  • backend/src/controllers/AdminController.ts (atualizado)"
Write-Info "  • backend/src/routes/admin.ts (atualizado)"
Write-Info "  • backend/src/middleware/rateLimit.ts (atualizado)"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Middleware de sanitização para admin" -ForegroundColor White
Write-Info "  ✅ Validação reforçada com Zod (senha forte, email, role)" -ForegroundColor White
Write-Info "  ✅ Rate limiting específico para admin" -ForegroundColor White
Write-Info "  ✅ Security logging para ações admin" -ForegroundColor White
Write-Info "  ✅ Proteção contra auto-desativação e auto-mudança de role" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Faça login com um usuário admin" -ForegroundColor White
Write-Info "  3. Teste a criação de usuário com senha fraca (deve falhar)" -ForegroundColor White
Write-Info "  4. Teste a desativação da própria conta (deve falhar)" -ForegroundColor White

Write-Success "🎉 Parte 1/3 concluída com sucesso!"