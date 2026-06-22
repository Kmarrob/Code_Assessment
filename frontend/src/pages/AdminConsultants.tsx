// frontend/src/pages/AdminConsultants.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCog, Plus, Search, Edit, Trash2, Eye,
  ChevronLeft, ChevronRight, Loader2,
  Building2, RefreshCw, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { adminService } from '../services/admin.service.js';
import { companyService } from '../services/company.service.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import toast from 'react-hot-toast';

interface Consultant {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  companies?: Array<{
    _id: string;
    name: string;
    status: string;
  }>;
  createdAt: string;
}

export const AdminConsultants: React.FC = () => {
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const limit = 10;

  // Estados para modais
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingConsultant, setDeletingConsultant] = useState<Consultant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadConsultants = async (pageToLoad: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Buscar apenas usuários com role 'consultant'
      const response = await adminService.listUsers({
        page: pageToLoad,
        limit,
        search: search || undefined,
        role: 'consultant',
      });
      
      // Buscar empresas para cada consultor
      const consultantsWithCompanies = await Promise.all(
        (response.users || []).map(async (consultant: any) => {
          try {
            // Buscar todas as empresas e filtrar por consultantId
            const allCompanies = await companyService.listCompanies({ limit: 1000 });
            const consultantCompanies = (allCompanies.items || []).filter(
              (company: any) => company.consultantId === consultant._id
            );
            return {
              ...consultant,
              companies: consultantCompanies,
            };
          } catch (err) {
            return {
              ...consultant,
              companies: [],
            };
          }
        })
      );
      
      setConsultants(consultantsWithCompanies);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar consultores:', err);
      setError('Erro ao carregar consultores');
      toast.error('Erro ao carregar consultores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConsultants(page);
  }, [page, search]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleCreate = () => {
    navigate('/admin/consultores/novo');
  };

  const handleEdit = (consultant: Consultant) => {
    navigate(`/admin/consultores/${consultant._id}/editar`);
  };

  const handleView = (consultant: Consultant) => {
    navigate(`/admin/consultores/${consultant._id}`);
  };

  const handleDeleteClick = (consultant: Consultant) => {
    setDeletingConsultant(consultant);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingConsultant) return;
    setIsDeleting(true);
    try {
      await adminService.deleteUser(deletingConsultant._id);
      toast.success('Consultor removido com sucesso');
      setIsDeleteModalOpen(false);
      setDeletingConsultant(null);
      await loadConsultants(page);
    } catch (error) {
      console.error('Erro ao remover consultor:', error);
      toast.error('Erro ao remover consultor');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (consultant: Consultant) => {
    try {
      if (consultant.isActive) {
        await adminService.deleteUser(consultant._id);
        toast.success('Consultor desativado');
      } else {
        await adminService.reactivateUser(consultant._id);
        toast.success('Consultor reativado');
      }
      await loadConsultants(page);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && consultants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando consultores...</p>
        </div>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
        <CheckCircle className="h-3.5 w-3.5" />
        Ativo
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-red-600 text-sm">
        <XCircle className="h-3.5 w-3.5" />
        Inativo
      </span>
    );
  };

  return (
    <>
      <AdminMetaTags
        title="Consultores - Admin"
        description="Gerenciamento de consultores do sistema"
        noIndex={true}
      />

      <div className="container mx-auto px-4 py-8">
        <AdminBreadcrumbs />

        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consultores</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os consultores e suas empresas atribuídas
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Consultor
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" size="sm">
                Filtrar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleClearFilters}>
                Limpar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Listagem */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600">{error}</p>
                <Button className="mt-4" onClick={() => loadConsultants(page)}>Tentar novamente</Button>
              </div>
            ) : consultants.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <UserCog className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>Nenhum consultor encontrado</p>
                <p className="text-sm text-gray-400 mt-1">
                  Clique em "Novo Consultor" para cadastrar
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Consultor</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Email</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Empresas</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {consultants.map((consultant) => (
                    <tr key={consultant._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{consultant.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{consultant.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {consultant.companies && consultant.companies.length > 0 ? (
                            consultant.companies.map((company) => (
                              <span
                                key={company._id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {company.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">Nenhuma empresa</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(consultant.isActive)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Visualizar - Redireciona para página de detalhes */}
                          <button
                            onClick={() => handleView(consultant)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {/* Editar - Redireciona para formulário de edição */}
                          <button
                            onClick={() => handleEdit(consultant)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {/* Ativar/Desativar */}
                          <button
                            onClick={() => handleToggleActive(consultant)}
                            className={`transition-colors p-1 rounded ${
                              consultant.isActive
                                ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            }`}
                            title={consultant.isActive ? 'Desativar' : 'Reativar'}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          {/* Remover - Abre modal de confirmação */}
                          <button
                            onClick={() => handleDeleteClick(consultant)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevious}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasPrevious
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasNext
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================
          MODAL DE CONFIRMAÇÃO PARA EXCLUIR
          ============================================ */}
      <ConfirmDialog
  isOpen={isDeleteModalOpen}
  onClose={() => {
    setIsDeleteModalOpen(false);
    setDeletingConsultant(null);
  }}
  onConfirm={handleConfirmDelete}
  title="Remover Consultor"
  message={`Tem certeza que deseja remover o consultor "${deletingConsultant?.name}"?`}
  confirmText="Remover"
  isLoading={isDeleting}
  variant="danger"  // <-- MUDAR DE "destructive" para "danger"
/>
    </>
  );
};

export default AdminConsultants;