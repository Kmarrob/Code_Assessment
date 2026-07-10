// backend/src/services/ReportService.ts
import mongoose from 'mongoose';
import { Report, IReport } from '../models/Report.js';
import { User } from '../models/User.js';
import { Response } from '../models/Response.js';
import { Assignment } from '../models/Assignment.js';
import { Company } from '../models/Company.js';
import { Control } from '../models/Control.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { UserRole, RoadmapData, RoadmapItem, RoadmapSection } from '../types/index.js';

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

  /**
   * 🔴 NOVO: Obter Roadmap de Implementação
   * Retorna dados estruturados do roadmap com medidas processuais, políticas e soluções técnicas
   */
  static async getRoadmap(companyId: string): Promise<RoadmapData> {
    console.log('🔍 [getRoadmap] Iniciando para companyId:', companyId);

    try {
      // Buscar empresa para obter o nome
      const company = await Company.findById(companyId);
      if (!company) {
        console.error('❌ [getRoadmap] Empresa não encontrada');
        throw new NotFoundError('Empresa não encontrada');
      }

      console.log('🔍 [getRoadmap] Empresa encontrada:', company.name);

      // ============================================================
      // 1. MEDIDAS PROCESSUAIS RECOMENDADAS
      // ============================================================
      const processuais: RoadmapItem[] = [
        {
          id: 'proc-001',
          name: 'Procedimentos e controles efetivos para Gestão de Ativos',
          description: 'Incluindo informação e outros ativos associados',
          priority: 'Crítico',
          category: 'processual',
          relatedControls: ['A.5.9', 'A.5.10', 'A.5.11']
        },
        {
          id: 'proc-002',
          name: 'Acordos de transferências seguras de informação',
          description: 'Estabelecer acordos formais para transferência segura de informações entre partes',
          priority: 'Crítico',
          category: 'processual',
          relatedControls: ['A.5.14']
        },
        {
          id: 'proc-003',
          name: 'Processo e procedimentos de Gestão de Logs e Eventos de Segurança',
          description: 'Estabelecer processo formal para coleta, armazenamento e análise de logs',
          priority: 'Crítico',
          category: 'processual',
          relatedControls: ['A.8.16']
        },
        {
          id: 'proc-004',
          name: 'Definições claras quanto ao encerramento ou mudanças de contratação',
          description: 'Procedimentos formais para gestão de saída de colaboradores e fornecedores',
          priority: 'Crítico',
          category: 'processual',
          relatedControls: ['A.5.6', 'A.5.7']
        },
        {
          id: 'proc-005',
          name: 'Instituição de procedimentos e controles para monitoramento da gestão de identidade e acessos',
          description: 'Processo contínuo de revisão e monitoramento de acessos',
          priority: 'Muito Alto',
          category: 'processual',
          relatedControls: ['A.5.15', 'A.5.16', 'A.5.17']
        },
        {
          id: 'proc-006',
          name: 'Seleção e gestão dos colaboradores observando requisitos de SI',
          description: 'Inclusive terceiros, com verificação de antecedentes e cláusulas de confidencialidade',
          priority: 'Muito Alto',
          category: 'processual',
          relatedControls: ['A.5.1', 'A.5.2']
        },
        {
          id: 'proc-007',
          name: 'Processo disciplinar para violações de SI',
          description: 'Estabelecer processo formal para tratamento de violações de segurança da informação',
          priority: 'Muito Alto',
          category: 'processual',
          relatedControls: ['A.5.3']
        },
        {
          id: 'proc-008',
          name: 'Elaboração de planos de treinamentos e Campanhas de conscientização em SI',
          description: 'Programa contínuo de conscientização e treinamento em segurança da informação',
          priority: 'Crítico',
          category: 'processual',
          relatedControls: ['A.5.4']
        },
        {
          id: 'proc-009',
          name: 'Instituição de procedimentos para proteção de dados e uso adequado da informação',
          description: 'Procedimentos para classificação, tratamento e proteção de dados',
          priority: 'Crítico',
          category: 'processual',
          relatedControls: ['A.5.12', 'A.5.13']
        },
        {
          id: 'proc-010',
          name: 'Implementação de procedimentos relacionados a resposta a incidentes',
          description: 'Procedimentos formais para detecção, resposta e recuperação de incidentes',
          priority: 'Crítico',
          category: 'processual',
          relatedControls: ['A.5.24', 'A.5.25', 'A.5.26']
        },
        {
          id: 'proc-011',
          name: 'Documentação de processos e procedimentos técnicos operacionais em geral',
          description: 'Formalização da documentação de todos os processos técnicos operacionais',
          priority: 'Alto',
          category: 'processual',
          relatedControls: ['A.5.5']
        },
        {
          id: 'proc-012',
          name: 'Documento definindo responsabilidades da alta administração sobre diretrizes de SI',
          description: 'Formalizar as responsabilidades da alta administração em segurança da informação',
          priority: 'Muito Alto',
          category: 'processual',
          relatedControls: ['A.5.1']
        },
        {
          id: 'proc-013',
          name: 'Implementação de Termos de responsabilidade e comprometimento',
          description: 'Termos para funcionários e partes externas relevantes; devolução de equipamentos',
          priority: 'Muito Alto',
          category: 'processual',
          relatedControls: ['A.5.1', 'A.5.2', 'A.5.3']
        },
        {
          id: 'proc-014',
          name: 'Formalização de fluxos e processos com o RH para gestão de acessos',
          description: 'Integração com RH para movimentações, férias, desligamentos e outros eventos',
          priority: 'Muito Alto',
          category: 'processual',
          relatedControls: ['A.5.6', 'A.5.15']
        },
        {
          id: 'proc-015',
          name: 'Estabelecimento de procedimentos e fluxos adequados de informações referentes à SI',
          description: 'Comunicação com autoridades legais, regulatórias e fiscalizadoras',
          priority: 'Alto',
          category: 'processual',
          relatedControls: ['A.5.8']
        },
        {
          id: 'proc-016',
          name: 'Processo para devolução de ativos entre a organização e partes interessadas',
          description: 'Procedimento formal para devolução de ativos no encerramento de relações',
          priority: 'Alto',
          category: 'processual',
          relatedControls: ['A.5.7']
        },
        {
          id: 'proc-017',
          name: 'Processo de identificação, classificação e tratamento das vulnerabilidades',
          description: 'Processo formal de gestão de vulnerabilidades',
          priority: 'Alto',
          category: 'processual',
          relatedControls: ['A.8.8']
        },
        {
          id: 'proc-018',
          name: 'Integrar a SI nos processos das áreas e no ciclo de vida dos projetos',
          description: 'Incorporar segurança da informação como requisito em todos os projetos e processos',
          priority: 'Alto',
          category: 'processual',
          relatedControls: ['A.5.5']
        }
      ];

      // ============================================================
      // 2. POLÍTICAS RECOMENDADAS
      // ============================================================
      const politicas: RoadmapItem[] = [
        // ========== CRÍTICO ==========
        {
          id: 'pol-001',
          name: 'Política de Segurança da Informação – PSI',
          description: 'Conjunto de diretrizes e procedimentos que estabelecem o gerenciamento da SI em uma organização',
          priority: 'Crítico',
          category: 'politica',
          relatedControls: ['A.5.1']
        },
        {
          id: 'pol-002',
          name: 'PCN – Plano de Continuidade de Negócios',
          description: 'Estabelece um plano de ação para garantir a continuidade das atividades da empresa em caso de incidentes',
          priority: 'Crítico',
          category: 'politica',
          relatedControls: ['A.5.29']
        },
        {
          id: 'pol-003',
          name: 'Política de Privacidade e Proteção de Dados Pessoais',
          description: 'Define como a empresa coleta, armazena, usa e compartilha informações pessoais',
          priority: 'Crítico',
          category: 'politica',
          relatedControls: ['A.5.12', 'A.5.13']
        },
        {
          id: 'pol-004',
          name: 'Plano de Gestão de Incidentes de SI',
          description: 'Conjunto de procedimentos para identificar, analisar, responder e recuperar-se de incidentes',
          priority: 'Crítico',
          category: 'politica',
          relatedControls: ['A.5.24', 'A.5.25']
        },
        {
          id: 'pol-005',
          name: 'Plano de Resposta a Incidentes (PRI)',
          description: 'Documento que descreve as etapas específicas para lidar com um incidente de segurança',
          priority: 'Crítico',
          category: 'politica',
          relatedControls: ['A.5.26']
        },
        {
          id: 'pol-006',
          name: 'Política de Gerenciamento de Mídias de Armazenamento',
          description: 'Diretriz que estabelece os procedimentos para gerenciar e proteger os dados armazenados',
          priority: 'Crítico',
          category: 'politica',
          relatedControls: ['A.5.10', 'A.5.11']
        },
        {
          id: 'pol-007',
          name: 'Plano de Programa de Conscientização',
          description: 'Estabelece um plano de treinamento e conscientização para os funcionários sobre boas práticas de SI',
          priority: 'Crítico',
          category: 'politica',
          relatedControls: ['A.5.4']
        },
        {
          id: 'pol-008',
          name: 'Política de Classificação de Dados Pessoais',
          description: 'Conjunto de diretrizes para categorizar e proteger os dados pessoais coletados, armazenados e processados',
          priority: 'Crítico',
          category: 'politica',
          relatedControls: ['A.5.12', 'A.5.13']
        },
        {
          id: 'pol-009',
          name: 'Política de Segregação de Redes',
          description: 'Estabelece diretrizes e medidas para separar diferentes redes ou segmentos de uma infraestrutura de TI',
          priority: 'Crítico',
          category: 'politica',
          relatedControls: ['A.8.22']
        },
        // ========== MUITO ALTO ==========
        {
          id: 'pol-010',
          name: 'Código de Conduta Empresarial',
          description: 'Estabelece regras das expectativas e padrões de comportamento ético para colaboradores e relacionamentos',
          priority: 'Muito Alto',
          category: 'politica',
          relatedControls: ['A.5.1']
        },
        {
          id: 'pol-011',
          name: 'Política de Gestão de Acesso',
          description: 'Define os requisitos e controles para gerenciar o acesso de usuários a sistemas, aplicativos e informações',
          priority: 'Muito Alto',
          category: 'politica',
          relatedControls: ['A.5.15', 'A.5.16', 'A.5.17']
        },
        {
          id: 'pol-012',
          name: 'Política de Controle de Acesso (Físico e Lógico)',
          description: 'Define os processos de identificação, permissão e concessão de acessos',
          priority: 'Muito Alto',
          category: 'politica',
          relatedControls: ['A.5.15', 'A.7.1']
        },
        {
          id: 'pol-013',
          name: 'Política de Uso de Serviço de Nuvem',
          description: 'Conjunto de diretrizes e procedimentos para utilização de serviços em nuvem',
          priority: 'Muito Alto',
          category: 'politica',
          relatedControls: ['A.5.19', 'A.5.20']
        },
        {
          id: 'pol-014',
          name: 'Política de Mascaramento de Dados',
          description: 'Diretrizes para substituição ou ofuscação de dados sensíveis por dados fictícios ou anonimizados',
          priority: 'Muito Alto',
          category: 'politica',
          relatedControls: ['A.5.12', 'A.5.13']
        },
        {
          id: 'pol-015',
          name: 'Política de Segurança de Rede',
          description: 'Diretrizes e procedimentos para proteger a rede contra ameaças e garantir confidencialidade, integridade e disponibilidade',
          priority: 'Muito Alto',
          category: 'politica',
          relatedControls: ['A.8.20', 'A.8.21']
        },
        {
          id: 'pol-016',
          name: 'Política de Descarte Seguro',
          description: 'Diretrizes para garantir que informações de ativos, mídias e dados sejam adequadamente destruídas',
          priority: 'Muito Alto',
          category: 'politica',
          relatedControls: ['A.5.10', 'A.5.11']
        },
        {
          id: 'pol-017',
          name: 'Política de Descarte Seguro de Informações',
          description: 'Regras e diretrizes para garantir a eliminação adequada e segura de informações sensíveis',
          priority: 'Muito Alto',
          category: 'politica',
          relatedControls: ['A.5.11']
        },
        // ========== ALTO ==========
        {
          id: 'pol-018',
          name: 'Política de Trabalho Remoto',
          description: 'Diretrizes e procedimentos para a realização do trabalho fora do escritório ou local de trabalho físico',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.6']
        },
        {
          id: 'pol-019',
          name: 'Política ou procedimento sobre Compliance com políticas, regras e normas',
          description: 'Diretriz para avaliar o compliance das normas, procedimentos e políticas',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.5']
        },
        {
          id: 'pol-020',
          name: 'Política de Rotulagem de informações',
          description: 'Diretrizes para rotulagem adequada de informações conforme sua classificação',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.12']
        },
        {
          id: 'pol-021',
          name: 'Política de Propriedade Intelectual',
          description: 'Fomentar a proteção dos direitos de propriedade intelectual e normas para gestão da Propriedade Intelectual',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.1']
        },
        {
          id: 'pol-022',
          name: 'Política de Senha Segura',
          description: 'Diretrizes e requisitos para criação, uso e armazenamento seguro de senhas',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.17']
        },
        {
          id: 'pol-023',
          name: 'Política de Classificação da Informação',
          description: 'Diretrizes para categorizar a informação de acordo com sua importância e sensibilidade',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.12']
        },
        {
          id: 'pol-024',
          name: 'Política de Controles Criptográficos',
          description: 'Diretrizes para o uso seguro e adequado de técnicas de criptografia',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.18']
        },
        {
          id: 'pol-025',
          name: 'Política de Transferência de Informações',
          description: 'Regras para compartilhamento de informação entre diferentes sistemas ou entidades',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.14']
        },
        {
          id: 'pol-026',
          name: 'Política de Due Diligence',
          description: 'Processo de avaliação preventiva de riscos de corrupção, reputação e integridade com fornecedores',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.19']
        },
        {
          id: 'pol-027',
          name: 'Política de Reutilização de Equipamentos',
          description: 'Diretrizes e procedimentos para promover boas práticas de reutilização de equipamentos',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.10']
        },
        {
          id: 'pol-028',
          name: 'Política de Direitos de Acessos Privilegiados',
          description: 'Diretrizes e controles para gerenciar e controlar o acesso a contas com privilégios elevados',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.17']
        },
        {
          id: 'pol-029',
          name: 'Política de Gestão de Fornecedores',
          description: 'Normas e procedimentos para selecionar, avaliar, monitorar e gerenciar fornecedores',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.5.19']
        },
        {
          id: 'pol-030',
          name: 'Política de Backup',
          description: 'Diretrizes e procedimentos para realização de cópias de segurança de dados e informações',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.8.13']
        },
        {
          id: 'pol-031',
          name: 'Política de Logs',
          description: 'Diretrizes para criação, armazenamento, proteção e monitoramento de logs de atividades',
          priority: 'Alto',
          category: 'politica',
          relatedControls: ['A.8.16']
        },
        // ========== MÉDIO ==========
        {
          id: 'pol-032',
          name: 'Política de Mesa e Tela Limpas',
          description: 'Diretrizes para manter áreas de trabalho organizadas e sem informações sensíveis expostas',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.7.7']
        },
        {
          id: 'pol-033',
          name: 'Política de Uso Aceitável de Ativos',
          description: 'Regras para utilização dos recursos de tecnologia da informação pelos usuários autorizados',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.5.8']
        },
        {
          id: 'pol-034',
          name: 'Política de Gestão de Identidade',
          description: 'Diretrizes e procedimentos para gerenciar as identidades dos usuários e sistemas',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.5.15']
        },
        {
          id: 'pol-035',
          name: 'Política de Segurança Física',
          description: 'Diretrizes, princípios e responsabilidades para nortear as atividades de segurança física',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.7.1', 'A.7.2']
        },
        {
          id: 'pol-036',
          name: 'Política de Uso de Equipamento e da Rede',
          description: 'Regras e diretrizes para regular o uso apropriado dos equipamentos de tecnologia e da rede',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.5.8']
        },
        {
          id: 'pol-037',
          name: 'Política de Proteção de Registros',
          description: 'Diretrizes e procedimentos para proteger os registros físicos e eletrônicos',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.5.12']
        },
        {
          id: 'pol-038',
          name: 'Política de Gestão de Configuração',
          description: 'Diretrizes para gerenciar e controlar configurações em todo o ciclo de vida dos sistemas',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.8.9']
        },
        {
          id: 'pol-039',
          name: 'Política de Configuração Segura',
          description: 'Regras e diretrizes para garantir que sistemas sejam configurados de forma segura',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.8.9']
        },
        {
          id: 'pol-040',
          name: 'Política de Gestão de Vulnerabilidades',
          description: 'Processo de identificação, avaliação e tratamento de vulnerabilidades de segurança',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.8.8']
        },
        {
          id: 'pol-041',
          name: 'Política de Instalação de Software em Sistemas Operacionais',
          description: 'Diretrizes para determinar quais softwares podem ser instalados em sistemas operacionais',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.8.10']
        },
        {
          id: 'pol-042',
          name: 'Política de Proteção do Código Fonte',
          description: 'Diretrizes e medidas para garantir a segurança e confidencialidade do código fonte',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.8.25']
        },
        {
          id: 'pol-043',
          name: 'Política Análise Crítica Independente',
          description: 'Diretrizes para garantir avaliação objetiva, imparcial e rigorosa de atividades, projetos e processos',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.5.5']
        },
        {
          id: 'pol-044',
          name: 'Política de Gestão de Mudança',
          description: 'Diretrizes para planejar, comunicar, implementar e avaliar mudanças organizacionais',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.8.32']
        },
        {
          id: 'pol-045',
          name: 'Política de Auditoria',
          description: 'Diretrizes para monitorar e avaliar a conformidade e segurança dos sistemas de informação',
          priority: 'Médio',
          category: 'politica',
          relatedControls: ['A.5.5']
        }
      ];

      // ============================================================
      // 3. SOLUÇÕES TÉCNICAS DE APOIO
      // ============================================================
      const tecnicas: RoadmapItem[] = [
        // ========== CRÍTICO ==========
        {
          id: 'tec-001',
          name: 'Firewall, Vans, IPS, e Automações de Redes',
          description: 'Barreiras de segurança que monitoram e controlam o tráfego de rede prevenindo acessos não autorizados',
          priority: 'Crítico',
          category: 'tecnica',
          relatedControls: ['A.8.20', 'A.8.21']
        },
        {
          id: 'tec-002',
          name: 'MDM / EMM',
          description: 'Gerenciamento de dispositivos móveis e controle de acesso à conteúdo',
          priority: 'Crítico',
          category: 'tecnica',
          relatedControls: ['A.5.15']
        },
        {
          id: 'tec-003',
          name: 'DLP – Data Loss Prevention',
          description: 'Solução com foco na prevenção da perda de dados',
          priority: 'Crítico',
          category: 'tecnica',
          relatedControls: ['A.5.13', 'A.8.12']
        },
        {
          id: 'tec-004',
          name: 'Solução de Privacidade de Dados',
          description: 'Softwares de mascaramento ou anonimização de dados',
          priority: 'Crítico',
          category: 'tecnica',
          relatedControls: ['A.5.12', 'A.5.13']
        },
        {
          id: 'tec-005',
          name: 'SOC + SIEM',
          description: 'Soluções de segurança em tempo real para prevenção, detecção e resposta a incidentes',
          priority: 'Crítico',
          category: 'tecnica',
          relatedControls: ['A.8.16', 'A.8.24']
        },
        {
          id: 'tec-006',
          name: 'Solução de Inventário de Dados',
          description: 'Software para gerenciar dados coletados, permitindo rastrear, documentar e controlar o uso',
          priority: 'Crítico',
          category: 'tecnica',
          relatedControls: ['A.5.9']
        },
        // ========== MUITO ALTO ==========
        {
          id: 'tec-007',
          name: 'Ferramentas/aplicação de controle de acesso à rede, ou NAC',
          description: 'Protege as redes corporativas implementando políticas para todos os dispositivos antes do acesso',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.8.20']
        },
        {
          id: 'tec-008',
          name: 'Criptografia',
          description: 'Recurso para transformar informações em formato ininteligível para proteger confidencialidade e integridade',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.5.18']
        },
        {
          id: 'tec-009',
          name: 'Endpoint Manager',
          description: 'Sistema que administra e gerência permissões de acesso de endpoint',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.8.10']
        },
        {
          id: 'tec-010',
          name: 'Ferramenta de mascaramento de dados, pseudonimização e anonimização',
          description: 'Protege a privacidade e a segurança dos dados pessoais substituindo informações identificáveis',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.5.12', 'A.5.13']
        },
        {
          id: 'tec-011',
          name: 'MFA – Autenticação de Fator Múltiplo',
          description: 'Exige que os usuários forneçam pelo menos dois fatores diferentes de autenticação',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.5.17']
        },
        {
          id: 'tec-012',
          name: 'Serviço de Pentest',
          description: 'Ferramenta para gestão proativa de inventário e testes de invasão',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.8.8']
        },
        {
          id: 'tec-013',
          name: 'Ferramenta que sobrescreve informações',
          description: 'Grava aleatoriamente sequências de dados em um arquivo para torná-lo incompreensível',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.5.11']
        },
        {
          id: 'tec-014',
          name: 'Ferramentas/aplicações para categorizar, rotular e proteger dados',
          description: 'Software para organização e proteção de informações sensíveis',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.5.12']
        },
        {
          id: 'tec-015',
          name: 'IDM / IAM / PAM / Cofre de Senhas',
          description: 'Gerenciamento de identidade e acessos a recursos de TI',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.5.15', 'A.5.16', 'A.5.17']
        },
        {
          id: 'tec-016',
          name: 'Configuração de alertas e notificações de monitoramento',
          description: 'Garantir que os sistemas e recursos sejam monitorados de maneira eficiente e em tempo real',
          priority: 'Muito Alto',
          category: 'tecnica',
          relatedControls: ['A.8.16']
        },
        // ========== ALTO ==========
        {
          id: 'tec-017',
          name: 'DMZ – Zona Desmilitarizada',
          description: 'Zona desmilitarizada para conter serviços voltados para a Internet que não devem ser expostos da rede interna',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.8.21']
        },
        {
          id: 'tec-018',
          name: 'Ferramentas de sobregravação',
          description: 'Sobregravar várias vezes o setor de um disco rígido para inibir a possibilidade de recuperação',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.5.11']
        },
        {
          id: 'tec-019',
          name: 'Solução de Backup',
          description: 'Cópia de dados e informações críticas para diferentes mídias de armazenamento',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.8.13']
        },
        {
          id: 'tec-020',
          name: 'Dispositivos de autenticação',
          description: 'Mecanismos que validam a identidade do usuário antes de conceder acesso (Certificados Digitais, tokens)',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.5.17']
        },
        {
          id: 'tec-021',
          name: 'Antivírus, Antimalware, Proteção em e-mail',
          description: 'Software para proteção contra programas maliciosos, incluindo proteção avançada para e-mails',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.8.10']
        },
        {
          id: 'tec-022',
          name: 'Ferramentas/aplicação de gerenciamento de ativos de TI - ITAM',
          description: 'Ferramenta para gestão proativa de inventário',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.5.9']
        },
        {
          id: 'tec-023',
          name: 'EDR – Endpoint Detection and Response',
          description: 'Detecção e resposta a ameaças de endpoint',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.8.10']
        },
        {
          id: 'tec-024',
          name: 'Soluções de inteligência de ameaças',
          description: 'Ferramentas para identificar, monitorar e mitigar ameaças cibernéticas',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.8.24']
        },
        {
          id: 'tec-025',
          name: 'Solução de SOAR',
          description: 'Orquestração de segurança, automação e resposta de eventos e/ou incidentes',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.8.24']
        },
        {
          id: 'tec-026',
          name: 'Anti-DDoS',
          description: 'Protege contra ataques distribuídos de negação de serviço identificando e filtrando tráfego malicioso',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.8.21']
        },
        {
          id: 'tec-027',
          name: 'ITSM – IT Service Management',
          description: 'Ferramenta para gestão de serviços de TI para fornecer valor ao cliente através de processos e tecnologia',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.5.5']
        },
        {
          id: 'tec-028',
          name: 'HSM’s',
          description: 'Dispositivos que fornecem segurança adicional para chaves criptográficas',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.5.18']
        },
        {
          id: 'tec-029',
          name: 'Provisão de sinal único (SSO)',
          description: 'Ferramentas de gestão de autenticação que reduzem a quantidade de informações de autenticação',
          priority: 'Alto',
          category: 'tecnica',
          relatedControls: ['A.5.17']
        },
        // ========== MÉDIO ==========
        {
          id: 'tec-030',
          name: 'Ferramenta/Aplicações de Análise de Vulnerabilidades',
          description: 'Identificação das vulnerabilidades nos sistemas e aplicações',
          priority: 'Médio',
          category: 'tecnica',
          relatedControls: ['A.8.8']
        },
        {
          id: 'tec-031',
          name: 'Ferramentas de segurança em pipeline',
          description: 'Soluções de garantia de segurança do código no processo de CI/CD',
          priority: 'Médio',
          category: 'tecnica',
          relatedControls: ['A.8.25']
        },
        {
          id: 'tec-032',
          name: 'Active Directory (AD)',
          description: 'Gerenciamento de dispositivos móveis e controle de acesso à conteúdo',
          priority: 'Médio',
          category: 'tecnica',
          relatedControls: ['A.5.15']
        },
        {
          id: 'tec-033',
          name: 'Controle de acessos (Físico)',
          description: 'Catracas, portas reforçadas, câmeras, alarmes, equipe de segurança, biometria e PIN',
          priority: 'Médio',
          category: 'tecnica',
          relatedControls: ['A.7.1']
        },
        {
          id: 'tec-034',
          name: 'Ferramenta para apoiar Gestão de Projetos',
          description: 'Recurso para apoiar a gestão de projetos a fim de assegurar a segurança da informação',
          priority: 'Médio',
          category: 'tecnica',
          relatedControls: ['A.5.5']
        }
      ];

      // ============================================================
      // 4. MONTAGEM DO ROADMAP
      // ============================================================
      const allItems = [...processuais, ...politicas, ...tecnicas];

      const byPriority = allItems.reduce(
        (acc, item) => {
          switch (item.priority) {
            case 'Crítico': acc.critico++; break;
            case 'Muito Alto': acc.muitoAlto++; break;
            case 'Alto': acc.alto++; break;
            case 'Médio': acc.medio++; break;
            case 'Baixo': acc.baixo++; break;
          }
          return acc;
        },
        { critico: 0, muitoAlto: 0, alto: 0, medio: 0, baixo: 0 }
      );

      const roadmapData: RoadmapData = {
        companyId: companyId,
        companyName: company.name,
        generatedAt: new Date(),
        sections: {
          processuais: {
            title: 'Medidas Processuais Recomendadas',
            description: 'Procedimentos e controles processuais a serem implementados para garantir a conformidade com a ISO 27001:2022',
            items: processuais,
            priority: 'Crítico'
          },
          politicas: {
            title: 'Políticas Recomendadas',
            description: 'Políticas de segurança da informação organizadas por nível de priorização para garantir a conformidade com a ISO 27001:2022',
            items: politicas,
            priority: 'Crítico'
          },
          tecnicas: {
            title: 'Soluções Técnicas de Apoio',
            description: 'Soluções tecnológicas para apoiar a implementação e operacionalização dos controles de segurança',
            items: tecnicas,
            priority: 'Crítico'
          }
        },
        summary: {
          totalItems: allItems.length,
          byPriority: {
            critico: byPriority.critico,
            muitoAlto: byPriority.muitoAlto,
            alto: byPriority.alto,
            medio: byPriority.medio,
            baixo: byPriority.baixo
          }
        }
      };

      console.log(`✅ [getRoadmap] Roadmap gerado com ${allItems.length} itens para empresa ${company.name}`);
      console.log(`📊 [getRoadmap] Resumo: Crítico=${byPriority.critico}, Muito Alto=${byPriority.muitoAlto}, Alto=${byPriority.alto}, Médio=${byPriority.medio}`);

      return roadmapData;
    } catch (error) {
      console.error('❌ [getRoadmap] Erro:', error);
      throw error;
    }
  }

  /**
   * 🔴 CORRIGIDO: Gerar dados para a Matriz de Priorização
   * Retorna apenas controles com RESPOSTA E maturidade 0 (Não implementado) ou 1 (Parcial)
   */
  static async getPriorizationMatrix(companyId: string): Promise<any[]> {
    console.log('🔍 [getPriorizationMatrix] Iniciando para companyId:', companyId);
    
    try {
      // 1. Buscar todos os controles
      const controls = await Control.find({}).sort({ id: 1 }).lean();
      console.log(`🔍 [getPriorizationMatrix] Total de controles: ${controls.length}`);

      // 2. Buscar todas as respostas da empresa
      const responses = await Response.find({ companyId }).lean();
      console.log(`🔍 [getPriorizationMatrix] Respostas encontradas: ${responses.length}`);

      // 3. Criar mapa de respostas por controlId (ObjectId)
      const responseMap = new Map();
      responses.forEach((response: any) => {
        const controlId = response.controlId?.toString();
        if (controlId) {
          if (!responseMap.has(controlId)) {
            responseMap.set(controlId, response);
          }
        }
      });

      // 4. Buscar recomendações
     let recommendations: any[] = [];
try {
  const Recommendation = (await import('../models/Recommendation.js')).Recommendation;
  recommendations = await Recommendation.find({}).lean();
} catch (err) {
  console.log('⚠️ [getPriorizationMatrix] Nenhuma recomendação encontrada');
      }
      
      const recMap = new Map();
      recommendations.forEach((rec: any) => {
        const controlId = rec.controlId?.toString();
        if (controlId) {
          recMap.set(controlId, rec);
        }
      });

      // 5. Montar a matriz - APENAS controles com RESPOSTA E maturidade 0 ou 1
      const matrixData = [];
      let refId = 1;

      for (const control of controls) {
        // Usar o _id do controle para fazer o match com a resposta
        const controlObjectId = control._id?.toString();
        if (!controlObjectId) continue;

        const response = responseMap.get(controlObjectId);
        
        // 🔴 CORREÇÃO: Converter string para número
        let maturity = 0;
        if (response) {
          maturity = parseInt(response.maturityLevel) || 0;
        }
        
        // 🔴 NOVO FILTRO: APENAS controles com RESPOSTA E maturidade 0 ou 1
        if (!response || (maturity !== 0 && maturity !== 1)) {
          if (!response) {
            console.log(`⏭️ [getPriorizationMatrix] Pulando controle ${control.id || controlObjectId} (sem resposta)`);
          } else {
            console.log(`⏭️ [getPriorizationMatrix] Pulando controle ${control.id || controlObjectId} (maturity ${maturity} - Implementado)`);
          }
          continue;
        }

        console.log(`✅ [getPriorizationMatrix] Incluindo controle ${control.id || controlObjectId} (maturity ${maturity})`);

        const recommendation = recMap.get(controlObjectId);

        let scenario = 'Inserir Cenário identificado';
        let observations = '';
        let vulnerabilities = '-';
        let solutions = '-';

        if (response) {
          scenario = response.scenarioDescription || 'Inserir Cenário identificado';
          observations = response.observations || '';
          
          if (!response.scenarioDescription && observations) {
            scenario = observations;
          }

          if (response.threats && response.threats.length > 0) {
            vulnerabilities = response.threats.map((t: string) => `- ${t}`).join('\n');
          } else if (maturity === 0) {
            vulnerabilities = `- Ausência de implementação do controle ${control.id || controlObjectId}\n- Processos não documentados\n- Risco de não conformidade com a ISO 27001`;
          } else if (maturity === 1) {
            vulnerabilities = `- Implementação parcial do controle ${control.id || controlObjectId}\n- Processos não completamente documentados\n- Risco de lacunas na segurança da informação`;
          }
        }

const controlName = control.nome || control.id || controlObjectId;

        if (recommendation) {
          if (recommendation.solucoesTecnicas && recommendation.solucoesTecnicas.length > 0) {
            solutions = recommendation.solucoesTecnicas.join(', ');
          }
          if (recommendation.recomendacoes && recommendation.recomendacoes.length > 0) {
            const recText = recommendation.recomendacoes.join(', ');
            if (solutions === '-') {
              solutions = recText;
            } else {
              solutions = `${solutions}; ${recText}`;
            }
          }
        }

        // 🔴 NOVO: Criar resumo para a coluna de soluções técnicas
        const solutionsSummary = solutions && solutions.length > 80 
          ? solutions.substring(0, 80) + '...' 
          : solutions || '-';

        // Probabilidade e Impacto
        const probability = Math.max(0, 9 - (maturity * 3));
        const impact = Math.max(0, 9 - (maturity * 3));
        const riskScore = Math.round((probability + impact) / 2);

        let priority = 'Médio';
        if (riskScore >= 8) priority = 'Crítico';
        else if (riskScore >= 7) priority = 'Muito Alto';
        else if (riskScore >= 6) priority = 'Alto';
        else if (riskScore >= 4) priority = 'Médio';
        else if (riskScore >= 2) priority = 'Baixo';
        else priority = 'Muito Baixo';

        matrixData.push({
          refId: refId++,
          controlId: control.id || controlObjectId,
          controlName: controlName,
          maturity: maturity,
          scenario: scenario,
          vulnerabilities: vulnerabilities,
          solutions: solutions,
          solutionsSummary: solutionsSummary,
          probability: probability,
          impact: impact,
          riskScore: riskScore,
          priority: priority,
          status: maturity === 0 ? 'Não Implementado' : 'Parcial',
        });
      }

      // Ordenar por prioridade (Crítico primeiro)
      const priorityOrder = { 'Crítico': 0, 'Muito Alto': 1, 'Alto': 2, 'Médio': 3, 'Baixo': 4, 'Muito Baixo': 5 };
      matrixData.sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 99) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 99));

      console.log(`✅ [getPriorizationMatrix] Matriz gerada com ${matrixData.length} itens (apenas controles respondidos como Não implementados ou Parciais)`);
      return matrixData;
    } catch (error) {
      console.error('❌ [getPriorizationMatrix] Erro:', error);
      return [];
    }
  }
}