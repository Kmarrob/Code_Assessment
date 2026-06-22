# scripts/apply-admin-security-part2.ps1
# Script para aplicar Parte 2/3 - Backend - Autorização e Auditoria

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
Write-Host "║     PARTE 2/3 - BACKEND - AUTORIZAÇÃO E AUDITORIA          ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: AUDIT SERVICE
# ============================================
Write-Step "PARTE 1/2: AUDIT SERVICE"

Write-Info "Criando AuditService.ts..."
@'
// backend/src/services/AuditService.ts
import { logger } from '../utils/logger.js';
import { SecurityLogger, SecurityEventType } from '../utils/securityLogger.js';

export interface AuditLog {
  userId: string;
  email: string;
  action: string;
  targetUserId?: string;
  targetEmail?: string;
  details?: Record<string, any>;
  ip: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
}

export class AuditService {
  static logAdminAction(
    userId: string,
    email: string,
    action: string,
    ip: string,
    userAgent: string,
    success: boolean,
    details?: Record<string, any>
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_UPDATED,
      timestamp: new Date(),
      userId,
      email,
      ip,
      userAgent,
      success,
      message: `Ação administrativa: ${action}`,
      details,
    });
  }

  static logUserCreation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    role: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_CREATED,
      timestamp: new Date(),
      userId: targetUserId,
      email: targetEmail,
      ip,
      userAgent,
      success,
      message: `Usuário criado por ${adminEmail} com papel: ${role}`,
      details: {
        adminId,
        adminEmail,
        role,
      },
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
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_UPDATED,
      timestamp: new Date(),
      userId: targetUserId,
      email: targetEmail,
      ip,
      userAgent,
      success,
      message: `Usuário atualizado por ${adminEmail}`,
      details: {
        adminId,
        adminEmail,
        changes,
      },
    });
  }

  static logUserDeactivation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_DELETED,
      timestamp: new Date(),
      userId: targetUserId,
      email: targetEmail,
      ip,
      userAgent,
      success,
      message: `Usuário desativado por ${adminEmail}`,
      details: {
        adminId,
        adminEmail,
      },
    });
  }

  static logUserReactivation(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.USER_UPDATED,
      timestamp: new Date(),
      userId: targetUserId,
      email: targetEmail,
      ip,
      userAgent,
      success,
      message: `Usuário reativado por ${adminEmail}`,
      details: {
        adminId,
        adminEmail,
      },
    });
  }

  static logPasswordReset(
    adminId: string,
    adminEmail: string,
    targetUserId: string,
    targetEmail: string,
    ip: string,
    userAgent: string,
    success: boolean
  ): void {
    SecurityLogger.log({
      eventType: SecurityEventType.PASSWORD_CHANGE,
      timestamp: new Date(),
      userId: targetUserId,
      email: targetEmail,
      ip,
      userAgent,
      success,
      message: `Senha resetada por ${adminEmail}`,
      details: {
        adminId,
        adminEmail,
      },
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
    SecurityLogger.log({
      eventType: SecurityEventType.ACCESS_DENIED,
      timestamp: new Date(),
      userId,
      email,
      ip,
      userAgent,
      success: false,
      message: `Acesso negado: ${action}`,
      details: { reason },
    });
  }

  static async getAuditLogs(
    filter?: AuditFilter,
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return {
      logs: [],
      total: 0,
    };
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\services\AuditService.ts" -Encoding UTF8
Write-Success "AuditService.ts criado"

# ============================================
# PARTE 2: ADMIN CONTROLLER ATUALIZADO
# ============================================
Write-Step "PARTE 2/2: ADMIN CONTROLLER ATUALIZADO"

Write-Info "Atualizando AdminController.ts com auditoria..."
@'
// backend/src/controllers/AdminController.ts
import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService.js';
import { logger } from '../utils/logger.js';
import { validate } from '../utils/validation.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { AuditService } from '../services/AuditService.js';
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
        AuditService.logAccessDenied(
          req.userId || '',
          req.user?.email || '',
          'listar usuários',
          req.ip || '',
          req.headers['user-agent'] || '',
          'Filtros inválidos'
        );
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
        AuditService.logUserCreation(
          req.userId || '',
          req.user?.email || '',
          '',
          '',
          '',
          req.ip || '',
          req.headers['user-agent'] || '',
          false
        );
        throw new ValidationError(validation.errors);
      }

      const user = await AdminService.createUser(validation.data);

      AuditService.logUserCreation(
        req.userId || '',
        req.user?.email || '',
        user._id.toString(),
        user.email,
        user.role,
        req.ip || '',
        req.headers['user-agent'] || '',
        true
      );

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

      if (id === req.userId) {
        const validation = validate(adminUpdateUserSchema, req.body);
        if (validation.success) {
          if (validation.data.isActive === false) {
            AuditService.logAccessDenied(
              req.userId || '',
              req.user?.email || '',
              'desativar própria conta',
              req.ip || '',
              req.headers['user-agent'] || '',
              'Usuário tentou desativar a própria conta'
            );
            throw new AppError('Você não pode desativar sua própria conta', 400);
          }
          if (validation.data.role && validation.data.role !== existingUser.role) {
            AuditService.logAccessDenied(
              req.userId || '',
              req.user?.email || '',
              'alterar própria role',
              req.ip || '',
              req.headers['user-agent'] || '',
              'Usuário tentou alterar a própria role'
            );
            throw new AppError('Você não pode alterar sua própria role', 400);
          }
        }
      }

      const validation = validate(adminUpdateUserSchema, req.body);
      if (!validation.success) {
        AuditService.logUserUpdate(
          req.userId || '',
          req.user?.email || '',
          id,
          existingUser.email,
          {},
          req.ip || '',
          req.headers['user-agent'] || '',
          false
        );
        throw new ValidationError(validation.errors);
      }

      const user = await AdminService.updateUser(id, validation.data);

      AuditService.logUserUpdate(
        req.userId || '',
        req.user?.email || '',
        id,
        user.email,
        validation.data,
        req.ip || '',
        req.headers['user-agent'] || '',
        true
      );

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
        AuditService.logAccessDenied(
          req.userId || '',
          req.user?.email || '',
          'desativar própria conta',
          req.ip || '',
          req.headers['user-agent'] || '',
          'Usuário tentou desativar a própria conta'
        );
        throw new AppError('Você não pode desativar sua própria conta', 400);
      }

      const user = await AdminService.getUserById(id);
      if (!user) {
        throw new NotFoundError('Usuário', id);
      }

      await AdminService.deleteUser(id);

      AuditService.logUserDeactivation(
        req.userId || '',
        req.user?.email || '',
        id,
        user.email,
        req.ip || '',
        req.headers['user-agent'] || '',
        true
      );

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

      const user = await AdminService.getUserById(id);

      AuditService.logUserReactivation(
        req.userId || '',
        req.user?.email || '',
        id,
        user.email,
        req.ip || '',
        req.headers['user-agent'] || '',
        true
      );

      res.json({
        success: true,
        message: 'Usuário reativado com sucesso',
        data: { user },
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

      const user = await AdminService.getUserById(id);
      if (!user) {
        throw new NotFoundError('Usuário', id);
      }

      const validation = validate(adminResetPasswordSchema, req.body);
      if (!validation.success) {
        AuditService.logPasswordReset(
          req.userId || '',
          req.user?.email || '',
          id,
          user.email,
          req.ip || '',
          req.headers['user-agent'] || '',
          false
        );
        throw new ValidationError(validation.errors);
      }

      await AdminService.resetPassword(id, validation.data.password);

      AuditService.logPasswordReset(
        req.userId || '',
        req.user?.email || '',
        id,
        user.email,
        req.ip || '',
        req.headers['user-agent'] || '',
        true
      );

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
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 2/3 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • backend/src/services/AuditService.ts"
Write-Info "  • backend/src/controllers/AdminController.ts (atualizado)"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ AuditService para registro de ações admin" -ForegroundColor White
Write-Info "  ✅ Logs estruturados para criação, edição, desativação" -ForegroundColor White
Write-Info "  ✅ Logs para reativação e reset de senha" -ForegroundColor White
Write-Info "  ✅ Logs de tentativas de acesso negado" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Faça login com um usuário admin" -ForegroundColor White
Write-Info "  3. Execute ações CRUD e verifique os logs" -ForegroundColor White

Write-Success "🎉 Parte 2/3 concluída com sucesso!"