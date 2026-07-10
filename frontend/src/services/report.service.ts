// frontend/src/services/report.service.ts
import api from './api.js';
import { ApiResponse } from '../types/index.js';
import { Report, ReportDashboardData, ReportListResponse, UpdateReportData, RoadmapData } from '../types/report.js';

export const reportService = {
  /**
   * Obter dashboard do relat車rio da empresa do preposto
   * GET /api/reports/dashboard
   */
  async getDashboard(): Promise<ReportDashboardData> {
    const response = await api.get<ApiResponse<ReportDashboardData>>('/reports/dashboard');
    return response.data.data;
  },

  /**
   * ?? NOVO: Obter dashboard completo do relat車rio para ADMIN (com companyId)
   * GET /api/reports/admin/dashboard/:companyId
   */
  async getAdminDashboard(companyId: string): Promise<ReportDashboardData> {
    const response = await api.get<ApiResponse<ReportDashboardData>>(`/reports/admin/dashboard/${companyId}`);
    return response.data.data;
  },

  /**
   * Obter relat車rio de uma empresa espec赤fica
   * GET /api/reports/company/:companyId
   */
  async getReportByCompany(companyId: string): Promise<Report> {
    const response = await api.get<ApiResponse<Report>>(`/reports/company/${companyId}`);
    return response.data.data;
  },

  /**
   * Gerar dados autom芍ticos do relat車rio
   * POST /api/reports/company/:companyId/generate
   */
  async generateReport(companyId: string): Promise<Report> {
    const response = await api.post<ApiResponse<Report>>(`/reports/company/${companyId}/generate`);
    return response.data.data;
  },

  /**
   * Atualizar relat車rio (campos edit芍veis)
   * PUT /api/reports/company/:companyId
   */
  async updateReport(companyId: string, data: UpdateReportData): Promise<Report> {
    const response = await api.put<ApiResponse<Report>>(`/reports/company/${companyId}`, data);
    return response.data.data;
  },

  /**
   * Listar todos os relat車rios (apenas ADMIN)
   * GET /api/reports
   */
  async listReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ReportListResponse> {
    const response = await api.get<ApiResponse<ReportListResponse>>('/reports', { params });
    return response.data.data;
  },

  /**
   * ?? NOVO: Obter dados para a Matriz de Prioriza??o
   * GET /api/reports/priorization/:companyId
   */
  async getPriorizationMatrix(companyId: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/reports/priorization/${companyId}`);
    return response.data.data.matrix || response.data.data || [];
  },

  /**
   * ?? NOVO: Obter Roadmap de Implementacao
   * GET /api/reports/roadmap/:companyId
   */
  async getRoadmap(companyId: string): Promise<RoadmapData> {
    const response = await api.get<ApiResponse<RoadmapData>>(`/reports/roadmap/${companyId}`);
    return response.data.data;
  },
};