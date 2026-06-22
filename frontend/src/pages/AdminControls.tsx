// frontend/src/pages/AdminControls.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Card, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Search, ChevronLeft, ChevronRight, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { ControlFormModal } from '../components/admin/ControlFormModal.js';
import { ConfirmDeleteModal } from '../components/admin/ConfirmDeleteModal.js';

interface Control {
  _id: string;
  id: string;
  nome: string;
  controles: string;
  dominioDeSI: string[];
  tipoDeControle: string[];
  propriedadeDeSI: string[];
  conceitoDeSegurancaCibernetica: string[];
  capacidadesOperacionais: string[];
}

export const AdminControls: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dominio, setDominio] = useState('');
  const [controls, setControls] = useState<Control[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;

  // Estados para modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingControl, setDeletingControl] = useState<Control | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // FUNÇÃO PARA CARREGAR OS CONTROLES
  // ============================================
  const loadControls = async (pageToLoad: number) => {
    console.log('🔄 Carregando controles - Página:', pageToLoad);
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('page', String(pageToLoad));
      params.append('limit', String(limit));
      params.append('sort', 'id');
      if (search) params.append('search', search);
      if (dominio) params.append('dominio', dominio);
      
      const response = await api.get(`/admin/controls?${params.toString()}`);
      console.log('📦 Resposta:', response.data);
      
      setControls(response.data.data.controls || []);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('❌ Erro:', err);
      setError('Erro ao carregar controles');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // CARREGAR QUANDO A PÁGINA MUDAR
  // ============================================
  useEffect(() => {
    loadControls(page);
  }, [page]);

  // ============================================
  // HANDLERS DE CRUD
  // ============================================
  
  // Abrir modal de criação
  const handleCreate = () => {
    setEditingControl(null);
    setIsModalOpen(true);
  };

  // Abrir modal de edição
  const handleEdit = (control: Control) => {
    setEditingControl(control);
    setIsModalOpen(true);
  };

  // Abrir modal de exclusão
  const handleDeleteClick = (control: Control) => {
    setDeletingControl(control);
    setIsDeleteModalOpen(true);
  };

  // Salvar controle (criar ou atualizar)
  const handleSaveControl = async (data: Partial<Control>) => {
    setIsSubmitting(true);
    try {
      if (editingControl) {
        // Atualizar
        await api.put(`/admin/controls/${editingControl._id}`, data);
        console.log('✅ Controle atualizado com sucesso');
      } else {
        // Criar
        await api.post('/admin/controls', data);
        console.log('✅ Controle criado com sucesso');
      }
      setIsModalOpen(false);
      setEditingControl(null);
      // Recarregar a lista
      await loadControls(page);
    } catch (error: any) {
      console.error('❌ Erro ao salvar controle:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!deletingControl) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/controls/${deletingControl._id}`);
      console.log('✅ Controle excluído com sucesso');
      setIsDeleteModalOpen(false);
      setDeletingControl(null);
      // Recarregar a lista
      await loadControls(page);
    } catch (error: any) {
      console.error('❌ Erro ao excluir controle:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // HANDLERS DE FILTRO E PAGINAÇÃO
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDominio('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    console.log('📄 Mudando para página:', newPage);
    if (newPage === page) return;
    if (newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading && controls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando controles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error}</p>
          <Button className="mt-4" onClick={() => loadControls(page)}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  // Gerar números das páginas
  const getPageNumbers = () => {
    if (!pagination) return [];
    
    const total = pagination.totalPages || 1;
    const current = pagination.page || 1;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - current) <= delta) {
        range.push(i);
      }
    }

    let last: number | null = null;
    for (const i of range) {
      if (last !== null && i - last > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();
  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;
  const hasPagination = totalPages > 1;

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <>
      <AdminMetaTags
        title="Controles ISO 27001 - Code_Assessment"
        description="Lista dos 93 controles da ISO 27001 cadastrados no sistema."
        noIndex={true}
      />

      <div className="container mx-auto px-4 py-8">
        <AdminBreadcrumbs />

        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Controles ISO 27001</h1>
            <p className="text-gray-600 mt-1">Visualize todos os 93 controles da norma</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Total: <span className="font-bold">{pagination?.total || 0}</span> controles
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Controle
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar por ID ou nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <select
                  value={dominio}
                  onChange={(e) => setDominio(e.target.value)}
                  className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Todos os domínios</option>
                  <option value="Governança e ecossistema">Governança e ecossistema</option>
                  <option value="Proteção">Proteção</option>
                  <option value="Defesa">Defesa</option>
                  <option value="Resiliência">Resiliência</option>
                </select>
              </div>
              <Button type="submit" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleClearFilters}>
                Limpar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Nome</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 min-w-[200px]">Controle</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Domínio</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Tipo</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Propriedades SI</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Conceitos</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Capacidades</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {controls.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      Nenhum controle encontrado
                    </td>
                  </tr>
                ) : (
                  controls.map((control) => (
                    <tr key={control._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{control.id}</td>
                      <td className="py-3 px-4 text-gray-900 max-w-xs truncate" title={control.nome}>
                        {control.nome}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-md truncate" title={control.controles}>
                        {control.controles || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {control.dominioDeSI?.join(', ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {control.tipoDeControle?.join(', ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {control.propriedadeDeSI?.join(', ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {control.conceitoDeSegurancaCibernetica?.join(', ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {control.capacidadesOperacionais?.join(', ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(control)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(control)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* ============================================
            PAGINAÇÃO
            ============================================ */}
        <div className="mt-6 pt-4 border-t-2 border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              Mostrando <span className="font-semibold">{controls.length}</span> de <span className="font-semibold">{pagination?.total || 0}</span> controles
              {hasPagination && (
                <span className="ml-2">
                  • Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Anterior */}
              <button
                onClick={() => {
                  console.log('🔙 Anterior clicado!');
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
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

              {/* Números */}
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg">
                {pageNumbers.length > 0 ? (
                  pageNumbers.map((item, index) => (
                    typeof item === 'number' ? (
                      <button
                        key={index}
                        onClick={() => {
                          console.log('🔢 Número clicado:', item);
                          handlePageChange(item);
                        }}
                        className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          item === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={index} className="px-1 text-gray-400 text-sm">
                        {item}
                      </span>
                    )
                  ))
                ) : (
                  <span className="text-sm text-gray-500 px-2">
                    {hasPagination ? `${currentPage} / ${totalPages}` : 'Única página'}
                  </span>
                )}
              </div>

              {/* Próximo */}
              <button
                onClick={() => {
                  console.log('🔜 Próximo clicado!');
                  if (currentPage < totalPages) {
                    handlePageChange(currentPage + 1);
                  }
                }}
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
      </div>

      {/* ============================================
          MODAIS
          ============================================ */}

      {/* Modal de Criação/Edição */}
      <ControlFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingControl(null);
        }}
        onSave={handleSaveControl}
        control={editingControl}
        title={editingControl ? 'Editar Controle' : 'Novo Controle'}
        isLoading={isSubmitting}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingControl(null);
        }}
        onConfirm={handleConfirmDelete}
        controlId={deletingControl?.id || ''}
        controlName={deletingControl?.nome || ''}
        isLoading={isSubmitting}
      />
    </>
  );
};

export default AdminControls;