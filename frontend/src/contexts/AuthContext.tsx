// frontend/src/contexts/AuthContext.tsx
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
  login: (email: string, password: string) => Promise<IUser | undefined>;
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
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser._id) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setIsLoading(false);
  }, []);

  // Atualizar usuário no localStorage - CORRIGIDO
  const updateStoredUser = useCallback((userData: IUser | null) => {
    if (userData && typeof userData === 'object' && userData._id) {
      const safeUser = {
        _id: userData._id,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'user',
        company: userData.company || '',
        companyId: (userData as any).companyId || null, // ✅ ADICIONADO
        department: userData.department || '',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        lastLoginAt: userData.lastLoginAt || null,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
      setUser(safeUser as IUser);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
    }
  }, []);

  // Login - AGORA RETORNA O USUÁRIO
  const login = useCallback(async (email: string, password: string): Promise<IUser | undefined> => {
    try {
      setIsLoading(true);
      const { user: userData, tokens } = await authService.login({ email, password });
      
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      updateStoredUser(userData);
      
      toast.success('Login realizado com sucesso!');
      return userData;
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