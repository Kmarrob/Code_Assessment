import { Types } from 'mongoose';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { logger } from '../utils/logger.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { UserRole, IUser } from '../types/index.js';
import { retryDatabase } from '../utils/retry.js';
import { databaseCircuitBreaker } from '../utils/circuitBreaker.js';
import { withDbTimeout } from '../middleware/timeout.js';
// 🔴 NOVO: Import do EmailJSService
import { emailjsService } from './EmailJSService.js';

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
            
            // 🔴 CORREÇÃO: Filtrar por companyId
            if (filters.companyId) {
              filter.companyId = new Types.ObjectId(filters.companyId);
            }
            
            if (filters.company) {
              filter.company = { $regex: filters.company, $options: 'i' };
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

              // ============================================
              // 🔴 CORREÇÃO: VALIDAR LIMITE DE USUÁRIOS DO PLANO
              // ============================================
              // ✅ CORRIGIDO: Contar todos os usuários da empresa (exceto admins e consultores)
              const activeUserCount = await User.countDocuments({
                companyId: companyId,
                isActive: true,
                role: { $nin: [UserRole.ADMIN, UserRole.CONSULTANT] }
              });

              // Verificar se atingiu o limite (apenas para usuários comuns, prepostos e outros que consomem o plano)
              if (data.role !== UserRole.ADMIN && data.role !== UserRole.CONSULTANT) {
                if (activeUserCount >= company.maxUsers) {
                  const planName = company.plan === 'enterprise' ? 'Enterprise' : 
                                   company.plan === 'pro' ? 'Profissional' : 'Básico';
                  throw new AppError(
                    `Limite de usuários do plano ${planName} atingido (${company.maxUsers}). Faça upgrade para adicionar mais usuários.`,
                    403
                  );
                }
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

            // 🔴 NOVO: Enviar e-mail de boas-vindas com link para criar senha
            try {
              const frontendUrl = process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com';
              const resetToken = user._id; // Usar ID como token simples
              const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

              await emailjsService.sendPasswordResetEmail({
                to: user.email,
                userName: user.name,
                userEmail: user.email,
                resetLink: resetLink,
                expiryTime: '24 horas',
              });

              logger.info(`📧 E-mail de boas-vindas enviado para ${user.email} (Admin)`);
            } catch (emailError) {
              // Não interrompe o fluxo se o e-mail falhar
              logger.error(`❌ Erro ao enviar e-mail de boas-vindas para ${user.email}:`, emailError);
            }

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

  // ============================================
  // MÉTODOS DE BRANDING - LOGO E FAVICON
  // ============================================

  /**
   * Upload da logo da empresa
   */
  static async uploadLogo(
    companyId: string,
    file: Express.Multer.File,
    userId: string
  ): Promise<any> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(companyId)) {
              throw new AppError('ID da empresa inválido', 400);
            }

            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID do usuário inválido', 400);
            }

            const company = await Company.findById(companyId);
            if (!company) {
              throw new NotFoundError('Empresa', companyId);
            }

            // Validações do arquivo
            const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
              throw new AppError('Formato de arquivo não suportado. Use PNG, JPG, SVG ou WEBP.', 400);
            }

            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
              throw new AppError('Arquivo muito grande. Máximo 2MB.', 400);
            }

            // 🔴 CORREÇÃO: Usar URL absoluta para a logo
            const baseUrl = process.env.BASE_URL || 'https://cisatool.com.br';

            // Atualizar branding da empresa
            const branding = company.branding || {
              logo: {
                url: '',
                filename: '',
                size: 0,
                mimeType: '',
                dimensions: { width: 0, height: 0 },
                uploadedAt: null,
                uploadedBy: null,
              },
              favicon: {
                url: '',
                filename: '',
                size: 0,
                mimeType: '',
                uploadedAt: null,
                uploadedBy: null,
              },
              colors: {
                primary: '#122A40',
                secondary: '#1E5359',
                accent: '#30736C',
                background: '#F2F2F2',
                text: '#122A40',
                extractedFrom: null,
              },
              settings: {
                showLogoInHeader: true,
                showLogoInReport: true,
                useCustomColors: false,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Atualizar apenas o logo mantendo o restante do branding
            branding.logo = {
              url: `${baseUrl}/uploads/logo/${companyId}/${file.filename}`,
              filename: file.filename,
              size: file.size,
              mimeType: file.mimetype,
              dimensions: {
                width: 0,
                height: 0,
              },
              uploadedAt: new Date(),
              uploadedBy: new Types.ObjectId(userId),
            };
            branding.updatedAt = new Date();

            company.branding = branding;
            await company.save();

            logger.info(`Logo enviada para empresa ${company.name} por ${userId}`);

            return {
              logo: company.branding.logo,
              companyId: company._id,
              companyName: company.name,
            };
          }, 'AdminService.uploadLogo');
        }, 'AdminService.uploadLogo');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao fazer upload da logo:', error);
      throw new AppError('Erro ao fazer upload da logo. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Upload do favicon da empresa
   */
  static async uploadFavicon(
    companyId: string,
    file: Express.Multer.File,
    userId: string
  ): Promise<any> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(companyId)) {
              throw new AppError('ID da empresa inválido', 400);
            }

            if (!Types.ObjectId.isValid(userId)) {
              throw new AppError('ID do usuário inválido', 400);
            }

            const company = await Company.findById(companyId);
            if (!company) {
              throw new NotFoundError('Empresa', companyId);
            }

            // Validações do arquivo
            const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon', 'image/webp'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
              throw new AppError('Formato de arquivo não suportado. Use PNG, JPG, SVG, ICO ou WEBP.', 400);
            }

            const maxSize = 512 * 1024; // 512KB
            if (file.size > maxSize) {
              throw new AppError('Arquivo muito grande. Máximo 512KB.', 400);
            }

            // 🔴 CORREÇÃO: Usar URL absoluta para o favicon
            const baseUrl = process.env.BASE_URL || 'https://cisatool.com.br';

            // Atualizar branding da empresa
            const branding = company.branding || {
              logo: {
                url: '',
                filename: '',
                size: 0,
                mimeType: '',
                dimensions: { width: 0, height: 0 },
                uploadedAt: null,
                uploadedBy: null,
              },
              favicon: {
                url: '',
                filename: '',
                size: 0,
                mimeType: '',
                uploadedAt: null,
                uploadedBy: null,
              },
              colors: {
                primary: '#122A40',
                secondary: '#1E5359',
                accent: '#30736C',
                background: '#F2F2F2',
                text: '#122A40',
                extractedFrom: null,
              },
              settings: {
                showLogoInHeader: true,
                showLogoInReport: true,
                useCustomColors: false,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            branding.favicon = {
              url: `${baseUrl}/uploads/favicon/${companyId}/${file.filename}`,
              filename: file.filename,
              size: file.size,
              mimeType: file.mimetype,
              uploadedAt: new Date(),
              uploadedBy: new Types.ObjectId(userId),
            };
            branding.updatedAt = new Date();

            company.branding = branding;
            await company.save();

            logger.info(`Favicon enviado para empresa ${company.name} por ${userId}`);

            return {
              favicon: company.branding.favicon,
              companyId: company._id,
              companyName: company.name,
            };
          }, 'AdminService.uploadFavicon');
        }, 'AdminService.uploadFavicon');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao fazer upload do favicon:', error);
      throw new AppError('Erro ao fazer upload do favicon. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Obter branding da empresa
   */
  static async getBranding(companyId: string): Promise<any> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(companyId)) {
              throw new AppError('ID da empresa inválido', 400);
            }

            const company = await Company.findById(companyId)
              .select('branding name')
              .lean();

            if (!company) {
              throw new NotFoundError('Empresa', companyId);
            }

            // Garantir que o branding tenha todos os campos
            const branding = company.branding || {
              logo: {
                url: '',
                filename: '',
                size: 0,
                mimeType: '',
                dimensions: { width: 0, height: 0 },
                uploadedAt: null,
                uploadedBy: null,
              },
              favicon: {
                url: '',
                filename: '',
                size: 0,
                mimeType: '',
                uploadedAt: null,
                uploadedBy: null,
              },
              colors: {
                primary: '#122A40',
                secondary: '#1E5359',
                accent: '#30736C',
                background: '#F2F2F2',
                text: '#122A40',
                extractedFrom: null,
              },
              settings: {
                showLogoInHeader: true,
                showLogoInReport: true,
                useCustomColors: false,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            return {
              companyId: company._id,
              companyName: company.name,
              branding: branding,
            };
          }, 'AdminService.getBranding');
        }, 'AdminService.getBranding');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao obter branding:', error);
      throw new AppError('Erro ao obter branding. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Obter branding público da empresa (sem autenticação)
   */
  static async getPublicBranding(companyId: string): Promise<any> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(companyId)) {
              throw new AppError('ID da empresa inválido', 400);
            }

            const company = await Company.findById(companyId)
              .select('branding name')
              .lean();

            if (!company) {
              throw new NotFoundError('Empresa', companyId);
            }

            const branding = company.branding || {
              logo: {
                url: '',
                filename: '',
                size: 0,
                mimeType: '',
                dimensions: { width: 0, height: 0 },
                uploadedAt: null,
                uploadedBy: null,
              },
              favicon: {
                url: '',
                filename: '',
                size: 0,
                mimeType: '',
                uploadedAt: null,
                uploadedBy: null,
              },
              colors: {
                primary: '#122A40',
                secondary: '#1E5359',
                accent: '#30736C',
                background: '#F2F2F2',
                text: '#122A40',
                extractedFrom: null,
              },
              settings: {
                showLogoInHeader: true,
                showLogoInReport: true,
                useCustomColors: false,
              },
            };
            
            return {
              companyId: company._id,
              companyName: company.name,
              logo: branding.logo && branding.logo.url ? {
                url: branding.logo.url,
                filename: branding.logo.filename,
              } : null,
              favicon: branding.favicon && branding.favicon.url ? {
                url: branding.favicon.url,
                filename: branding.favicon.filename,
              } : null,
              colors: branding.colors || {
                primary: '#122A40',
                secondary: '#1E5359',
                accent: '#30736C',
                background: '#F2F2F2',
                text: '#122A40',
              },
              settings: branding.settings || {
                showLogoInHeader: true,
                showLogoInReport: true,
                useCustomColors: false,
              },
            };
          }, 'AdminService.getPublicBranding');
        }, 'AdminService.getPublicBranding');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao obter branding público:', error);
      throw new AppError('Erro ao obter branding público. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Remover logo da empresa
   */
  static async removeLogo(companyId: string): Promise<any> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(companyId)) {
              throw new AppError('ID da empresa inválido', 400);
            }

            const company = await Company.findById(companyId);
            if (!company) {
              throw new NotFoundError('Empresa', companyId);
            }

            // Inicializar branding se não existir
            if (!company.branding) {
              company.branding = {
                logo: {
                  url: '',
                  filename: '',
                  size: 0,
                  mimeType: '',
                  dimensions: { width: 0, height: 0 },
                  uploadedAt: null,
                  uploadedBy: null,
                },
                favicon: {
                  url: '',
                  filename: '',
                  size: 0,
                  mimeType: '',
                  uploadedAt: null,
                  uploadedBy: null,
                },
                colors: {
                  primary: '#122A40',
                  secondary: '#1E5359',
                  accent: '#30736C',
                  background: '#F2F2F2',
                  text: '#122A40',
                  extractedFrom: null,
                },
                settings: {
                  showLogoInHeader: true,
                  showLogoInReport: true,
                  useCustomColors: false,
                },
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }

            company.branding.logo = {
              url: '',
              filename: '',
              size: 0,
              mimeType: '',
              dimensions: { width: 0, height: 0 },
              uploadedAt: null,
              uploadedBy: null,
            };
            company.branding.updatedAt = new Date();
            await company.save();

            logger.info(`Logo removida da empresa ${company.name}`);

            return {
              companyId: company._id,
              companyName: company.name,
              logoRemoved: true,
            };
          }, 'AdminService.removeLogo');
        }, 'AdminService.removeLogo');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao remover logo:', error);
      throw new AppError('Erro ao remover logo. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Remover favicon da empresa
   */
  static async removeFavicon(companyId: string): Promise<any> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(companyId)) {
              throw new AppError('ID da empresa inválido', 400);
            }

            const company = await Company.findById(companyId);
            if (!company) {
              throw new NotFoundError('Empresa', companyId);
            }

            // Inicializar branding se não existir
            if (!company.branding) {
              company.branding = {
                logo: {
                  url: '',
                  filename: '',
                  size: 0,
                  mimeType: '',
                  dimensions: { width: 0, height: 0 },
                  uploadedAt: null,
                  uploadedBy: null,
                },
                favicon: {
                  url: '',
                  filename: '',
                  size: 0,
                  mimeType: '',
                  uploadedAt: null,
                  uploadedBy: null,
                },
                colors: {
                  primary: '#122A40',
                  secondary: '#1E5359',
                  accent: '#30736C',
                  background: '#F2F2F2',
                  text: '#122A40',
                  extractedFrom: null,
                },
                settings: {
                  showLogoInHeader: true,
                  showLogoInReport: true,
                  useCustomColors: false,
                },
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }

            company.branding.favicon = {
              url: '',
              filename: '',
              size: 0,
              mimeType: '',
              uploadedAt: null,
              uploadedBy: null,
            };
            company.branding.updatedAt = new Date();
            await company.save();

            logger.info(`Favicon removido da empresa ${company.name}`);

            return {
              companyId: company._id,
              companyName: company.name,
              faviconRemoved: true,
            };
          }, 'AdminService.removeFavicon');
        }, 'AdminService.removeFavicon');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao remover favicon:', error);
      throw new AppError('Erro ao remover favicon. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Atualizar configurações de branding
   */
  static async updateBrandingSettings(
    companyId: string,
    settings: {
      showLogoInHeader?: boolean;
      showLogoInReport?: boolean;
      useCustomColors?: boolean;
    }
  ): Promise<any> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(companyId)) {
              throw new AppError('ID da empresa inválido', 400);
            }

            const company = await Company.findById(companyId);
            if (!company) {
              throw new NotFoundError('Empresa', companyId);
            }

            // Inicializar branding se não existir
            if (!company.branding) {
              company.branding = {
                logo: {
                  url: '',
                  filename: '',
                  size: 0,
                  mimeType: '',
                  dimensions: { width: 0, height: 0 },
                  uploadedAt: null,
                  uploadedBy: null,
                },
                favicon: {
                  url: '',
                  filename: '',
                  size: 0,
                  mimeType: '',
                  uploadedAt: null,
                  uploadedBy: null,
                },
                colors: {
                  primary: '#122A40',
                  secondary: '#1E5359',
                  accent: '#30736C',
                  background: '#F2F2F2',
                  text: '#122A40',
                  extractedFrom: null,
                },
                settings: {
                  showLogoInHeader: true,
                  showLogoInReport: true,
                  useCustomColors: false,
                },
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }

            if (settings.showLogoInHeader !== undefined) {
              company.branding.settings.showLogoInHeader = settings.showLogoInHeader;
            }
            if (settings.showLogoInReport !== undefined) {
              company.branding.settings.showLogoInReport = settings.showLogoInReport;
            }
            if (settings.useCustomColors !== undefined) {
              company.branding.settings.useCustomColors = settings.useCustomColors;
            }
            company.branding.updatedAt = new Date();

            await company.save();

            logger.info(`Configurações de branding atualizadas para empresa ${company.name}`);

            return {
              companyId: company._id,
              companyName: company.name,
              settings: company.branding.settings,
            };
          }, 'AdminService.updateBrandingSettings');
        }, 'AdminService.updateBrandingSettings');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar configurações de branding:', error);
      throw new AppError('Erro ao atualizar configurações de branding. Tente novamente mais tarde.', 500);
    }
  }
}