// frontend/src/pages/AdminCompanies.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Search, ChevronLeft, ChevronRight, 
  Loader2, Edit, Trash2, Users, RefreshCw, ClipboardList  // <-- ADICIONADO
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { companyService, Company } from '../services/company.service.js';
import { CompanyFormModal } from '../components/admin/CompanyFormModal.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';

export const AdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 20;

  // Estados para modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================
  // CARREGAR EMPRESAS
  // ============================================
  const loadCompanies = async (pageToLoad: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await companyService.listCompanies({
        page: pageToLoad,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setCompanies(response.items || []);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Erro ao carregar empresas:', err);
      setError('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies(page);
  }, [page, search, statusFilter]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (company: Company) => {
    setDeletingCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCompany = async (data: Partial<Company>) => {
    setIsSubmitting(true);
    try {
      if (editingCompany) {
        await companyService.updateCompany(editingCompany._id, data);
      } else {
        await companyService.createCompany(data as any);
      }
      setIsModalOpen(false);
      setEditingCompany(null);
      await loadCompanies(page);
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCompany) return;
    setIsDeleting(true);
    try {
      await companyService.deactivateCompany(deletingCompany._id);
      setIsDeleteModalOpen(false);
      setDeletingCompany(null);
      await loadCompanies(page);
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivate = async (company: Company) => {
    if (!confirm(`Deseja reativar a empresa "${company.name}"?`)) return;
    try {
      await companyService.reactivateCompany(company._id);
      await loadCompanies(page);
    } catch (error: any) {
      console.error('Erro ao reativar empresa:', error);
    }
  };

  // ============================================
  // ATRIBUIR CONTROLES À EMPRESA - ADICIONADO
  // ============================================
  const handleAssignControls = async (company: Company) => {
    if (!confirm(`Deseja atribuir todos os 93 controles à empresa "${company.name}"?`)) return;
    
    try {
      const result = await companyService.assignAllControls(company._id);
      await loadCompanies(page);
    } catch (error: any) {
      console.error('Erro ao atribuir controles:', error);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && companies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativa' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inativa' },
      suspended: { color: 'bg-red-100 text-red-800', label: 'Suspensa' },
    };
    const config = configs[status as keyof typeof configs] || configs.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const configs = {
      basic: { color: 'bg-blue-100 text-blue-800', label: 'Basic' },
      pro: { color: 'bg-purple-100 text-purple-800', label: 'Pro' },
      enterprise: { color: 'bg-yellow-100 text-yellow-800', label: 'Enterprise' },
    };
    const config = configs[plan as keyof typeof configs] || configs.basic;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <AdminMetaTags
        title="Empresas - Admin"
        description="Gerenciamento de empresas do sistema"
        noIndex={true}
      />

      <div className="container mx-auto px-4 py-8">
        <AdminBreadcrumbs />

        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
            <p className="text-gray-600 mt-1">Gerencie as empresas cadastradas no sistema</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou CNPJ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os status</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                  <option value="suspended">Suspensas</option>
                </select>
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
            {companies.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>Nenhuma empresa encontrada</p>
                <p className="text-sm text-gray-400 mt-1">
                  Clique em "Nova Empresa" para cadastrar
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Empresa</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">CNPJ</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Plano</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Usuários</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Controles</th>  {/* <-- ADICIONADO */}
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {companies.map((company) => (
                    <tr key={company._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{company.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                        {company.cnpj || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {getPlanBadge(company.plan)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{company.userCount || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">  {/* <-- ADICIONADO */}
                        <div className="flex items-center gap-1 text-gray-600">
                          <ClipboardList className="h-4 w-4" />
                          <span>{company.assignedControlsCount || 0}/93</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(company.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Botão Atribuir Controles - ADICIONADO */}
                          <button
                            onClick={() => handleAssignControls(company)}
                            className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                            title="Atribuir todos os controles"
                          >
                            <ClipboardList className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(company)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {company.status === 'active' ? (
                            <button
                              onClick={() => handleDeleteClick(company)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                              title="Desativar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(company)}
                              className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                              title="Reativar"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
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
          MODAIS
          ============================================ */}

      <CompanyFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleSaveCompany}
        company={editingCompany}
        title={editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCompany(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Desativar Empresa"
        message={`Tem certeza que deseja desativar a empresa "${deletingCompany?.name}"? Todos os usuários vinculados serão desativados.`}
        confirmText="Desativar"
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
};

export default AdminCompanies;