// frontend/src/services/document.service.ts
import api from './api';

export type DocumentCategory = 'policy' | 'procedure' | 'evidence' | 'other';
export type DocumentStatus = 'draft' | 'active' | 'archived';

export interface CompanyDocument {
  _id: string;
  companyId: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  subcategory?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  status: DocumentStatus;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  tags?: string[];
  controlIds?: Array<{
    _id: string;
    id: string;
    nome: string;
  }>;
  metadata?: Record<string, any>;
}

export interface DocumentStats {
  total: number;
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

export interface DocumentsResponse {
  success: boolean;
  data: CompanyDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface UploadDocumentData {
  title: string;
  description?: string;
  category: DocumentCategory;
  subcategory?: string;
  file: File;
  expiresAt?: string;
  tags?: string[];
  controlIds?: string[];
  metadata?: Record<string, any>;
}

export const documentService = {
  /**
   * Listar documentos da empresa
   */
  async getDocuments(params?: {
    page?: number;
    limit?: number;
    category?: DocumentCategory;
    status?: DocumentStatus;
    search?: string;
    controlId?: string;
  }): Promise<DocumentsResponse> {
    const response = await api.get<DocumentsResponse>('/api/documents', { params });
    return response.data;
  },

  /**
   * Buscar documento por ID
   */
  async getDocumentById(documentId: string): Promise<CompanyDocument> {
    const response = await api.get<{ success: boolean; data: CompanyDocument }>(
      `/api/documents/${documentId}`
    );
    return response.data.data;
  },

  /**
   * Upload de novo documento
   */
  async uploadDocument(data: UploadDocumentData): Promise<CompanyDocument> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('category', data.category);
    if (data.subcategory) formData.append('subcategory', data.subcategory);
    formData.append('file', data.file);
    if (data.expiresAt) formData.append('expiresAt', data.expiresAt);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.controlIds) formData.append('controlIds', JSON.stringify(data.controlIds));
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

    const response = await api.post<{ success: boolean; data: CompanyDocument }>(
      '/api/documents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Atualizar documento
   */
  async updateDocument(
    documentId: string,
    data: Partial<Omit<CompanyDocument, '_id' | 'companyId' | 'uploadedBy' | 'uploadedAt' | 'createdAt' | 'updatedAt'>>
  ): Promise<CompanyDocument> {
    const response = await api.patch<{ success: boolean; data: CompanyDocument }>(
      `/api/documents/${documentId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Excluir documento
   */
  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/api/documents/${documentId}`);
  },

  /**
   * Arquivar documento
   */
  async archiveDocument(documentId: string): Promise<CompanyDocument> {
    const response = await api.patch<{ success: boolean; data: CompanyDocument }>(
      `/api/documents/${documentId}/archive`
    );
    return response.data.data;
  },

  /**
   * Restaurar documento arquivado
   */
  async restoreDocument(documentId: string): Promise<CompanyDocument> {
    const response = await api.patch<{ success: boolean; data: CompanyDocument }>(
      `/api/documents/${documentId}/restore`
    );
    return response.data.data;
  },

  /**
   * Baixar documento
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await api.get(`/api/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Obter estatísticas de documentos
   */
  async getStats(): Promise<DocumentStats> {
    const response = await api.get<{ success: boolean; data: DocumentStats }>('/api/documents/stats');
    return response.data.data;
  },

  /**
   * Buscar documentos por controle
   */
  async getDocumentsByControl(controlId: string): Promise<CompanyDocument[]> {
    const response = await api.get<{ success: boolean; data: CompanyDocument[] }>(
      `/api/documents/control/${controlId}`
    );
    return response.data.data;
  },

  /**
   * Obter o nome amigável da categoria
   */
  getCategoryLabel(category: DocumentCategory): string {
    const map: Record<DocumentCategory, string> = {
      policy: '📋 Política',
      procedure: '📄 Procedimento',
      evidence: '📎 Evidência',
      other: '📁 Outros',
    };
    return map[category] || category;
  },

  /**
   * Obter a cor da categoria
   */
  getCategoryColor(category: DocumentCategory): string {
    const map: Record<DocumentCategory, string> = {
      policy: 'bg-blue-100 text-blue-800',
      procedure: 'bg-green-100 text-green-800',
      evidence: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return map[category] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Formatar tamanho do arquivo
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
  },
};