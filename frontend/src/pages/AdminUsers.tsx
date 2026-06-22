// frontend/src/pages/AdminUsers.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersTable } from '../components/admin/UsersTable.js';
import { UserForm } from '../components/admin/UserForm.js';
import { useCreateUser, useUpdateUser } from '../hooks/useAdmin.js';
import { IUser } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { ArrowLeft, UserPlus } from 'lucide-react';
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
              />
            )}
          </section>
        </main>
      </AdminErrorBoundary>
    </>
  );
};
export default AdminUsers;