import api from './api.js';
import { ApiResponse } from '../types/index.js';

export interface BrandingLogo {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  uploadedAt: string | null;
  uploadedBy: string | null;
}

export interface BrandingFavicon {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string | null;
  uploadedBy: string | null;
}

export interface BrandingColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  extractedFrom: string | null;
}

export interface BrandingSettings {
  showLogoInHeader: boolean;
  showLogoInReport: boolean;
  useCustomColors: boolean;
}

export interface BrandingData {
  companyId: string;
  companyName: string;
  branding: {
    logo: BrandingLogo | null;
    favicon: BrandingFavicon | null;
    colors: BrandingColors;
    settings: BrandingSettings;
  };
}

export interface PublicBrandingData {
  companyId: string;
  companyName: string;
  logo: {
    url: string;
    filename: string;
  } | null;
  favicon: {
    url: string;
    filename: string;
  } | null;
  colors: BrandingColors;
  settings: BrandingSettings;
}

// 🔴 CORREÇÃO: Função auxiliar para determinar se o usuário é ADMIN
const isAdmin = (): boolean => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    return user?.role === 'admin';
  } catch {
    return false;
  }
};

export const brandingService = {
  /**
   * Upload da logo da empresa
   * POST /api/admin/company/:companyId/branding/logo (ADMIN)
   * POST /api/rep/company/:companyId/branding/logo (REP)
   */
  async uploadLogo(companyId: string, file: File): Promise<BrandingData> {
    const formData = new FormData();
    formData.append('logo', file);

    // 🔴 CORREÇÃO: Escolher rota baseada no role
    const route = isAdmin() 
      ? `/admin/company/${companyId}/branding/logo`
      : `/rep/company/${companyId}/branding/logo`;

    const response = await api.post<ApiResponse<BrandingData>>(
      route,
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
   * Upload do favicon da empresa
   * POST /api/admin/company/:companyId/branding/favicon (ADMIN)
   * POST /api/rep/company/:companyId/branding/favicon (REP)
   */
  async uploadFavicon(companyId: string, file: File): Promise<BrandingData> {
    const formData = new FormData();
    formData.append('favicon', file);

    // 🔴 CORREÇÃO: Escolher rota baseada no role
    const route = isAdmin() 
      ? `/admin/company/${companyId}/branding/favicon`
      : `/rep/company/${companyId}/branding/favicon`;

    const response = await api.post<ApiResponse<BrandingData>>(
      route,
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
   * Obter branding da empresa
   * GET /api/branding/company/:companyId/branding
   * Acesso: ADMIN ou REP da própria empresa
   */
  async getBranding(companyId: string): Promise<BrandingData> {
    const response = await api.get<ApiResponse<BrandingData>>(
      `/branding/company/${companyId}/branding`
    );
    return response.data.data;
  },

  /**
   * Remover logo da empresa
   * DELETE /api/admin/company/:companyId/branding/logo (ADMIN)
   * DELETE /api/rep/company/:companyId/branding/logo (REP)
   */
  async removeLogo(companyId: string): Promise<{ logoRemoved: boolean }> {
    // 🔴 CORREÇÃO: Escolher rota baseada no role
    const route = isAdmin() 
      ? `/admin/company/${companyId}/branding/logo`
      : `/rep/company/${companyId}/branding/logo`;

    const response = await api.delete<ApiResponse<{ logoRemoved: boolean }>>(
      route
    );
    return response.data.data;
  },

  /**
   * Remover favicon da empresa
   * DELETE /api/admin/company/:companyId/branding/favicon (ADMIN)
   * DELETE /api/rep/company/:companyId/branding/favicon (REP)
   */
  async removeFavicon(companyId: string): Promise<{ faviconRemoved: boolean }> {
    // 🔴 CORREÇÃO: Escolher rota baseada no role
    const route = isAdmin() 
      ? `/admin/company/${companyId}/branding/favicon`
      : `/rep/company/${companyId}/branding/favicon`;

    const response = await api.delete<ApiResponse<{ faviconRemoved: boolean }>>(
      route
    );
    return response.data.data;
  },

  /**
   * Atualizar configurações de branding
   * PUT /api/admin/company/:companyId/branding/settings (ADMIN)
   * PUT /api/rep/company/:companyId/branding/settings (REP)
   */
  async updateSettings(
    companyId: string,
    settings: {
      showLogoInHeader?: boolean;
      showLogoInReport?: boolean;
      useCustomColors?: boolean;
    }
  ): Promise<{ settings: BrandingSettings }> {
    // 🔴 CORREÇÃO: Escolher rota baseada no role
    const route = isAdmin() 
      ? `/admin/company/${companyId}/branding/settings`
      : `/rep/company/${companyId}/branding/settings`;

    const response = await api.put<ApiResponse<{ settings: BrandingSettings }>>(
      route,
      settings
    );
    return response.data.data;
  },

  /**
   * Obter branding público da empresa (sem autenticação)
   * GET /api/branding/:companyId
   */
  async getPublicBranding(companyId: string): Promise<PublicBrandingData> {
    const response = await api.get<ApiResponse<PublicBrandingData>>(
      `/branding/${companyId}`
    );
    return response.data.data;
  },
};