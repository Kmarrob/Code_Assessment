// backend/src/services/RecommendationService.ts
import mongoose from 'mongoose';
import { Recommendation, IRecommendation } from '../models/Recommendation.js';
import { Control } from '../models/Control.js';
import { Response } from '../models/Response.js';
import { Assignment } from '../models/Assignment.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export interface CreateRecommendationData {
  controlId: string;
  titulo: string;
  dominio: string;
  recomendacoes: string[];
  solucoesTecnicas?: string[];
}

export interface UpdateRecommendationData {
  titulo?: string;
  dominio?: string;
  recomendacoes?: string[];
  solucoesTecnicas?: string[];
}

export interface RecommendationWithResponse {
  controlId: string;
  titulo: string;
  dominio: string;
  status: string;
  cenarioIdentificado: string;
  recomendacoes: string[];
  solucoesTecnicas?: string[];
  maturityLevel: number;
}

export class RecommendationService {
  /**
   * Criar uma recomendação para um controle
   */
  static async createRecommendation(
    data: CreateRecommendationData,
    userId: string
  ): Promise<IRecommendation> {
    const control = await Control.findOne({ id: data.controlId });
    if (!control) {
      throw new NotFoundError(`Controle ${data.controlId} não encontrado`);
    }

    const existing = await Recommendation.findOne({ controlId: data.controlId });
    if (existing) {
      throw new AppError(`Já existe uma recomendação para o controle ${data.controlId}`, 400);
    }

    const recommendation = new Recommendation({
      controlId: data.controlId,
      controlObjectId: control._id,
      titulo: data.titulo,
      dominio: data.dominio,
      recomendacoes: data.recomendacoes,
      solucoesTecnicas: data.solucoesTecnicas || [],
      createdBy: new mongoose.Types.ObjectId(userId),
      updatedBy: new mongoose.Types.ObjectId(userId),
    });

    await recommendation.save();
    logger.info(`Recomendação criada para o controle ${data.controlId} pelo usuário ${userId}`);

    return recommendation;
  }

  /**
   * Buscar recomendação por ID do controle
   */
  static async getByControlId(controlId: string): Promise<IRecommendation | null> {
    return Recommendation.findOne({ controlId }).lean() as Promise<IRecommendation | null>;
  }

  /**
   * Buscar recomendação por ObjectId do controle
   */
  static async getByControlObjectId(controlObjectId: string): Promise<IRecommendation | null> {
    return Recommendation.findOne({ controlObjectId }).lean() as Promise<IRecommendation | null>;
  }

  /**
   * Listar todas as recomendações - COM TOTAL CORRETO
   */
  static async listRecommendations(
    filters: {
      dominio?: string;
      search?: string;
    } = {},
    pagination: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ recommendations: IRecommendation[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;
    const { dominio, search } = filters;

    const match: any = {};

    if (dominio && dominio !== 'all') {
      match.dominio = dominio;
    }

    if (search) {
      match.$or = [
        { controlId: { $regex: search, $options: 'i' } },
        { titulo: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Buscar TODOS os documentos que atendem ao filtro
    const allDocs = await Recommendation.find(match)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    // Ordenação Numérica Estrita por Segmentos (5.1 -> 5.2 -> 5.10)
    const sortedDocs = allDocs.sort((a, b) => {
      const partsA = (a.controlId || '').split('.').map(Number);
      const partsB = (b.controlId || '').split('.').map(Number);
      
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const numA = partsA[i] || 0;
        const numB = partsB[i] || 0;
        if (numA !== numB) {
          return numA - numB;
        }
      }
      return (a.controlId || '').localeCompare(b.controlId || '');
    });

    // total = TODOS os documentos (não apenas os da página)
    const total = sortedDocs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    
    // Aplicar paginação APÓS calcular o total
    const paginatedDocs = sortedDocs.slice(skip, skip + limit);

    return { 
      recommendations: paginatedDocs as any[],
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  /**
   * Atualizar uma recomendação
   */
  static async updateRecommendation(
    controlId: string,
    data: UpdateRecommendationData,
    userId: string
  ): Promise<IRecommendation> {
    const recommendation = await Recommendation.findOne({ controlId });
    if (!recommendation) {
      throw new NotFoundError(`Recomendação para o controle ${controlId} não encontrada`);
    }

    if (data.titulo !== undefined) {
      recommendation.titulo = data.titulo;
    }
    if (data.dominio !== undefined) {
      recommendation.dominio = data.dominio;
    }
    if (data.recomendacoes !== undefined) {
      recommendation.recomendacoes = data.recomendacoes;
    }
    if (data.solucoesTecnicas !== undefined) {
      recommendation.solucoesTecnicas = data.solucoesTecnicas;
    }

    recommendation.updatedBy = new mongoose.Types.ObjectId(userId);
    await recommendation.save();

    logger.info(`Recomendação para o controle ${controlId} atualizada pelo usuário ${userId}`);

    return recommendation;
  }

  /**
   * Deletar uma recomendação
   */
  static async deleteRecommendation(controlId: string): Promise<void> {
    const result = await Recommendation.findOneAndDelete({ controlId });
    if (!result) {
      throw new NotFoundError(`Recomendação para o controle ${controlId} não encontrada`);
    }
    logger.info(`Recomendação para o controle ${controlId} removida`);
  }

  /**
   * Buscar recomendações com respostas para o relatório
   */
  static async getRecommendationsWithResponses(
    companyId: string
  ): Promise<RecommendationWithResponse[]> {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new NotFoundError('Empresa não encontrada');
      }

      const userFilter: any = {
        $or: [
          { companyId: new mongoose.Types.ObjectId(companyId) },
          { company: company.name },
        ],
        isActive: true,
      };

      const users = await User.find(userFilter).select('_id');
      const userIds = users.map(u => u._id);

      if (userIds.length === 0) {
        return [];
      }

      const assignments = await Assignment.find({
        userId: { $in: userIds },
      }).populate('controlId').lean();

      const responses = await Response.find({
        userId: { $in: userIds },
      }).lean();

      const responseMap = new Map();
      responses.forEach(r => {
        responseMap.set(r.assignmentId.toString(), r);
      });

      const allRecommendations = await Recommendation.find().lean();

      const recommendationMap = new Map();
      allRecommendations.forEach(rec => {
        recommendationMap.set(rec.controlId, rec);
      });

      const result: RecommendationWithResponse[] = [];

      assignments.forEach(a => {
        const response = responseMap.get(a._id.toString());
        const control = a.controlId as any;

        if (!control) return;

        let status = 'Não implementado';
        let maturityLevel = 0;
        let cenarioIdentificado = '';

        if (response) {
          const level = response.maturityLevel;
          if (level === 2 || level === '2') {
            status = 'Implementado';
            maturityLevel = 2;
          } else if (level === 1 || level === '1') {
            status = 'Parcialmente implementado';
            maturityLevel = 1;
          } else if (level === 0 || level === '0') {
            status = 'Não implementado';
            maturityLevel = 0;
          } else if (level === -1 || level === '-1' || level === 'N/A') {
            status = 'Não se aplica';
            maturityLevel = -1;
          }

          // 🔴 CORREÇÃO: Priorizar Descrição do Cenário Atual, depois Observações, depois Status
          if (response.scenarioDescription && response.scenarioDescription.trim()) {
            cenarioIdentificado = response.scenarioDescription;
          } else if (response.observations && response.observations.trim()) {
            cenarioIdentificado = response.observations;
          } else {
            cenarioIdentificado = status;
          }
        }

        // 🔴 CORREÇÃO: Remover filtro de status - mostrar TODOS os controles respondidos
        // Comentado: if (status !== 'Parcialmente implementado' && status !== 'Não implementado') { return; }

        const recommendation = recommendationMap.get(control.id);

        const recomendacoes = recommendation?.recomendacoes || ['Recomendação não cadastrada para este controle.'];
        const solucoesTecnicas = recommendation?.solucoesTecnicas || [];

        const tipos = control.tiposDeControles || control.tipoDeControle || [];
        let dominio = 'Controles organizacionais';
        if (Array.isArray(tipos)) {
          if (tipos.includes('Controles de Pessoas') || tipos.includes('Pessoas')) {
            dominio = 'Controles de pessoas';
          } else if (tipos.includes('Controles Físicos') || tipos.includes('Físicos')) {
            dominio = 'Controles físicos';
          } else if (tipos.includes('Controles Tecnológicos') || tipos.includes('Tecnológicos')) {
            dominio = 'Controles tecnológicos';
          }
        } else if (typeof tipos === 'string') {
          if (tipos.includes('Pessoas')) dominio = 'Controles de pessoas';
          else if (tipos.includes('Físicos')) dominio = 'Controles físicos';
          else if (tipos.includes('Tecnológicos')) dominio = 'Controles tecnológicos';
        }

        result.push({
          controlId: control.id || control._id,
          titulo: control.nome || 'Controle sem nome',
          dominio,
          status,
          cenarioIdentificado,
          recomendacoes,
          solucoesTecnicas,
          maturityLevel,
        });
      });

      result.sort((a, b) => {
        const partsA = (a.controlId || '').split('.').map(Number);
        const partsB = (b.controlId || '').split('.').map(Number);
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
          const numA = partsA[i] || 0;
          const numB = partsB[i] || 0;
          if (numA !== numB) return numA - numB;
        }
        return (a.controlId || '').localeCompare(b.controlId || '');
      });

      return result;

    } catch (error) {
      logger.error('❌ Erro ao buscar recomendações com respostas:', error);
      throw error;
    }
  }

  /**
   * 🔴 NOVO: Buscar recomendações para o relatório (formato simplificado para PDF)
   * GET /api/reports/:companyId/pdf
   * Acesso: ADMIN ou REP (da empresa)
   */
  static async getRecommendationsForReport(
    companyId: string
  ): Promise<any[]> {
    try {
      // Buscar recomendações com respostas
      const recommendationsWithResponses = await this.getRecommendationsWithResponses(companyId);

      // Mapear para o formato esperado pelo relatório
      return recommendationsWithResponses.map(item => ({
        controlId: item.controlId,
        titulo: item.titulo,
        dominio: item.dominio,
        status: item.status,
        cenarioIdentificado: item.cenarioIdentificado,
        recomendacoes: item.recomendacoes,
        solucoesTecnicas: item.solucoesTecnicas || [],
        maturityLevel: item.maturityLevel,
      }));

    } catch (error) {
      logger.error('❌ Erro ao buscar recomendações para relatório:', error);
      return [];
    }
  }

  /**
   * Obter domínios disponíveis para filtro
   */
  static async getDominios(): Promise<string[]> {
    return [
      'Controles organizacionais',
      'Controles de pessoas',
      'Controles físicos',
      'Controles tecnológicos',
    ];
  }
}

export default RecommendationService;