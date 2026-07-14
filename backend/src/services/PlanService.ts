// backend/src/services/PlanService.ts
import { Types } from 'mongoose';
import { Plan, IPlan } from '../models/Plan.js';
import { logger } from '../utils/logger.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { retryDatabase } from '../utils/retry.js';
import { databaseCircuitBreaker } from '../utils/circuitBreaker.js';
import { withDbTimeout } from '../middleware/timeout.js';

export interface CreatePlanData {
  name: 'basic' | 'pro' | 'enterprise' | 'trial';
  displayName: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  pricePerUser: number;
  features: {
    maxUsers: number;
    maxControls: number;
    canViewReport: boolean;
    canPrintReport: boolean;
    canDownloadReport: boolean;
    canViewRoadmap: boolean;
    canViewComparative: boolean;
    canExportData: boolean;
    hasConsultingHours: boolean;
    consultingHours: number;
    consultingHoursUsed: number;
    supportPriority: 'low' | 'medium' | 'high' | 'critical';
    supportHours: 'business' | 'extended' | '24x7';
    canCustomizeBranding: boolean;
    canAddCustomControls: boolean;
    canIntegrateAPI: boolean;
    canIntegrateSSO: boolean;
  };
  sortOrder?: number;
  badge?: string;
  trialDays?: number;
  isActive?: boolean;
  isPublic?: boolean;
  allowCustomPricing?: boolean;
  createdBy?: string;
}

export interface UpdatePlanData {
  displayName?: string;
  description?: string;
  priceMonthly?: number;
  priceAnnual?: number;
  pricePerUser?: number;
  features?: Partial<CreatePlanData['features']>;
  sortOrder?: number;
  badge?: string;
  isActive?: boolean;
  isPublic?: boolean;
  allowCustomPricing?: boolean;
  customPriceMonthly?: number;
  customPriceAnnual?: number;
  trialDays?: number;
}

export class PlanService {
  /**
   * Criar um novo plano
   */
  static async createPlan(data: CreatePlanData, userId: string): Promise<IPlan> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            // Verificar se já existe um plano com este nome
            const existingPlan = await Plan.findOne({ name: data.name });
            if (existingPlan) {
              throw new AppError(`Plano ${data.name} já existe`, 400);
            }

            // Validar features
            if (data.features.maxUsers < 1) {
              throw new AppError('Número máximo de usuários deve ser maior que 0', 400);
            }

            if (data.features.maxControls < 1) {
              throw new AppError('Número máximo de controles deve ser maior que 0', 400);
            }

            const plan = new Plan({
              ...data,
              createdBy: new Types.ObjectId(userId),
              updatedBy: new Types.ObjectId(userId),
            });

            await plan.save();

            logger.info(`Plano criado: ${plan.displayName} (${plan.name}) por ${userId}`);

            return plan;
          }, 'PlanService.createPlan');
        }, 'PlanService.createPlan');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao criar plano:', error);
      throw new AppError('Erro ao criar plano. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Listar todos os planos (admin)
   */
  static async listPlans(
    filters: {
      isActive?: boolean;
      isPublic?: boolean;
    } = {},
    pagination: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ plans: IPlan[]; total: number; totalPages: number }> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const { page = 1, limit = 20 } = pagination;
            const { isActive, isPublic } = filters;

            const match: any = {};
            if (isActive !== undefined) match.isActive = isActive;
            if (isPublic !== undefined) match.isPublic = isPublic;

            const skip = (page - 1) * limit;

            const [plans, total] = await Promise.all([
              Plan.find(match)
                .sort({ sortOrder: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
              Plan.countDocuments(match),
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
              plans: plans as unknown as IPlan[],
              total,
              totalPages,
            };
          }, 'PlanService.listPlans');
        }, 'PlanService.listPlans');
      });
    } catch (error) {
      logger.error('Erro ao listar planos:', error);
      throw new AppError('Erro ao listar planos. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Obter planos públicos (para página de planos)
   */
  static async getPublicPlans(): Promise<IPlan[]> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const plans = await Plan.find({
              isActive: true,
              isPublic: true,
            })
              .sort({ sortOrder: 1 })
              .lean();

            return plans as unknown as IPlan[];
          }, 'PlanService.getPublicPlans');
        }, 'PlanService.getPublicPlans');
      });
    } catch (error) {
      logger.error('Erro ao buscar planos públicos:', error);
      throw new AppError('Erro ao buscar planos públicos. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Obter plano por ID
   */
  static async getPlanById(planId: string): Promise<IPlan> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(planId)) {
              throw new AppError('ID do plano inválido', 400);
            }

            const plan = await Plan.findById(planId);
            if (!plan) {
              throw new NotFoundError('Plano', planId);
            }

            return plan;
          }, 'PlanService.getPlanById');
        }, 'PlanService.getPlanById');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao buscar plano:', error);
      throw new AppError('Erro ao buscar plano. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Obter plano por nome
   */
  static async getPlanByName(name: string): Promise<IPlan | null> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            return Plan.findOne({ name, isActive: true });
          }, 'PlanService.getPlanByName');
        }, 'PlanService.getPlanByName');
      });
    } catch (error) {
      logger.error('Erro ao buscar plano por nome:', error);
      throw new AppError('Erro ao buscar plano. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Atualizar plano
   */
  static async updatePlan(
    planId: string,
    data: UpdatePlanData,
    userId: string
  ): Promise<IPlan> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(planId)) {
              throw new AppError('ID do plano inválido', 400);
            }

            const plan = await Plan.findById(planId);
            if (!plan) {
              throw new NotFoundError('Plano', planId);
            }

            // Atualizar campos
            if (data.displayName !== undefined) plan.displayName = data.displayName;
            if (data.description !== undefined) plan.description = data.description;
            if (data.priceMonthly !== undefined) plan.priceMonthly = data.priceMonthly;
            if (data.priceAnnual !== undefined) plan.priceAnnual = data.priceAnnual;
            if (data.pricePerUser !== undefined) plan.pricePerUser = data.pricePerUser;
            if (data.sortOrder !== undefined) plan.sortOrder = data.sortOrder;
            if (data.badge !== undefined) plan.badge = data.badge;
            if (data.isActive !== undefined) plan.isActive = data.isActive;
            if (data.isPublic !== undefined) plan.isPublic = data.isPublic;
            if (data.allowCustomPricing !== undefined) plan.allowCustomPricing = data.allowCustomPricing;
            if (data.customPriceMonthly !== undefined) plan.customPriceMonthly = data.customPriceMonthly;
            if (data.customPriceAnnual !== undefined) plan.customPriceAnnual = data.customPriceAnnual;
            if (data.trialDays !== undefined) plan.trialDays = data.trialDays;

            // Atualizar features
            if (data.features) {
              if (data.features.maxUsers !== undefined) plan.features.maxUsers = data.features.maxUsers;
              if (data.features.maxControls !== undefined) plan.features.maxControls = data.features.maxControls;
              if (data.features.canViewReport !== undefined) plan.features.canViewReport = data.features.canViewReport;
              if (data.features.canPrintReport !== undefined) plan.features.canPrintReport = data.features.canPrintReport;
              if (data.features.canDownloadReport !== undefined) plan.features.canDownloadReport = data.features.canDownloadReport;
              if (data.features.canViewRoadmap !== undefined) plan.features.canViewRoadmap = data.features.canViewRoadmap;
              if (data.features.canViewComparative !== undefined) plan.features.canViewComparative = data.features.canViewComparative;
              if (data.features.canExportData !== undefined) plan.features.canExportData = data.features.canExportData;
              if (data.features.hasConsultingHours !== undefined) plan.features.hasConsultingHours = data.features.hasConsultingHours;
              if (data.features.consultingHours !== undefined) plan.features.consultingHours = data.features.consultingHours;
              if (data.features.supportPriority !== undefined) plan.features.supportPriority = data.features.supportPriority;
              if (data.features.supportHours !== undefined) plan.features.supportHours = data.features.supportHours;
              if (data.features.canCustomizeBranding !== undefined) plan.features.canCustomizeBranding = data.features.canCustomizeBranding;
              if (data.features.canAddCustomControls !== undefined) plan.features.canAddCustomControls = data.features.canAddCustomControls;
              if (data.features.canIntegrateAPI !== undefined) plan.features.canIntegrateAPI = data.features.canIntegrateAPI;
              if (data.features.canIntegrateSSO !== undefined) plan.features.canIntegrateSSO = data.features.canIntegrateSSO;
            }

            plan.updatedBy = new Types.ObjectId(userId);

            await plan.save();

            logger.info(`Plano atualizado: ${plan.displayName} (${plan.name}) por ${userId}`);

            return plan;
          }, 'PlanService.updatePlan');
        }, 'PlanService.updatePlan');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar plano:', error);
      throw new AppError('Erro ao atualizar plano. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Deletar plano (soft delete - apenas desativa)
   */
  static async deletePlan(planId: string, userId: string): Promise<void> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(planId)) {
              throw new AppError('ID do plano inválido', 400);
            }

            const plan = await Plan.findById(planId);
            if (!plan) {
              throw new NotFoundError('Plano', planId);
            }

            // Verificar se é um plano padrão (não pode deletar)
            const defaultPlans = ['basic', 'pro', 'enterprise', 'trial'];
            if (defaultPlans.includes(plan.name)) {
              throw new AppError(`Plano ${plan.name} é um plano padrão e não pode ser deletado`, 400);
            }

            plan.isActive = false;
            plan.updatedBy = new Types.ObjectId(userId);
            await plan.save();

            logger.info(`Plano desativado: ${plan.displayName} (${plan.name}) por ${userId}`);
          }, 'PlanService.deletePlan');
        }, 'PlanService.deletePlan');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao deletar plano:', error);
      throw new AppError('Erro ao deletar plano. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Obter plano padrão (basic)
   */
  static async getDefaultPlan(): Promise<IPlan | null> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            return Plan.findOne({ name: 'basic', isActive: true });
          }, 'PlanService.getDefaultPlan');
        }, 'PlanService.getDefaultPlan');
      });
    } catch (error) {
      logger.error('Erro ao buscar plano padrão:', error);
      throw new AppError('Erro ao buscar plano padrão. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Calcular preço efetivo com base no número de usuários
   */
  static async calculateEffectivePrice(
    planId: string,
    userCount: number,
    isAnnual: boolean = false
  ): Promise<{ basePrice: number; extraUsers: number; extraPrice: number; total: number }> {
    try {
      const plan = await this.getPlanById(planId);
      
      const basePrice = isAnnual ? plan.priceAnnual : plan.priceMonthly;
      const extraUsers = Math.max(0, userCount - plan.features.maxUsers);
      const extraPrice = extraUsers * plan.pricePerUser;
      const total = basePrice + extraPrice;

      return {
        basePrice,
        extraUsers,
        extraPrice,
        total,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao calcular preço efetivo:', error);
      throw new AppError('Erro ao calcular preço. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Verificar se um plano tem uma feature específica
   */
  static async hasFeature(planId: string, feature: keyof IPlan['features']): Promise<boolean> {
    try {
      const plan = await this.getPlanById(planId);
      return plan.features[feature] as boolean;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao verificar feature:', error);
      return false;
    }
  }

  /**
   * Obter todos os planos ativos (para cache)
   */
  static async getActivePlans(): Promise<IPlan[]> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            return Plan.find({ isActive: true }).sort({ sortOrder: 1 });
          }, 'PlanService.getActivePlans');
        }, 'PlanService.getActivePlans');
      });
    } catch (error) {
      logger.error('Erro ao buscar planos ativos:', error);
      throw new AppError('Erro ao buscar planos ativos. Tente novamente mais tarde.', 500);
    }
  }
}