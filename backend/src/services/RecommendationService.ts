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
    // Buscar o controle para obter o ObjectId
    const control = await Control.findOne({ id: data.controlId });
    if (!control) {
      throw new NotFoundError(`Controle ${data.controlId} não encontrado`);
    }

    // Verificar se já existe recomendação para este controle
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
    return Recommendation.findOne({ controlId }).lean();
  }

  /**
   * Buscar recomendação por ObjectId do controle
   */
  static async getByControlObjectId(controlObjectId: string): Promise<IRecommendation | null> {
    return Recommendation.findOne({ controlObjectId }).lean();
  }

  /**
   * Listar todas as recomendações
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
  ): Promise<{ recommendations: IRecommendation[]; total: number }> {
    const { page = 1, limit = 20 } = pagination;
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

    const [recommendations, total] = await Promise.all([
      Recommendation.find(match)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ controlId: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Recommendation.countDocuments(match),
    ]);

    return { recommendations: recommendations as any[], total };
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
   * Retorna apenas controles com status "Parcialmente implementado" ou "Não implementado"
   */
  static async getRecommendationsWithResponses(
    companyId: string
  ): Promise<RecommendationWithResponse[]> {
    try {
      // Buscar empresa
      const company = await Company.findById(companyId);
      if (!company) {
        throw new NotFoundError('Empresa não encontrada');
      }

      // Buscar usuários da empresa
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

      // Buscar atribuições e respostas
      const assignments = await Assignment.find({
        userId: { $in: userIds },
      }).populate('controlId').lean();

      const responses = await Response.find({
        userId: { $in: userIds },
      }).lean();

      // Criar mapa de respostas por assignmentId
      const responseMap = new Map();
      responses.forEach(r => {
        responseMap.set(r.assignmentId.toString(), r);
      });

      // Buscar recomendações existentes
      const allRecommendations = await Recommendation.find().lean();

      // Mapear recomendações por controlId
      const recommendationMap = new Map();
      allRecommendations.forEach(rec => {
        recommendationMap.set(rec.controlId, rec);
      });

      // Construir resultado
      const result: RecommendationWithResponse[] = [];

      assignments.forEach(a => {
        const response = responseMap.get(a._id.toString());
        const control = a.controlId as any;

        if (!control) return;

        // Verificar se o controle tem status que precisa de atenção
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

          // Cenário identificado vem da resposta
          cenarioIdentificado = response.scenarioDescription || response.scenario || '';
        }

        // Filtrar apenas controles que precisam de atenção
        if (status !== 'Parcialmente implementado' && status !== 'Não implementado') {
          return;
        }

        // Buscar recomendação
        const recommendation = recommendationMap.get(control.id);

        // Se não houver recomendação, criar uma estrutura básica
        const recomendacoes = recommendation?.recomendacoes || ['Recomendação não cadastrada para este controle.'];
        const solucoesTecnicas = recommendation?.solucoesTecnicas || [];

        // Determinar domínio
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

      // Ordenar por controlId
      result.sort((a, b) => a.controlId.localeCompare(b.controlId));

      return result;

    } catch (error) {
      logger.error('❌ Erro ao buscar recomendações com respostas:', error);
      throw error;
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