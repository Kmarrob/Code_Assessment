// frontend/src/pages/AdminConsultantForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, UserCog, Building2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { AdminMetaTags } from '../components/admin/AdminMetaTags.js';
import { AdminBreadcrumbs } from '../components/admin/AdminBreadcrumbs.js';
import { adminService } from '../services/admin.service.js';
import { companyService } from '../services/company.service.js';
import toast from 'react-hot-toast';

interface Consultant {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
  companies: string[];
}

export const AdminConsultantForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Consultant>({
    _id: '',
    name: '',
    email: '',
    password: '',
    role: 'consultant',
    isActive: true,
    companies: [],
  });
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordRequired, setPasswordRequired] = useState(!isEditing);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Carregar empresas disponíveis
        const companiesResponse = await companyService.listCompanies({ limit: 1000 });
        setAllCompanies(companiesResponse.items || []);

        // Se for edição, carregar dados do consultor
        if (isEditing && id) {
          try {
            // Buscar o consultor pelo ID usando adminService.getUserById
            const consultant = await adminService.getUserById(id);
            
            if (consultant) {
              // Buscar empresas atribuídas ao consultor
              const allCompaniesList = await companyService.listCompanies({ limit: 1000 });
              const consultantCompanies = (allCompaniesList.items || []).filter(
                (company: any) => company.consultantId === id
              );
              const companyIds = consultantCompanies.map((c: any) => c._id);
              
              setFormData({
                _id: consultant._id,
                name: consultant.name || '',
                email: consultant.email || '',
                password: '',
                role: consultant.role || 'consultant',
                isActive: consultant.isActive !== undefined ? consultant.isActive : true,
                companies: companyIds,
              });
              setPasswordRequired(false);
            } else {
              setError('Consultor não encontrado');
            }
          } catch (err) {
            console.error('Erro ao buscar consultor:', err);
            setError('Consultor não encontrado');
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (field: keyof Consultant, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCompanyToggle = (companyId: string) => {
    setFormData((prev) => {
      const companies = prev.companies.includes(companyId)
        ? prev.companies.filter((id) => id !== companyId)
        : [...prev.companies, companyId];
      return { ...prev, companies };
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email inválido';
    if (passwordRequired && !formData.password) errors.password = 'Senha é obrigatória';
    if (passwordRequired && formData.password && formData.password.length < 8) {
      errors.password = 'Senha deve ter pelo menos 8 caracteres';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
      let consultantId = id;

      if (isEditing) {
        // Atualizar consultor
        await adminService.updateUser(id!, {
          name: formData.name,
          email: formData.email,
          role: 'consultant',
          isActive: formData.isActive,
        });
        toast.success('Consultor atualizado com sucesso');
      } else {
        // Criar novo consultor
        const newUser = await adminService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password!,
          role: 'consultant',
          isActive: true,
        });
        consultantId = newUser._id;
        toast.success('Consultor criado com sucesso');
      }

      // Atualizar empresas atribuídas ao consultor
      if (consultantId) {
        // Remover consultor de todas as empresas
        const allCompaniesList = await companyService.listCompanies({ limit: 1000 });
        for (const company of allCompaniesList.items || []) {
          if (company.consultantId === consultantId) {
            await companyService.updateCompany(company._id, {
              consultantId: null,
            });
          }
        }

        // Adicionar consultor às empresas selecionadas
        for (const companyId of formData.companies) {
          await companyService.updateCompany(companyId, {
            consultantId: consultantId,
          });
        }
      }

      navigate('/admin/consultores');
    } catch (err: any) {
      console.error('Erro ao salvar consultor:', err);
      const message = err.response?.data?.message || 'Erro ao salvar consultor';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/consultores');
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">{isEditing ? 'Carregando consultor...' : 'Carregando...'}</p>
        </div>
      </div>
    );
  }

  if (error && isEditing && !formData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error}</p>
          <Button className="mt-4" onClick={handleBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminMetaTags
        title={isEditing ? 'Editar Consultor - Admin' : 'Novo Consultor - Admin'}
        description="Cadastro e edição de consultores"
        noIndex={true}
      />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserCog className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle>{isEditing ? 'Editar Consultor' : 'Novo Consultor'}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditing
                    ? 'Edite as informações do consultor e atribua empresas'
                    : 'Cadastre um novo consultor e atribua empresas'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: João Consultor"
                  className={fieldErrors.name ? 'border-red-500' : ''}
                />
                {fieldErrors.name && <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Ex: consultor@empresa.com"
                  className={fieldErrors.email ? 'border-red-500' : ''}
                  disabled={isEditing}
                />
                {fieldErrors.email && <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>}
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-1">Email não pode ser alterado</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEditing ? 'Nova Senha (opcional)' : 'Senha *'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={isEditing ? 'Digite para alterar a senha' : 'Mínimo 8 caracteres'}
                  className={fieldErrors.password ? 'border-red-500' : ''}
                />
                {fieldErrors.password && <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>}
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-1">Deixe em branco para manter a senha atual</p>
                )}
              </div>

              {/* Status */}
              {isEditing && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Consultor ativo
                  </label>
                </div>
              )}

              {/* Empresas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresas Atribuídas
                </label>
                {allCompanies.length === 0 ? (
                  <p className="text-sm text-gray-400">Nenhuma empresa cadastrada</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {allCompanies.map((company) => (
                      <label
                        key={company._id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.companies.includes(company._id)}
                          onChange={() => handleCompanyToggle(company._id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{company.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Selecione as empresas que este consultor irá gerenciar
                </p>
              </div>

              {/* Resumo da seleção */}
              {formData.companies.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">{formData.companies.length}</span> empresas selecionadas
                  </p>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Atualizar Consultor' : 'Criar Consultor'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminConsultantForm;