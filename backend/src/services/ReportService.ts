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

// 🔴 NOVO: Escopo padrão do projeto
const DEFAULT_SCOPE = `Avaliação do nível de maturidade em Segurança da Informação com base nos controles do Anexo A da norma ISO/IEC 27001:2022 (tratados como controles na ISO/IEC 27002:2022). 
O processo de assessment é realizado na modalidade web, sob licença contratada, podendo ou não ser complementado por horas de consultoria especializada para apoio na interpretação dos requisitos, análise de evidências e elaboração do plano de ação.`;

export class ReportService {
  /**
   * 🔴 NOVO: Gerar número do projeto automaticamente
   * Formato: ANO + CONTADOR (ex: 2026001)
   */
  private static async generateProjectNumber(): Promise<string> {
    const year = new Date().getFullYear();
    
    // Buscar o último relatório criado no ano atual
    const lastReport = await Report.findOne({
      projectNumber: { $regex: `^${year}` }
    }).sort({ projectNumber: -1 });

    let counter = 1;
    if (lastReport && lastReport.projectNumber) {
      // Extrair o número sequencial (ex: 2026001 -> 001)
      const lastNumber = parseInt(lastReport.projectNumber.slice(-3));
      counter = lastNumber + 1;
    }

    // Formatar com 3 dígitos (001, 002, ...)
    const counterStr = String(counter).padStart(3, '0');
    return `${year}${counterStr}`;
  }

  /**
   * Obter ou criar relatório para uma empresa
   */
  static async getOrCreateReport(companyId: string): Promise<IReport> {
    console.log('🔍 [getOrCreateReport] Iniciando para companyId:', companyId);
    
    let report = await Report.findOne({ companyId });
    console.log('🔍 [getOrCreateReport] Relatório encontrado:', report ? 'SIM' : 'NÃO');

    if (!report) {
      // 🔴 NOVO: Gerar número do projeto automaticamente
      const projectNumber = await this.generateProjectNumber();
      console.log('🔍 [getOrCreateReport] Número do projeto gerado:', projectNumber);
      
      report = new Report({
        companyId,
        projectNumber, // 🔴 NOVO: Número gerado automaticamente
        scope: DEFAULT_SCOPE, // 🔴 NOVO: Escopo padrão
        clientTeam: [],
        consultantTeam: [],
        status: 'draft',
      });
      await report.save();
      console.log('✅ [getOrCreateReport] Relatório CRIADO:', {
        companyId,
        projectNumber: report.projectNumber,
        scope: report.scope ? 'DEFINIDO' : 'VAZIO',
        status: report.status,
        id: report._id
      });
      logger.info(`Relatório criado para empresa ${companyId} - Projeto: ${projectNumber}`);
    } else {
      // 🔴 CORREÇÃO: SEMPRE garantir que os campos estejam preenchidos
      let needsUpdate = false;
      
      if (!report.projectNumber) {
        report.projectNumber = await this.generateProjectNumber();
        needsUpdate = true;
        console.log(`🔍 [getOrCreateReport] ProjectNumber definido para empresa ${companyId}: ${report.projectNumber}`);
        logger.info(`🔄 ProjectNumber definido para empresa ${companyId}: ${report.projectNumber}`);
      }
      
      if (!report.scope) {
        report.scope = DEFAULT_SCOPE;
        needsUpdate = true;
        console.log(`🔍 [getOrCreateReport] Scope definido para empresa ${companyId}`);
        logger.info(`🔄 Scope definido para empresa ${companyId}`);
      }

      // 🔴 NOVO: ATUALIZAR EQUIPE DO CLIENTE EM TEMPO REAL
      const activeUsers = await User.find({
        companyId,
        isActive: true,
        role: { $in: [UserRole.USER, UserRole.REP] },
      }).select('name email role');

      const newClientTeam = activeUsers.map((user) => ({
        name: user.name,
        role: user.role === UserRole.REP ? 'Preposto' : 'Usuário',
        email: user.email,
      }));

      // 🔴 NOVO: ATUALIZAR EQUIPE DE CONSULTORIA EM TEMPO REAL
      const consultants = await User.find({
        companyId,
        role: UserRole.CONSULTANT,
        isActive: true,
      }).select('name email');

      let newConsultantTeam: Array<{ name: string; role: string; email: string }> = [];
      if (consultants.length > 0) {
        newConsultantTeam = consultants.map((consultant) => ({
          name: consultant.name,
          role: 'Consultor GRC/IRM',
          email: consultant.email,
        }));
      } else {
        newConsultantTeam = [
          {
            name: 'Avaliação Online',
            role: 'Assessment Remoto',
            email: 'assessment@cisatool.com.br',
          },
        ];
      }

      // 🔴 VERIFICAR SE HOUVE MUDANÇA NA EQUIPE
      const currentClientEmails = report.clientTeam.map(m => m.email).sort();
      const newClientEmails = newClientTeam.map(m => m.email).sort();
      const clientTeamChanged = JSON.stringify(currentClientEmails) !== JSON.stringify(newClientEmails);

      if (clientTeamChanged) {
        report.clientTeam = newClientTeam;
        report.consultantTeam = newConsultantTeam;
        needsUpdate = true;
        console.log(`🔍 [getOrCreateReport] Equipe atualizada: ${newClientTeam.length} membros`);
        logger.info(`🔄 Equipe do cliente atualizada para empresa ${companyId} (${newClientTeam.length} membros)`);
      }

      // 🔴 NOVO: ATUALIZAR STATUS
      const allAssignments = await Assignment.find({
        userId: { $in: activeUsers.map(u => u._id) }
      });

      const totalAssignments = allAssignments.length;
      const answeredAssignments = await Response.countDocuments({
        userId: { $in: activeUsers.map(u => u._id) }
      });

      let newStatus = report.status;
      if (totalAssignments > 0 && answeredAssignments === totalAssignments) {
        newStatus = 'finalized';
      } else if (answeredAssignments > 0) {
        newStatus = 'in_review';
      } else {
        newStatus = 'draft';
      }

      if (newStatus !== report.status) {
        report.status = newStatus;
        needsUpdate = true;
        console.log(`🔍 [getOrCreateReport] Status atualizado: ${report.status} -> ${newStatus}`);
        logger.info(`🔄 Status do relatório atualizado para empresa ${companyId}: ${newStatus}`);
      }

      if (needsUpdate) {
        await report.save();
        console.log('✅ [getOrCreateReport] Relatório ATUALIZADO com os campos e equipe preenchidos');
        logger.info(`✅ Relatório atualizado para empresa ${companyId}`);
      }
      
      console.log('✅ [getOrCreateReport] Relatório existente:', {
        companyId,
        projectNumber: report.projectNumber,
        scope: report.scope ? 'DEFINIDO' : 'VAZIO',
        status: report.status,
        clientTeam: report.clientTeam.length,
        consultantTeam: report.consultantTeam.length,
        id: report._id
      });
    }

    return report;
  }

  /**
   * Gerar dados automáticos do relatório
   */
  static async generateReportData(companyId: string): Promise<IReport> {
    console.log('🔍 [generateReportData] Iniciando para companyId:', companyId);
    
    const report = await Report.findOne({ companyId });
    if (!report) {
      console.error('❌ [generateReportData] Relatório não encontrado');
      throw new NotFoundError('Relatório não encontrado');
    }

    console.log('🔍 [generateReportData] Relatório encontrado - Status atual:', report.status);

    // Buscar empresa
    const company = await Company.findById(companyId);
    if (!company) {
      console.error('❌ [generateReportData] Empresa não encontrada');
      throw new NotFoundError('Empresa não encontrada');
    }
    console.log('🔍 [generateReportData] Empresa encontrada:', company.name);

    // 1. Buscar todos os usuários ativos da empresa
    const activeUsers = await User.find({
      companyId,
      isActive: true,
      role: { $in: [UserRole.USER, UserRole.REP] },
    }).select('name email role');
    console.log(`🔍 [generateReportData] Usuários ativos encontrados: ${activeUsers.length}`);

    // 2. Buscar consultores vinculados à empresa
    const consultants = await User.find({
      companyId,
      role: UserRole.CONSULTANT,
      isActive: true,
    }).select('name email');
    console.log(`🔍 [generateReportData] Consultores encontrados: ${consultants.length}`);

    // 3. Calcular datas do assessment
    const firstResponse = await Response.findOne({ companyId })
      .sort({ createdAt: 1 })
      .select('createdAt');

    const lastResponse = await Response.findOne({ companyId })
      .sort({ createdAt: -1 })
      .select('createdAt');
    
    console.log('🔍 [generateReportData] Datas - Início:', firstResponse?.createdAt, 'Fim:', lastResponse?.createdAt);

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

    // 🔴 NOVO: Calcular status automaticamente
    const allAssignments = await Assignment.find({
      userId: { $in: activeUsers.map(u => u._id) }
    });

    const totalAssignments = allAssignments.length;
    const answeredAssignments = await Response.countDocuments({
      userId: { $in: activeUsers.map(u => u._id) }
    });

    console.log(`🔍 [generateReportData] Atribuições: ${totalAssignments}, Respostas: ${answeredAssignments}`);

    // Se todas as atribuições foram respondidas, status = finalized
    if (totalAssignments > 0 && answeredAssignments === totalAssignments) {
      report.status = 'finalized';
      console.log(`✅ [generateReportData] Status DEFINIDO como 'finalized'`);
      logger.info(`📊 Relatório finalizado para empresa ${companyId} (${answeredAssignments}/${totalAssignments} respondidos)`);
    } else if (answeredAssignments > 0) {
      // Se algumas respostas foram dadas, status = in_review
      report.status = 'in_review';
      console.log(`✅ [generateReportData] Status DEFINIDO como 'in_review'`);
      logger.info(`📊 Relatório em andamento para empresa ${companyId} (${answeredAssignments}/${totalAssignments} respondidos)`);
    } else {
      // Se não há respostas, status = draft
      report.status = 'draft';
      console.log(`✅ [generateReportData] Status DEFINIDO como 'draft'`);
    }

    // 🔴 LOG FINAL: Verificar todos os campos antes de salvar
    console.log('📊 [generateReportData] Dados FINAIS do relatório:', {
      companyId,
      projectNumber: report.projectNumber,
      scope: report.scope ? 'DEFINIDO' : 'VAZIO',
      status: report.status,
      clientTeam: report.clientTeam.length,
      consultantTeam: report.consultantTeam.length,
      assessmentStartDate: report.assessmentStartDate,
      assessmentEndDate: report.assessmentEndDate
    });

    await report.save();
    console.log('✅ [generateReportData] Relatório SALVO com sucesso!');

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
    console.log('🔍 [updateReport] Iniciando para companyId:', companyId);
    console.log('🔍 [updateReport] Dados para atualizar:', data);
    
    const report = await Report.findOne({ companyId });
    if (!report) {
      console.error('❌ [updateReport] Relatório não encontrado');
      throw new NotFoundError('Relatório não encontrado');
    }

    console.log('🔍 [updateReport] Relatório encontrado - Status atual:', report.status);

    if (data.projectNumber !== undefined) {
      report.projectNumber = data.projectNumber;
      console.log('🔍 [updateReport] ProjectNumber atualizado para:', data.projectNumber);
    }
    if (data.scope !== undefined) {
      report.scope = data.scope;
      console.log('🔍 [updateReport] Scope atualizado:', data.scope ? 'DEFINIDO' : 'VAZIO');
    }
    if (data.status !== undefined) {
      report.status = data.status;
      console.log('🔍 [updateReport] Status atualizado para:', data.status);
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
    console.log('✅ [updateReport] Relatório ATUALIZADO com sucesso!');
    console.log('📊 [updateReport] Dados FINAIS:', {
      projectNumber: report.projectNumber,
      scope: report.scope ? 'DEFINIDO' : 'VAZIO',
      status: report.status,
      updatedAt: report.updatedAt
    });

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
  ): Promise<{ reports: any[]; total: number }> {
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

    return { 
      reports: reports as any[], 
      total 
    };
  }
}