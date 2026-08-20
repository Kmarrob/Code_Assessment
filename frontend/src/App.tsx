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
import AdminCompanyDetail from './pages/AdminCompanyDetail.js';
import AdminBranding from './pages/AdminBranding.js';
import RepMyControls from './pages/RepMyControls.js';

// ============================================
// 🆕 NOVO (v39) - IMPORTAÇÕES DO MÓDULO DE GOVERNANÇA
// ============================================
import AdminGovernance from './modules/governance/pages/admin/AdminGovernance.js';
import AdminPolicyEditor from './modules/governance/pages/admin/AdminPolicyEditor.js';
import AdminStandardEditor from './modules/governance/pages/admin/AdminStandardEditor.js';
import AdminProcedureEditor from './modules/governance/pages/admin/AdminProcedureEditor.js';
import AdminWorkInstructionEditor from './modules/governance/pages/admin/AdminWorkInstructionEditor.js';
import AdminPolicyEditorV2 from './modules/governance/pages/admin/AdminPolicyEditorV2.js';
import AdminNormEditorV2 from './modules/governance/pages/admin/AdminNormEditorV2.js';
import AdminProcedureEditorV2 from './modules/governance/pages/admin/AdminProcedureEditorV2.js';
import RepGovernance from './modules/governance/pages/rep/RepGovernance.js';
import RepPolicyView from './modules/governance/pages/rep/RepPolicyView.js';

// ============================================
// 🆕 NOVO (v44.0) - IMPORTAÇÕES DO MÓDULO DE AUDITORIA INTERNA (SGSI)
// ============================================
import { AdminAuditDashboard } from './modules/audit/pages/admin/dashboard/AdminAuditDashboard.js';
import { AdminAuditReports } from './modules/audit/pages/admin/reports/AdminAuditReports.js';
import { RepAuditDashboard } from './modules/audit/pages/rep/dashboard/RepAuditDashboard.js';
import { RepAuditPlans } from './modules/audit/pages/rep/plans/RepAuditPlans.js';
import { RepAuditPlanForm } from './modules/audit/pages/rep/plans/RepAuditPlanForm.js';
import { RepAuditExecution } from './modules/audit/pages/rep/execution/RepAuditExecution.js';
import { RepAuditFindings } from './modules/audit/pages/rep/findings/RepAuditFindings.js';
import { RepAuditFindingForm } from './modules/audit/pages/rep/findings/RepAuditFindingForm.js';
import { RepAuditActionPlan } from './modules/audit/pages/rep/actions/RepAuditActionPlan.js';
import { RepAuditReport } from './modules/audit/pages/rep/reports/RepAuditReport.js';

// ============================================
// 🆕 NOVO (v46.0) - IMPORTAÇÕES ADICIONAIS - AUDITORIA INTERNA (SGSI)
// ============================================
import { RepAuditChecklist } from './modules/audit/pages/rep/checklist/RepAuditChecklist.js';
import { RepAuditEvidence } from './modules/audit/pages/rep/evidence/RepAuditEvidence.js';
import { RepAuditRisks } from './modules/audit/pages/rep/risks/RepAuditRisks.js';
import { RepAuditSoA } from './modules/audit/pages/rep/soa/RepAuditSoA.js';
import { RepAuditProgram } from './modules/audit/pages/rep/program/RepAuditProgram.js';
import { RepAuditDocumentReview } from './modules/audit/pages/rep/document-review/RepAuditDocumentReview.js';

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

import AdminFunnelAnalytics from './pages/admin/AdminFunnelAnalytics.js';
import AdminClientDetails from './pages/admin/AdminClientDetails.js';
import AdminAuditLogs from './pages/admin/AdminAuditLogs.js';

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
                    <Route path="/admin/branding" element={
                      <Layout>
                        <AdminBranding />
                      </Layout>
                    } />
                    <Route path="/admin/analytics" element={
                      <Layout>
                        <AdminFunnelAnalytics />
                      </Layout>
                    } />
                    <Route path="/admin/analytics/clients/:clientId" element={
                      <Layout>
                        <AdminClientDetails />
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

                    {/* ============================================
                        🆕 NOVO (v39) - ROTAS ADMIN - GOVERNANÇA
                        ============================================ */}
                    <Route path="/admin/governance" element={
                      <Layout>
                        <AdminGovernance />
                      </Layout>
                    } />
                    <Route path="/admin/governance/policy/new" element={
                      <Layout>
                        <AdminPolicyEditor />
                      </Layout>
                    } />
                    <Route path="/admin/governance/standard/new" element={
                      <Layout>
                        <AdminStandardEditor />
                      </Layout>
                    } />
                    <Route path="/admin/governance/procedure/new" element={
                      <Layout>
                        <AdminProcedureEditor />
                      </Layout>
                    } />
                    <Route path="/admin/governance/instruction/new" element={
                      <Layout>
                        <AdminWorkInstructionEditor />
                      </Layout>
                    } />
                    <Route path="/admin/governance/policy/new-v2" element={
                      <Layout>
                        <AdminPolicyEditorV2 />
                      </Layout>
                    } />
                    <Route path="/admin/governance/standard/new-v2" element={
                      <Layout>
                        <AdminNormEditorV2 />
                      </Layout>
                    } />
                    <Route path="/admin/governance/standard/:id/edit-v2" element={
                      <Layout>
                        <AdminNormEditorV2 />
                      </Layout>
                    } />
                    <Route path="/admin/governance/procedure/new-v2" element={
                      <Layout>
                        <AdminProcedureEditorV2 />
                      </Layout>
                    } />
                    <Route path="/admin/governance/procedure/:id/edit-v2" element={
                      <Layout>
                        <AdminProcedureEditorV2 />
                      </Layout>
                    } />
                    <Route path="/admin/governance/document/:id" element={
                      <Layout>
                        <AdminGovernance />
                      </Layout>
                    } />
                    <Route path="/admin/governance/document/:id/edit" element={
                      <Layout>
                        <AdminPolicyEditorV2 />
                      </Layout>
                    } />

                    {/* 🆕 NOVO (v42.0) - Rota para Auditoria do Sistema */}
                    <Route path="/admin/audit" element={
                      <Layout>
                        <AdminAuditLogs />
                      </Layout>
                    } />

                    {/* ============================================
                        🆕 NOVO (v44.0) - ROTAS ADMIN - AUDITORIA INTERNA (SGSI)
                        ============================================ */}
                    <Route path="/admin/audit/dashboard" element={
                      <Layout>
                        <AdminAuditDashboard />
                      </Layout>
                    } />
                    <Route path="/admin/audit/reports" element={
                      <Layout>
                        <AdminAuditReports />
                      </Layout>
                    } />
                    <Route path="/admin/audit/reports/:id" element={
                      <Layout>
                        <AdminAuditReports />
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
                    <Route path="/rep/branding" element={
                      <Layout>
                        <AdminBranding />
                      </Layout>
                    } />
                    <Route path="/rep/my-controls" element={
                      <Layout>
                        <RepMyControls />
                      </Layout>
                    } />

                    {/* ============================================
                        🆕 NOVO (v41) - ROTA REP - GOVERNANÇA
                        ============================================ */}
                    <Route path="/rep/governance" element={
                      <Layout>
                        <RepGovernance />
                      </Layout>
                    } />

                    <Route path="/rep/governance/document/:id" element={
                      <Layout>
                        <RepPolicyView />
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

                    {/* ============================================
                        🆕 NOVO (v44.0) - ROTAS REP - AUDITORIA INTERNA (SGSI)
                        ============================================ */}
                    {/* Dashboard */}
                    <Route path="/rep/audit/dashboard" element={
                      <Layout>
                        <RepAuditDashboard />
                      </Layout>
                    } />

                    {/* Planos */}
                    <Route path="/rep/audit/plans" element={
                      <Layout>
                        <RepAuditPlans />
                      </Layout>
                    } />
                    <Route path="/rep/audit/plans/new" element={
                      <Layout>
                        <RepAuditPlanForm />
                      </Layout>
                    } />
                    <Route path="/rep/audit/plans/:id" element={
                      <Layout>
                        <RepAuditPlanForm />
                      </Layout>
                    } />
                    <Route path="/rep/audit/plans/:id/edit" element={
                      <Layout>
                        <RepAuditPlanForm />
                      </Layout>
                    } />

                    {/* Execução */}
                    <Route path="/rep/audit/execution/:planId" element={
                      <Layout>
                        <RepAuditExecution />
                      </Layout>
                    } />

                    {/* Checklist - 🆕 NOVO (v46.0) */}
                    <Route path="/rep/audit/checklist/:planId" element={
                      <Layout>
                        <RepAuditChecklist />
                      </Layout>
                    } />

                    {/* Evidências - 🆕 NOVO (v46.0) */}
                    <Route path="/rep/audit/evidence/:planId" element={
                      <Layout>
                        <RepAuditEvidence />
                      </Layout>
                    } />

                    {/* Riscos - 🆕 NOVO (v46.0) */}
                    <Route path="/rep/audit/risks/:planId" element={
                      <Layout>
                        <RepAuditRisks />
                      </Layout>
                    } />

                    {/* SoA - 🆕 NOVO (v46.0) */}
                    <Route path="/rep/audit/soa/:planId" element={
                      <Layout>
                        <RepAuditSoA />
                      </Layout>
                    } />

                    {/* Programa - 🆕 NOVO (v46.0) */}
                    <Route path="/rep/audit/program/:planId" element={
                      <Layout>
                        <RepAuditProgram />
                      </Layout>
                    } />

                    {/* Revisão Documental - 🆕 NOVO (v46.0) */}
                    <Route path="/rep/audit/document-review/:planId" element={
                      <Layout>
                        <RepAuditDocumentReview />
                      </Layout>
                    } />

                    {/* Não Conformidades */}
                    <Route path="/rep/audit/findings/:planId" element={
                      <Layout>
                        <RepAuditFindings />
                      </Layout>
                    } />
                    <Route path="/rep/audit/findings/new/:planId" element={
                      <Layout>
                        <RepAuditFindingForm />
                      </Layout>
                    } />
                    <Route path="/rep/audit/findings/:findingId" element={
                      <Layout>
                        <RepAuditFindingForm />
                      </Layout>
                    } />
                    <Route path="/rep/audit/findings/:findingId/edit" element={
                      <Layout>
                        <RepAuditFindingForm />
                      </Layout>
                    } />

                    {/* Planos de Ação */}
                    <Route path="/rep/audit/actions/:findingId" element={
                      <Layout>
                        <RepAuditActionPlan />
                      </Layout>
                    } />
                    <Route path="/rep/audit/actions/new/:findingId" element={
                      <Layout>
                        <RepAuditActionPlan />
                      </Layout>
                    } />

                    {/* Relatórios */}
                    <Route path="/rep/audit/reports/:planId" element={
                      <Layout>
                        <RepAuditReport />
                      </Layout>
                    } />
                    <Route path="/rep/audit/reports/:reportId/edit" element={
                      <Layout>
                        <RepAuditReport />
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