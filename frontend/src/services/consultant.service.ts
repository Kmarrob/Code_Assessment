// frontend/src/services/consultant.service.ts
import api from './api';
import { ApiResponse } from '../types';

export interface ConsultantCompany {
  _id: string;
  name: string;
  cnpj?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  userCount: number;
  assignedControlsCount: number;
  totalAssignments: number;
  totalResponses: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultantStats {
  totalCompanies: number;
  totalUsers: number;
  totalAssignments: number;
  totalResponses: number;
  completionRate: number;
  maturityDistribution: Record<string, number>;
}

export interface CompanyDetails {
  company: ConsultantCompany;
  users: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    total: number;
    completed: number;
    percentage: number;
  }>;
  totalUsers: number;
  totalAssignments: number;
  totalResponses: number;
  maturityDistribution: Record<string, number>;
}

export const consultantService = {
  /**
   * Listar empresas do consultor
   */
  async listCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ items: ConsultantCompany[]; pagination: any }> {
    const response = await api.get<ApiResponse<any>>('/consultant/companies', { params });
    
    const data = response.data.data;
    const pagination = response.data.pagination;
    
    if (Array.isArray(data)) {
      return {
        items: data as ConsultantCompany[],
        pagination: pagination || { page: 1, limit: 10, total: data.length, totalPages: 1 }
      };
    }
    
    if (data && data.items && Array.isArray(data.items)) {
      return {
        items: data.items as ConsultantCompany[],
        pagination: data.pagination || pagination
      };
    }
    
    return {
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
    };
  },

  /**
   * Obter estatísticas do consultor
   */
  async getStats(): Promise<ConsultantStats> {
    const response = await api.get<ApiResponse<ConsultantStats>>('/consultant/stats');
    return response.data.data;
  },

  /**
   * Obter detalhes de uma empresa
   */
  async getCompanyDetails(companyId: string): Promise<CompanyDetails> {
    const response = await api.get<ApiResponse<CompanyDetails>>(`/consultant/companies/${companyId}`);
    return response.data.data;
  },
};