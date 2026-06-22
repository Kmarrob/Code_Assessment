// frontend/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext.js';
import { Input } from '../components/ui/Input.js';
import { EmailInput } from '../components/ui/EmailInput.js';
import { PasswordInput } from '../components/ui/PasswordInput.js';
import { Container } from '../components/ui/Container.js';
import { Form, FormGroup, FormRow } from '../components/ui/Form.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card.js';
import { User, Building, Shield } from 'lucide-react';
import { RegisterMetaTags } from '../components/MetaTags.js';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(12, 'Senha deve ter pelo menos 12 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial'),
  company: z.string().optional(),
  department: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser(data);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <RegisterMetaTags />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
        <Container size="sm">
          <Card className="glass-card animate-fade-in">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Shield className="h-8 w-8 text-primary-600" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
              <CardDescription>
                Comece sua jornada de assessment digital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form
                onSubmit={handleSubmit(onSubmit)}
                isLoading={isLoading}
                submitLabel="Criar conta"
                loadingLabel="Criando conta..."
              >
                <FormGroup>
                  <Input
                    label="Nome completo"
                    placeholder="Seu nome"
                    icon={<User className="h-4 w-4" />}
                    error={errors.name?.message}
                    {...register('name')}
                    autoComplete="name"
                  />
                  
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
                    error={errors.password?.message}
                    {...register('password')}
                    autoComplete="new-password"
                  />

                  <FormRow cols={2}>
                    <Input
                      label="Empresa"
                      placeholder="Nome da empresa"
                      icon={<Building className="h-4 w-4" />}
                      error={errors.company?.message}
                      {...register('company')}
                      autoComplete="organization"
                    />
                    
                    <Input
                      label="Departamento"
                      placeholder="Seu departamento"
                      icon={<Building className="h-4 w-4" />}
                      error={errors.department?.message}
                      {...register('department')}
                      autoComplete="organization"
                    />
                  </FormRow>
                </FormGroup>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </Card>
        </Container>
      </div>
    </>
  );
};
