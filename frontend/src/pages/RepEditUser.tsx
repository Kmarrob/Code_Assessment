// frontend/src/pages/RepEditUser.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Building2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserCheck,
  Eye,
  Users,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { repService } from '../services/rep.service.js';
import { User as UserType } from '../types';

// ============================================================
// 🆕 v52.0 — ROLES DISPONÍVEIS PARA EDIÇÃO
// ============================================================
//
// MOTIVO:
//   O REP precisa poder alterar o papel de um usuário já
//   cadastrado (ex.: promover user → auditor, ou rebaixar
//   auditor → observer).
//
// REGRAS:
//   - Só aceita os 4 roles que o REP pode gerenciar.
//   - role não pode ser alterado para rep/admin/consultant.
//
// ============================================================

type RoleOption = {
  value: string;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'user',
    label: 'Usuário Comum',
    description: 'Responde aos controles atribuídos',
    Icon: Users,
  },
  {
    value: 'auditor_lead',
    label: 'Auditor Líder',
    description: 'Aprova planos, executa e vê relatórios',
    Icon: ShieldCheck,
  },
  {
    value: 'auditor',
    label: 'Auditor',
    description: 'Executa auditoria em parceria',
    Icon: UserCheck,
  },
  {
    value: 'observer',
    label: 'Observador',
    description: 'Acompanha em modo somente leitura',
    Icon: Eye,
  },
];

export const RepEditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'user', // 🆕 v52.0
  });

  const [originalEmail, setOriginalEmail] = useState('');
  const [originalRole, setOriginalRole] = useState('user');

  // ============================================
  // CARREGAR DADOS DO USUÁRIO
  // ============================================
  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        setError('ID do usuário não fornecido');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Buscar lista de usuários e encontrar o específico
        const response = await repService.listUsers({ page: 1, limit: 100 });
        const user = response.items.find((u) => u._id === userId);

        if (!user) {
          setError('Usuário não encontrado');
          setIsLoading(false);
          return;
        }

        setFormData({
          name: user.name || '',
          email: user.email || '',
          department: user.department || '',
          // 🆕 v52.0 — Carrega o role atual
          role: (user as any).role || 'user',
        });
        setOriginalEmail(user.email || '');
        setOriginalRole((user as any).role || 'user');
        setError(null);
      } catch (err: any) {
        console.error('Erro ao carregar usuário:', err);
        setError(err.response?.data?.message || 'Erro ao carregar dados do usuário');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return;
    }

    // Verificar se houve alterações
    const hasChanges =
      formData.name !== '' ||
      formData.email !== originalEmail ||
      formData.department !== '' ||
      formData.role !== originalRole;

    if (!hasChanges) {
      setError('Nenhuma alteração foi feita');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Montar payload apenas com campos alterados
      const updateData: any = {};
      if (formData.name && formData.name !== '') {
        updateData.name = formData.name;
      }
      if (formData.email && formData.email !== originalEmail) {
        updateData.email = formData.email;
      }
      if (formData.department !== undefined) {
        updateData.department = formData.department;
      }
      // 🆕 v52.0 — Só envia o role se mudou
      if (formData.role !== originalRole) {
        updateData.role = formData.role;
      }

      await repService.updateUser(userId!, updateData);

      setSuccessMessage('Usuário atualizado com sucesso!');

      // 🔴 CORRIGIDO: Redirecionar para o painel do preposto (lista de usuários)
      setTimeout(() => {
        navigate('/rep');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // 🔴 CORRIGIDO: Redirecionar para o painel do preposto (lista de usuários)
    navigate('/rep');
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

  const roleChanged = formData.role !== originalRole;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Usuário</h1>
            <p className="text-gray-600 text-sm">Atualize as informações do usuário</p>
          </div>
        </div>

        {/* Card de edição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Dados do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="Nome completo"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="email@empresa.com"
                    disabled={isSubmitting}
                  />
                </div>
                {originalEmail && formData.email !== originalEmail && (
                  <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    O email será alterado de <strong>{originalEmail}</strong> para <strong>{formData.email}</strong>
                  </p>
                )}
              </div>

              {/* Departamento */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="Ex: Tecnologia da Informação"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* ============================================================
                  🆕 v52.0 — SELECT DE ROLE
                  ============================================================
                  Permite alterar o papel do usuário.
                  Mostra aviso visual quando o role está sendo alterado.
                  ============================================================ */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função / Papel
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.Icon;
                    const isSelected = formData.role === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleRoleChange(option.value)}
                        disabled={isSubmitting}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            isSelected ? 'bg-indigo-100' : 'bg-gray-100'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              isSelected ? 'text-indigo-600' : 'text-gray-500'
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              isSelected ? 'text-indigo-900' : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {roleChanged && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      A função está sendo alterada de <strong>{originalRole}</strong> para <strong>{formData.role}</strong>.
                      Isso afetará o que o usuário poderá acessar no sistema.
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                  <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-green-700 text-sm">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informação adicional */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Campos marcados com * são obrigatórios</p>
        </div>
      </div>
    </div>
  );
};

export default RepEditUser;