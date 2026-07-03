// frontend/src/services/rep.service.ts
import api from './api';
import { User, ApiResponse } from '../types';

export interface RepUser extends User {
  assignmentsCount: number;
  responsesCount: number;
}

export interface AssignmentResult {
  assigned: number;
  removed?: number;
  skipped: number;
  conflicts?: string[];
  conflictMessage?: string;
  assignments: any[];
}

export interface UserProgress {
  userId: string;
  userName: string;
  userEmail: string;
  total: number;
  completed: number;
  pending: number;
  percentage: number;
  maturityDistribution: {
    'N/A': number;
    '0': number;
    '1': number;
    '2': number;
  };
  details: Array<{
    assignmentId: string;
    controlId: string;
    controlName: string;
    status: string;
    response: any | null;
  }>;
}

export interface OverallProgress {
  totalUsers: number;
  totalAssignments: number;
  totalResponses: number;
  overallPercentage: number;
  userProgress: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    total: number;
    completed: number;
    percentage: number;
  }>;
}

export interface RepStats {
  totalUsers: number;
  totalAssignments: number;
  totalResponses: number;
  statusDistribution: Record<string, number>;
  averageMaturity: number;
  completionRate: number;
}

/**
 * Interface para resposta do endpoint otimizado
 */
export interface UserWithResponses {
  _id: string;
  name: string;
  email: string;
  department: string;
  responses: Array<{
    _id: string;
    controlId: string;
    controlName: string;
    maturityLevel: number;
    scenario: string;
    observations: string;
    updatedAt: string;
  }>;
  totalResponses: number;
  completedResponses: number;
  progress: number;
}

export interface UsersWithResponsesResponse {
  success: boolean;
  data: UserWithResponses[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 🔴 NOVO: Interface para inativação de usuário
 */
export interface InactivateUserData {
  reason: 'Desligado' | 'Mudou de setor' | 'Outros';
  description: string;
}

/**
 * 🔴 NOVO: Interface para revogação de controle
 */
export interface RevokeControlData {
  confirmRevoke: boolean;
  newUserId?: string;
}

/**
 * 🔴 NOVO: Interface para edição de usuário
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  department?: string;
}

export const repService = {
  /**
   * Listar usuários do preposto
   */
  async listUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'active' | 'inactive';
  }): Promise<{ items: RepUser[]; pagination: any }> {
    const response = await api.get<ApiResponse<any>>('/rep/users', { params });
    
    const data = response.data.data;
    const pagination = response.data.pagination;
    
    if (Array.isArray(data)) {
      return {
        items: data as RepUser[],
        pagination: pagination || { page: 1, limit: 10, total: data.length, totalPages: 1 }
      };
    }
    
    if (data && data.items && Array.isArray(data.items)) {
      return {
        items: data.items as RepUser[],
        pagination: data.pagination || pagination
      };
    }
    
    return {
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
    };
  },

  /**
   * 🔴 CORRIGIDO: Criar usuário (senha opcional - sistema gera automaticamente)
   */
  async createUser(data: {
    name: string;
    email: string;
    password?: string; // 🔴 TORNADO OPCIONAL
    company?: string;
    department?: string;
  }): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User }>>('/rep/users', data);
    return response.data.data.user;
  },

  /**
   * 🔴 NOVO: Editar usuário
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>(`/rep/users/${userId}`, data);
    return response.data.data.user;
  },

  /**
   * 🔴 NOVO: Inativar usuário
   */
  async inactivateUser(userId: string, data: InactivateUserData): Promise<User> {
    const response = await api.delete<ApiResponse<{ user: User }>>(`/rep/users/${userId}`, {
      data: data
    });
    return response.data.data.user;
  },

  /**
   * 🔴 NOVO: Revogar controle com reatribuição
   */
  async revokeControl(assignmentId: string, data: RevokeControlData): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/rep/assignments/${assignmentId}/revoke`, data);
    return response.data.data;
  },

  /**
   * Atribuir controles a um usuário - CORRIGIDO FINAL
   */
  async assignControls(data: {
    userId: string;
    controlIds: string[] | Record<string, string>;
    force?: boolean;
  }): Promise<AssignmentResult> {
    // FORÇAR conversão para array de strings
    let controlIdsArray: string[] = [];
    
    if (Array.isArray(data.controlIds)) {
      controlIdsArray = data.controlIds.map(id => String(id));
    } else if (data.controlIds && typeof data.controlIds === 'object') {
      controlIdsArray = Object.values(data.controlIds).map(id => String(id));
    }
    
    console.log('📤 repService - controlIdsArray:', controlIdsArray);
    
    const payload = {
      userId: data.userId,
      controlIds: controlIdsArray,
      force: data.force || false,
    };
    
    console.log('📤 repService - payload:', payload);
    
    const response = await api.post<ApiResponse<AssignmentResult>>('/rep/assignments', payload);
    return response.data.data;
  },

  /**
   * Obter progresso de um usuário
   */
  async getUserProgress(userId: string): Promise<UserProgress> {
    const response = await api.get<ApiResponse<UserProgress>>(`/rep/progress/${userId}`);
    return response.data.data;
  },

  /**
   * Obter progresso geral do preposto
   */
  async getOverallProgress(): Promise<OverallProgress> {
    const response = await api.get<ApiResponse<OverallProgress>>('/rep/progress/overall');
    return response.data.data;
  },

  /**
   * Obter estatísticas do preposto
   */
  async getStats(): Promise<RepStats> {
    const response = await api.get<ApiResponse<RepStats>>('/rep/stats');
    return response.data.data;
  },

  /**
   * Buscar todos os usuários com suas respostas (otimizado)
   * GET /api/rep/users-with-responses
   */
  async getUsersWithResponses(): Promise<UsersWithResponsesResponse> {
    const response = await api.get<UsersWithResponsesResponse>('/rep/users-with-responses');
    return response.data;
  },
};