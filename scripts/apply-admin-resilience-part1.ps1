# scripts/apply-admin-resilience-part1.ps1
# Script para aplicar Parte 1/3 - Backend - Tratamento de Erros e Retry

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
Write-Host "║     PARTE 1/3 - BACKEND - TRATAMENTO DE ERROS E RETRY      ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: ADMIN SERVICE COM RETRY
# ============================================
Write-Step "PARTE 1/2: ADMIN SERVICE COM RETRY"

Write-Info "Atualizando AdminService.ts..."
@'
// backend/src/services/AdminService.ts
import { Types } from 'mongoose';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { UserRole, IUser } from '../types/index.js';
import { retryDatabase } from '../utils/retry.js';
import { databaseCircuitBreaker } from '../utils/circuitBreaker.js';
import { withDbTimeout } from '../middleware/timeout.js';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company?: string;
  department?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  company?: string;
  department?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  company?: string;
  department?: string;
}

export class AdminService {
  static async listUsers(
    filters: UserFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: IUser[]; total: number; totalPages: number }> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const filter: any = {};

            if (filters.role) filter.role = filters.role;
            if (filters.isActive !== undefined) filter.isActive = filters.isActive;
            if (filters.company) filter.company = { $regex: filters.company, $options: 'i' };
            if (filters.department) filter.department = { $regex: filters.department, $options: 'i' };

            if (filters.search) {
              filter.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
              ];
            }

            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
              User.find(filter)
                .select('_id name email role company department isActive lastLoginAt createdAt')
                .lean()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
              User.countDocuments(filter),
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
              users: users as IUser[],
              total,
              totalPages,
            };
          }, 'AdminService.listUsers');
        }, 'AdminService.listUsers');
      });
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao listar usuários. Tente novamente mais tarde.', 500);
    }
  }

  static async getUserById(userId: string): Promise<IUser> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId)
              .select('_id name email role company department isActive lastLoginAt createdAt')
              .lean();

            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            return user as IUser;
          }, 'AdminService.getUserById');
        }, 'AdminService.getUserById');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao buscar usuário:', error);
      throw new AppError('Erro ao buscar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async createUser(data: CreateUserData): Promise<IUser> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const existingUser = await User.findOne({ email: data.email });
            if (existingUser) {
              throw new AppError('Email já está em uso', 400);
            }

            const user = new User({
              name: data.name,
              email: data.email,
              password: data.password,
              role: data.role || UserRole.USER,
              company: data.company,
              department: data.department,
              isActive: true,
            });

            await user.save();

            logger.info(`Usuário criado pelo admin: ${user.email} (${user.role})`);

            return user.toJSON() as IUser;
          }, 'AdminService.createUser');
        }, 'AdminService.createUser');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao criar usuário:', error);
      throw new AppError('Erro ao criar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async updateUser(userId: string, data: UpdateUserData): Promise<IUser> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            if (data.email && data.email !== user.email) {
              const existingUser = await User.findOne({ email: data.email });
              if (existingUser) {
                throw new AppError('Email já está em uso', 400);
              }
              user.email = data.email;
            }

            if (data.name) user.name = data.name;
            if (data.role) user.role = data.role;
            if (data.company !== undefined) user.company = data.company;
            if (data.department !== undefined) user.department = data.department;
            if (data.isActive !== undefined) user.isActive = data.isActive;

            await user.save();

            logger.info(`Usuário atualizado pelo admin: ${user.email}`);

            return user.toJSON() as IUser;
          }, 'AdminService.updateUser');
        }, 'AdminService.updateUser');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar usuário:', error);
      throw new AppError('Erro ao atualizar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await databaseCircuitBreaker.execute(async () => {
        await retryDatabase(async () => {
          await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            user.isActive = false;
            await user.save();

            logger.info(`Usuário desativado pelo admin: ${user.email}`);
          }, 'AdminService.deleteUser');
        }, 'AdminService.deleteUser');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao desativar usuário:', error);
      throw new AppError('Erro ao desativar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async reactivateUser(userId: string): Promise<IUser> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            user.isActive = true;
            await user.save();

            logger.info(`Usuário reativado pelo admin: ${user.email}`);

            return user.toJSON() as IUser;
          }, 'AdminService.reactivateUser');
        }, 'AdminService.reactivateUser');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao reativar usuário:', error);
      throw new AppError('Erro ao reativar usuário. Tente novamente mais tarde.', 500);
    }
  }

  static async resetPassword(userId: string, newPassword: string): Promise<void> {
    try {
      await databaseCircuitBreaker.execute(async () => {
        await retryDatabase(async () => {
          await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID de usuário inválido', 400);
            }

            const user = await User.findById(userId);
            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            user.password = newPassword;
            await user.save();

            logger.info(`Senha resetada pelo admin para: ${user.email}`);
          }, 'AdminService.resetPassword');
        }, 'AdminService.resetPassword');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao resetar senha:', error);
      throw new AppError('Erro ao resetar senha. Tente novamente mais tarde.', 500);
    }
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\services\AdminService.ts" -Encoding UTF8
Write-Success "AdminService.ts atualizado"

# ============================================
# PARTE 2: ADMIN CONTROLLER ATUALIZADO
# ============================================
Write-Step "PARTE 2/2: ADMIN CONTROLLER ATUALIZADO"

Write-Info "Atualizando AdminController.ts com error handling..."
@'
// backend/src/controllers/AdminController.ts
import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService.js';
import { logger } from '../utils/logger.js';
import { validate } from '../utils/validation.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { ErrorLogger } from '../utils/errorLogger.js';
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
        ErrorLogger.logValidationError(
          new Error('Filtros inválidos'),
          {
            userId: req.userId,
            email: req.user?.email,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            path: req.path,
            method: req.method,
            body: validation.errors,
          }
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
      ErrorLogger.logError(error as Error, {
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        query: req.query,
      });
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
      ErrorLogger.logError(error as Error, {
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        params: req.params,
      });
      next(error);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(adminCreateUserSchema, req.body);
      if (!validation.success) {
        ErrorLogger.logValidationError(
          new Error('Dados inválidos para criação'),
          {
            userId: req.userId,
            email: req.user?.email,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            path: req.path,
            method: req.method,
            body: validation.errors,
          }
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
      ErrorLogger.logError(error as Error, {
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        body: req.body,
      });
      next(error);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (id === req.userId) {
        const validation = validate(adminUpdateUserSchema, req.body);
        if (validation.success) {
          if (validation.data.isActive === false) {
            throw new AppError('Você não pode desativar sua própria conta', 400);
          }
          if (validation.data.role) {
            const existingUser = await AdminService.getUserById(id);
            if (validation.data.role !== existingUser.role) {
              throw new AppError('Você não pode alterar sua própria role', 400);
            }
          }
        }
      }

      const validation = validate(adminUpdateUserSchema, req.body);
      if (!validation.success) {
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
      ErrorLogger.logError(error as Error, {
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        params: req.params,
        body: req.body,
      });
      next(error);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (id === req.userId) {
        throw new AppError('Você não pode desativar sua própria conta', 400);
      }

      await AdminService.deleteUser(id);

      const user = await AdminService.getUserById(id);

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
      ErrorLogger.logError(error as Error, {
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        params: req.params,
      });
      next(error);
    }
  }

  static async reactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await AdminService.reactivateUser(id);

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
      ErrorLogger.logError(error as Error, {
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        params: req.params,
      });
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

      const user = await AdminService.getUserById(id);

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
      ErrorLogger.logError(error as Error, {
        userId: req.userId,
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        params: req.params,
        body: req.body,
      });
      next(error);
    }
  }

  static async listUsersFallback(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(503).json({
      success: false,
      message: 'Serviço temporariamente indisponível. Tente novamente mais tarde.',
      statusCode: 503,
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\controllers\AdminController.ts" -Encoding UTF8
Write-Success "AdminController.ts atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 1/3 CONCLUÍDA!"

Write-Success "Arquivos atualizados:"
Write-Info "  • backend/src/services/AdminService.ts"
Write-Info "  • backend/src/controllers/AdminController.ts"

Write-Info ""
Write-Info "📌 Melhorias aplicadas:" -ForegroundColor Cyan
Write-Info "  ✅ Retry com backoff para todas as operações admin" -ForegroundColor White
Write-Info "  ✅ Circuit breaker integrado" -ForegroundColor White
Write-Info "  ✅ Timeouts configuráveis" -ForegroundColor White
Write-Info "  ✅ ErrorLogger para erros admin" -ForegroundColor White
Write-Info "  ✅ Fallback para serviço indisponível" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Simule uma falha de banco de dados" -ForegroundColor White
Write-Info "  3. Verifique o retry automático" -ForegroundColor White
Write-Info "  4. Verifique os logs de erro" -ForegroundColor White

Write-Success "🎉 Parte 1/3 concluída com sucesso!"