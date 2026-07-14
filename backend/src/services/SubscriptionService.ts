// backend/src/services/SubscriptionService.ts
import { Types } from 'mongoose';
import { Subscription, ISubscription, SubscriptionStatus } from '../models/Subscription.js';
import { Plan, IPlan } from '../models/Plan.js';
import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { PlanService } from './PlanService.js';
import { logger } from '../utils/logger.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { retryDatabase } from '../utils/retry.js';
import { databaseCircuitBreaker } from '../utils/circuitBreaker.js';
import { withDbTimeout } from '../middleware/timeout.js';

export interface CreateSubscriptionData {
  companyId: string;
  planId: string;
  userId: string;
  billingCycle: 'monthly' | 'annual';
  autoRenew?: boolean;
  paymentMethod?: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
  paymentProvider?: 'stripe' | 'pagseguro' | 'mercadopago' | 'manual';
  paymentId?: string;
  subscriptionId?: string;
  notes?: string;
}

export interface UpdateSubscriptionData {
  status?: SubscriptionStatus;
  planId?: string;
  autoRenew?: boolean;
  maxUsers?: number;
  currentUsers?: number;
  consultingHoursUsed?: number;
  notes?: string;
}

export interface SubscriptionStatusResult {
  isActive: boolean;
  status: SubscriptionStatus;
  daysUntilExpiration: number;
  daysUntilTrialEnd: number;
  isOnTrial: boolean;
  isExpired: boolean;
  isSuspended: boolean;
}

export class SubscriptionService {
  /**
   * Criar uma nova assinatura
   */
  static async createSubscription(data: CreateSubscriptionData): Promise<ISubscription> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            // Validar empresa
            const company = await Company.findById(data.companyId);
            if (!company) {
              throw new NotFoundError('Empresa', data.companyId);
            }

            // Validar plano
            const plan = await PlanService.getPlanById(data.planId);
            if (!plan) {
              throw new NotFoundError('Plano', data.planId);
            }

            // Verificar se já existe uma assinatura ativa
            const existingSubscription = await Subscription.findOne({
              companyId: data.companyId,
              status: { $in: ['active', 'trial', 'trialing'] },
            });

            if (existingSubscription) {
              throw new AppError('Empresa já possui uma assinatura ativa', 400);
            }

            // Buscar usuários ativos da empresa
            const activeUsers = await User.countDocuments({
              companyId: data.companyId,
              isActive: true,
            });

            // Calcular datas
            const startDate = new Date();
            const trialDays = plan.trialDays || 7;
            const trialEndDate = new Date(startDate);
            trialEndDate.setDate(trialEndDate.getDate() + trialDays);

            const endDate = new Date(startDate);
            if (data.billingCycle === 'annual') {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }

            // Calcular preço
            const priceCalc = await PlanService.calculateEffectivePrice(
              data.planId,
              activeUsers,
              data.billingCycle === 'annual'
            );

            // Criar assinatura
            const subscription = new Subscription({
              companyId: new Types.ObjectId(data.companyId),
              planId: new Types.ObjectId(data.planId),
              userId: new Types.ObjectId(data.userId),
              status: 'pending',
              startDate,
              endDate,
              trialStartDate: startDate,
              trialEndDate,
              amount: priceCalc.total,
              currency: 'BRL',
              billingCycle: data.billingCycle,
              autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
              maxUsers: plan.features.maxUsers,
              currentUsers: activeUsers,
              features: { ...plan.features },
              consultingHoursTotal: plan.features.hasConsultingHours ? plan.features.consultingHours : 0,
              consultingHoursUsed: 0,
              consultingHoursRemaining: plan.features.hasConsultingHours ? plan.features.consultingHours : 0,
              paymentMethod: data.paymentMethod,
              paymentProvider: data.paymentProvider,
              paymentId: data.paymentId,
              subscriptionId: data.subscriptionId,
              notes: data.notes,
              createdBy: new Types.ObjectId(data.userId),
              updatedBy: new Types.ObjectId(data.userId),
            });

            await subscription.save();

            // Atualizar empresa com o plano
            company.plan = plan.name as 'basic' | 'pro' | 'enterprise';
            await company.save();

            logger.info(`Assinatura criada para empresa ${company.name} - Plano ${plan.name}`);

            return subscription;
          }, 'SubscriptionService.createSubscription');
        }, 'SubscriptionService.createSubscription');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao criar assinatura:', error);
      throw new AppError('Erro ao criar assinatura. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Ativar assinatura (após pagamento confirmado)
   */
  static async activateSubscription(subscriptionId: string): Promise<ISubscription> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
              throw new NotFoundError('Assinatura', subscriptionId);
            }

            // Atualizar status
            subscription.status = 'active';
            subscription.startDate = new Date();
            
            // Atualizar data de término baseado no ciclo
            const endDate = new Date(subscription.startDate);
            if (subscription.billingCycle === 'annual') {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }
            subscription.endDate = endDate;

            // Atualizar empresa
            const plan = await PlanService.getPlanById(subscription.planId.toString());
            if (plan) {
              const company = await Company.findById(subscription.companyId);
              if (company) {
                company.plan = plan.name as 'basic' | 'pro' | 'enterprise';
                company.status = 'active';
                await company.save();
              }
            }

            await subscription.save();

            logger.info(`Assinatura ativada: ${subscriptionId}`);

            return subscription;
          }, 'SubscriptionService.activateSubscription');
        }, 'SubscriptionService.activateSubscription');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao ativar assinatura:', error);
      throw new AppError('Erro ao ativar assinatura. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Obter assinatura ativa de uma empresa
   */
  static async getActiveSubscription(companyId: string): Promise<ISubscription | null> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(companyId)) {
              throw new AppError('ID da empresa inválido', 400);
            }

            return Subscription.findOne({
              companyId: new Types.ObjectId(companyId),
              status: { $in: ['active', 'trial', 'trialing'] },
              endDate: { $gt: new Date() },
            }).populate('planId');
          }, 'SubscriptionService.getActiveSubscription');
        }, 'SubscriptionService.getActiveSubscription');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao buscar assinatura ativa:', error);
      throw new AppError('Erro ao buscar assinatura. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Obter histórico de assinaturas de uma empresa
   */
  static async getSubscriptionHistory(companyId: string): Promise<ISubscription[]> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(companyId)) {
              throw new AppError('ID da empresa inválido', 400);
            }

            return Subscription.find({
              companyId: new Types.ObjectId(companyId),
            })
              .sort({ createdAt: -1 })
              .populate('planId');
          }, 'SubscriptionService.getSubscriptionHistory');
        }, 'SubscriptionService.getSubscriptionHistory');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao buscar histórico de assinaturas:', error);
      throw new AppError('Erro ao buscar histórico. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Verificar status da assinatura
   */
  static async checkSubscriptionStatus(companyId: string): Promise<SubscriptionStatusResult> {
    try {
      const subscription = await this.getActiveSubscription(companyId);
      
      if (!subscription) {
        return {
          isActive: false,
          status: 'expired' as SubscriptionStatus,
          daysUntilExpiration: 0,
          daysUntilTrialEnd: 0,
          isOnTrial: false,
          isExpired: true,
          isSuspended: false,
        };
      }

      const now = new Date();
      const isActive = subscription.status === 'active' || subscription.status === 'trial' || subscription.status === 'trialing';
      const isExpired = subscription.endDate && now > subscription.endDate;
      const isOnTrial = subscription.status === 'trial' || subscription.status === 'trialing';
      const isSuspended = subscription.status === 'suspended';

      const daysUntilExpiration = subscription.endDate 
        ? Math.max(0, Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      const daysUntilTrialEnd = subscription.trialEndDate
        ? Math.max(0, Math.ceil((subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        isActive: isActive && !isExpired,
        status: subscription.status,
        daysUntilExpiration,
        daysUntilTrialEnd,
        isOnTrial,
        isExpired,
        isSuspended,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao verificar status da assinatura:', error);
      throw new AppError('Erro ao verificar status. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Atualizar assinatura
   */
  static async updateSubscription(
    subscriptionId: string,
    data: UpdateSubscriptionData,
    userId: string
  ): Promise<ISubscription> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(subscriptionId)) {
              throw new AppError('ID da assinatura inválido', 400);
            }

            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
              throw new NotFoundError('Assinatura', subscriptionId);
            }

            // Registrar mudança de plano
            if (data.planId && data.planId !== subscription.planId.toString()) {
              const oldPlan = await PlanService.getPlanById(subscription.planId.toString());
              const newPlan = await PlanService.getPlanById(data.planId);
              
              if (oldPlan && newPlan) {
                subscription.changeHistory.push({
                  fromPlan: oldPlan.name,
                  toPlan: newPlan.name,
                  changedAt: new Date(),
                  changedBy: new Types.ObjectId(userId),
                  reason: data.notes || 'Upgrade de plano',
                });
              }
            }

            // Atualizar campos
            if (data.status !== undefined) subscription.status = data.status;
            if (data.planId !== undefined) {
              subscription.planId = new Types.ObjectId(data.planId);
              // Atualizar features com o novo plano
              const plan = await PlanService.getPlanById(data.planId);
              if (plan) {
                subscription.features = { ...plan.features };
                subscription.maxUsers = plan.features.maxUsers;
                subscription.consultingHoursTotal = plan.features.hasConsultingHours ? plan.features.consultingHours : 0;
                subscription.consultingHoursRemaining = plan.features.hasConsultingHours ? plan.features.consultingHours - subscription.consultingHoursUsed : 0;
              }
            }
            if (data.autoRenew !== undefined) subscription.autoRenew = data.autoRenew;
            if (data.maxUsers !== undefined) subscription.maxUsers = data.maxUsers;
            if (data.currentUsers !== undefined) subscription.currentUsers = data.currentUsers;
            if (data.consultingHoursUsed !== undefined) {
              subscription.consultingHoursUsed = data.consultingHoursUsed;
              subscription.consultingHoursRemaining = subscription.consultingHoursTotal - data.consultingHoursUsed;
            }
            if (data.notes !== undefined) subscription.notes = data.notes;

            subscription.updatedBy = new Types.ObjectId(userId);

            await subscription.save();

            logger.info(`Assinatura atualizada: ${subscriptionId} por ${userId}`);

            return subscription;
          }, 'SubscriptionService.updateSubscription');
        }, 'SubscriptionService.updateSubscription');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao atualizar assinatura:', error);
      throw new AppError('Erro ao atualizar assinatura. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Cancelar assinatura
   */
  static async cancelSubscription(
    subscriptionId: string,
    userId: string,
    reason?: string
  ): Promise<ISubscription> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(subscriptionId)) {
              throw new AppError('ID da assinatura inválido', 400);
            }

            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
              throw new NotFoundError('Assinatura', subscriptionId);
            }

            if (subscription.status === 'cancelled' || subscription.status === 'expired') {
              throw new AppError('Assinatura já está cancelada ou expirada', 400);
            }

            subscription.status = 'cancelled';
            subscription.cancelledAt = new Date();
            subscription.autoRenew = false;
            subscription.updatedBy = new Types.ObjectId(userId);
            subscription.notes = reason || subscription.notes || 'Cancelamento solicitado';

            await subscription.save();

            // Atualizar empresa
            const company = await Company.findById(subscription.companyId);
            if (company) {
              company.status = 'inactive';
              await company.save();
            }

            logger.info(`Assinatura cancelada: ${subscriptionId} por ${userId}`);

            return subscription;
          }, 'SubscriptionService.cancelSubscription');
        }, 'SubscriptionService.cancelSubscription');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao cancelar assinatura:', error);
      throw new AppError('Erro ao cancelar assinatura. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Suspender assinatura (por não pagamento)
   */
  static async suspendSubscription(
    subscriptionId: string,
    userId: string,
    reason: string = 'Pagamento não realizado'
  ): Promise<ISubscription> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(subscriptionId)) {
              throw new AppError('ID da assinatura inválido', 400);
            }

            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
              throw new NotFoundError('Assinatura', subscriptionId);
            }

            if (subscription.status === 'suspended') {
              throw new AppError('Assinatura já está suspensa', 400);
            }

            subscription.status = 'suspended';
            subscription.suspendedAt = new Date();
            subscription.updatedBy = new Types.ObjectId(userId);
            subscription.notes = reason;

            await subscription.save();

            // Atualizar empresa
            const company = await Company.findById(subscription.companyId);
            if (company) {
              company.status = 'suspended';
              await company.save();
            }

            logger.info(`Assinatura suspensa: ${subscriptionId} por ${userId} - Motivo: ${reason}`);

            return subscription;
          }, 'SubscriptionService.suspendSubscription');
        }, 'SubscriptionService.suspendSubscription');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao suspender assinatura:', error);
      throw new AppError('Erro ao suspender assinatura. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Reativar assinatura (após pagamento)
   */
  static async reactivateSubscription(
    subscriptionId: string,
    userId: string
  ): Promise<ISubscription> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(subscriptionId)) {
              throw new AppError('ID da assinatura inválido', 400);
            }

            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
              throw new NotFoundError('Assinatura', subscriptionId);
            }

            if (subscription.status !== 'suspended' && subscription.status !== 'cancelled') {
              throw new AppError('Assinatura não está suspensa ou cancelada', 400);
            }

            subscription.status = 'active';
            subscription.reactivatedAt = new Date();
            subscription.updatedBy = new Types.ObjectId(userId);

            // Estender data de término
            const endDate = new Date();
            if (subscription.billingCycle === 'annual') {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }
            subscription.endDate = endDate;

            await subscription.save();

            // Atualizar empresa
            const company = await Company.findById(subscription.companyId);
            if (company) {
              company.status = 'active';
              await company.save();
            }

            logger.info(`Assinatura reativada: ${subscriptionId} por ${userId}`);

            return subscription;
          }, 'SubscriptionService.reactivateSubscription');
        }, 'SubscriptionService.reactivateSubscription');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao reativar assinatura:', error);
      throw new AppError('Erro ao reativar assinatura. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Processar renovações automáticas (job diário)
   */
  static async processAutoRenewals(): Promise<{
    renewed: number;
    suspended: number;
    errors: number;
  }> {
    try {
      const result = { renewed: 0, suspended: 0, errors: 0 };

      // Buscar assinaturas que vão expirar em até 7 dias
      const expiringSoon = await Subscription.find({
        status: 'active',
        autoRenew: true,
        endDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      for (const subscription of expiringSoon) {
        try {
          // TODO: Integrar com gateway de pagamento para cobrança
          // Por enquanto, apenas estender a data
          const endDate = new Date(subscription.endDate);
          if (subscription.billingCycle === 'annual') {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }
          subscription.endDate = endDate;
          await subscription.save();
          result.renewed++;
          
          logger.info(`Assinatura renovada automaticamente: ${subscription._id}`);
        } catch (error) {
          logger.error(`Erro ao renovar assinatura ${subscription._id}:`, error);
          result.errors++;
        }
      }

      // Buscar assinaturas expiradas
      const expired = await Subscription.find({
        status: 'active',
        autoRenew: false,
        endDate: { $lt: new Date() },
      });

      for (const subscription of expired) {
        try {
          await this.suspendSubscription(
            subscription._id.toString(),
            'system',
            'Assinatura expirada sem renovação automática'
          );
          result.suspended++;
        } catch (error) {
          logger.error(`Erro ao suspender assinatura ${subscription._id}:`, error);
          result.errors++;
        }
      }

      return result;
    } catch (error) {
      logger.error('Erro ao processar renovações automáticas:', error);
      throw new AppError('Erro ao processar renovações. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * Obter métricas de assinaturas (admin)
   */
  static async getSubscriptionMetrics(): Promise<{
    total: number;
    active: number;
    trial: number;
    suspended: number;
    cancelled: number;
    expired: number;
    byPlan: Record<string, number>;
    monthlyRevenue: number;
    annualRevenue: number;
  }> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            const [total, active, trial, suspended, cancelled, expired, byPlan, revenue] = await Promise.all([
              Subscription.countDocuments(),
              Subscription.countDocuments({ status: 'active' }),
              Subscription.countDocuments({ status: { $in: ['trial', 'trialing'] } }),
              Subscription.countDocuments({ status: 'suspended' }),
              Subscription.countDocuments({ status: 'cancelled' }),
              Subscription.countDocuments({ status: 'expired' }),
              Subscription.aggregate([
                { $match: { status: 'active' } },
                { $group: { _id: '$planId', count: { $sum: 1 } } },
              ]),
              Subscription.aggregate([
                { $match: { status: 'active' } },
                { $group: {
                  _id: '$billingCycle',
                  total: { $sum: '$amount' },
                } },
              ]),
            ]);

            const byPlanMap: Record<string, number> = {};
            for (const item of byPlan) {
              const plan = await PlanService.getPlanById(item._id.toString());
              if (plan) {
                byPlanMap[plan.name] = item.count;
              }
            }

            const monthlyRevenue = revenue.find(r => r._id === 'monthly')?.total || 0;
            const annualRevenue = revenue.find(r => r._id === 'annual')?.total || 0;

            return {
              total,
              active,
              trial,
              suspended,
              cancelled,
              expired,
              byPlan: byPlanMap,
              monthlyRevenue,
              annualRevenue,
            };
          }, 'SubscriptionService.getSubscriptionMetrics');
        }, 'SubscriptionService.getSubscriptionMetrics');
      });
    } catch (error) {
      logger.error('Erro ao obter métricas de assinaturas:', error);
      throw new AppError('Erro ao obter métricas. Tente novamente mais tarde.', 500);
    }
  }

  /**
   * 🔴 NOVO: Obter assinatura por ID
   */
  static async getSubscriptionById(subscriptionId: string): Promise<ISubscription> {
    try {
      return await databaseCircuitBreaker.execute(async () => {
        return await retryDatabase(async () => {
          return await withDbTimeout(async () => {
            if (!Types.ObjectId.isValid(subscriptionId)) {
              throw new AppError('ID da assinatura inválido', 400);
            }

            const subscription = await Subscription.findById(subscriptionId).populate('planId');
            if (!subscription) {
              throw new NotFoundError('Assinatura', subscriptionId);
            }

            return subscription;
          }, 'SubscriptionService.getSubscriptionById');
        }, 'SubscriptionService.getSubscriptionById');
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Erro ao buscar assinatura por ID:', error);
      throw new AppError('Erro ao buscar assinatura. Tente novamente mais tarde.', 500);
    }
  }
}