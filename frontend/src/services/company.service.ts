// frontend/src/services/company.service.ts
import api from './api';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Company {
  _id: string;
  name: string;
  cnpj?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  maxUsers: number;
  maxControls: number;
  assignedControls?: string[];
  assignedControlsCount?: number;
  userCount?: number;
  consultantId?: string | null; // <-- ADICIONADO
  createdAt: string;
  updatedAt: string;
}

export interface CompanyStats {
  totalCompanies: number;
  totalUsers: number;
  activeCompanies: number;
  inactiveCompanies: number;
  usersPerCompany: Array<{ _id: string; count: number }>;
  topCompanies: Array<{ name: string; userCount: number }>;
}

export const companyService = {
  /**
   * Listar empresas
   */
  async listCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    consultantId?: string; // <-- ADICIONADO
  }): Promise<PaginatedResponse<Company>> {
    const response = await api.get<ApiResponse<any>>('/admin/companies', { params });
    
    const data = response.data.data;
    const pagination = response.data.pagination;
    
    return {
      items: Array.isArray(data) ? data : [],
      pagination: pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
    };
  },

  /**
   * Buscar empresa por ID
   */
  async getCompanyById(id: string): Promise<Company> {
    const response = await api.get<ApiResponse<{ company: Company }>>(`/admin/companies/${id}`);
    return response.data.data.company;
  },

  /**
   * Criar empresa
   */
  async createCompany(data: {
    name: string;
    cnpj?: string;
    plan?: 'basic' | 'pro' | 'enterprise';
    maxUsers?: number;
    maxControls?: number;
  }): Promise<Company> {
    const response = await api.post<ApiResponse<{ company: Company }>>('/admin/companies', data);
    return response.data.data.company;
  },

  /**
   * Atualizar empresa - CORRIGIDO
   */
  async updateCompany(
    id: string,
    data: {
      name?: string;
      cnpj?: string;
      plan?: 'basic' | 'pro' | 'enterprise';
      maxUsers?: number;
      maxControls?: number;
      status?: 'active' | 'inactive' | 'suspended';
      consultantId?: string | null; // <-- ADICIONADO
    }
  ): Promise<Company> {
    const response = await api.put<ApiResponse<{ company: Company }>>(`/admin/companies/${id}`, data);
    return response.data.data.company;
  },

  /**
   * Desativar empresa
   */
  async deactivateCompany(id: string): Promise<Company> {
    const response = await api.delete<ApiResponse<{ company: Company }>>(`/admin/companies/${id}`);
    return response.data.data.company;
  },

  /**
   * Reativar empresa
   */
  async reactivateCompany(id: string): Promise<Company> {
    const response = await api.post<ApiResponse<{ company: Company }>>(`/admin/companies/${id}/reactivate`);
    return response.data.data.company;
  },

  /**
   * Atribuir todos os controles à empresa
   */
  async assignAllControls(id: string): Promise<{
    company: Company;
    assigned: number;
    total: number;
  }> {
    const response = await api.post<ApiResponse<{
      company: Company;
      assigned: number;
      total: number;
    }>>(`/admin/companies/${id}/assign-all-controls`);
    return response.data.data;
  },

  /**
   * Obter estatísticas das empresas
   */
  async getStats(): Promise<CompanyStats> {
    const response = await api.get<ApiResponse<CompanyStats>>('/admin/companies/stats');
    return response.data.data;
  },
};