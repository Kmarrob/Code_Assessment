# scripts/setup-frontend.ps1
# Script para configurar o frontend do Code_Assessment

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
)

$ErrorActionPreference = 'Stop'

# Cores para output
$Colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Blue'
    Step = 'Magenta'
}

function Write-Step {
    param($Message)
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
    Write-Host "║ $Message" -ForegroundColor $Colors.Header
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Colors.Header
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️ $Message" -ForegroundColor $Colors.Warning
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor $Colors.Error
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Colors.Info
}

function Write-StepDetail {
    param($Message)
    Write-Host "  → $Message" -ForegroundColor $Colors.Step
}

# ============================================
# PARTE 1: CONFIGURAR FRONTEND
# ============================================
Write-Step "PARTE 2/4: CONFIGURANDO FRONTEND"

# Verificar se Node.js está instalado
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Node.js não está instalado. Por favor, instale o Node.js primeiro."
    exit 1
}
Write-Info "Node.js versão: $nodeVersion"

# 1.1 - package.json
Write-Info "Criando frontend/package.json..."
@'
{
  "name": "code-assessment-frontend",
  "version": "1.0.0",
  "description": "Frontend do sistema Code_Assessment",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "@hookform/resolvers": "^3.3.2",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@tanstack/react-query": "^5.12.2",
    "@tanstack/react-query-devtools": "^5.12.2",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.2",
    "vite": "^5.0.8",
    "vitest": "^1.0.4"
  }
}
'@ | Out-File -FilePath "$BaseDir\frontend\package.json" -Encoding UTF8
Write-Success "frontend/package.json criado"

# 1.2 - vite.config.ts
Write-Info "Criando frontend/vite.config.ts..."
@'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@hookform/resolvers', 'react-hook-form', 'zod'],
        },
      },
    },
  },
});
'@ | Out-File -FilePath "$BaseDir\frontend\vite.config.ts" -Encoding UTF8
Write-Success "frontend/vite.config.ts criado"

# 1.3 - tsconfig.json
Write-Info "Criando frontend/tsconfig.json..."
@'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@contexts/*": ["src/contexts/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
'@ | Out-File -FilePath "$BaseDir\frontend\tsconfig.json" -Encoding UTF8
Write-Success "frontend/tsconfig.json criado"

# 1.4 - tsconfig.node.json
Write-Info "Criando frontend/tsconfig.node.json..."
@'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
'@ | Out-File -FilePath "$BaseDir\frontend\tsconfig.node.json" -Encoding UTF8
Write-Success "frontend/tsconfig.node.json criado"

# 1.5 - tailwind.config.js
Write-Info "Criando frontend/tailwind.config.js..."
@'
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
'@ | Out-File -FilePath "$BaseDir\frontend\tailwind.config.js" -Encoding UTF8
Write-Success "frontend/tailwind.config.js criado"

# 1.6 - postcss.config.js
Write-Info "Criando frontend/postcss.config.js..."
@'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
'@ | Out-File -FilePath "$BaseDir\frontend\postcss.config.js" -Encoding UTF8
Write-Success "frontend/postcss.config.js criado"

# 1.7 - index.html
Write-Info "Criando frontend/index.html..."
@'
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001</title>
    <meta name="description" content="Sistema completo para avaliação de maturidade em Segurança da Informação baseado na ISO 27001" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@ | Out-File -FilePath "$BaseDir\frontend\index.html" -Encoding UTF8
Write-Success "frontend/index.html criado"

# ============================================
# PARTE 2: CRIAR ARQUIVOS DE CÓDIGO FONTE
# ============================================
Write-Step "PARTE 2/4: CRIANDO ARQUIVOS DE CÓDIGO FONTE"

# 2.1 - src/types/index.ts
Write-Info "Criando frontend/src/types/index.ts..."
@'
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
'@ | Out-File -FilePath "$BaseDir\frontend\src\types\index.ts" -Encoding UTF8
Write-Success "frontend/src/types/index.ts criado"

# 2.2 - src/utils/constants.ts
Write-Info "Criando frontend/src/utils/constants.ts..."
@'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REFRESH: `${API_BASE_URL}/auth/refresh-token`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    USERS: `${API_BASE_URL}/auth/users`,
  },
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_DASHBOARD: '/admin',
  REP_DASHBOARD: '/rep',
  CONSULTANT_DASHBOARD: '/consultant',
  USER_DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;
'@ | Out-File -FilePath "$BaseDir\frontend\src\utils\constants.ts" -Encoding UTF8
Write-Success "frontend/src/utils/constants.ts criado"

# 2.3 - src/utils/helpers.ts
Write-Info "Criando frontend/src/utils/helpers.ts..."
@'
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'Ocorreu um erro inesperado';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    rep: 'Preposto',
    consultant: 'Consultor',
    user: 'Usuário',
  };
  return labels[role] || role;
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    rep: 'bg-blue-100 text-blue-800',
    consultant: 'bg-purple-100 text-purple-800',
    user: 'bg-green-100 text-green-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\utils\helpers.ts" -Encoding UTF8
Write-Success "frontend/src/utils/helpers.ts criado"

# 2.4 - src/index.css
Write-Info "Criando frontend/src/index.css..."
@'
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
  }

  #root {
    @apply min-h-screen;
  }
}

@layer components {
  .glass-card {
    @apply bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl;
  }

  .gradient-primary {
    @apply bg-gradient-to-r from-primary-600 to-primary-700;
  }

  .loading-spinner {
    @apply inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent;
  }
}
'@ | Out-File -FilePath "$BaseDir\frontend\src\index.css" -Encoding UTF8
Write-Success "frontend/src/index.css criado"

# 2.5 - src/main.tsx
Write-Info "Criando frontend/src/main.tsx..."
@'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\main.tsx" -Encoding UTF8
Write-Success "frontend/src/main.tsx criado"

# 2.6 - src/App.tsx
Write-Info "Criando frontend/src/App.tsx..."
@'
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { UserRole } from './types/index.js';

// Lazy loading das páginas
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.js'));
const RepDashboard = lazy(() => import('./pages/RepDashboard.js'));
const ConsultantDashboard = lazy(() => import('./pages/ConsultantDashboard.js'));
const UserDashboard = lazy(() => import('./pages/UserDashboard.js'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.js'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1f2937',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner" />
              </div>
            }
          >
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Rotas protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Preposto */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.REP, UserRole.ADMIN]} />}>
                <Route path="/rep" element={<RepDashboard />} />
              </Route>

              {/* Consultor */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                <Route path="/consultant" element={<ConsultantDashboard />} />
              </Route>

              {/* Usuário */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.USER, UserRole.REP, UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                <Route path="/dashboard" element={<UserDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
'@ | Out-File -FilePath "$BaseDir\frontend\src\App.tsx" -Encoding UTF8
Write-Success "frontend/src/App.tsx criado"

# 2.7 - src/services/api.ts
Write-Info "Criando frontend/src/services/api.ts..."
@'
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, AuthTokens } from '../types/index.js';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants.js';
import { formatError } from '../utils/helpers.js';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
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
    
    // Se for erro 401 e não for retry, tentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await axios.post<ApiResponse<{ tokens: AuthTokens }>>(
          API_ENDPOINTS.AUTH.REFRESH,
          { refreshToken }
        );
        
        const { tokens } = response.data.data!;
        
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        
        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, logout
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
'@ | Out-File -FilePath "$BaseDir\frontend\src\services\api.ts" -Encoding UTF8
Write-Success "frontend/src/services/api.ts criado"

# 2.8 - src/services/auth.service.ts
Write-Info "Criando frontend/src/services/auth.service.ts..."
@'
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
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\services\auth.service.ts" -Encoding UTF8
Write-Success "frontend/src/services/auth.service.ts criado"

# 2.9 - src/contexts/AuthContext.tsx
Write-Info "Criando frontend/src/contexts/AuthContext.tsx..."
@'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUser, AuthTokens } from '../types/index.js';
import { authService } from '../services/auth.service.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { formatError } from '../utils/helpers.js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setIsLoading(false);
  }, []);

  // Atualizar usuário no localStorage
  const updateStoredUser = useCallback((userData: IUser | null) => {
    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    setUser(userData);
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: userData, tokens } = await authService.login({ email, password });
      
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      updateStoredUser(userData);
      
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error(formatError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateStoredUser]);

  // Register
  const register = useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      const userData = await authService.register(data);
      toast.success('Registro realizado com sucesso! Faça login para continuar.');
      return userData;
    } catch (error) {
      toast.error(formatError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      updateStoredUser(null);
      toast.success('Logout realizado com sucesso');
    }
  }, [updateStoredUser]);

  // Refresh user
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getProfile();
      updateStoredUser(userData);
    } catch (error) {
      // If can't refresh, logout
      await logout();
    }
  }, [logout, updateStoredUser]);

  // Auto-refresh on mount
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
      refreshUser();
    }
  }, [refreshUser]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile: async (data: Partial<IUser>) => {
      try {
        setIsLoading(true);
        const updatedUser = await authService.updateProfile(data);
        updateStoredUser(updatedUser);
        toast.success('Perfil atualizado com sucesso!');
      } catch (error) {
        toast.error(formatError(error));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\contexts\AuthContext.tsx" -Encoding UTF8
Write-Success "frontend/src/contexts/AuthContext.tsx criado"

# 2.10 - src/components/ui/Button.tsx
Write-Info "Criando frontend/src/components/ui/Button.tsx..."
@'
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/helpers.js';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, loading, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Button.tsx" -Encoding UTF8
Write-Success "frontend/src/components/ui/Button.tsx criado"

# 2.11 - src/components/ui/Input.tsx
Write-Info "Criando frontend/src/components/ui/Input.tsx..."
@'
import React from 'react';
import { cn } from '../../utils/helpers.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={id}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Input.tsx" -Encoding UTF8
Write-Success "frontend/src/components/ui/Input.tsx criado"

# 2.12 - src/components/ui/Card.tsx
Write-Info "Criando frontend/src/components/ui/Card.tsx..."
@'
import React from 'react';
import { cn } from '../../utils/helpers.js';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Card.tsx" -Encoding UTF8
Write-Success "frontend/src/components/ui/Card.tsx criado"

# 2.13 - src/components/ProtectedRoute.tsx
Write-Info "Criando frontend/src/components/ProtectedRoute.tsx..."
@'
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { UserRole } from '../types/index.js';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ProtectedRoute.tsx" -Encoding UTF8
Write-Success "frontend/src/components/ProtectedRoute.tsx criado"

# 2.14 - src/pages/LandingPage.tsx
Write-Info "Criando frontend/src/pages/LandingPage.tsx..."
@'
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { Shield, Users, BarChart3, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Avaliação Completa',
    description: '93 controles da ISO 27001 mapeados e organizados para uma avaliação precisa da maturidade.',
  },
  {
    icon: Users,
    title: 'Gestão de Equipes',
    description: 'Prepostos podem cadastrar usuários e distribuir controles de forma inteligente e sem repetições.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Detalhados',
    description: 'Visualize o nível de maturidade da organização com gráficos e indicadores claros.',
  },
  {
    icon: Zap,
    title: 'Automação Total',
    description: 'Processo digitalizado com scripts PowerShell para setup rápido e automatizado.',
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Code_Assessment</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button>Começar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-16">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Transforme seu assessment manual em digital
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Avalie sua maturidade em<br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Segurança da Informação
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Automatize o processo de assessment baseado na ISO 27001, com gestão de usuários,
              controles e relatórios em tempo real.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="text-base">
                  Iniciar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-base">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tudo o que você precisa para um assessment completo
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Gerencie todo o processo de avaliação de maturidade em um só lugar
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-600 mb-4">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 gradient-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-primary-100 max-w-2xl mx-auto mb-8">
              Cadastre-se agora e transforme seu processo de assessment em uma experiência digital e eficiente.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-primary-700 hover:text-primary-800">
                Criar conta gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Code_Assessment. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\LandingPage.tsx" -Encoding UTF8
Write-Success "frontend/src/pages/LandingPage.tsx criado"

# 2.15 - src/pages/LoginPage.tsx
Write-Info "Criando frontend/src/pages/LoginPage.tsx..."
@'
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Mail, Lock, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <Card className="w-full max-w-md glass-card animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" loading={isLoading}>
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\LoginPage.tsx" -Encoding UTF8
Write-Success "frontend/src/pages/LoginPage.tsx criado"

# 2.16 - src/pages/RegisterPage.tsx
Write-Info "Criando frontend/src/pages/RegisterPage.tsx..."
@'
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { User, Mail, Lock, Building, Shield } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  company: z.string().optional(),
  department: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser(data);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <Card className="w-full max-w-md glass-card animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>
            Comece sua jornada de assessment digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              icon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Empresa"
              placeholder="Nome da empresa"
              icon={<Building className="h-4 w-4" />}
              error={errors.company?.message}
              {...register('company')}
            />
            <Input
              label="Departamento"
              placeholder="Seu departamento"
              icon={<Building className="h-4 w-4" />}
              error={errors.department?.message}
              {...register('department')}
            />
            <Button type="submit" className="w-full" loading={isLoading}>
              Criar conta
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\RegisterPage.tsx" -Encoding UTF8
Write-Success "frontend/src/pages/RegisterPage.tsx criado"

# 2.17 - Páginas de Dashboard (placeholder)
Write-Info "Criando páginas de Dashboard (placeholder)..."

# AdminDashboard
@'
import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card.js';
import { LogOut, Users, Shield, BarChart3, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-gray-900">Code_Assessment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin: {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">15</CardTitle>
              <CardDescription>Usuários ativos</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">93</CardTitle>
              <CardDescription>Controles ISO 27001</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">67%</CardTitle>
              <CardDescription>Maturidade geral</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">12</CardTitle>
              <CardDescription>Avaliações em andamento</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Usuários
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Nenhuma atividade recente.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\AdminDashboard.tsx" -Encoding UTF8

# RepDashboard
@'
import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card.js';
import { LogOut, Users, ClipboardList, Plus, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RepDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-gray-900">Code_Assessment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Preposto: {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Preposto</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">8</CardTitle>
              <CardDescription>Controles atribuídos</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">5</CardTitle>
              <CardDescription>Em andamento</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">3</CardTitle>
              <CardDescription>Concluídos</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Gerenciamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/rep/assign">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Atribuir Controles
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/rep/users">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Usuários
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Avaliação
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Controles atribuídos</span>
                  <span className="font-medium">8/93</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 rounded-full h-2" style={{ width: '8.6%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\RepDashboard.tsx" -Encoding UTF8

# ConsultantDashboard
@'
import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card.js';
import { LogOut, FileText, CheckCircle, Clock, Shield } from 'lucide-react';

export const ConsultantDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-gray-900">Code_Assessment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Consultor: {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Consultor</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">12</CardTitle>
              <CardDescription>Pendentes para avaliação</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">7</CardTitle>
              <CardDescription>Em análise</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">5</CardTitle>
              <CardDescription>Finalizados</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Avaliar Controles
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Validar Respostas
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Histórico
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Últimas Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Nenhuma avaliação recente.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\ConsultantDashboard.tsx" -Encoding UTF8

# UserDashboard
@'
import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card.js';
import { LogOut, ClipboardCheck, Clock, CheckCircle, Shield } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-gray-900">Code_Assessment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Usuário: {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Meu Dashboard</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">3</CardTitle>
              <CardDescription>Controles atribuídos</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">1</CardTitle>
              <CardDescription>Pendentes</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">2</CardTitle>
              <CardDescription>Concluídos</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Minhas Atividades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Responder Controles
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Ver Pendências
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Histórico de Respostas
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">66%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 rounded-full h-2" style={{ width: '66%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\UserDashboard.tsx" -Encoding UTF8

# ProfilePage
@'
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card.js';
import { LogOut, User, Mail, Building, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  company: z.string().optional(),
  department: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      company: user?.company || '',
      department: user?.department || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      await updateProfile(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Meu Perfil</CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome completo"
                icon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Email"
                icon={<Mail className="h-4 w-4" />}
                value={user?.email}
                disabled
                className="bg-gray-50"
              />
              <Input
                label="Empresa"
                icon={<Building className="h-4 w-4" />}
                error={errors.company?.message}
                {...register('company')}
              />
              <Input
                label="Departamento"
                icon={<Building className="h-4 w-4" />}
                error={errors.department?.message}
                {...register('department')}
              />
              <div className="pt-4">
                <Button type="submit" className="w-full" loading={isLoading}>
                  Salvar alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\ProfilePage.tsx" -Encoding UTF8

Write-Success "Páginas de Dashboard criadas"

# ============================================
# PARTE 3: INSTALAR DEPENDÊNCIAS
# ============================================
Write-Step "PARTE 3/4: INSTALANDO DEPENDÊNCIAS DO FRONTEND"

Write-Info "Instalando dependências do frontend..."
Push-Location "$BaseDir\frontend"
try {
    npm install
    Write-Success "Dependências do frontend instaladas com sucesso!"
} catch {
    Write-Error "Erro ao instalar dependências do frontend: $_"
    exit 1
}
Pop-Location

# ============================================
# PARTE 4: CRIAR SCRIPTS DE INÍCIO
# ============================================
Write-Step "PARTE 4/4: CRIANDO SCRIPTS DE INÍCIO"

# Criar script de início do frontend
@'
# start-frontend.ps1
Write-Host "🚀 Iniciando frontend..." -ForegroundColor Green
Set-Location "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment\frontend"
npm run dev
'@ | Out-File -FilePath "$BaseDir\start-frontend.ps1" -Encoding UTF8

@'
# start-frontend.bat
@echo off
echo 🚀 Iniciando frontend...
echo.
cd /d "%~dp0frontend"
npm run dev
'@ | Out-File -FilePath "$BaseDir\start-frontend.bat" -Encoding ASCII

Write-Success "Scripts de início criados"

# ============================================
# RESUMO FINAL
# ============================================
Write-Step "✅ SETUP DO FRONTEND CONCLUÍDO!"

Write-Success "Frontend configurado com sucesso!"
Write-Info "Para iniciar o frontend:"
Write-Info "  1. cd $BaseDir\frontend"
Write-Info "  2. npm run dev"

Write-Info "Ou use o script de início:"
Write-Info "  • Windows: $BaseDir\start-frontend.bat"
Write-Info "  • PowerShell: $BaseDir\start-frontend.ps1"

Write-Info "Para iniciar o backend e frontend juntos:"
Write-Info "  • Terminal 1: cd backend && npm run dev"
Write-Info "  • Terminal 2: cd frontend && npm run dev"

Write-Success "🎉 Setup finalizado com sucesso!"