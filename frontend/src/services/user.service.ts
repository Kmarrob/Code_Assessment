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

// 🆕 TIPOS PARA PROGRESSO
export interface InProgressActivity {
  assignmentId: string;
  controlId: string;
  controlCode: string;
  controlName: string;
  progressStatus: 'in_progress' | 'interrupted';
  lastActivityAt: string;
  partialData: {
    maturityLevel?: string;
    scenarioDescription?: string;
    notes?: string;
    [key: string]: any;
  };
  isInterrupted: boolean;
  domain: string[];
}

export interface AssignmentProgress {
  assignmentId: string;
  controlId: string;
  controlCode: string;
  controlName: string;
  progressStatus: 'in_progress' | 'interrupted';
  lastActivityAt: string;
  partialData: any;
  isInterrupted: boolean;
  existingResponse: {
    maturityLevel: string;
    scenarioDescription: string;
    observations: string;
  };
}

export interface SaveProgressData {
  assignmentId: string;
  partialData: {
    maturityLevel?: string;
    scenarioDescription?: string;
    notes?: string;
    [key: string]: any;
  };
  progressStatus: 'in_progress' | 'interrupted';
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

  // ============================================
  // 🆕 NOVOS MÉTODOS PARA PROGRESSO (ADICIONADOS - NADA FOI EXCLUÍDO)
  // ============================================

  /**
   * Salvar progresso parcial de um controle (em andamento)
   */
  async saveProgress(data: SaveProgressData): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/user/progress', data);
    return response.data.data;
  },

  /**
   * Buscar atividades em andamento/interrompidas do usuário
   */
  async getInProgressActivities(): Promise<InProgressActivity[]> {
    const response = await api.get<ApiResponse<InProgressActivity[]>>('/user/progress/in-progress');
    return response.data.data;
  },

  /**
   * Verificar se há atividades pendentes
   */
  async hasPendingActivity(): Promise<boolean> {
    const response = await api.get<ApiResponse<{ hasPending: boolean }>>('/user/progress/has-pending');
    return response.data.data.hasPending;
  },

  /**
   * Buscar progresso de uma atribuição específica
   */
  async getProgressByAssignment(assignmentId: string): Promise<AssignmentProgress | null> {
    const response = await api.get<ApiResponse<AssignmentProgress | null>>(`/user/progress/assignment/${assignmentId}`);
    return response.data.data;
  },

  /**
   * Limpar progresso de uma atividade
   */
  async clearProgress(assignmentId: string): Promise<any> {
    const response = await api.delete<ApiResponse<any>>(`/user/progress/assignment/${assignmentId}`);
    return response.data.data;
  },
};