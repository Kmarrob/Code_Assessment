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

// ============================================
// 🔴 NOVO (v19): Tipos de Recomendação
// ============================================
export * from './recommendation.js';// frontend/src/types/index.ts
export enum UserRole {
  ADMIN = 'admin',
  REP = 'rep',
  CONSULTANT = 'consultant',
  USER = 'user',

  // ============================================
  // 🆕 NOVO (v52.1) — ROLES DE AUDITORIA INTERNA
  // ============================================
  //
  // MOTIVO:
  //   Os roles auditor_lead, auditor e observer foram
  //   introduzidos no backend em v52.0 e precisam estar
  //   espelhados no frontend para que:
  //     - O AuthContext persista o role corretamente.
  //     - O ProtectedRoute permita o acesso às rotas
  //       /auditor-lead/*, /auditor/* e /observer/*.
  //     - Os dashboards por role funcionem.
  //
  // COMPATIBILIDADE:
  //   - Os 4 roles antigos permanecem INALTERADOS.
  //   - Os 3 novos roles são ADITIVOS.
  //   - Tokens JWT antigos continuam válidos.
  //
  // ============================================
  AUDITOR_LEAD = 'auditor_lead',   // Auditor Líder — aprova planos, executa auditoria
  AUDITOR = 'auditor',             // Auditor — executa auditoria em parceria
  OBSERVER = 'observer',           // Observador — somente leitura de tudo relacionado ao plano
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

// ============================================
// 🔴 NOVO (v19): Tipos de Recomendação
// ============================================
export * from './recommendation.js';