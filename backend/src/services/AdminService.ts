// backend/src/services/AdminService.ts
import { Types } from 'mongoose';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
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
  companyId?: string;
  department?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  company?: string;
  companyId?: string;
  department?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  company?: string;
  companyId?: string;
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
            if (filters.company) {
              filter.company = { $regex: filters.company, $options: 'i' };
            }
            if (filters.companyId) {
              filter.companyId = new Types.ObjectId(filters.companyId);
            }
            if (filters.department) {
              filter.department = { $regex: filters.department, $options: 'i' };
            }

            if (filters.search) {
              filter.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
              ];
            }

            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
              User.find(filter)
                .select('_id name email role company companyId department isActive lastLoginAt createdAt')
                .lean()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .hint({ role: 1, isActive: 1, createdAt: -1 }),
              User.countDocuments(filter),
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
              users: users as unknown as IUser[],
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
              .select('_id name email role company companyId department isActive lastLoginAt createdAt')
              .lean()
              .exec();

            if (!user) {
              throw new NotFoundError('Usuário', userId);
            }

            return user as unknown as IUser;
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

            // Validar companyId se fornecido
            let companyId = data.companyId;
            if (companyId) {
              if (!Types.ObjectId.isValid(companyId)) {
                throw new AppError('ID da empresa inválido', 400);
              }
              const company = await Company.findById(companyId);
              if (!company) {
                throw new AppError('Empresa não encontrada', 404);
              }
            }

            const user = new User({
              name: data.name,
              email: data.email,
              password: data.password,
              role: data.role || UserRole.USER,
              company: data.company,
              companyId: companyId ? new Types.ObjectId(companyId) : undefined,
              department: data.department,
              isActive: true,
            });

            await user.save();

            logger.info(`Usuário criado pelo admin: ${user.email} (${user.role}) - Empresa: ${companyId || 'Nenhuma'}`);

            return user.toJSON() as unknown as IUser;
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

            // Validar companyId se fornecido
            if (data.companyId !== undefined) {
              if (data.companyId && !Types.ObjectId.isValid(data.companyId)) {
                throw new AppError('ID da empresa inválido', 400);
              }
              if (data.companyId) {
                const company = await Company.findById(data.companyId);
                if (!company) {
                  throw new AppError('Empresa não encontrada', 404);
                }
                user.companyId = new Types.ObjectId(data.companyId);
              } else {
                user.companyId = undefined;
              }
            }

            if (data.name) user.name = data.name;
            if (data.role) user.role = data.role;
            if (data.company !== undefined) user.company = data.company;
            if (data.department !== undefined) user.department = data.department;
            if (data.isActive !== undefined) user.isActive = data.isActive;

            await user.save();

            logger.info(`Usuário atualizado pelo admin: ${user.email} - Empresa: ${user.companyId || 'Nenhuma'}`);

            return user.toJSON() as unknown as IUser;
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

            return user.toJSON() as unknown as IUser;
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

  static async getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  }> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
              User.countDocuments({}),
              User.countDocuments({ isActive: true }),
              User.countDocuments({ createdAt: { $gte: startOfMonth } }),
            ]);

            return {
              totalUsers,
              activeUsers,
              newUsersThisMonth,
            };
          }, 'AdminService.getDashboardStats');
        }, 'AdminService.getDashboardStats');
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      throw new AppError('Erro ao obter estatísticas. Tente novamente mais tarde.', 500);
    }
  }
}