import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuditPlanForm } from '../../../components/forms/AuditPlanForm';
import { usePlan, useCreatePlan, useUpdatePlan } from '../../../hooks/useAudit';

export function RepAuditPlanForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== 'new' && location.pathname.endsWith('/edit');
  const isViewingExisting = !!id && id !== 'new' && !isEditing;

  const { data: existingPlan, isLoading: isLoadingPlan } = usePlan(id || '');
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  useEffect(() => {
    if (isViewingExisting && id) {
      navigate(`/rep/audit/execution/${id}`, { replace: true });
    }
  }, [id, isViewingExisting, navigate]);

  const handleSubmit = async (data: any) => {
    if (isEditing && id) {
      await updatePlan.mutateAsync({ id, data });
    } else {
      await createPlan.mutateAsync(data);
    }
    navigate('/rep/audit/plans');
  };

  const isSubmitting = createPlan.isPending || updatePlan.isPending;

  if (isViewingExisting || (isLoadingPlan && isEditing)) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/rep/audit/plans')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Plano de Auditoria' : 'Novo Plano de Auditoria'}</h1>
          <p className="text-gray-500 text-sm">{isEditing ? 'Atualize as informações do plano' : 'Crie um novo plano de auditoria interna'}</p>
        </div>
      </div>

      <AuditPlanForm
        initialData={isEditing ? existingPlan : undefined}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
