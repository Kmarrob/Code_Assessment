// backend/src/controllers/CompanyController.ts
import { Response, NextFunction } from 'express';
import { CompanyService } from '../services/CompanyService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class CompanyController {
  /**
   * Listar empresas (Admin)
   */
  static async listCompanies(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, search, status } = req.query;

      const result = await CompanyService.listCompanies({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as string,
      });

      res.json({
        success: true,
        data: result.companies,
        pagination: result.pagination,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar empresa por ID
   */
  static async getCompanyById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const company = await CompanyService.getCompanyById(id);

      res.json({
        success: true,
        data: { company },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar empresa
   */
  static async createCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, cnpj, plan, maxUsers, maxControls } = req.body;

      const company = await CompanyService.createCompany({
        name,
        cnpj,
        plan,
        maxUsers,
        maxControls,
      });

      logger.info(`Empresa criada por ${req.user?.email}: ${company.name}`);

      res.status(201).json({
        success: true,
        message: 'Empresa criada com sucesso',
        data: { company },
        statusCode: 201,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar empresa - CORRIGIDO COM TRATAMENTO PARA consultantId
   */
  static async updateCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      
      // Extrair todos os campos do body, incluindo consultantId
      const { name, cnpj, plan, maxUsers, maxControls, status, consultantId } = req.body;

      // Validar e tratar consultantId
      let validatedConsultantId = consultantId;
      
      // Se consultantId for null, undefined, string vazia ou "null", definir como null
      if (consultantId === null || 
          consultantId === undefined || 
          consultantId === '' || 
          consultantId === 'null' ||
          consultantId === 'undefined') {
        validatedConsultantId = null;
      }

      // Se consultantId for um ObjectId válido, manter
      // Caso contrário, o service vai validar

      const company = await CompanyService.updateCompany(id, {
        name,
        cnpj,
        plan,
        maxUsers,
        maxControls,
        status,
        consultantId: validatedConsultantId,
      });

      logger.info(`Empresa atualizada por ${req.user?.email}: ${company.name}`);

      res.json({
        success: true,
        message: 'Empresa atualizada com sucesso',
        data: { company },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Erro ao atualizar empresa:', error);
      next(error);
    }
  }

  /**
   * Desativar empresa
   */
  static async deactivateCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const company = await CompanyService.deactivateCompany(id);

      logger.info(`Empresa desativada por ${req.user?.email}: ${company.name}`);

      res.json({
        success: true,
        message: 'Empresa desativada com sucesso',
        data: { company },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reativar empresa
   */
  static async reactivateCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const company = await CompanyService.reactivateCompany(id);

      logger.info(`Empresa reativada por ${req.user?.email}: ${company.name}`);

      res.json({
        success: true,
        message: 'Empresa reativada com sucesso',
        data: { company },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atribuir todos os controles à empresa
   */
  static async assignAllControls(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const result = await CompanyService.assignAllControls(id);

      logger.info(`Todos os controles atribuídos à empresa ${result.company.name} por ${req.user?.email}`);

      res.json({
        success: true,
        message: `${result.assigned} controles atribuídos à empresa ${result.company.name}`,
        data: {
          company: result.company,
          assigned: result.assigned,
          total: result.total,
        },
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas das empresas
   */
  static async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await CompanyService.getStats();

      res.json({
        success: true,
        data: stats,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}