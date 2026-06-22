// frontend/src/hooks/useRep.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repService } from '../services/rep.service';

// ============================================
// QUERIES
// ============================================

export function useRepUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
}) {
  return useQuery({
    queryKey: ['rep', 'users', params],
    queryFn: () => repService.listUsers(params),
  });
}

export function useUserProgress(userId: string) {
  return useQuery({
    queryKey: ['rep', 'progress', userId],
    queryFn: () => repService.getUserProgress(userId),
    enabled: !!userId,
  });
}

export function useOverallProgress() {
  return useQuery({
    queryKey: ['rep', 'progress', 'overall'],
    queryFn: () => repService.getOverallProgress(),
  });
}

export function useRepStats() {
  return useQuery({
    queryKey: ['rep', 'stats'],
    queryFn: () => repService.getStats(),
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      company?: string;
      department?: string;
    }) => repService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rep', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['rep', 'stats'] });
    },
  });
}

export function useAssignControls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      controlIds: string[];
    }) => repService.assignControls(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rep', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['rep', 'progress', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['rep', 'progress', 'overall'] });
      queryClient.invalidateQueries({ queryKey: ['rep', 'stats'] });
    },
  });
}
