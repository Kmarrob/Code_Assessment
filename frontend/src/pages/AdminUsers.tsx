// frontend/src/pages/AdminUsers.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersTable } from '../components/admin/UsersTable.js';
import { UserForm } from '../components/admin/UserForm.js';
import { useCreateUser, useUpdateUser } from '../hooks/useAdmin.js';
import { IUser } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { ArrowLeft, UserPlus, Crown, X, AlertCircle } from 'lucide-react';
import { useSanitize } from '../hooks/useSanitize.js';
import { AdminErrorBoundary } from '../components/AdminErrorBoundary.js';
import { AdminErrorFallback } from '../components/admin/AdminFallbacks.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';

type ViewMode = 'list' | 'create' | 'edit';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { sanitizeApiData } = useSanitize();
  const [mode, setMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<IUser | undefined>();

  // 🔴 NOVO: Estado para o modal de upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const handleCreate = () => {
    setSelectedUser(undefined);
    setMode('create');
  };

  const handleEdit = (user: IUser) => {
    const sanitizedUser = sanitizeApiData(user);
    setSelectedUser(sanitizedUser);
    setMode('edit');
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedUser(undefined);
  };

  // 🔴 NOVO: Função para abrir o modal de upgrade
  const handleUpgradeNeeded = (message: string) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };

  // 🔴 NOVO: Função para fechar o modal
  const handleCloseModal = () => {
    setShowUpgradeModal(false);
  };

  // 🔴 NOVO: Função para redirecionar para a página de planos
  const handleUpgrade = () => {
    navigate('/plans');
  };

  const handleSubmit = async (data: any) => {
    const sanitizedData = sanitizeApiData(data);
    
    if (mode === 'create') {
      await createUser.mutateAsync(sanitizedData);
    } else if (mode === 'edit' && selectedUser) {
      await updateUser.mutateAsync({ id: selectedUser._id, data: sanitizedData });
    }
    setMode('list');
    setSelectedUser(undefined);
  };

  const isLoading = createUser.isPending || updateUser.isPending;

  return (
    <>
      <AdminMetaTags
        title="Gerenciar Usuários - Code_Assessment"
        description="Gerencie todos os usuários do sistema Code_Assessment, incluindo administradores, prepostos, consultores e usuários finais."
        noIndex={true}
      />

      <AdminErrorBoundary
        fallback={<AdminErrorFallback onRetry={() => window.location.reload()} />}
        onError={(error, errorInfo) => {
          console.error('AdminUsers Error:', error, errorInfo);
        }}
      >
        <main className="container mx-auto px-4 py-8" role="main" aria-label="Gerenciamento de usuários">
          <nav aria-label="Breadcrumb" className="mb-4">
            <AdminBreadcrumbs />
          </nav>

          <header className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
                aria-label="Voltar ao dashboard"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar ao dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
              <p className="text-gray-600">Cadastre, edite e gerencie usuários do sistema</p>
            </div>
            {mode === 'list' && (
              <Button onClick={handleCreate} aria-label="Adicionar novo usuário">
                <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                Novo Usuário
              </Button>
            )}
          </header>

          <section aria-label="Conteúdo de gerenciamento de usuários">
            {mode === 'list' && (
              <UsersTable onEdit={handleEdit} onCreate={handleCreate} />
            )}

            {(mode === 'create' || mode === 'edit') && (
              <UserForm
                user={selectedUser}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                // 🔴 NOVO: Passar a prop para capturar o erro de upgrade
                onUpgradeNeeded={handleUpgradeNeeded}
              />
            )}
          </section>
        </main>
      </AdminErrorBoundary>

      {/* 🔴 NOVO: Modal de Upgrade de Plano */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            {/* Header com ícone */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Limite do Plano Atingido</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-amber-50 rounded-full flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {upgradeMessage || 'Você atingiu o limite máximo de usuários do seu plano atual.'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Faça o upgrade para adicionar mais usuários e desbloquear novas funcionalidades.
                  </p>
                </div>
              </div>

              {/* Benefícios do Upgrade */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Benefícios do Upgrade
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Mais usuários simultâneos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Funcionalidades exclusivas
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Suporte prioritário
                  </li>
                </ul>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={handleUpgrade}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para animações */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.25s ease-out;
        }
      `}</style>
    </>
  );
};
export default AdminUsers;