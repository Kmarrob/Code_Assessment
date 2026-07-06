// frontend/src/services/report.service.ts
import api from './api.js';
import { ApiResponse } from '../types/index.js';
import { Report, ReportDashboardData, ReportListResponse, UpdateReportData } from '../types/report.js';

export const reportService = {
  /**
   * Obter dashboard do relatório da empresa do preposto
   * GET /api/reports/dashboard
   */
  async getDashboard(): Promise<ReportDashboardData> {
    const response = await api.get<ApiResponse<ReportDashboardData>>('/reports/dashboard');
    return response.data.data;
  },

  /**
   * Obter relatório de uma empresa específica
   * GET /api/reports/company/:companyId
   */
  async getReportByCompany(companyId: string): Promise<Report> {
    const response = await api.get<ApiResponse<Report>>(`/reports/company/${companyId}`);
    return response.data.data;
  },

  /**
   * Gerar dados automáticos do relatório
   * POST /api/reports/company/:companyId/generate
   */
  async generateReport(companyId: string): Promise<Report> {
    const response = await api.post<ApiResponse<Report>>(`/reports/company/${companyId}/generate`);
    return response.data.data;
  },

  /**
   * Atualizar relatório (campos editáveis)
   * PUT /api/reports/company/:companyId
   */
  async updateReport(companyId: string, data: UpdateReportData): Promise<Report> {
    const response = await api.put<ApiResponse<Report>>(`/reports/company/${companyId}`, data);
    return response.data.data;
  },

  /**
   * Listar todos os relatórios (apenas ADMIN)
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
};