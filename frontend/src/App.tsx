// frontend/src/App.tsx
import React from 'react';
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
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { AuthErrorFallback } from './components/ui/Fallback.js';
import { SkipLink } from './components/SkipLink.js';
import AdminCompanies from './pages/AdminCompanies.js';
import AdminQuestions from './pages/AdminQuestions.js';
import AdminConsultants from './pages/AdminConsultants.js';
import AdminConsultantForm from './pages/AdminConsultantForm.js';
import UserAnswer from './pages/UserAnswer.js';
import AdminConsultantView from './pages/AdminConsultantView.js';

// ============================================
// IMPORTAÇÕES DO DASHBOARD (DIRETAS - CORRIGIDO)
// ============================================
import { DashboardOverview } from './pages/dashboard/DashboardOverview.js';
import { Categorization } from './pages/dashboard/Categorization.js';
import { ControlTypes } from './pages/dashboard/ControlTypes.js';
import { CyberConcepts } from './pages/dashboard/CyberConcepts.js';
import { Capabilities } from './pages/dashboard/Capabilities.js';
import { Domains } from './pages/dashboard/Domains.js';
import { AdminCompanySelector } from './pages/dashboard/AdminCompanySelector.js';

// ============================================
// IMPORTAÇÕES DIRETAS (SEM LAZY)
// ============================================
import AdminDashboard from './pages/AdminDashboard.js';
import AdminUsers from './pages/AdminUsers.js';
import AdminControls from './pages/AdminControls.js';
import RepDashboard from './pages/RepDashboard.js';
import RepNewUser from './pages/RepNewUser.js';
import RepAssignControls from './pages/RepAssignControls.js';
import RepResponses from './pages/RepResponses.js'; // 🔴 NOVO
import ConsultantDashboard from './pages/ConsultantDashboard.js';
import UserDashboard from './pages/UserDashboard.js';
import ProfilePage from './pages/ProfilePage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SkipLink targetId="main-content" />
        
        <AuthProvider>
          <ErrorBoundary
            fallback={<AuthErrorFallback onLogin={() => window.location.href = '/login'} />}
          >
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
            
            <main id="main-content" role="main">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                { /* ============================================
                    ROTAS PROTEGIDAS (qualquer usuário autenticado)
                    ============================================ */ }
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                { /* ============================================
                    ROTAS ADMIN
                    ============================================ */ }
                <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/usuarios" element={<AdminUsers />} />
                  <Route path="/admin/controles" element={<AdminControls />} />
                  <Route path="/admin/users" element={<Navigate to="/admin/usuarios" replace />} />
                  <Route path="/admin/empresas" element={<AdminCompanies />} />
                  <Route path="/admin/perguntas" element={<AdminQuestions />} />
                  <Route path="/admin/consultores" element={<AdminConsultants />} />
                  <Route path="/admin/consultores/novo" element={<AdminConsultantForm />} />
                  <Route path="/admin/consultores/:id/editar" element={<AdminConsultantForm />} />
                  <Route path="/admin/consultores/:id" element={<AdminConsultantView />} />
                  
                  {/* Dashboard Admin - Seletor de empresas e Visão interna */}
                  <Route path="/admin/dashboard" element={<AdminCompanySelector />} />
                  <Route path="/admin/dashboard/empresas/:companyId" element={<DashboardOverview />} />
                  <Route path="/admin/dashboard/categorizacao/:companyId" element={<Categorization />} />
                  <Route path="/admin/dashboard/tipos-controle/:companyId" element={<ControlTypes />} />
                  <Route path="/admin/dashboard/conceitos-ciberneticos/:companyId" element={<CyberConcepts />} />
                  <Route path="/admin/dashboard/capacidades/:companyId" element={<Capabilities />} />
                  <Route path="/admin/dashboard/dominios/:companyId" element={<Domains />} />
                </Route>

                { /* ============================================
                    ROTAS REP (PREPOSTO)
                    ============================================ */ }
                <Route element={<ProtectedRoute allowedRoles={[UserRole.REP, UserRole.ADMIN]} />}>
                  <Route path="/rep" element={<RepDashboard />} />
                  <Route path="/rep/users/new" element={<RepNewUser />} />
                  <Route path="/rep/users/:userId/assign" element={<RepAssignControls />} />
                  <Route path="/rep/responses" element={<RepResponses />} /> {/* 🔴 NOVO */}
                  
                  {/* Dashboard Rep - Visão da empresa do preposto */}
                  <Route path="/rep/dashboard" element={<DashboardOverview />} />
                  <Route path="/rep/dashboard/categorizacao" element={<Categorization />} />
                  <Route path="/rep/dashboard/tipos-controle" element={<ControlTypes />} />
                  <Route path="/rep/dashboard/conceitos-ciberneticos" element={<CyberConcepts />} />
                  <Route path="/rep/dashboard/capacidades" element={<Capabilities />} />
                  <Route path="/rep/dashboard/dominios" element={<Domains />} />
                </Route>

                { /* ============================================
                    ROTAS CONSULTANT
                    ============================================ */ }
                <Route element={<ProtectedRoute allowedRoles={[UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                  <Route path="/consultant" element={<ConsultantDashboard />} />
                </Route>

                { /* ============================================
                    ROTAS USER (e outros perfis que podem acessar dashboard)
                    ============================================ */ }
                <Route element={<ProtectedRoute allowedRoles={[UserRole.USER, UserRole.REP, UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/user/answer/:assignmentId" element={<UserAnswer />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;