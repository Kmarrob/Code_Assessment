// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext.js';
import { PlanProvider } from './contexts/PlanContext.js';
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
// 🔴 NOVO: Import da página de detalhes da empresa
import AdminCompanyDetail from './pages/AdminCompanyDetail.js';
// 🔴 NOVO: Import da página de branding (corrigido)
import AdminBranding from './pages/AdminBranding.js';

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
import RepResponses from './pages/RepResponses.js';
import RepEditUser from './pages/RepEditUser.js';
import RepDocuments from './pages/RepDocuments.js';
import ResetPassword from './pages/ResetPassword.js';
import ConsultantDashboard from './pages/ConsultantDashboard.js';
import UserDashboard from './pages/UserDashboard.js';
import ProfilePage from './pages/ProfilePage.js';
import ReportView from './pages/ReportView.js';
import AdminReports from './pages/AdminReports.js';
import AdminRecommendations from './pages/AdminRecommendations.js';

// 🔴 NOVO: Import do Layout
import { Layout } from './components/Layout.js';

// ============================================
// 🔴 NOVO: IMPORTAÇÕES DA FASE 3 - PLANOS E FATURAMENTO
// ============================================
import { PlansPage } from './pages/PlansPage.js';
import { BillingPage } from './pages/BillingPage.js';

// ============================================
// 🔴 NOVO: IMPORTAÇÃO DA FASE 5 - CHECKOUT
// ============================================
import { CheckoutPage } from './pages/CheckoutPage.js';

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
          <PlanProvider>
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
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* ============================================
                      ROTAS PÚBLICAS - PLANOS E CHECKOUT
                      ============================================ */}
                  <Route path="/plans" element={<PlansPage />} />
                  {/* 🔴 NOVO: Rota pública de checkout (sem autenticação necessária) */}
                  <Route path="/checkout" element={<CheckoutPage />} />

                  { /* ============================================
                      ROTAS PROTEGIDAS (qualquer usuário autenticado)
                      ============================================ */ }
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    } />
                    {/* 🔴 NOVO: Rota de faturamento */}
                    <Route path="/billing" element={
                      <Layout>
                        <BillingPage />
                      </Layout>
                    } />
                  </Route>

                  { /* ============================================
                      ROTAS ADMIN
                      ============================================ */ }
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin" element={
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    } />
                    <Route path="/admin/usuarios" element={
                      <Layout>
                        <AdminUsers />
                      </Layout>
                    } />
                    <Route path="/admin/controles" element={
                      <Layout>
                        <AdminControls />
                      </Layout>
                    } />
                    <Route path="/admin/users" element={<Navigate to="/admin/usuarios" replace />} />
                    <Route path="/admin/empresas" element={
                      <Layout>
                        <AdminCompanies />
                      </Layout>
                    } />
                    {/* 🔴 NOVO: Rota para detalhes da empresa */}
                    <Route path="/admin/empresas/:companyId/detalhes" element={
                      <Layout>
                        <AdminCompanyDetail />
                      </Layout>
                    } />
                    <Route path="/admin/perguntas" element={
                      <Layout>
                        <AdminQuestions />
                      </Layout>
                    } />
                    <Route path="/admin/consultores" element={
                      <Layout>
                        <AdminConsultants />
                      </Layout>
                    } />
                    <Route path="/admin/consultores/novo" element={
                      <Layout>
                        <AdminConsultantForm />
                      </Layout>
                    } />
                    <Route path="/admin/consultores/:id/editar" element={
                      <Layout>
                        <AdminConsultantForm />
                      </Layout>
                    } />
                    <Route path="/admin/consultores/:id" element={
                      <Layout>
                        <AdminConsultantView />
                      </Layout>
                    } />
                    <Route path="/admin/relatorios" element={
                      <Layout>
                        <AdminReports />
                      </Layout>
                    } />
                    {/* 🔴 NOVO: Rota para visualizar um relatório específico no admin */}
                    <Route path="/admin/relatorios/:companyId" element={
                      <Layout>
                        <ReportView />
                      </Layout>
                    } />
                    <Route path="/admin/recomendacoes" element={
                      <Layout>
                        <AdminRecommendations />
                      </Layout>
                    } />
                    {/* 🔴 NOVO: Rota para gerenciamento de branding (logo e favicon) */}
                    <Route path="/admin/branding" element={
                      <Layout>
                        <AdminBranding />
                      </Layout>
                    } />
                    
                    {/* Dashboard Admin - Seletor de empresas e Visão interna */}
                    <Route path="/admin/dashboard" element={
                      <Layout>
                        <AdminCompanySelector />
                      </Layout>
                    } />
                    <Route path="/admin/dashboard/empresas/:companyId" element={
                      <Layout>
                        <DashboardOverview />
                      </Layout>
                    } />
                    <Route path="/admin/dashboard/categorizacao/:companyId" element={
                      <Layout>
                        <Categorization />
                      </Layout>
                    } />
                    <Route path="/admin/dashboard/tipos-controle/:companyId" element={
                      <Layout>
                        <ControlTypes />
                      </Layout>
                    } />
                    <Route path="/admin/dashboard/conceitos-ciberneticos/:companyId" element={
                      <Layout>
                        <CyberConcepts />
                      </Layout>
                    } />
                    <Route path="/admin/dashboard/capacidades/:companyId" element={
                      <Layout>
                        <Capabilities />
                      </Layout>
                    } />
                    <Route path="/admin/dashboard/dominios/:companyId" element={
                      <Layout>
                        <Domains />
                      </Layout>
                    } />
                  </Route>

                  { /* ============================================
                      ROTAS REP (PREPOSTO)
                      ============================================ */ }
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.REP, UserRole.ADMIN]} />}>
                    <Route path="/rep" element={
                      <Layout>
                        <RepDashboard />
                      </Layout>
                    } />
                    <Route path="/rep/users/new" element={
                      <Layout>
                        <RepNewUser />
                      </Layout>
                    } />
                    <Route path="/rep/users/:userId/assign" element={
                      <Layout>
                        <RepAssignControls />
                      </Layout>
                    } />
                    <Route path="/rep/users/:userId/edit" element={
                      <Layout>
                        <RepEditUser />
                      </Layout>
                    } />
                    <Route path="/rep/responses" element={
                      <Layout>
                        <RepResponses />
                      </Layout>
                    } />
                    <Route path="/rep/documents" element={
                      <Layout>
                        <RepDocuments />
                      </Layout>
                    } />
                    <Route path="/rep/report" element={
                      <Layout>
                        <ReportView />
                      </Layout>
                    } />
                    
                    {/* Dashboard Rep - Visão da empresa do preposto */}
                    <Route path="/rep/dashboard" element={
                      <Layout>
                        <DashboardOverview />
                      </Layout>
                    } />
                    <Route path="/rep/dashboard/categorizacao" element={
                      <Layout>
                        <Categorization />
                      </Layout>
                    } />
                    <Route path="/rep/dashboard/tipos-controle" element={
                      <Layout>
                        <ControlTypes />
                      </Layout>
                    } />
                    <Route path="/rep/dashboard/conceitos-ciberneticos" element={
                      <Layout>
                        <CyberConcepts />
                      </Layout>
                    } />
                    <Route path="/rep/dashboard/capacidades" element={
                      <Layout>
                        <Capabilities />
                      </Layout>
                    } />
                    <Route path="/rep/dashboard/dominios" element={
                      <Layout>
                        <Domains />
                      </Layout>
                    } />
                  </Route>

                  { /* ============================================
                      ROTAS CONSULTANT
                      ============================================ */ }
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                    <Route path="/consultant" element={
                      <Layout>
                        <ConsultantDashboard />
                      </Layout>
                    } />
                  </Route>

                  { /* ============================================
                      ROTAS USER (e outros perfis que podem acessar dashboard)
                      ============================================ */ }
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.USER, UserRole.REP, UserRole.CONSULTANT, UserRole.ADMIN]} />}>
                    <Route path="/dashboard" element={
                      <Layout>
                        <UserDashboard />
                      </Layout>
                    } />
                    <Route path="/user/answer/:assignmentId" element={
                      <Layout>
                        <UserAnswer />
                      </Layout>
                    } />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </ErrorBoundary>
          </PlanProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;