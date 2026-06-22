// frontend/src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';
import { User, Mail, Building, Shield, Lock } from 'lucide-react';
import { getRoleLabel, getRoleColor } from '../utils/helpers.js';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  company: z.string().optional(),
  department: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      company: user?.company || '',
      department: user?.department || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      const updateData: any = {
        name: data.name,
        company: data.company,
        department: data.department,
      };
      if (data.currentPassword && data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }
      await updateProfile(updateData);
      setShowPasswordFields(false);
      reset({ ...data, currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
        </div>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role || 'user')}`}>
                    {getRoleLabel(user?.role || 'user')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nome completo"
                  icon={<User className="h-4 w-4" />}
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  value={user?.email}
                  disabled
                  icon={<Mail className="h-4 w-4" />}
                  className="bg-gray-50"
                />
                <Input
                  label="Empresa"
                  icon={<Building className="h-4 w-4" />}
                  error={errors.company?.message}
                  {...register('company')}
                />
                <Input
                  label="Departamento"
                  icon={<Building className="h-4 w-4" />}
                  error={errors.department?.message}
                  {...register('department')}
                />

                {/* Password Change Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {showPasswordFields ? 'Cancelar alteração de senha' : 'Alterar senha'}
                  </button>
                </div>

                {showPasswordFields && (
                  <div className="space-y-4 border-t border-gray-200 pt-4 mt-2">
                    <Input
                      label="Senha atual"
                      type="password"
                      placeholder="••••••••"
                      error={errors.currentPassword?.message}
                      {...register('currentPassword')}
                    />
                    <Input
                      label="Nova senha"
                      type="password"
                      placeholder="••••••••"
                      error={errors.newPassword?.message}
                      {...register('newPassword')}
                    />
                    <Input
                      label="Confirmar nova senha"
                      type="password"
                      placeholder="••••••••"
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword')}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" loading={isLoading}>
                  Salvar alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;