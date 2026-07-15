/**
 * ============================================
 * ANALYTICS SERVICE - FRONTEND
 * ============================================
 * 
 * Serviço responsável por comunicar com a API
 * de analytics do backend.
 * 
 * @module AnalyticsService
 * @since v30.0
 */

import api from './api';
import {
  AnalyticsSummary,
  RevenueMetrics,
  FunnelDetails,
  ChurnMetrics,
  PlanDistribution,
  ClientListItem,
  RetentionCurve,
  ChurnPrediction,
  RetentionStrategies,
  ConversionTrend,
  AnalyticsPeriod,
  ClientFunnelStatus,
  AnalyticsApiResponse
} from '../types/analytics';

// ============================================
// INTERFACES DE PARÂMETROS
// ============================================

interface PeriodParams {
  period: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}

interface ClientListParams extends PeriodParams {
  plan?: string;
  status?: ClientFunnelStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

interface RetentionParams extends PeriodParams {
  maxMonths?: number;
}

interface TrendParams extends PeriodParams {
  interval?: 'daily' | 'weekly' | 'monthly';
}

// ============================================
// SERVIÇO
// ============================================

class AnalyticsService {
  // 🔴 CORRIGIDO: Removido /api pois o api.ts já tem a base URL
  private readonly baseUrl = '/admin/analytics';

  /**
   * Obtém resumo completo do dashboard
   */
  async getSummary(params: PeriodParams): Promise<AnalyticsSummary> {
    try {
      const response = await api.get<AnalyticsApiResponse<AnalyticsSummary>>(
        `${this.baseUrl}/summary`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar resumo de analytics:', error);
      throw error;
    }
  }

  /**
   * Obtém métricas de receita
   */
  async getRevenue(params: PeriodParams): Promise<RevenueMetrics> {
    try {
      const response = await api.get<AnalyticsApiResponse<RevenueMetrics>>(
        `${this.baseUrl}/revenue`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar métricas de receita:', error);
      throw error;
    }
  }

  /**
   * Obtém métricas do funil de conversão
   */
  async getFunnel(params: PeriodParams): Promise<FunnelDetails> {
    try {
      const response = await api.get<AnalyticsApiResponse<FunnelDetails>>(
        `${this.baseUrl}/funnel`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar métricas do funil:', error);
      throw error;
    }
  }

  /**
   * Obtém métricas de churn
   */
  async getChurn(params: PeriodParams): Promise<ChurnMetrics> {
    try {
      const response = await api.get<AnalyticsApiResponse<ChurnMetrics>>(
        `${this.baseUrl}/churn`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar métricas de churn:', error);
      throw error;
    }
  }

  /**
   * Obtém distribuição por plano
   */
  async getPlans(): Promise<PlanDistribution[]> {
    try {
      const response = await api.get<AnalyticsApiResponse<PlanDistribution[]>>(
        `${this.baseUrl}/plans`
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar distribuição por plano:', error);
      throw error;
    }
  }

  /**
   * Obtém lista de clientes com status
   */
  async getClients(params: ClientListParams): Promise<{
    clients: ClientListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await api.get<AnalyticsApiResponse<any>>(
        `${this.baseUrl}/clients`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar lista de clientes:', error);
      throw error;
    }
  }

  /**
   * Obtém curva de retenção
   */
  async getRetention(params: RetentionParams): Promise<RetentionCurve> {
    try {
      const response = await api.get<AnalyticsApiResponse<RetentionCurve>>(
        `${this.baseUrl}/retention`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar curva de retenção:', error);
      throw error;
    }
  }

  /**
   * Obtém predição de churn
   */
  async getPrediction(): Promise<ChurnPrediction> {
    try {
      const response = await api.get<AnalyticsApiResponse<ChurnPrediction>>(
        `${this.baseUrl}/prediction`
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar predição de churn:', error);
      throw error;
    }
  }

  /**
   * Obtém estratégias de retenção
   */
  async getStrategies(params: PeriodParams): Promise<RetentionStrategies> {
    try {
      const response = await api.get<AnalyticsApiResponse<RetentionStrategies>>(
        `${this.baseUrl}/strategies`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar estratégias de retenção:', error);
      throw error;
    }
  }

  /**
   * Obtém trials abandonados
   */
  async getAbandonedTrials(params: PeriodParams): Promise<{
    total: number;
    clients: {
      companyId: string;
      companyName: string;
      trialStart: Date;
      trialEnd: Date;
      daysActive: number;
    }[];
  }> {
    try {
      const response = await api.get<AnalyticsApiResponse<any>>(
        `${this.baseUrl}/abandoned`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar trials abandonados:', error);
      throw error;
    }
  }

  /**
   * Obtém tendência de conversão
   */
  async getTrend(params: TrendParams): Promise<ConversionTrend> {
    try {
      const response = await api.get<AnalyticsApiResponse<ConversionTrend>>(
        `${this.baseUrl}/trend`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Erro ao buscar tendência de conversão:', error);
      throw error;
    }
  }

  /**
   * Exporta dados em CSV/Excel
   */
  async exportData(params: {
    period: AnalyticsPeriod;
    startDate?: string;
    endDate?: string;
    format: 'csv' | 'excel';
  }): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }
}

/**
 * Instância única do serviço (singleton)
 */
export const analyticsService = new AnalyticsService();