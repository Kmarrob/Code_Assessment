// frontend/src/services/audit.service.ts
import api from './api.js';

export interface AuditLog {
  _id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  companyId?: string;
  companyName?: string;
  action: string;
  category: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  resource: string;
  resourceId?: string;
  resourceName?: string;
  details?: any;
  success: boolean;
  errorMessage?: string;
  errorCode?: string;
  duration?: number;
  ip: string;
  userAgent: string;
  origin?: string;
  referer?: string;
  method?: string;
  path?: string;
  query?: any;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditFilters {
  page?: number;
  limit?: number;
  action?: string;
  category?: string;
  level?: string;
  userId?: string;
  userEmail?: string;
  companyId?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditStats {
  total: number;
  days: number;
  byCategory: Array<{ _id: string; count: number }>;
  byAction: Array<{ _id: string; count: number }>;
  byLevel: Array<{ _id: string; count: number }>;
  bySuccess: Array<{ _id: boolean; count: number }>;
  byDay: Array<{ _id: string; count: number }>;
}

export const auditService = {
  /**
   * Listar logs com filtros
   */
  async listLogs(filters?: AuditFilters): Promise<{ logs: AuditLog[]; pagination: any }> {
    const response = await api.get('/admin/audit/logs', { params: filters });
    return response.data;
  },

  /**
   * Obter estatísticas de logs
   */
  async getStats(days?: number): Promise<AuditStats> {
    const response = await api.get('/admin/audit/stats', { params: { days } });
    return response.data.data;
  },

  /**
   * Buscar log por ID
   */
  async getLogById(id: string): Promise<AuditLog> {
    const response = await api.get(`/admin/audit/logs/${id}`);
    return response.data.data.log;
  },

  /**
   * Exportar logs (CSV ou JSON)
   */
  async exportLogs(filters?: AuditFilters, format: 'csv' | 'json' = 'json'): Promise<Blob> {
    const response = await api.get('/admin/audit/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },
};