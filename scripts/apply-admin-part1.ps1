# scripts/apply-admin-part1.ps1
# Script para aplicar Parte 1/4 - Backend - Estrutura e Controllers

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
Write-Host "║     CODE_ASSESSMENT - ADMIN (PILAR 1: CLEAN CODE)          ║" -ForegroundColor $Colors.Header
Write-Host "║     PARTE 1/4 - BACKEND - ESTRUTURA E CONTROLLERS          ║" -ForegroundColor $Colors.Header
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor $Colors.Header
Write-Host ""

# ============================================
# PARTE 1: ADMIN SERVICE
# ============================================
Write-Step "PARTE 1/3: ADMIN SERVICE"

Write-Info "Criando AdminService.ts..."
@'
// backend/src/services/AdminService.ts
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { IUser, UserRole } from '../types/index.js';
import { TokenService } from './TokenService.js';
import { passwordPolicy } from './PasswordPolicy.js';

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

export class AdminService {
  /**
   * Lista todos os usuários com paginação e filtros
   */
  static async listUsers(
    page: number = 1,
    limit: number = 10,
    filters: {
      role?: UserRole;
      isActive?: boolean;
      search?: string;
    } = {}
  ): Promise<{
    users: IUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const filter: any = {};

      if (filters.role) filter.role = filters.role;
      if (filters.isActive !== undefined) filter.isActive = filters.isActive;
      if (filters.search) {
        filter.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ];
      }

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
        users: users as unknown as IUser[],
        total,
        page,
        totalPages,
      };
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      throw new AppError('Erro ao listar usuários', 500);
    }
  }

  /**
   * Busca um usuário por ID
   */
  static async getUserById(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId)
        .select('_id name email role company department isActive lastLoginAt createdAt updatedAt')
        .lean();

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      return user as unknown as IUser;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao buscar usuário:', error);
      throw new AppError('Erro ao buscar usuário', 500);
    }
  }

  /**
   * Cria um novo usuário
   */
  static async createUser(data: CreateUserData): Promise<IUser> {
    try {
      // Verificar se email já existe
      const existingUser = await User.findOne({ email: data.email }).lean();
      if (existingUser) {
        throw new AppError('Email já está em uso', 409);
      }

      // Validar senha
      const validation = passwordPolicy.validate(data.password, {
        name: data.name,
        email: data.email,
      });

      if (!validation.valid) {
        throw new AppError(`Senha inválida: ${validation.errors.join(', ')}`, 400);
      }

      // Criar usuário
      const user = new User({
        ...data,
        isActive: true,
      });

      await user.save();

      logger.info(`Usuário criado por admin: ${user.email} (${user.role})`);

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao criar usuário:', error);
      throw new AppError('Erro ao criar usuário', 500);
    }
  }

  /**
   * Atualiza um usuário
   */
  static async updateUser(userId: string, data: UpdateUserData): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Se o email está sendo alterado, verificar se já existe
      if (data.email && data.email !== user.email) {
        const existingUser = await User.findOne({ email: data.email }).lean();
        if (existingUser) {
          throw new AppError('Email já está em uso', 409);
        }
        user.email = data.email;
      }

      if (data.name) user.name = data.name;
      if (data.role) user.role = data.role;
      if (data.company !== undefined) user.company = data.company;
      if (data.department !== undefined) user.department = data.department;
      if (data.isActive !== undefined) user.isActive = data.isActive;

      // Se desativar, revogar tokens
      if (data.isActive === false) {
        await TokenService.revokeAllUserTokens(userId);
        logger.info(`Usuário desativado: ${user.email}`);
      }

      await user.save();

      logger.info(`Usuário atualizado por admin: ${user.email}`);

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar usuário:', error);
      throw new AppError('Erro ao atualizar usuário', 500);
    }
  }

  /**
   * Desativa um usuário
   */
  static async deactivateUser(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      if (!user.isActive) {
        throw new AppError('Usuário já está desativado', 400);
      }

      user.isActive = false;
      await user.save();

      // Revogar todos os tokens
      await TokenService.revokeAllUserTokens(userId);

      logger.info(`Usuário desativado: ${user.email}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao desativar usuário:', error);
      throw new AppError('Erro ao desativar usuário', 500);
    }
  }

  /**
   * Reativa um usuário
   */
  static async reactivateUser(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      if (user.isActive) {
        throw new AppError('Usuário já está ativo', 400);
      }

      user.isActive = true;
      await user.save();

      logger.info(`Usuário reativado: ${user.email}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao reativar usuário:', error);
      throw new AppError('Erro ao reativar usuário', 500);
    }
  }

  /**
   * Reseta a senha de um usuário
   */
  static async resetPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Validar senha
      const validation = passwordPolicy.validate(newPassword, {
        name: user.name,
        email: user.email,
      });

      if (!validation.valid) {
        throw new AppError(`Senha inválida: ${validation.errors.join(', ')}`, 400);
      }

      user.password = newPassword;
      await user.save();

      // Revogar todos os tokens
      await TokenService.revokeAllUserTokens(userId);

      logger.info(`Senha resetada para usuário: ${user.email}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao resetar senha:', error);
      throw new AppError('Erro ao resetar senha', 500);
    }
  }

  /**
   * Verifica se um usuário tem permissão de admin
   */
  static isAdmin(user: IUser): boolean {
    return user.role === UserRole.ADMIN;
  }

  /**
   * Verifica se um usuário tem permissão de preposto
   */
  static isRep(user: IUser): boolean {
    return user.role === UserRole.REP || user.role === UserRole.ADMIN;
  }
}
'@ | Out-File -FilePath "$BaseDir\backend\src\services\AdminService.ts" -Encoding UTF8
Write-Success "AdminService.ts criado"

# ============================================
# PARTE 2: ADMIN CONTROLLER
# ============================================
Write-Step "PARTE 2/3: ADMIN CONTROLLER"

Write-Info "Criando AdminController.ts..."
@'
// backend/src/controllers/AdminController.ts
import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService.js';
import { logger } from '../utils/logger.js';
import { validate } from '../utils/validation.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';
import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(12, 'Senha deve ter pelo menos 12 caracteres'),
  role: z.enum(['admin', 'rep', 'consultant', 'user']),
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['admin', 'rep', 'consultant', 'user']).optional(),
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(12, 'Senha deve ter pelo menos 12 caracteres'),
});

const listUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  role: z.enum(['admin', 'rep', 'consultant', 'user']).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ============================================
// ADMIN CONTROLLER
// ============================================

export class AdminController {
  /**
   * Lista usuários com paginação
   */
  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(listUsersSchema, req.query);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      const { page, limit, role, isActive, search } = validation.data;

      const result = await AdminService.listUsers(page, limit, {
        role,
        isActive,
        search,
      });

      res.json({
        success: true,
        data: {
          users: result.users,
          pagination: {
            page: result.page,
            limit,
            total: result.total,
            totalPages: result.totalPages,
            hasNext: result.page < result.totalPages,
            hasPrevious: result.page > 1,
          },
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca um usuário por ID
   */
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

  /**
   * Cria um novo usuário
   */
  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(createUserSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      const user = await AdminService.createUser(validation.data);

      // Log da ação
      logger.info(`Admin ${req.user?.email} criou usuário: ${user.email}`);

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

  /**
   * Atualiza um usuário
   */
  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const validation = validate(updateUserSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      const user = await AdminService.updateUser(id, validation.data);

      // Log da ação
      logger.info(`Admin ${req.user?.email} atualizou usuário: ${user.email}`);

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

  /**
   * Desativa um usuário
   */
  static async deactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await AdminService.deactivateUser(id);

      // Log da ação
      logger.info(`Admin ${req.user?.email} desativou usuário: ${id}`);

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

  /**
   * Reativa um usuário
   */
  static async reactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await AdminService.reactivateUser(id);

      // Log da ação
      logger.info(`Admin ${req.user?.email} reativou usuário: ${id}`);

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

  /**
   * Reseta a senha de um usuário
   */
  static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const validation = validate(resetPasswordSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      await AdminService.resetPassword(id, validation.data.newPassword);

      // Log da ação
      logger.info(`Admin ${req.user?.email} resetou senha do usuário: ${id}`);

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
Write-Success "AdminController.ts criado"

# ============================================
# PARTE 3: ADMIN ROUTES
# ============================================
Write-Step "PARTE 3/3: ADMIN ROUTES"

Write-Info "Criando admin.ts..."
@'
// backend/src/routes/admin.ts
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  authenticatedRateLimiter,
  sensitiveRateLimiter
} from '../middleware/rateLimit.js';
import { noCache } from '../middleware/cache.js';
import { UserRole } from '../types/index.js';

const router = Router();

// ============================================
// TODAS AS ROTAS ADMIN EXIGEM AUTENTICAÇÃO E ROLE ADMIN
// ============================================
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// ============================================
// ROTAS DE USUÁRIOS
// ============================================

// Listar usuários (com paginação e filtros)
router.get(
  '/users',
  authenticatedRateLimiter,
  noCache,
  AdminController.listUsers
);

// Buscar usuário por ID
router.get(
  '/users/:id',
  authenticatedRateLimiter,
  noCache,
  AdminController.getUserById
);

// Criar usuário
router.post(
  '/users',
  sensitiveRateLimiter,
  noCache,
  AdminController.createUser
);

// Atualizar usuário
router.put(
  '/users/:id',
  sensitiveRateLimiter,
  noCache,
  AdminController.updateUser
);

// Desativar usuário
router.delete(
  '/users/:id',
  sensitiveRateLimiter,
  noCache,
  AdminController.deactivateUser
);

// Reativar usuário
router.post(
  '/users/:id/reactivate',
  sensitiveRateLimiter,
  noCache,
  AdminController.reactivateUser
);

// Resetar senha
router.post(
  '/users/:id/reset-password',
  sensitiveRateLimiter,
  noCache,
  AdminController.resetPassword
);

export default router;
'@ | Out-File -FilePath "$BaseDir\backend\src\routes\admin.ts" -Encoding UTF8
Write-Success "admin.ts criado"

# ============================================
# ATUALIZAR SERVER.TS
# ============================================
Write-Info "Atualizando server.ts com rotas admin..."
# Verificar se já existe importação do admin routes
$serverPath = "$BaseDir\backend\src\server.ts"
$serverContent = Get-Content $serverPath -Raw

if ($serverContent -notmatch "import adminRoutes from './routes/admin.js'") {
    # Adicionar importação após authRoutes
    $serverContent = $serverContent -replace "import authRoutes from './routes/auth.js';", "import authRoutes from './routes/auth.js';`nimport adminRoutes from './routes/admin.js';"
}

if ($serverContent -notmatch "app.use\('/api/admin', adminRoutes\)") {
    # Adicionar rota admin após auth
    $serverContent = $serverContent -replace "app.use\('/api/auth', authRoutes\);", "app.use('/api/auth', authRoutes);`n`n// ============================================`n// ROTAS ADMIN`n// ============================================`napp.use('/api/admin', adminRoutes);"
}

$serverContent | Out-File -FilePath $serverPath -Encoding UTF8
Write-Success "server.ts atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 1/4 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • backend/src/services/AdminService.ts"
Write-Info "  • backend/src/controllers/AdminController.ts"
Write-Info "  • backend/src/routes/admin.ts"
Write-Info "  • backend/src/server.ts (atualizado)"

Write-Info ""
Write-Info "📌 Endpoints disponíveis:" -ForegroundColor Cyan
Write-Info "  GET    /api/admin/users - Listar usuários" -ForegroundColor White
Write-Info "  GET    /api/admin/users/:id - Buscar usuário" -ForegroundColor White
Write-Info "  POST   /api/admin/users - Criar usuário" -ForegroundColor White
Write-Info "  PUT    /api/admin/users/:id - Atualizar usuário" -ForegroundColor White
Write-Info "  DELETE /api/admin/users/:id - Desativar usuário" -ForegroundColor White
Write-Info "  POST   /api/admin/users/:id/reactivate - Reativar usuário" -ForegroundColor White
Write-Info "  POST   /api/admin/users/:id/reset-password - Resetar senha" -ForegroundColor White

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o backend: cd backend && npm run dev" -ForegroundColor White
Write-Info "  2. Faça login com um usuário admin" -ForegroundColor White
Write-Info "  3. Use o token para testar os endpoints" -ForegroundColor White

Write-Success "🎉 Parte 1/4 concluída com sucesso!"