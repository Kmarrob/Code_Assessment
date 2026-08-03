import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governanceService } from '../services/governance.service';
import {
  GovernanceDocument,
  GovernanceFilters,
  CreateGovernanceDocumentDTO,
  UpdateGovernanceDocumentDTO,
} from '../types/governance.types';

// Extender os filtros para incluir isAdmin
interface GovernanceQueryFilters extends GovernanceFilters {
  isAdmin?: boolean;
}

export function useGovernanceDocuments(filters?: GovernanceQueryFilters) {
  const { isAdmin, ...restFilters } = filters || {};
  
  return useQuery({
    queryKey: ['governance', 'documents', filters],
    queryFn: () => {
      if (isAdmin) {
        return governanceService.listDocuments(restFilters);
      } else {
        return governanceService.repListDocuments(restFilters);
      }
    },
  });
}

export function useGovernanceDocument(id: string) {
  return useQuery({
    queryKey: ['governance', 'document', id],
    queryFn: () => governanceService.getDocument(id),
    enabled: !!id,
  });
}

export function useGovernanceViewDocument(id: string, isAdmin?: boolean) {
  return useQuery({
    queryKey: ['governance', 'document', 'view', id],
    queryFn: () => {
      if (isAdmin) {
        return governanceService.viewDocument(id);
      } else {
        return governanceService.repViewDocument(id);
      }
    },
    enabled: !!id,
  });
}

export function useGovernanceTree() {
  return useQuery({
    queryKey: ['governance', 'tree'],
    queryFn: () => governanceService.getDocumentTree(),
  });
}

export function useGovernanceDocumentsByLevel(level: 1 | 2 | 3 | 4 | 5) {
  return useQuery({
    queryKey: ['governance', 'documents', 'level', level],
    queryFn: () => governanceService.getDocumentsByLevel(level),
  });
}

export function useCreateGovernanceDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGovernanceDocumentDTO) => governanceService.createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance'] });
    },
  });
}

export function useUpdateGovernanceDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGovernanceDocumentDTO }) =>
      governanceService.updateDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['governance'] });
      queryClient.invalidateQueries({ queryKey: ['governance', 'document', variables.id] });
    },
  });
}

export function useDeleteGovernanceDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => governanceService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance'] });
    },
  });
}

export function useApproveGovernanceDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => governanceService.approveDocument(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['governance'] });
      queryClient.invalidateQueries({ queryKey: ['governance', 'document', id] });
    },
  });
}