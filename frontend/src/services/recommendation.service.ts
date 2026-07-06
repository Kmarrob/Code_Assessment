// frontend/src/services/recommendation.service.ts
import api from './api.js';
import { ApiResponse } from '../types/index.js';

// ============================================
// TIPOS
// ============================================

export interface Recommendation {
  _id: string;
  controlId: string;
  controlObjectId: string;
  titulo: string;
  dominio: string;
  recomendacoes: string[];
  solucoesTecnicas?: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
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

export interface RecommendationListResponse {
  recommendations: Recommendation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// SERVIÇO
// ============================================

export const recommendationService = {
  /**
   * Listar todas as recomendações (ADMIN)
   * GET /api/recommendations
   */
  async listRecommendations(params?: {
    page?: number;
    limit?: number;
    dominio?: string;
    search?: string;
  }): Promise<RecommendationListResponse> {
    const response = await api.get<ApiResponse<RecommendationListResponse>>(
      '/recommendations',
      { params }
    );
    return response.data.data;
  },

  /**
   * Buscar recomendação por ID do controle (ADMIN)
   * GET /api/recommendations/:controlId
   */
  async getByControlId(controlId: string): Promise<Recommendation | null> {
    const response = await api.get<ApiResponse<{ recommendation: Recommendation | null }>>(
      `/recommendations/${controlId}`
    );
    return response.data.data.recommendation;
  },

  /**
   * Criar recomendação (ADMIN)
   * POST /api/recommendations
   */
  async createRecommendation(data: CreateRecommendationData): Promise<Recommendation> {
    const response = await api.post<ApiResponse<{ recommendation: Recommendation }>>(
      '/recommendations',
      data
    );
    return response.data.data.recommendation;
  },

  /**
   * Atualizar recomendação (ADMIN)
   * PUT /api/recommendations/:controlId
   */
  async updateRecommendation(
    controlId: string,
    data: UpdateRecommendationData
  ): Promise<Recommendation> {
    const response = await api.put<ApiResponse<{ recommendation: Recommendation }>>(
      `/recommendations/${controlId}`,
      data
    );
    return response.data.data.recommendation;
  },

  /**
   * Deletar recomendação (ADMIN)
   * DELETE /api/recommendations/:controlId
   */
  async deleteRecommendation(controlId: string): Promise<void> {
    await api.delete(`/recommendations/${controlId}`);
  },

  /**
   * Obter domínios disponíveis (ADMIN)
   * GET /api/recommendations/dominios
   */
  async getDominios(): Promise<string[]> {
    const response = await api.get<ApiResponse<{ dominios: string[] }>>(
      '/recommendations/dominios'
    );
    return response.data.data.dominios;
  },

  /**
   * Obter recomendações com respostas para o relatório
   * GET /api/recommendations/report/:companyId
   */
  async getRecommendationsForReport(companyId: string): Promise<RecommendationWithResponse[]> {
    const response = await api.get<ApiResponse<RecommendationWithResponse[]>>(
      `/recommendations/report/${companyId}`
    );
    return response.data.data;
  },
};

export default recommendationService;