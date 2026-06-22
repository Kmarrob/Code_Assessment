// frontend/src/services/dashboard.service.ts
import api from './api';
import { ApiResponse } from '../types';

export interface DashboardSummary {
  totalControls: number;
  totalUsers: number;
  Implementado: number;
  Parcialmente: number;
  NaoImplementado: number;
  NaoSeAplica: number;
  percentages: {
    Implementado: number;
    Parcialmente: number;
    NaoImplementado: number;
    NaoSeAplica: number;
  };
  maturityLevels: Record<string, number>;
}

export interface DashboardData {
  company: {
    id: string;
    name: string;
  };
  summary: DashboardSummary;
  byDomain: Record<string, any>;
  byCategory: Record<string, any>;
  byType: Record<string, any>;
  byCyberConcept: Record<string, any>;
  byCapability: Record<string, any>;
  controls: any[];
}

export interface CompanySummary {
  id: string;
  name: string;
  consultantId: string;
  totalControls: number;
  totalUsers: number;
  implemented: number;
  partial: number;
  notImpl: number;
  completionRate: number;
}

export const dashboardService = {
  /**
   * Obter dashboard da empresa (Preposto)
   */
  async getRepDashboard(companyId: string): Promise<DashboardData> {
    const response = await api.get<ApiResponse<DashboardData>>(`/rep/dashboard/${companyId}`);
    return response.data.data;
  },

  /**
   * Obter dashboard de uma empresa (Admin)
   */
  async getAdminCompanyDashboard(companyId: string): Promise<DashboardData> {
    const response = await api.get<ApiResponse<DashboardData>>(`/admin/dashboard/companies/${companyId}`);
    return response.data.data;
  },

  /**
   * Listar resumo de todas as empresas (Admin)
   */
  async listCompaniesSummary(): Promise<CompanySummary[]> {
    const response = await api.get<ApiResponse<CompanySummary[]>>('/admin/dashboard/companies');
    return response.data.data;
  },
};