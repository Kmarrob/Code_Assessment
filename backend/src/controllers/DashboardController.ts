// backend/src/controllers/DashboardController.ts
import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { Company } from '../models/Company.js'; // <-- IMPORTAÇÃO ADICIONADA
import { User } from '../models/User.js'; // <-- IMPORTAÇÃO ADICIONADA

export class DashboardController {
  /**
   * Obter dados de maturidade da empresa do preposto
   */
  static async getRepDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const repId = req.userId;
      if (!repId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { companyId } = req.params;
      if (!companyId) {
        throw new AppError('ID da empresa é obrigatório', 400);
      }

      // Verificar se o preposto pertence à empresa
      const user = await User.findById(repId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Se for rep, verificar se pertence à empresa
      if (user.role === 'rep' && user.companyId?.toString() !== companyId) {
        throw new AppError('Acesso negado', 403);
      }

      const maturityData = await DashboardService.getCompanyMaturity(companyId);
      const stats = DashboardService.calculateMaturityStats(maturityData);
      const byDomain = DashboardService.groupByDomain(maturityData.controls);
      const byCategory = DashboardService.groupByCategory(maturityData.controls);
      const byType = DashboardService.groupByType(maturityData.controls);
      const byCyberConcept = DashboardService.groupByCyberConcept(maturityData.controls);
      const byCapability = DashboardService.groupByCapability(maturityData.controls);

      res.json({
        success: true,
        data: {
          company: maturityData.company,
          summary: {
            totalControls: maturityData.totalControls,
            totalUsers: maturityData.users,
            ...stats,
          },
          byDomain,
          byCategory,
          byType,
          byCyberConcept,
          byCapability,
          controls: maturityData.controls,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao obter dashboard do rep:', error);
      next(error);
    }
  }

  /**
   * Obter dados de maturidade de uma empresa (Admin)
   */
  static async getAdminCompanyDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { companyId } = req.params;
      if (!companyId) {
        throw new AppError('ID da empresa é obrigatório', 400);
      }

      const maturityData = await DashboardService.getCompanyMaturity(companyId);
      const stats = DashboardService.calculateMaturityStats(maturityData);
      const byDomain = DashboardService.groupByDomain(maturityData.controls);
      const byCategory = DashboardService.groupByCategory(maturityData.controls);
      const byType = DashboardService.groupByType(maturityData.controls);
      const byCyberConcept = DashboardService.groupByCyberConcept(maturityData.controls);
      const byCapability = DashboardService.groupByCapability(maturityData.controls);

      res.json({
        success: true,
        data: {
          company: maturityData.company,
          summary: {
            totalControls: maturityData.totalControls,
            totalUsers: maturityData.users,
            ...stats,
          },
          byDomain,
          byCategory,
          byType,
          byCyberConcept,
          byCapability,
          controls: maturityData.controls,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao obter dashboard da empresa:', error);
      next(error);
    }
  }

  /**
   * Listar todas as empresas com resumo (Admin)
   */
  static async listCompaniesSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companies = await Company.find({ status: 'active' })
        .select('_id name consultantId')
        .lean();

      const summaries = await Promise.all(
        companies.map(async (company) => {
          const data = await DashboardService.getCompanyMaturity(company._id.toString());
          const stats = DashboardService.calculateMaturityStats(data);
          return {
            id: company._id,
            name: company.name,
            consultantId: company.consultantId,
            totalControls: data.totalControls,
            totalUsers: data.users,
            implemented: stats.statusCounts.Implementado || 0,
            partial: stats.statusCounts['Parcialmente implementado'] || 0,
            notImpl: stats.statusCounts['Não implementado'] || 0,
            completionRate: stats.percentages.Implementado || 0,
          };
        })
      );

      res.json({
        success: true,
        data: summaries,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao listar resumo das empresas:', error);
      next(error);
    }
  }
}