import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Trash2,
  Clock,
  Calendar,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { useAudit } from '../../hooks/useAudit';
import { toast } from 'react-hot-toast';

interface ProgramActivity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  responsible: string;
  location: string;
}

interface Program {
  _id: string;
  companyId: string;
  year: number;
  activities: ProgramActivity[];
  sectors: string[];
  supplierAudits: Array<{
    supplierName: string;
    date: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  }>;
  externalAudit: {
    date: string;
    auditor: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  };
  status: 'draft' | 'approved' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export function RepAuditProgram() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ProgramActivity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  // Hooks do React Query
  const {
    useProgramByPlan,
    useCreateProgramActivity,
    useUpdateProgramActivity,
    useDeleteProgramActivity,
  } = useAudit();

  // Buscar programa do plano
  const {
    data: programData,
    isLoading,
    error,
    refetch,
  } = useProgramByPlan(planId || '');

  // Mutations
  const createActivityMutation = useCreateProgramActivity();
  const updateActivityMutation = useUpdateProgramActivity();
  const deleteActivityMutation = useDeleteProgramActivity();

  const program = programData?.data;

  // Handler para criar atividade
  const handleCreateActivity = async (data: Omit<ProgramActivity, 'id'>) => {
    if (!program) return;
    try {
      await createActivityMutation.mutateAsync({
        programId: program._id,
        data,
      });
      toast.success('Atividade criada com sucesso!');
      setShowActivityForm(false);
      await refetch();
    } catch (err) {
      toast.error('Erro ao criar atividade');
      console.error(err);
    }
  };

  // Handler para atualizar atividade
  const handleUpdateActivity = async (id: string, data: Partial<ProgramActivity>) => {
    if (!program) return;
    try {
      await updateActivityMutation.mutateAsync({
        programId: program._id,
        activityId: id,
        data,
      });
      toast.success('Atividade atualizada com sucesso!');
      setEditingActivity(null);
      await refetch();
    } catch (err) {
      toast.error('Erro ao atualizar atividade');
      console.error(err);
    }
  };

  // Handler para deletar atividade
  const handleDeleteActivity = async (id: string) => {
    if (!program) return;
    try {
      await deleteActivityMutation.mutateAsync({
        programId: program._id,
        activityId: id,
      });
      toast.success('Atividade removida com sucesso!');
      setActivityToDelete(null);
      await refetch();
    } catch (err) {
      toast.error('Erro ao remover atividade');
      console.error(err);
    }
  };

  // Formatar hora
  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Concluído</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Em andamento</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Cancelado</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">Planejado</span>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Carregando programa...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar programa
        </h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          {(error as Error).message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Empty state
  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum programa encontrado
        </h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          Não há programa de auditoria para este plano.
        </p>
        <button
          onClick={() => navigate(`/rep/audit/execution/${planId}`)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Voltar para execução
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/rep/audit/execution/${planId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Programa de Auditoria
            </h1>
            <p className="text-sm text-gray-500">
              {program.year} • {new Date(program.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            program.status === 'active' ? 'bg-green-100 text-green-700' :
            program.status === 'approved' ? 'bg-blue-100 text-blue-700' :
            program.status === 'archived' ? 'bg-gray-100 text-gray-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {program.status === 'active' ? 'Ativo' :
             program.status === 'approved' ? 'Aprovado' :
             program.status === 'archived' ? 'Arquivado' : 'Rascunho'}
          </span>
          <button
            onClick={() => {
              setEditingActivity(null);
              setShowActivityForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Atividade
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Atividades</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{program.activities.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Setores</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{program.sectors?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Auditoria Externa</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {program.externalAudit?.status === 'completed' ? '✅' :
             program.externalAudit?.status === 'in_progress' ? '🔄' : '📋'}
          </p>
        </div>
      </div>

      {/* Setores */}
      {program.sectors && program.sectors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Setores Auditados</h3>
          <div className="flex flex-wrap gap-2">
            {program.sectors.map((sector: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {sector}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Atividades */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Cronograma de Atividades</h3>
        
        {program.activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma atividade programada.</p>
            <button
              onClick={() => {
                setEditingActivity(null);
                setShowActivityForm(true);
              }}
              className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm"
            >
              Adicionar primeira atividade
            </button>
          </div>
        ) : (
          // Ordenar atividades por horário
          [...program.activities]
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-indigo-600">
                        {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span>👤 {activity.responsible}</span>
                      {activity.location && <span>📍 {activity.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-4">
                    <button
                      onClick={() => {
                        setEditingActivity(activity);
                        setShowActivityForm(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActivityToDelete(activity.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Modal de Formulário de Atividade */}
      {showActivityForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
              </h3>
              <button
                onClick={() => {
                  setShowActivityForm(false);
                  setEditingActivity(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <ActivityForm
              initialData={editingActivity || undefined}
              onSubmit={async (data) => {
                if (editingActivity) {
                  await handleUpdateActivity(editingActivity.id, data);
                } else {
                  await handleCreateActivity(data as Omit<ProgramActivity, 'id'>);
                }
              }}
              onCancel={() => {
                setShowActivityForm(false);
                setEditingActivity(null);
              }}
              isSubmitting={createActivityMutation.isPending || updateActivityMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {activityToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar exclusão
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setActivityToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteActivity(activityToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Formulário de Atividade
interface ActivityFormProps {
  initialData?: Partial<ProgramActivity>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function ActivityForm({ initialData, onSubmit, onCancel, isSubmitting }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    responsible: initialData?.responsible || '',
    location: initialData?.location || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Abertura, Entrevista, Avaliação..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva a atividade..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Início *
          </label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fim *
          </label>
          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsável *
          </label>
          <input
            type="text"
            value={formData.responsible}
            onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
            placeholder="Nome do responsável"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Local da atividade"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Atividade'
          )}
        </button>
      </div>
    </form>
  );
}

// Componente XCircle (adicionado para resolver referência)
function XCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}