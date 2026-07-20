// frontend/src/services/admin.service.ts
import api from './api.js';
import { IUser } from '../types/index.js';

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
  company?: string;
  companyId?: string;
  department?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  company?: string;
  department?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  company?: string;
  department?: string;
  isActive?: boolean;
}

export interface UserListResponse {
  users: IUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ============================================
// FUNÇÃO AUXILIAR PARA EXTRAIR DADOS DA RESPOSTA
// ============================================
function extractData<T>(response: any): T {
  // Se response.data.data existir, usar
  if (response.data?.data) {
    return response.data.data;
  }

  // Se response.data existir, usar
  if (response.data) {
    return response.data;
  }

  // Fallback: retornar o próprio response
  return response;
}

function extractUser(response: any): IUser {
  const data = extractData<any>(response);

  // Tentar diferentes estruturas
  return data.user || data;
}

export const adminService = {
  async listUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    const params = new URLSearchParams();

    if (filters.page) {
      params.append('page', String(filters.page));
    }

    if (filters.limit) {
      params.append('limit', String(filters.limit));
    }

    if (filters.role) {
      params.append('role', filters.role);
    }

    if (filters.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.company) {
      params.append('company', filters.company);
    }

    if (filters.companyId) {
      params.append('companyId', filters.companyId);
    }

    if (filters.department) {
      params.append('department', filters.department);
    }

    const response = await api.get(`/admin/users?${params.toString()}`);
    const data = extractData<any>(response);

    // Retornar buscando a paginação diretamente na raiz da resposta HTTP (response.data)
    return {
      users: data.users || [],
      pagination: response.data?.pagination || data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      }
    };
  },

  async getUserById(id: string): Promise<IUser> {
    const response = await api.get(`/admin/users/${id}`);

    return extractUser(response);
  },

  async createUser(data: CreateUserData): Promise<IUser> {
    const response = await api.post('/admin/users', data);

    return extractUser(response);
  },

  async updateUser(id: string, data: UpdateUserData): Promise<IUser> {
    const response = await api.put(`/admin/users/${id}`, data);

    return extractUser(response);
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async reactivateUser(id: string): Promise<IUser> {
    const response = await api.post(`/admin/users/${id}/reactivate`);

    return extractUser(response);
  },

  async resetPassword(id: string, password: string): Promise<void> {
    await api.post(`/admin/users/${id}/reset-password`, { password });
  },
};