import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAudit } from '../../../hooks/useAudit';
import { toast } from 'react-hot-toast';

interface Risk {
  _id: string;
  riskId: string;
  description: string;
  eventOrAsset: string;
  owner: string;
  threat: string;
  vulnerability: string;
  existingControl: string;
  probability: 'baixa' | 'media' | 'alta' | 'critica';
  impact: 'baixo' | 'medio' | 'alto' | 'critico';
  riskLevel: 'baixo' | 'medio' | 'alto' | 'critico';
  riskClassification: string;
  treatment: 'accept' | 'mitigate' | 'transfer' | 'avoid';
  treatmentPlan: string;
  probabilityAfter: 'baixa' | 'media' | 'alta' | 'critica';
  impactAfter: 'baixo' | 'medio' | 'alto' | 'critico';
  residualRisk: 'baixo' | 'medio' | 'alto' | 'critico';
  status: 'identified' | 'assessed' | 'treated' | 'monitored' | 'closed' | 'reopened';
  createdAt: string;
  updatedAt: string;
}

export function RepAuditRisks() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [riskToDelete, setRiskToDelete] = useState<string | null>(null);

  // Hooks do React Query
  const {
    useRisksByPlan,
    useCreateRisk,
    useUpdateRisk,
    useDeleteRisk,
  } = useAudit;

  // Buscar riscos do plano
  const {
    data: risksData,
    isLoading,
    error,
    refetch,
  } = useRisksByPlan(planId || '');

  // Mutations
  const createRiskMutation = useCreateRisk();
  const updateRiskMutation = useUpdateRisk();
  const deleteRiskMutation = useDeleteRisk();

  const risks = risksData?.data || [];

  // Handler para criar/editar risco
  const handleSaveRisk = async (data: any) => {
    try {
      if (editingRisk) {
        await updateRiskMutation.mutateAsync({
          id: editingRisk._id,
          data,
        });
        toast.success('Risco atualizado com sucesso!');
      } else {
        await createRiskMutation.mutateAsync({
          ...data,
          auditPlanId: planId,
        });
        toast.success('Risco criado com sucesso!');
      }
      setShowForm(false);
      setEditingRisk(null);
      await refetch();
    } catch (err) {
      toast.error('Erro ao salvar risco');
      console.error(err);
    }
  };

  // Handler para deletar risco
  const handleDeleteRisk = async (id: string) => {
    try {
      await deleteRiskMutation.mutateAsync(id);
      toast.success('Risco removido com sucesso!');
      setRiskToDelete(null);
      await refetch();
    } catch (err) {
      toast.error('Erro ao remover risco');
      console.error(err);
    }
  };

  // Cores para nível de risco
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critico':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'alto':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medio':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'baixo':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Ícone para nível de risco
  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critico':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'alto':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medio':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'baixo':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  // Label para tratamento
  const getTreatmentLabel = (treatment: string) => {
    switch (treatment) {
      case 'accept':
        return 'Aceitar';
      case 'mitigate':
        return 'Mitigar';
      case 'transfer':
        return 'Transferir';
      case 'avoid':
        return 'Evitar';
      default:
        return treatment;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Carregando riscos...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar riscos
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/rep/audit/execution/${planId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riscos da Auditoria</h1>
          <p className="text-sm text-gray-500">
            Identifique e gerencie os riscos relacionados à auditoria
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => {
              setEditingRisk(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Risco
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total de Riscos</p>
          <p className="text-2xl font-bold text-gray-900">{risks.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Riscos Críticos</p>
          <p className="text-2xl font-bold text-red-600">
            {risks.filter((r: Risk) => r.riskLevel === 'critico').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Riscos Altos</p>
          <p className="text-2xl font-bold text-orange-600">
            {risks.filter((r: Risk) => r.riskLevel === 'alto').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Tratados</p>
          <p className="text-2xl font-bold text-green-600">
            {risks.filter((r: Risk) => r.status === 'treated' || r.status === 'closed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Risco Residual</p>
          <p className="text-2xl font-bold text-yellow-600">
            {risks.filter((r: Risk) => r.residualRisk === 'alto' || r.residualRisk === 'critico').length}
          </p>
        </div>
      </div>

      {/* Lista de Riscos */}
      {risks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum risco cadastrado
          </h3>
          <p className="text-gray-500 text-sm text-center max-w-md mb-4">
            Identifique os riscos relacionados à auditoria.
          </p>
          <button
            onClick={() => {
              setEditingRisk(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Adicionar Risco
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {risks.map((risk: Risk) => (
            <div
              key={risk._id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-mono text-gray-500">
                      {risk.riskId}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRiskLevelColor(risk.riskLevel)}`}>
                      {risk.riskLevel.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      risk.status === 'closed' ? 'bg-green-100 text-green-700' :
                      risk.status === 'treated' ? 'bg-blue-100 text-blue-700' :
                      risk.status === 'monitored' ? 'bg-purple-100 text-purple-700' :
                      risk.status === 'assessed' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {risk.status === 'identified' ? 'Identificado' :
                       risk.status === 'assessed' ? 'Avaliado' :
                       risk.status === 'treated' ? 'Tratado' :
                       risk.status === 'monitored' ? 'Monitorado' :
                       risk.status === 'closed' ? 'Fechado' :
                       risk.status === 'reopened' ? 'Reaberto' : risk.status}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {getTreatmentLabel(risk.treatment)}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mt-2">
                    {risk.description}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Evento/Ativo:</span> {risk.eventOrAsset}
                    </div>
                    <div>
                      <span className="font-medium">Responsável:</span> {risk.owner}
                    </div>
                    <div>
                      <span className="font-medium">Ameaça:</span> {risk.threat}
                    </div>
                    <div>
                      <span className="font-medium">Vulnerabilidade:</span> {risk.vulnerability}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Controle Existente:</span> {risk.existingControl}
                    </div>
                    <div>
                      <span className="font-medium">Classificação:</span> {risk.riskClassification}
                    </div>
                    <div>
                      <span className="font-medium">Probabilidade:</span> {risk.probability}
                    </div>
                  </div>
                  {risk.treatmentPlan && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Plano de Tratamento:</span> {risk.treatmentPlan}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Probabilidade Pós:</span> {risk.probabilityAfter}
                    </div>
                    <div>
                      <span className="font-medium">Impacto Pós:</span> {risk.impactAfter}
                    </div>
                    <div>
                      <span className="font-medium">Risco Residual:</span>{' '}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(risk.residualRisk)}`}>
                        {risk.residualRisk}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-4">
                  <button
                    onClick={() => {
                      setEditingRisk(risk);
                      setShowForm(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRiskToDelete(risk._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRisk ? 'Editar Risco' : 'Novo Risco'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingRisk(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <RiskForm
              initialData={editingRisk || undefined}
              onSubmit={handleSaveRisk}
              onCancel={() => {
                setShowForm(false);
                setEditingRisk(null);
              }}
              isSubmitting={createRiskMutation.isPending || updateRiskMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {riskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar exclusão
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Tem certeza que deseja excluir este risco? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRiskToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteRisk(riskToDelete)}
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

// Componente de Formulário de Risco
interface RiskFormProps {
  initialData?: Partial<Risk>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function RiskForm({ initialData, onSubmit, onCancel, isSubmitting }: RiskFormProps) {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    eventOrAsset: initialData?.eventOrAsset || '',
    owner: initialData?.owner || '',
    threat: initialData?.threat || '',
    vulnerability: initialData?.vulnerability || '',
    existingControl: initialData?.existingControl || '',
    probability: initialData?.probability || 'media',
    impact: initialData?.impact || 'medio',
    riskClassification: initialData?.riskClassification || '',
    treatment: initialData?.treatment || 'mitigate',
    treatmentPlan: initialData?.treatmentPlan || '',
    probabilityAfter: initialData?.probabilityAfter || 'media',
    impactAfter: initialData?.impactAfter || 'medio',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição do Risco *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o risco identificado..."
          rows={3}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Evento/Ativo e Responsável */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evento ou Ativo *
          </label>
          <input
            type="text"
            value={formData.eventOrAsset}
            onChange={(e) => setFormData({ ...formData, eventOrAsset: e.target.value })}
            placeholder="Ex: Sistema de Gestão, Banco de Dados..."
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsável *
          </label>
          <input
            type="text"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            placeholder="Nome do responsável"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Ameaça e Vulnerabilidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ameaça *
          </label>
          <input
            type="text"
            value={formData.threat}
            onChange={(e) => setFormData({ ...formData, threat: e.target.value })}
            placeholder="Identifique a ameaça"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vulnerabilidade *
          </label>
          <input
            type="text"
            value={formData.vulnerability}
            onChange={(e) => setFormData({ ...formData, vulnerability: e.target.value })}
            placeholder="Identifique a vulnerabilidade"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Controle Existente e Classificação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Controle Existente *
          </label>
          <input
            type="text"
            value={formData.existingControl}
            onChange={(e) => setFormData({ ...formData, existingControl: e.target.value })}
            placeholder="Ex: Firewall, Antivírus, Política de Acesso..."
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Classificação do Risco *
          </label>
          <input
            type="text"
            value={formData.riskClassification}
            onChange={(e) => setFormData({ ...formData, riskClassification: e.target.value })}
            placeholder="Ex: Crítico, Alto, Médio, Baixo"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Probabilidade e Impacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Probabilidade *
          </label>
          <select
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: e.target.value as any })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impacto *
          </label>
          <select
            value={formData.impact}
            onChange={(e) => setFormData({ ...formData, impact: e.target.value as any })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
            <option value="critico">Crítico</option>
          </select>
        </div>
      </div>

      {/* Tratamento e Plano de Tratamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tratamento *
          </label>
          <select
            value={formData.treatment}
            onChange={(e) => setFormData({ ...formData, treatment: e.target.value as any })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="accept">Aceitar</option>
            <option value="mitigate">Mitigar</option>
            <option value="transfer">Transferir</option>
            <option value="avoid">Evitar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plano de Tratamento *
          </label>
          <input
            type="text"
            value={formData.treatmentPlan}
            onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
            placeholder="Descreva o plano de tratamento..."
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pós-Tratamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Probabilidade Após Tratamento *
          </label>
          <select
            value={formData.probabilityAfter}
            onChange={(e) => setFormData({ ...formData, probabilityAfter: e.target.value as any })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impacto Após Tratamento *
          </label>
          <select
            value={formData.impactAfter}
            onChange={(e) => setFormData({ ...formData, impactAfter: e.target.value as any })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
            <option value="critico">Crítico</option>
          </select>
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
            'Salvar Risco'
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