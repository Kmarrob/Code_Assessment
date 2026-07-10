// frontend/src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext.js';
import { EmailInput } from '../components/ui/EmailInput.js';
import { PasswordInput } from '../components/ui/PasswordInput.js';
import { Container } from '../components/ui/Container.js';
import { Form, FormGroup } from '../components/ui/Form.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Shield, Building2 } from 'lucide-react';
import { LoginMetaTags } from '../components/MetaTags.js';
import { SchemaMarkup } from '../components/SchemaMarkup.js';
import { brandingService, PublicBrandingData } from '../services/branding.service.js';

// Cores da paleta MRS
const MRS_COLORS = {
  primary: '#122A40',
  secondary: '#1E5359',
  accent: '#30736C',
  background: '#F2F2F2',
  text: '#122A40',
};

// Logo da MRS Consultoria (caminho fixo - imagem local - FALLBACK)
const MRS_LOGO_FALLBACK = '/images/brand/logo-mrs.png';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [branding, setBranding] = useState<PublicBrandingData | null>(null);

  // Buscar branding ao carregar
  useEffect(() => {
    const loadBranding = async () => {
      try {
        // TODO: Buscar o companyId da empresa principal
        const companyId = '67f8a1b2c3d4e5f6g7h8i9j0';
        const data = await brandingService.getPublicBranding(companyId);
        setBranding(data);
      } catch (error) {
        console.error('Erro ao carregar branding no login:', error);
      }
    };
    loadBranding();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const user = await login(data.email, data.password);
      
      if (user) {
        const role = user.role;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'rep') {
          navigate('/rep');
        } else if (role === 'consultant') {
          navigate('/consultant');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Erro já tratado pelo AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  // Obter cores do branding ou usar padrão
  const colors = branding?.colors || MRS_COLORS;
  const showLogo = branding?.settings?.showLogoInHeader !== false;
  const logoUrl = branding?.logo?.url;

  // Determinar qual logo usar: a da API ou a fallback local
  const finalLogoUrl = (showLogo && logoUrl) ? logoUrl : MRS_LOGO_FALLBACK;

  const loginSchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Login - MRS Consultoria',
    description: 'Faça login no sistema MRS Consultoria para acessar o painel',
    url: 'https://code-assessment.com/login',
  };

  // Gradiente personalizado com as cores da marca
  const gradientStyle = {
    background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 50%, ${colors.accent}15 100%)`
  };

  return (
    <>
      <LoginMetaTags />
      <SchemaMarkup schema={loginSchemaMarkup} />
      <main 
        className="min-h-screen flex items-center justify-center p-4"
        style={gradientStyle}
      >
        <Container size="sm">
          <section aria-labelledby="login-title">
            <Card 
              className="animate-fade-in border-0 shadow-xl"
              style={{ 
                backgroundColor: colors.background || '#FFFFFF',
                borderColor: colors.accent + '30' || '#E5E7EB',
              }}
            >
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <img
                    src={finalLogoUrl}
                    alt="MRS Consultoria"
                    className="h-28 w-auto object-contain"
                    style={{ maxHeight: '112px' }}
                    onError={(e) => {
                      // Se a imagem da API falhar, tenta a fallback
                      if (e.currentTarget.src !== MRS_LOGO_FALLBACK) {
                        e.currentTarget.src = MRS_LOGO_FALLBACK;
                      } else {
                        // Se a fallback também falhar, mostra o ícone
                        e.currentTarget.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'p-3 rounded-full';
                        fallback.style.backgroundColor = colors.accent + '20' || '#f0fdf4';
                        const icon = document.createElement('div');
                        icon.className = 'h-8 w-8';
                        icon.style.color = colors.primary || '#122A40';
                        icon.textContent = '🏢';
                        fallback.appendChild(icon);
                        e.currentTarget.parentNode?.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <CardTitle 
                  id="login-title" 
                  className="text-2xl font-bold"
                  style={{ color: colors.primary || '#122A40' }}
                >
                  Bem-vindo de volta
                </CardTitle>
                <CardDescription style={{ color: colors.secondary || '#1E5359' }}>
                  Entre com suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form
                  onSubmit={handleSubmit(onSubmit)}
                  isLoading={isLoading}
                  submitLabel="Entrar"
                  loadingLabel="Entrando..."
                >
                  <FormGroup>
                    <EmailInput
                      label="Email"
                      placeholder="seu@email.com"
                      error={errors.email?.message}
                      {...register('email')}
                      autoComplete="email"
                    />
                    
                    <PasswordInput
                      label="Senha"
                      placeholder="••••••••"
                      showStrength={false}
                      error={errors.password?.message}
                      {...register('password')}
                      autoComplete="current-password"
                    />
                  </FormGroup>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm" style={{ color: colors.text || '#122A40' }}>
                  Não tem uma conta?{' '}
                  <Link 
                    to="/register" 
                    className="font-medium hover:opacity-70 transition-opacity"
                    style={{ color: colors.accent || '#30736C' }}
                  >
                    Cadastre-se
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </section>
        </Container>
      </main>
    </>
  );
};