// backend/src/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';
import { logger } from '../utils/logger.js';
import { validate, registerSchema, loginSchema, refreshTokenSchema, updateProfileSchema } from '../utils/validation.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ValidationError } from '../middleware/errorHandler.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(registerSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const user = await AuthService.register(validation.data);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: { user },
        statusCode: 201,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(loginSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const { email, password } = validation.data;
      const { user, tokens } = await AuthService.login(email, password);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user,
          tokens,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validate(refreshTokenSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const tokens = await AuthService.refreshToken(validation.data.refreshToken);

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: { tokens },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      await AuthService.logout(userId);

      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Usuário não autenticado', 401);
      }

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

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const validation = validate(updateProfileSchema, req.body);
      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const { name, company, department, currentPassword, newPassword } = validation.data;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      if (name) user.name = name;
      if (company) user.company = company;
      if (department) user.department = department;

      if (currentPassword && newPassword) {
        await AuthService.changePassword(userId, currentPassword, newPassword);
      }

      await user.save();

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, role, isActive, search } = req.query;

      const filter: any = {};
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('_id name email role company department isActive lastLoginAt createdAt')
          .lean()
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      res.json({
        success: true,
        data: { users },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrevious: Number(page) > 1,
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
      
      const user = await User.findById(id)
        .select('_id name email role company department isActive lastLoginAt createdAt')
        .lean();

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

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
}