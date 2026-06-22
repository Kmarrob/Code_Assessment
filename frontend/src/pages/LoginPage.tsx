// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
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
import { Shield } from 'lucide-react';
import { LoginMetaTags } from '../components/MetaTags.js';
import { SchemaMarkup } from '../components/SchemaMarkup.js';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
      // O login agora retorna o usuário
      const user = await login(data.email, data.password);
      
      // Redirecionar baseado no role
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
        // Fallback
        navigate('/dashboard');
      }
    } catch (error) {
      // Erro já tratado pelo AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const loginSchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Login - Code_Assessment',
    description: 'Faça login no Code_Assessment para acessar o sistema',
    url: 'https://code-assessment.com/login',
  };

  return (
    <>
      <LoginMetaTags />
      <SchemaMarkup schema={loginSchemaMarkup} />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
        <Container size="sm">
          <section aria-labelledby="login-title">
            <Card className="glass-card animate-fade-in">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-full">
                    <Shield className="h-8 w-8 text-primary-600" aria-hidden="true" />
                  </div>
                </div>
                <CardTitle id="login-title" className="text-2xl font-bold">
                  Bem-vindo de volta
                </CardTitle>
                <CardDescription>
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
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
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