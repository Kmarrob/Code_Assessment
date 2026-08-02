import api from '../../../services/api';
import {
  GovernanceDocument,
  GovernanceFilters,
  CreateGovernanceDocumentDTO,
  UpdateGovernanceDocumentDTO,
  CreatePolicyDTO,
  CreateStandardDTO,
  CreateProcedureDTO,
  CreateWorkInstructionDTO,
  CreateRecordDTO,
} from '../types/governance.types';

const BASE_URL = '/api/governance';

/**
 * Serviço para o módulo de governança (Admin)
 */
export const governanceService = {
  // ============================================
  // ADMIN - Documentos Gerais
  // ============================================

  async listDocuments(filters?: GovernanceFilters): Promise<GovernanceDocument[]> {
    const response = await api.get(`${BASE_URL}/admin/documents`, { params: filters });
    return response.data;
  },

  async getDocument(id: string): Promise<GovernanceDocument> {
    const response = await api.get(`${BASE_URL}/admin/documents/${id}`);
    return response.data;
  },

  async createDocument(data: CreateGovernanceDocumentDTO): Promise<GovernanceDocument> {
    const response = await api.post(`${BASE_URL}/admin/documents`, data);
    return response.data;
  },

  async updateDocument(id: string, data: UpdateGovernanceDocumentDTO): Promise<GovernanceDocument> {
    const response = await api.put(`${BASE_URL}/admin/documents/${id}`, data);
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/admin/documents/${id}`);
  },

  async approveDocument(id: string): Promise<GovernanceDocument> {
    const response = await api.patch(`${BASE_URL}/admin/documents/${id}/approve`);
    return response.data;
  },

  async getDocumentsByLevel(level: 1 | 2 | 3 | 4 | 5): Promise<GovernanceDocument[]> {
    const response = await api.get(`${BASE_URL}/admin/documents/level/${level}`);
    return response.data;
  },

  async getDocumentTree(): Promise<any> {
    const response = await api.get(`${BASE_URL}/admin/documents/tree`);
    return response.data;
  },

  // ============================================
  // ADMIN - Políticas (Nível 1)
  // ============================================

  async createPolicy(data: CreatePolicyDTO): Promise<GovernanceDocument> {
    const response = await api.post(`${BASE_URL}/admin/documents`, {
      ...data,
      level: 1,
    });
    return response.data;
  },

  async listPolicies(): Promise<GovernanceDocument[]> {
    return this.getDocumentsByLevel(1);
  },

  // ============================================
  // ADMIN - Normas (Nível 2)
  // ============================================

  async createStandard(data: CreateStandardDTO): Promise<GovernanceDocument> {
    const response = await api.post(`${BASE_URL}/admin/documents`, {
      ...data,
      level: 2,
    });
    return response.data;
  },

  async listStandards(): Promise<GovernanceDocument[]> {
    return this.getDocumentsByLevel(2);
  },

  // ============================================
  // ADMIN - Procedimentos (Nível 3)
  // ============================================

  async createProcedure(data: CreateProcedureDTO): Promise<GovernanceDocument> {
    const response = await api.post(`${BASE_URL}/admin/documents`, {
      ...data,
      level: 3,
    });
    return response.data;
  },

  async listProcedures(): Promise<GovernanceDocument[]> {
    return this.getDocumentsByLevel(3);
  },

  // ============================================
  // ADMIN - Instruções de Trabalho (Nível 4)
  // ============================================

  async createWorkInstruction(data: CreateWorkInstructionDTO): Promise<GovernanceDocument> {
    const response = await api.post(`${BASE_URL}/admin/documents`, {
      ...data,
      level: 4,
    });
    return response.data;
  },

  async listWorkInstructions(): Promise<GovernanceDocument[]> {
    return this.getDocumentsByLevel(4);
  },

  // ============================================
  // ADMIN - Registros (Nível 5)
  // ============================================

  async createRecord(data: CreateRecordDTO): Promise<GovernanceDocument> {
    const response = await api.post(`${BASE_URL}/admin/documents`, {
      ...data,
      level: 5,
    });
    return response.data;
  },

  async listRecords(): Promise<GovernanceDocument[]> {
    return this.getDocumentsByLevel(5);
  },

  // ============================================
  // REP (Enterprise) - Visualização
  // ============================================

  async repListDocuments(filters?: GovernanceFilters): Promise<GovernanceDocument[]> {
    const response = await api.get(`${BASE_URL}/rep/documents`, { params: filters });
    return response.data;
  },

  async repGetDocument(id: string): Promise<GovernanceDocument> {
    const response = await api.get(`${BASE_URL}/rep/documents/${id}`);
    return response.data;
  },

  async repGetDocumentsByLevel(level: 1 | 2 | 3 | 4 | 5): Promise<GovernanceDocument[]> {
    const response = await api.get(`${BASE_URL}/rep/documents/level/${level}`);
    return response.data;
  },

  async repGetDocumentTree(): Promise<any> {
    const response = await api.get(`${BASE_URL}/rep/documents/tree`);
    return response.data;
  },
};