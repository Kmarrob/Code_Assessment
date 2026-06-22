// frontend/src/services/user.service.ts
import api from './api';
import { ApiResponse } from '../types';

export interface UserControl {
  assignmentId: string;
  control: {
    _id: string;
    id: string;
    nome: string;
    dominioDeSI: string[];
    tipoDeControle: string[];
    nota?: string;
  };
  assignedBy: {
    name: string;
    email: string;
  };
  assignedAt: string;
  status: string;
  response: any | null;
}

export interface UserStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
}

export interface UserProgress {
  stats: UserStats;
  controls: UserControl[];
}

export const userService = {
  /**
   * Obter controles do usuário
   */
  async getControls(): Promise<UserControl[]> {
    const response = await api.get<ApiResponse<UserControl[]>>('/user/controls');
    return response.data.data;
  },

  /**
   * Obter estatísticas do usuário
   */
  async getStats(): Promise<UserStats> {
    const response = await api.get<ApiResponse<UserStats>>('/user/stats');
    return response.data.data;
  },

  /**
   * Obter progresso do usuário
   */
  async getProgress(): Promise<UserProgress> {
    const response = await api.get<ApiResponse<UserProgress>>('/user/progress');
    return response.data.data;
  },

  /**
   * Salvar resposta de um controle
   */
  async saveResponse(data: {
    assignmentId: string;
    maturityLevel: string;
    scenarioDescription?: string;
    evidence?: string[];
    notes?: string;
  }): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/user/responses', data);
    return response.data.data;
  },
};