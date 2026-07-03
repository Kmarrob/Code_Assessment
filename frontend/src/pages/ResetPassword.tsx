// frontend/src/pages/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle,
  ArrowLeft, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { authService } from '../services/auth.service.js';

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ============================================
  // VALIDAR TOKEN
  // ============================================
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token de redefinição não fornecido');
        setIsValidating(false);
        return;
      }

      try {
        // Validar token com o backend
        await authService.validateResetToken(token);
        setIsValidToken(true);
        setError(null);
      } catch (err: any) {
        console.error('Token inválido:', err);
        setError(err.response?.data?.message || 'Link de redefinição inválido ou expirado');
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      errors.password = 'Senha deve ter no mínimo 8 caracteres';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Senha deve conter pelo menos 1 letra maiúscula';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Senha deve conter pelo menos 1 letra minúscula';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Senha deve conter pelo menos 1 número';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      errors.password = 'Senha deve conter pelo menos 1 caractere especial';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirme sua senha';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
      await authService.resetPassword(token!, formData.password);
      
      setSuccess('✅ Senha redefinida com sucesso!');
      
      // Redirecionar para o login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      setError(err.response?.data?.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Validando link de redefinição...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Link Inválido</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Este link não é mais válido</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">{error || 'O link de redefinição de senha é inválido ou expirou.'}</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Voltar para o Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Code_Assessment</span>
          </div>
          <p className="text-gray-500 text-sm">Sistema de Avaliação de Maturidade ISO 27001</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Criar Nova Senha</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Defina sua senha de acesso ao sistema
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Erro geral */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Sucesso */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {/* Nova Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className={`pl-9 pr-10 ${fieldErrors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded ${/[A-Z]/.test(formData.password) ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    Maiúscula
                  </span>
                  <span className={`px-2 py-0.5 rounded ${/[a-z]/.test(formData.password) ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    Minúscula
                  </span>
                  <span className={`px-2 py-0.5 rounded ${/[0-9]/.test(formData.password) ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    Número
                  </span>
                  <span className={`px-2 py-0.5 rounded ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    Especial
                  </span>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Digite a senha novamente"
                    className={`pl-9 pr-10 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Botão */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Criar Senha
                  </>
                )}
              </Button>

              {/* Link para login */}
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Voltar para o login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;