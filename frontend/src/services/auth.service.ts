import api from './api.js';
import { API_ENDPOINTS } from '../utils/constants.js';
import { IUser, AuthTokens, LoginCredentials, RegisterData } from '../types/index.js';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: IUser; tokens: AuthTokens }> {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data.data;
  },

  async register(data: RegisterData): Promise<IUser> {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data.data.user;
  },

  async logout(): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async getProfile(): Promise<IUser> {
    const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data.data.user;
  },

  async updateProfile(data: Partial<IUser>): Promise<IUser> {
    const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, data);
    return response.data.data.user;
  },

  async listUsers(params?: { page?: number; limit?: number; role?: string; search?: string }): Promise<{
    users: IUser[];
    pagination: any;
  }> {
    const response = await api.get(API_ENDPOINTS.AUTH.USERS, { params });
    return response.data.data;
  },

  /**
   * 🔴 NOVO: Validar token de redefinição de senha
   */
  async validateResetToken(token: string): Promise<{ success: boolean; userId: string }> {
    const response = await api.post('/auth/validate-reset-token', { token });
    return response.data.data;
  },

  /**
   * 🔴 NOVO: Redefinir senha
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },
};