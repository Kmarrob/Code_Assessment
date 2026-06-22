// frontend/src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { UserRole } from '../types/index.js';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // LOGS PARA DEBUG
  console.log('🔍 ProtectedRoute Debug:');
  console.log('  - isLoading:', isLoading);
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - user:', user);
  console.log('  - user?.role:', user?.role);
  console.log('  - allowedRoles:', allowedRoles);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('❌ Usuário não autenticado, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`❌ Role ${user.role} não permitida. Permitidas:`, allowedRoles);
    console.log('🔄 Redirecionando para /');
    return <Navigate to="/" replace />;
  }

  console.log('✅ Acesso permitido!');
  return <Outlet />;
};