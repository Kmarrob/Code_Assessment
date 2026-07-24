// frontend/src/services/control.service.ts
import api from './api';
import { ApiResponse } from '../types';

export interface Control {
  _id: string;
  id: string;
  nome: string;
  dominioDeSI: string[];
  tipoDeControle: string[];
  nota: number;
  descricao: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListControlsResponse {
  items: Control[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ControlFilters {
  page?: number;
  limit?: number;
  search?: string;
  domain?: string;
}

export const controlService = {
  /**
   * Listar controles com filtros e paginação
   * GET /api/admin/controls
   */
  async listControls(filters: ControlFilters = {}): Promise<ListControlsResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.search) params.append('search', filters.search);
    if (filters.domain) params.append('domain', filters.domain);

    const response = await api.get<ApiResponse<{ controls: Control[]; pagination: any }>>(
      `/admin/controls?${params.toString()}`
    );
    
    const data = response.data.data;
    
    return {
      items: data.controls || [],
      pagination: data.pagination || { 
        page: 1, 
        limit: 10, 
        total: 0, 
        totalPages: 0 
      }
    };
  },

  /**
   * Buscar controle por ID
   * GET /api/admin/controls/:id
   */
  async getControlById(id: string): Promise<Control> {
    const response = await api.get<ApiResponse<{ control: Control }>>(`/admin/controls/${id}`);
    return response.data.data.control;
  },

  /**
   * Buscar controles disponíveis para atribuição (não atribuídos a um usuário específico)
   * GET /api/rep/controls
   */
  async getAvailableControls(): Promise<Control[]> {
    const response = await api.get<ApiResponse<Control[]>>('/rep/controls');
    return response.data.data || [];
  },

  /**
   * Buscar todos os controles (sem paginação - para seleção)
   * GET /api/admin/controls/all
   */
  async getAllControls(): Promise<Control[]> {
    const response = await api.get<ApiResponse<{ controls: Control[] }>>('/admin/controls/all');
    return response.data.data.controls || [];
  },

  /**
   * Buscar controles por domínio
   * GET /api/admin/controls/domains/:domain
   */
  async getControlsByDomain(domain: string): Promise<Control[]> {
    const response = await api.get<ApiResponse<{ controls: Control[] }>>(`/admin/controls/domains/${domain}`);
    return response.data.data.controls || [];
  }
};

export default controlService;