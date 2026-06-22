// frontend/src/pages/AdminConsultantView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserCog, Building2, Mail, User, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { adminService } from '../services/admin.service.js';
import { companyService } from '../services/company.service.js';
import toast from 'react-hot-toast';

interface Consultant {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AdminConsultantView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!id) {
          setError('ID do consultor não informado');
          setIsLoading(false);
          return;
        }

        // Buscar consultor
        const consultantData = await adminService.getUserById(id);
        setConsultant(consultantData);

        // Buscar empresas atribuídas ao consultor
        const allCompanies = await companyService.listCompanies({ limit: 1000 });
        const consultantCompanies = (allCompanies.items || []).filter(
          (company: any) => company.consultantId === id
        );
        setCompanies(consultantCompanies);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do consultor');
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleBack = () => {
    navigate('/admin/consultores');
  };

  const handleEdit = () => {
    navigate(`/admin/consultores/${id}/editar`);
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando dados do consultor...</p>
        </div>
      </div>
    );
  }

  if (error || !consultant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error || 'Consultor não encontrado'}</p>
          <Button className="mt-4" onClick={handleBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <AdminMetaTags
        title={`Consultor: ${consultant.name} - Admin`}
        description="Visualização de consultor"
        noIndex={true}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AdminBreadcrumbs />

        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para consultores
        </button>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <UserCog className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{consultant.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Visualização detalhada do consultor
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEdit}>
                  Editar Consultor
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Nome Completo</p>
                      <p className="text-gray-900 font-medium">{consultant.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium">{consultant.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-gray-400 mt-0.5">👤</div>
                    <div>
                      <p className="text-xs text-gray-500">Perfil</p>
                      <p className="text-gray-900 font-medium">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Consultor
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-5 w-5 text-gray-400 mt-0.5">📋</div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-gray-900 font-medium">
                        {consultant.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            Inativo
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Criado em</p>
                    <p className="text-sm text-gray-700">{formatDate(consultant.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Última atualização</p>
                    <p className="text-sm text-gray-700">{formatDate(consultant.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Empresas Atribuídas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Empresas Atribuídas
                </h3>
                {companies.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Building2 className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Nenhuma empresa atribuída a este consultor</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Clique em "Editar" para atribuir empresas
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {companies.map((company) => (
                      <div
                        key={company._id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Building2 className="h-5 w-5 text-indigo-500" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500">
                            {company.status === 'active' ? 'Ativa' : 'Inativa'}
                          </p>
                        </div>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Atribuída
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumo */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Resumo:</span>{' '}
                  {consultant.name} é um consultor {consultant.isActive ? 'ativo' : 'inativo'} com{' '}
                  <span className="font-semibold">{companies.length}</span> empresa(s) atribuída(s).
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleEdit}
                  className="flex-1"
                >
                  Editar Consultor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminConsultantView;