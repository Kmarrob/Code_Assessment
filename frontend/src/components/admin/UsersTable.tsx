// frontend/src/components/admin/UsersTable.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUsers, useDeleteUser, useReactivateUser } from '../../hooks/useAdmin.js';
import { IUser, UserRole } from '../../types/index.js';
import { getRoleLabel, getRoleColor, formatDate } from '../../utils/helpers.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { ConfirmDialog } from '../ui/ConfirmDialog.js';
import { EmptyState } from '../ui/EmptyState.js';
import { AdminErrorFallback, AdminLoadingFallback } from './AdminFallbacks.js';
import { AdminLoadingOverlay } from './AdminLoadingOverlay.js';
import { 
  Search, UserPlus, Edit, Trash2, 
  RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Users, Building2
} from 'lucide-react';
import { useDebounce } from '../../hooks/useMemoized.js';
import { companyService, Company } from '../../services/company.service.js';

interface UsersTableProps {
  onEdit?: (user: IUser) => void;
  onCreate?: () => void;
}

// ============================================
// USER ROW COMPONENT
// ============================================
const UserRow = React.memo(({ 
  data, 
  index, 
  style 
}: { 
  data: { 
    users: IUser[]; 
    companies: Record<string, string>;
    onEdit?: (user: IUser) => void; 
    onDelete: (user: IUser) => void; 
    onReactivate: (user: IUser) => void;
  };
  index: number;
  style: React.CSSProperties;
}) => {
  const { users, companies, onEdit, onDelete, onReactivate } = data;
  
  if (!users || !Array.isArray(users) || users.length === 0) {
    return null;
  }
  
  const user = users[index];
  
  if (!user || typeof user !== 'object') {
    return null;
  }
  
  if (!user._id || !user.name) {
    return null;
  }

  const companyName = user.companyId ? companies[user.companyId] || 'Carregando...' : 'Sem empresa';

  return (
    <div style={style} className="grid grid-cols-[1.5fr_2fr_1fr_0.8fr_1fr_0.8fr] items-center border-b border-gray-100 hover:bg-gray-50 gap-2 px-4">
      {/* Nome com avatar */}
      <div className="flex items-center gap-3 py-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {user.name ? user.name.charAt(0) : '?'}
        </div>
        <span className="font-medium text-gray-900 truncate" title={user.name || 'Usuário'}>
          {user.name || 'Usuário'}
        </span>
      </div>
      
      {/* Email */}
      <div className="py-3 min-w-0">
        <span className="text-gray-600 truncate block" title={user.email || 'Sem email'}>
          {user.email || 'Sem email'}
        </span>
      </div>
      
      {/* Perfil */}
      <div className="py-3">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role || 'user')}`}>
          {getRoleLabel(user.role || 'user')}
        </span>
      </div>
      
      {/* Empresa */}
      <div className="py-3 min-w-0">
        <div className="flex items-center gap-1.5 text-gray-600 text-sm truncate" title={companyName}>
          <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <span className="truncate">{companyName}</span>
        </div>
      </div>
      
      {/* Status */}
      <div className="py-3">
        {user.isActive !== undefined && user.isActive ? (
          <span className="inline-flex items-center gap-1 text-green-600 text-sm whitespace-nowrap">
            <CheckCircle className="h-3.5 w-3.5" />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-600 text-sm whitespace-nowrap">
            <XCircle className="h-3.5 w-3.5" />
            Inativo
          </span>
        )}
      </div>
      
      {/* Ações */}
      <div className="py-3 flex items-center gap-2">
        {onEdit && user.isActive && (
          <button
            onClick={() => onEdit(user)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label={`Editar usuário ${user.name || ''}`}
            title={`Editar ${user.name || ''}`}
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        {user.isActive !== undefined && user.isActive ? (
          <button
            onClick={() => onDelete(user)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            aria-label={`Desativar usuário ${user.name || ''}`}
            title={`Desativar ${user.name || ''}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => onReactivate(user)}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            aria-label={`Reativar usuário ${user.name || ''}`}
            title={`Reativar ${user.name || ''}`}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
});

UserRow.displayName = 'UserRow';

// ============================================
// MAIN COMPONENT
// ============================================
export const UsersTable = React.memo(({ onEdit, onCreate }: UsersTableProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<IUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  
  const debouncedSearch = useDebounce(search, 300);
  const limit = 10;

  const filters = useMemo(() => ({
    page,
    limit,
    search: debouncedSearch,
    role: roleFilter || undefined,
  }), [page, limit, debouncedSearch, roleFilter]);

  const { data, isLoading, error, refetch } = useUsers(filters);
  const deleteUser = useDeleteUser();
  const reactivateUser = useReactivateUser();

  // ============================================
  // CARREGAR EMPRESAS PARA EXIBIÇÃO - CORRIGIDO
  // ============================================
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await companyService.listCompanies({ limit: 100 });
        const companyMap: Record<string, string> = {};
        
        // Verificar diferentes formatos de resposta
        let companiesList: Company[] = [];
        
        if (response && Array.isArray(response)) {
          companiesList = response;
        } else if (response && response.items && Array.isArray(response.items)) {
          companiesList = response.items;
        } else if (response && response.data && Array.isArray(response.data)) {
          companiesList = response.data;
        } else if (response && response.companies && Array.isArray(response.companies)) {
          companiesList = response.companies;
        }
        
        if (companiesList.length > 0) {
          companiesList.forEach((company) => {
            if (company && company._id) {
              companyMap[company._id] = company.name;
            }
          });
          console.log('✅ Empresas carregadas:', Object.keys(companyMap).length);
        } else {
          console.warn('⚠️ Nenhuma empresa encontrada na resposta:', response);
        }
        
        setCompanies(companyMap);
      } catch (error) {
        console.error('❌ Erro ao carregar empresas:', error);
      }
    };
    loadCompanies();
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleRoleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleDelete = useCallback((user: IUser) => {
    setDeleteTarget(user);
  }, []);

  const handleReactivate = useCallback((user: IUser) => {
    setReactivateTarget(user);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      await deleteUser.mutateAsync(deleteTarget._id);
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteUser]);

  const handleConfirmReactivate = useCallback(async () => {
    if (reactivateTarget) {
      setIsReactivating(true);
      await reactivateUser.mutateAsync(reactivateTarget._id);
      setIsReactivating(false);
      setReactivateTarget(null);
    }
  }, [reactivateTarget, reactivateUser]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('');
    setPage(1);
  }, []);

  if (isLoading) {
    return <AdminLoadingFallback />;
  }

  if (error) {
    return <AdminErrorFallback onRetry={() => refetch()} />;
  }

  const users = Array.isArray(data?.users) ? data.users : [];
  const pagination = data?.pagination;

  if (users.length === 0 && !search && !roleFilter) {
    return (
      <Card role="region" aria-label="Lista de usuários vazia">
        <CardContent className="p-8">
          <EmptyState
            icon={<Users className="h-12 w-12 text-gray-400" />}
            title="Nenhum usuário cadastrado"
            description="Comece adicionando seu primeiro usuário ao sistema."
            actionLabel="Adicionar usuário"
            onAction={onCreate}
            size="lg"
          />
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0 && (search || roleFilter)) {
    return (
      <Card role="region" aria-label="Resultados da busca vazios">
        <CardContent className="p-8">
          <EmptyState
            icon={<Users className="h-12 w-12 text-gray-400" />}
            title="Nenhum resultado encontrado"
            description={search 
              ? `Nenhum usuário encontrado para "${search}". Tente ajustar sua busca.`
              : 'Nenhum usuário encontrado com os filtros selecionados.'
            }
            actionLabel="Limpar filtros"
            onAction={handleClearFilters}
            size="lg"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AdminLoadingOverlay 
        isLoading={isDeleting || isReactivating}
        message={isDeleting ? 'Desativando usuário...' : 'Reativando usuário...'}
      >
        <Card role="region" aria-label="Tabela de usuários">
          <CardHeader>
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
              <h2 id="users-table-title" className="text-lg font-semibold text-gray-900">
                Usuários Cadastrados
              </h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto" role="search" aria-label="Buscar usuários">
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={handleSearchChange}
                    className="pl-9 w-full"
                    aria-label="Buscar usuários por nome ou email"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm w-full sm:w-auto"
                  aria-label="Filtrar por perfil"
                >
                  <option value="">Todos os perfis</option>
                  <option value="admin">Administrador</option>
                  <option value="rep">Preposto</option>
                  <option value="consultant">Consultor</option>
                  <option value="user">Usuário</option>
                </select>
                {onCreate && (
                  <Button 
                    size="sm" 
                    onClick={onCreate} 
                    className="w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    aria-label="Adicionar novo usuário"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Novo
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {users.length > 0 && (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Cabeçalho da tabela com grid */}
                  <div className="grid grid-cols-[1.5fr_2fr_1fr_0.8fr_1fr_0.8fr] items-center bg-gray-50 border-b border-gray-200 rounded-t-lg px-4 py-3 gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</span>
                  </div>

                  {/* Corpo da tabela */}
                  <div className="divide-y divide-gray-100">
                    {users.map((user, index) => (
                      <UserRow
                        key={user._id}
                        data={{ 
                          users, 
                          companies,
                          onEdit, 
                          onDelete: handleDelete, 
                          onReactivate: handleReactivate 
                        }}
                        index={index}
                        style={{}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <nav aria-label="Navegação de páginas" className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-3">
                <span className="text-sm text-gray-500">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuários
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevious}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    aria-label="Página anterior"
                    className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    aria-label="Próxima página"
                    className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </nav>
            )}
          </CardContent>
        </Card>
      </AdminLoadingOverlay>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Desativar Usuário"
        message={`Tem certeza que deseja desativar o usuário "${deleteTarget?.name || ''}"? Ele não poderá mais acessar o sistema.`}
        confirmLabel="Desativar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteUser.isPending}
      />

      <ConfirmDialog
        isOpen={!!reactivateTarget}
        title="Reativar Usuário"
        message={`Tem certeza que deseja reativar o usuário "${reactivateTarget?.name || ''}"? Ele poderá acessar o sistema novamente.`}
        confirmLabel="Reativar"
        variant="info"
        onConfirm={handleConfirmReactivate}
        onCancel={() => setReactivateTarget(null)}
        isLoading={reactivateUser.isPending}
      />
    </>
  );
});

UsersTable.displayName = 'UsersTable';
export default UsersTable;