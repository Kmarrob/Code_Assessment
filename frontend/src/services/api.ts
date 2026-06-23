import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, AuthTokens } from '../types/index.js';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants.js';
import { formatError } from '../utils/helpers.js';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await axios.post<ApiResponse<{ tokens: AuthTokens }>>(
          import.meta.env.VITE_API_URL 
            ? `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.AUTH.REFRESH}`
            : API_ENDPOINTS.AUTH.REFRESH,
          { refreshToken }
        );
        
        const { tokens } = response.data.data!;
        
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return api(originalRequest);
        
      } catch (refreshError) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper para chamadas API
export async function apiCall<T>(
  fn: () => Promise<{ data: ApiResponse<T> }>
): Promise<T> {
  try {
    const response = await fn();
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro na requisição');
    }
    return response.data.data as T;
  } catch (error) {
    throw new Error(formatError(error));
  }
}

export default api;