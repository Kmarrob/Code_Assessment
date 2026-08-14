import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuditFindingForm } from '../../../components/forms/AuditFindingForm';
import { useFinding, useCreateFinding, useUpdateFinding } from '../../../hooks/useAudit';
import { CreateAuditFindingDTO } from '../../../types/audit.types';

export function RepAuditFindingForm() {
  const navigate = useNavigate();
  const { planId, findingId } = useParams<{ planId: string; findingId: string }>();
  const isEditing = !!findingId && findingId !== 'new';

  const { data: existingFinding, isLoading: isLoadingFinding } = useFinding(findingId || '');
  const createFinding = useCreateFinding();
  const updateFinding = useUpdateFinding();

  const handleSubmit = async (data: CreateAuditFindingDTO) => {
    if (!planId) return;
    
    if (isEditing && findingId) {
      await updateFinding.mutateAsync({ id: findingId, data });
    } else {
      await createFinding.mutateAsync({ planId, data });
    }
    navigate(`/rep/audit/findings/${planId}`);
  };

  const isSubmitting = createFinding.isPending || updateFinding.isPending;

  if (isLoadingFinding && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/rep/audit/findings/${planId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Não Conformidade' : 'Registrar Não Conformidade'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditing 
              ? 'Atualize as informações da não conformidade' 
              : 'Registre uma nova não conformidade encontrada na auditoria'}
          </p>
        </div>
      </div>

      <AuditFindingForm
        planId={planId || ''}
        initialData={isEditing ? existingFinding : undefined}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}