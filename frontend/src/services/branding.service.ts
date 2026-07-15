// frontend/src/services/branding.service.ts
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

export const brandingService = {
  /**
   * Upload da logo da empresa (apenas ADMIN)
   * POST /api/admin/company/:companyId/branding/logo
   */
  async uploadLogo(companyId: string, file: File): Promise<BrandingData> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await api.post<ApiResponse<BrandingData>>(
      `/admin/company/${companyId}/branding/logo`,
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
   * Upload do favicon da empresa (apenas ADMIN)
   * POST /api/admin/company/:companyId/branding/favicon
   */
  async uploadFavicon(companyId: string, file: File): Promise<BrandingData> {
    const formData = new FormData();
    formData.append('favicon', file);

    const response = await api.post<ApiResponse<BrandingData>>(
      `/admin/company/${companyId}/branding/favicon`,
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
   * Remover logo da empresa (apenas ADMIN)
   * DELETE /api/admin/company/:companyId/branding/logo
   */
  async removeLogo(companyId: string): Promise<{ logoRemoved: boolean }> {
    const response = await api.delete<ApiResponse<{ logoRemoved: boolean }>>(
      `/admin/company/${companyId}/branding/logo`
    );
    return response.data.data;
  },

  /**
   * Remover favicon da empresa (apenas ADMIN)
   * DELETE /api/admin/company/:companyId/branding/favicon
   */
  async removeFavicon(companyId: string): Promise<{ faviconRemoved: boolean }> {
    const response = await api.delete<ApiResponse<{ faviconRemoved: boolean }>>(
      `/admin/company/${companyId}/branding/favicon`
    );
    return response.data.data;
  },

  /**
   * Atualizar configurações de branding (apenas ADMIN)
   * PUT /api/admin/company/:companyId/branding/settings
   */
  async updateSettings(
    companyId: string,
    settings: {
      showLogoInHeader?: boolean;
      showLogoInReport?: boolean;
      useCustomColors?: boolean;
    }
  ): Promise<{ settings: BrandingSettings }> {
    const response = await api.put<ApiResponse<{ settings: BrandingSettings }>>(
      `/admin/company/${companyId}/branding/settings`,
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