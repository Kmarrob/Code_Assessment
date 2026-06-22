// frontend/src/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, UserFilters } from '../services/admin.service.js';
import { showToast } from '../components/ui/Toast.js';
import { IUser } from '../types/index.js';

export const adminKeys = {
  all: ['admin'] as const,
  users: (filters: UserFilters = {}) => [...adminKeys.all, 'users', filters] as const,
  user: (id: string) => [...adminKeys.all, 'user', id] as const,
};

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: () => adminService.listUsers(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.user(id || ''),
    queryFn: () => adminService.getUserById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.createUser,
    onMutate: () => {
      showToast.loading('Criando usuário...');
    },
    onSuccess: (data) => {
      showToast.dismiss();
      showToast.success(`Usuário ${data.name} criado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao criar usuário');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminService.updateUser(id, data),
    onMutate: () => {
      showToast.loading('Atualizando usuário...');
    },
    onSuccess: (data, variables) => {
      showToast.dismiss();
      showToast.success(`Usuário ${data.name} atualizado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.id) });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao atualizar usuário');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.deleteUser,
    onMutate: () => {
      showToast.loading('Desativando usuário...');
    },
    onSuccess: (_, id) => {
      showToast.dismiss();
      showToast.success('Usuário desativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao desativar usuário');
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.reactivateUser,
    onMutate: () => {
      showToast.loading('Reativando usuário...');
    },
    onSuccess: (_, id) => {
      showToast.dismiss();
      showToast.success('Usuário reativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao reativar usuário');
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminService.resetPassword(id, password),
    onMutate: () => {
      showToast.loading('Resetando senha...');
    },
    onSuccess: (_, variables) => {
      showToast.dismiss();
      showToast.success('Senha resetada com sucesso!');
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.id) });
    },
    onError: (error: any) => {
      showToast.dismiss();
      showToast.error(error?.response?.data?.message || 'Erro ao resetar senha');
    },
  });
}
