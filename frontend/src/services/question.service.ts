// frontend/src/services/question.service.ts
import api from './api';
import { ApiResponse } from '../types';

export interface Question {
  _id: string;
  controlId: string;
  controlName: string;
  controlCategory: string;
  text: string;
  objective: string;
  answerImplemented: string;
  answerPartial: string;
  answerNotImplemented: string;
  guidance: string;
  attachmentUrl: string;
  attachmentName: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const questionService = {
  /**
   * Listar perguntas (Admin)
   */
  async listQuestions(params?: {
    search?: string;
    category?: string;
    active?: boolean;
    controlId?: string;
  }): Promise<Question[]> {
    const response = await api.get<ApiResponse<Question[]>>('/admin/questions', { params });
    return response.data.data;
  },

  /**
   * Buscar perguntas por controle (Admin)
   */
  async getQuestionsByControl(controlId: string): Promise<Question[]> {
    const response = await api.get<ApiResponse<Question[]>>(`/admin/questions/control/${controlId}`);
    return response.data.data;
  },

  /**
   * Buscar perguntas por controle (Usuário - Rota Pública Protegida)
   */
  async getUserQuestionsByControl(controlId: string): Promise<Question[]> {
    const response = await api.get<ApiResponse<Question[]>>(`/user/questions/control/${controlId}`);
    return response.data.data;
  },

  /**
   * Buscar pergunta por ID (Admin)
   */
  async getQuestionById(id: string): Promise<Question> {
    const response = await api.get<ApiResponse<Question>>(`/admin/questions/${id}`);
    return response.data.data;
  },

  /**
   * Criar pergunta (Admin)
   */
  async createQuestion(data: Partial<Question>): Promise<Question> {
    const response = await api.post<ApiResponse<Question>>('/admin/questions', data);
    return response.data.data;
  },

  /**
   * Atualizar pergunta (Admin)
   */
  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    const response = await api.put<ApiResponse<Question>>(`/admin/questions/${id}`, data);
    return response.data.data;
  },

  /**
   * Deletar pergunta (Admin)
   */
  async deleteQuestion(id: string): Promise<void> {
    await api.delete(`/admin/questions/${id}`);
  },

  /**
   * Ativar/Desativar pergunta (Admin)
   */
  async toggleActive(id: string): Promise<Question> {
    const response = await api.patch<ApiResponse<Question>>(`/admin/questions/${id}/toggle`);
    return response.data.data;
  },
};