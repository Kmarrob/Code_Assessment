// frontend/src/types/index.ts
export enum UserRole {
  ADMIN = 'admin',
  REP = 'rep',
  CONSULTANT = 'consultant',
  USER = 'user',
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  department?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
  department?: string;
  role?: UserRole;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ============================================
// 🔴 NOVO (v17): Tipos de Relatório
// ============================================
export * from './report.js';