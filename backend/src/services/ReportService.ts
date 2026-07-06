// backend/src/services/ReportService.ts
import mongoose from 'mongoose';
import { Report, IReport } from '../models/Report.js';
import { User } from '../models/User.js';
import { Response } from '../models/Response.js';
import { Assignment } from '../models/Assignment.js';
import { Company } from '../models/Company.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { UserRole } from '../types/index.js';

export class ReportService {
  /**
   * Obter ou criar relatório para uma empresa
   */
  static async getOrCreateReport(companyId: string): Promise<IReport> {
    let report = await Report.findOne({ companyId });

    if (!report) {
      report = new Report({
        companyId,
        clientTeam: [],
        consultantTeam: [],
        status: 'draft',
      });
      await report.save();
      logger.info(`Relatório criado para empresa ${companyId}`);
    }

    return report;
  }

  /**
   * Gerar dados automáticos do relatório
   */
  static async generateReportData(companyId: string): Promise<IReport> {
    const report = await Report.findOne({ companyId });
    if (!report) {
      throw new NotFoundError('Relatório não encontrado');
    }

    // Buscar empresa
    const company = await Company.findById(companyId);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada');
    }

    // 1. Buscar todos os usuários ativos da empresa
    const activeUsers = await User.find({
      companyId,
      isActive: true,
      role: { $in: [UserRole.USER, UserRole.REP] },
    }).select('name email role');

    // 2. Buscar consultores vinculados à empresa
    const consultants = await User.find({
      companyId,
      role: UserRole.CONSULTANT,
      isActive: true,
    }).select('name email');

    // 3. Calcular datas do assessment
    const firstResponse = await Response.findOne({ companyId })
      .sort({ createdAt: 1 })
      .select('createdAt');

    const lastResponse = await Response.findOne({ companyId })
      .sort({ createdAt: -1 })
      .select('createdAt');

    // 4. Montar equipe do cliente
    const clientTeam = activeUsers.map((user) => ({
      name: user.name,
      role: user.role === UserRole.REP ? 'Preposto' : 'Usuário',
      email: user.email,
    }));

    // 5. Montar equipe de consultoria
    let consultantTeam: Array<{ name: string; role: string; email: string }> = [];

    if (consultants.length > 0) {
      consultantTeam = consultants.map((consultant) => ({
        name: consultant.name,
        role: 'Consultor GRC/IRM',
        email: consultant.email,
      }));
    } else {
      // Se não houver consultor, mensagem padrão
      consultantTeam = [
        {
          name: 'Avaliação Online',
          role: 'Assessment Remoto',
          email: 'assessment@cisatool.com.br',
        },
      ];
    }

    // 6. Atualizar relatório
    report.clientTeam = clientTeam;
    report.consultantTeam = consultantTeam;
    report.assessmentStartDate = firstResponse?.createdAt || new Date();
    report.assessmentEndDate = lastResponse?.createdAt || new Date();

    await report.save();

    logger.info(`Dados do relatório gerados para empresa ${companyId}`);
    return report;
  }

  /**
   * Atualizar relatório (apenas campos editáveis)
   */
  static async updateReport(
    companyId: string,
    data: {
      projectNumber?: string;
      scope?: string;
      status?: 'draft' | 'in_review' | 'finalized' | 'archived';
    },
    userId: string
  ): Promise<IReport> {
    const report = await Report.findOne({ companyId });
    if (!report) {
      throw new NotFoundError('Relatório não encontrado');
    }

    if (data.projectNumber !== undefined) {
      report.projectNumber = data.projectNumber;
    }
    if (data.scope !== undefined) {
      report.scope = data.scope;
    }
    if (data.status !== undefined) {
      report.status = data.status;
    }

    report.updatedBy = new mongoose.Types.ObjectId(userId);
    report.updatedAt = new Date();

    // Registrar histórico
    if (!report.changeHistory) {
      report.changeHistory = [];
    }
    report.changeHistory.push({
      changedBy: new mongoose.Types.ObjectId(userId),
      changes: JSON.stringify(data),
      changedAt: new Date(),
    });

    await report.save();
    return report;
  }

  /**
   * Listar todos os relatórios (para admin)
   */
  static async listReports(
    filters: {
      status?: string;
      search?: string;
    } = {},
    pagination: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ reports: IReport[]; total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const { status, search } = filters;

    const match: any = {};

    if (status && status !== 'all') {
      match.status = status;
    }

    // Buscar empresas para pesquisa
    let companyIds: mongoose.Types.ObjectId[] = [];
    if (search) {
      const companies = await Company.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');
      companyIds = companies.map((c) => c._id);
      if (companyIds.length > 0) {
        match.companyId = { $in: companyIds };
      } else {
        return { reports: [], total: 0 };
      }
    }

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find(match)
        .populate('companyId', 'name cnpj')
        .populate('generatedBy', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(match),
    ]);

    return { reports, total };
  }
}