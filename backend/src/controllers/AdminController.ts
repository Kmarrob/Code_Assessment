import { Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService.js';
import { validate } from '../utils/validation.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
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
        throw new ValidationError(validation.errors || {});
      }

      const { page, limit, role, isActive, search, company, department } = validation.data;

      // Garantir que role seja do tipo correto usando enum
      let validRole: UserRole | undefined;
      if (role && typeof role === 'string') {
        const roles = Object.values(UserRole);
        if (roles.includes(role as UserRole)) {
          validRole = role as UserRole;
        }
      }

      const result = await AdminService.listUsers(
        { 
          role: validRole, 
          isActive, 
          search, 
          company, 
          department 
        },
        page,
        limit
      );

      // Garantir que page seja um número
      const currentPage = Number(page) || 1;

      res.json({
        success: true,
        data: { users: result.users },
        pagination: {
          page: currentPage,
          limit: Number(limit) || 10,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: currentPage < (result.totalPages || 1),
          hasPrevious: currentPage > 1,
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
      
      if (!id) {
        throw new ValidationError({ id: ['ID do usuário é obrigatório'] });
      }
      
      const user = await AdminService.getUserById(id);

      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

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
        throw new ValidationError(validation.errors || {});
      }

      // Garantir que role seja do tipo correto usando enum
      const userData = {
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
        role: validation.data.role as UserRole,
        company: validation.data.company ?? undefined,
        companyId: validation.data.companyId ?? undefined,
        department: validation.data.department ?? undefined,
      };

      const user = await AdminService.createUser(userData);

      // Verificar se userId existe antes de usar
      if (req.userId) {
        AuditService.logUserCreation(
          req.userId,
          req.user?.email || '',
          user._id.toString(),
          user.email,
          user.role,
          req.ip || '',
          req.headers['user-agent'] || '',
          true
        );
      }

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

      if (!id) {
        throw new ValidationError({ id: ['ID do usuário é obrigatório'] });
      }

      if (id === req.userId) {
        const validation = validate(adminUpdateUserSchema, req.body);
        if (validation.success) {
          if (validation.data.isActive === false) {
            throw new AppError('Você não pode desativar sua própria conta', 400);
          }
          if (validation.data.role) {
            const existingUser = await AdminService.getUserById(id);
            if (existingUser && validation.data.role !== existingUser.role) {
              throw new AppError('Você não pode alterar sua própria role', 400);
            }
          }
        }
      }

      const validation = validate(adminUpdateUserSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      // Preparar dados para atualização com conversão de null para undefined
      const updateData: any = {
        name: validation.data.name,
        email: validation.data.email,
        isActive: validation.data.isActive,
        company: validation.data.company ?? undefined,
        companyId: validation.data.companyId ?? undefined,
        department: validation.data.department ?? undefined,
      };

      if (validation.data.role) {
        updateData.role = validation.data.role as UserRole;
      }

      const user = await AdminService.updateUser(id, updateData);

      if (req.userId) {
        AuditService.logUserUpdate(
          req.userId,
          req.user?.email || '',
          id,
          user.email,
          updateData,
          req.ip || '',
          req.headers['user-agent'] || '',
          true
        );
      }

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

      if (!id) {
        throw new ValidationError({ id: ['ID do usuário é obrigatório'] });
      }

      if (id === req.userId) {
        throw new AppError('Você não pode desativar sua própria conta', 400);
      }

      // Buscar usuário antes de desativar para logging
      const user = await AdminService.getUserById(id);
      
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      await AdminService.deleteUser(id);

      if (req.userId) {
        AuditService.logUserDeactivation(
          req.userId,
          req.user?.email || '',
          id,
          user.email,
          req.ip || '',
          req.headers['user-agent'] || '',
          true
        );
      }

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

      if (!id) {
        throw new ValidationError({ id: ['ID do usuário é obrigatório'] });
      }

      const user = await AdminService.reactivateUser(id);

      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      if (req.userId) {
        AuditService.logUserReactivation(
          req.userId,
          req.user?.email || '',
          id,
          user.email,
          req.ip || '',
          req.headers['user-agent'] || '',
          true
        );
      }

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

      if (!id) {
        throw new ValidationError({ id: ['ID do usuário é obrigatório'] });
      }

      const validation = validate(adminResetPasswordSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      // Verificar se usuário existe antes de resetar
      const user = await AdminService.getUserById(id);
      
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      await AdminService.resetPassword(id, validation.data.password);

      if (req.userId) {
        AuditService.logPasswordReset(
          req.userId,
          req.user?.email || '',
          id,
          user.email,
          req.ip || '',
          req.headers['user-agent'] || '',
          true
        );
      }

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

  // ============================================
  // MÉTODOS DE BRANDING - LOGO E FAVICON
  // ============================================

  /**
   * Upload da logo da empresa (ADMIN ou REP da própria empresa)
   * POST /api/admin/company/:companyId/branding/logo
   */
  static async uploadLogo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        throw new ValidationError({ companyId: ['ID da empresa é obrigatório'] });
      }

      // 🔴 CORREÇÃO: Permitir ADMIN ou REP da própria empresa
      const user = req.user;
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (user.role === UserRole.ADMIN) {
        // ADMIN pode fazer upload para qualquer empresa
      } else if (user.role === UserRole.REP) {
        // REP só pode fazer upload para sua própria empresa
        const userCompanyId = user.companyId?.toString();
        if (userCompanyId !== companyId) {
          throw new AppError('Você não tem permissão para fazer upload da logo desta empresa', 403);
        }
      } else {
        throw new AppError('Apenas administradores e prepostos podem fazer upload da logo', 403);
      }

      // Verificar se o arquivo foi enviado
      if (!req.file) {
        throw new ValidationError({ logo: ['Arquivo de logo é obrigatório'] });
      }

      const result = await AdminService.uploadLogo(
        companyId,
        req.file,
        req.userId!
      );

      res.json({
        success: true,
        message: 'Logo enviada com sucesso',
        data: result,
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

  /**
   * Upload do favicon da empresa (apenas ADMIN)
   * POST /api/admin/company/:companyId/branding/favicon
   */
  static async uploadFavicon(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        throw new ValidationError({ companyId: ['ID da empresa é obrigatório'] });
      }

      // Verificar se o usuário é ADMIN
      if (req.user?.role !== UserRole.ADMIN) {
        throw new AppError('Apenas administradores podem fazer upload do favicon', 403);
      }

      // Verificar se o arquivo foi enviado
      if (!req.file) {
        throw new ValidationError({ favicon: ['Arquivo de favicon é obrigatório'] });
      }

      const result = await AdminService.uploadFavicon(
        companyId,
        req.file,
        req.userId!
      );

      res.json({
        success: true,
        message: 'Favicon enviado com sucesso',
        data: result,
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

  /**
   * Obter branding da empresa
   * GET /api/admin/company/:companyId/branding
   * Acesso: ADMIN ou REP (apenas da própria empresa)
   */
  static async getBranding(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        throw new ValidationError({ companyId: ['ID da empresa é obrigatório'] });
      }

      // 🔴 CORRIGIDO: Permitir REP da própria empresa
      const user = req.user;
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // ADMIN pode acessar qualquer empresa
      if (user.role === UserRole.ADMIN) {
        // OK
      } else if (user.role === UserRole.REP) {
        // REP só pode acessar a própria empresa
        const userCompanyId = user.companyId?.toString();
        if (userCompanyId !== companyId) {
          throw new AppError('Você não tem permissão para acessar o branding desta empresa', 403);
        }
      } else {
        throw new AppError('Apenas administradores e prepostos podem visualizar o branding', 403);
      }

      const branding = await AdminService.getBranding(companyId);

      res.json({
        success: true,
        data: branding,
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

  /**
   * Remover logo da empresa (apenas ADMIN)
   * DELETE /api/admin/company/:companyId/branding/logo
   */
  static async removeLogo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        throw new ValidationError({ companyId: ['ID da empresa é obrigatório'] });
      }

      // Verificar se o usuário é ADMIN
      if (req.user?.role !== UserRole.ADMIN) {
        throw new AppError('Apenas administradores podem remover a logo', 403);
      }

      const result = await AdminService.removeLogo(companyId);

      res.json({
        success: true,
        message: 'Logo removida com sucesso',
        data: result,
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

  /**
   * Remover favicon da empresa (apenas ADMIN)
   * DELETE /api/admin/company/:companyId/branding/favicon
   */
  static async removeFavicon(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        throw new ValidationError({ companyId: ['ID da empresa é obrigatório'] });
      }

      // Verificar se o usuário é ADMIN
      if (req.user?.role !== UserRole.ADMIN) {
        throw new AppError('Apenas administradores podem remover o favicon', 403);
      }

      const result = await AdminService.removeFavicon(companyId);

      res.json({
        success: true,
        message: 'Favicon removido com sucesso',
        data: result,
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

  /**
   * Atualizar configurações de branding (apenas ADMIN)
   * PUT /api/admin/company/:companyId/branding/settings
   */
  static async updateBrandingSettings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        throw new ValidationError({ companyId: ['ID da empresa é obrigatório'] });
      }

      // Verificar se o usuário é ADMIN
      if (req.user?.role !== UserRole.ADMIN) {
        throw new AppError('Apenas administradores podem atualizar as configurações de branding', 403);
      }

      const { showLogoInHeader, showLogoInReport, useCustomColors } = req.body;

      const result = await AdminService.updateBrandingSettings(
        companyId,
        { showLogoInHeader, showLogoInReport, useCustomColors }
      );

      res.json({
        success: true,
        message: 'Configurações de branding atualizadas com sucesso',
        data: result,
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

  /**
   * Obter branding público da empresa (para frontend sem autenticação)
   * GET /api/branding/:companyId
   * CORRIGIDO: Retorna valores padrão mesmo se o companyId não existir
   */
  static async getPublicBranding(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        throw new ValidationError({ companyId: ['ID da empresa é obrigatório'] });
      }

      let branding;
      try {
        branding = await AdminService.getPublicBranding(companyId);
      } catch (error) {
        // Se a empresa não for encontrada, retorna valores padrão
        console.warn(`⚠️ Empresa ${companyId} não encontrada para branding, usando valores padrão`);
        branding = {
          companyId: companyId,
          companyName: 'MRS Consultoria',
          logo: null,
          favicon: null,
          colors: {
            primary: '#122A40',
            secondary: '#1E5359',
            accent: '#30736C',
            background: '#F2F2F2',
            text: '#122A40',
          },
          settings: {
            showLogoInHeader: true,
            showLogoInReport: true,
            useCustomColors: false,
          },
        };
      }

      // Garantir que todos os campos existam
      const defaultColors = {
        primary: '#122A40',
        secondary: '#1E5359',
        accent: '#30736C',
        background: '#F2F2F2',
        text: '#122A40',
      };

      const defaultSettings = {
        showLogoInHeader: true,
        showLogoInReport: true,
        useCustomColors: false,
      };

      const responseData = {
        companyId: branding?.companyId || companyId,
        companyName: branding?.companyName || 'MRS Consultoria',
        logo: branding?.logo || null,
        favicon: branding?.favicon || null,
        colors: branding?.colors || defaultColors,
        settings: branding?.settings || defaultSettings,
      };

      res.json({
        success: true,
        data: responseData,
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