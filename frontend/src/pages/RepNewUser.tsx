// frontend/src/pages/rep/RepNewUser.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Loader2, AlertCircle, Mail, Crown, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { repService } from '../services/rep.service.js';

export const RepNewUser: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // 🔴 NOVO: Estado para o modal de upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao digitar
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Limpar mensagem de sucesso/erro ao digitar
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 🔴 NOVO: Função para fechar o modal
  const handleCloseModal = () => {
    setShowUpgradeModal(false);
  };

  // 🔴 NOVO: Função para redirecionar para a página de planos
  const handleUpgrade = () => {
    navigate('/plans');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await repService.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim() || undefined,
      });

      setSuccess(`✅ Usuário ${formData.name} criado com sucesso! Um e-mail com o link para criar a senha foi enviado para ${formData.email}.`);
      
      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        department: '',
      });
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/rep');
      }, 3000);
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err);
      
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Erro ao criar usuário. Tente novamente.';
      
      // 🔴 NOVO: Verificar se é erro de limite de usuários (403)
      if (status === 403 && message.includes('Limite de usuários')) {
        setUpgradeMessage(message);
        setShowUpgradeModal(true);
        setError(null);
      } else {
        setError(message);
      }

      const errors = err.response?.data?.errors;
      if (errors) {
        const fieldErrors: Record<string, string> = {};
        
        if (Array.isArray(errors)) {
          errors.forEach((e: any) => {
            if (e.field) {
              fieldErrors[e.field] = e.message;
            }
          });
        } else if (typeof errors === 'object') {
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              fieldErrors[field] = messages[0];
            } else if (typeof messages === 'string') {
              fieldErrors[field] = messages;
            }
          });
        }
        
        setFieldErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/rep');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Botão voltar */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Novo Usuário</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Cadastre um novo usuário — ele receberá um e-mail para criar a própria senha
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Erro geral */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Sucesso */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">{success}</p>
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
                  placeholder="Ex: João Silva"
                  className={fieldErrors.name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
                )}
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
                  placeholder="Ex: joao@empresa.com"
                  className={fieldErrors.email ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  📧 O usuário receberá um e-mail com o link para criar a própria senha
                </p>
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <Input
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Ex: TI, RH, Financeiro"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1">Opcional</p>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar Usuário
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informação adicional */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-start gap-2">
            <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold">💡 Como funciona:</span> O usuário receberá um e-mail com um link 
              para criar sua própria senha de acesso. Após definir a senha, poderá acessar o sistema normalmente.
            </span>
          </p>
        </div>
      </div>

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
    </div>
  );
};

export default RepNewUser;