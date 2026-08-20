import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  MinusCircle,
  FileText,
  Download,
  RefreshCw,
  Search
} from 'lucide-react';
import { useAudit } from '../../hooks/useAudit';
import { toast } from 'react-hot-toast';

interface SoAControl {
  clause: string;
  title: string;
  objective: string;
  motivators: string[];
  applicable: boolean;
  justification: string;
  status: 'conforme' | 'nao_conforme' | 'parcial' | 'nao_aplicavel';
  evidenceIds: string[];
}

interface SoA {
  _id: string;
  companyId: string;
  version: string;
  controls: SoAControl[];
  status: 'draft' | 'approved' | 'archived';
  statistics: {
    total: number;
    applicable: number;
    notApplicable: number;
    conforme: number;
    naoConforme: number;
    parcial: number;
  };
  createdAt: string;
  updatedAt: string;
}

export function RepAuditSoA() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Hooks do React Query
  const {
    useSoAByPlan,
    useUpdateSoAControl,
    useExportSoA,
  } = useAudit();

  // Buscar SoA do plano
  const {
    data: soaData,
    isLoading,
    error,
    refetch,
  } = useSoAByPlan(planId || '');

  // Mutations
  const updateSoAControlMutation = useUpdateSoAControl();
  const exportSoAMutation = useExportSoA();

  const soa = soaData?.data;

  // Estado local para controles
  const [controls, setControls] = useState<SoAControl[]>([]);

  useEffect(() => {
    if (soa?.controls) {
      setControls(soa.controls);
    }
  }, [soa]);

  // Handler para atualizar status de um controle
  const handleUpdateStatus = async (clause: string, status: SoAControl['status']) => {
    try {
      await updateSoAControlMutation.mutateAsync({
        soaId: soa?._id || '',
        clause,
        data: { status },
      });
      toast.success('Status do controle atualizado!');
      await refetch();
    } catch (err) {
      toast.error('Erro ao atualizar status');
      console.error(err);
    }
  };

  // Handler para exportar SoA
  const handleExport = async () => {
    if (!soa) return;
    try {
      const result = await exportSoAMutation.mutateAsync(soa._id);
      // Se retornar um blob, baixar
      if (result instanceof Blob) {
        const url = URL.createObjectURL(result);
        window.open(url, '_blank');
        toast.success('SoA exportada com sucesso!');
      }
    } catch (err) {
      toast.error('Erro ao exportar SoA');
      console.error(err);
    }
  };

  // Filtrar controles
  const filteredControls = controls.filter((control) => {
    const matchesSearch = 
      control.clause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || control.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Estatísticas
  const stats = soa?.statistics || {
    total: 0,
    applicable: 0,
    notApplicable: 0,
    conforme: 0,
    naoConforme: 0,
    parcial: 0,
  };

  // Badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conforme':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"><CheckCircle className="w-3 h-3" /> Conforme</span>;
      case 'nao_conforme':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full"><XCircle className="w-3 h-3" /> Não Conforme</span>;
      case 'parcial':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full"><MinusCircle className="w-3 h-3" /> Parcial</span>;
      case 'nao_aplicavel':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"><MinusCircle className="w-3 h-3" /> Não Aplicável</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">Pendente</span>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Carregando SoA...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar SoA
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
  if (!soa) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma SoA encontrada
        </h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          Não há Declaração de Aplicabilidade para este plano de auditoria.
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
    <div className="max-w-6xl mx-auto px-4 py-6">
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
              Declaração de Aplicabilidade (SoA)
            </h1>
            <p className="text-sm text-gray-500">
              Versão {soa.version} • {new Date(soa.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
          <button
            onClick={handleExport}
            disabled={exportSoAMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
          >
            {exportSoAMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exportar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Aplicáveis</p>
          <p className="text-xl font-bold text-blue-600">{stats.applicable}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Não Aplicáveis</p>
          <p className="text-xl font-bold text-gray-600">{stats.notApplicable}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Conformes</p>
          <p className="text-xl font-bold text-green-600">{stats.conforme}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Não Conformes</p>
          <p className="text-xl font-bold text-red-600">{stats.naoConforme}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500">Parciais</p>
          <p className="text-xl font-bold text-yellow-600">{stats.parcial}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cláusula ou título..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="conforme">Conforme</option>
          <option value="nao_conforme">Não Conforme</option>
          <option value="parcial">Parcial</option>
          <option value="nao_aplicavel">Não Aplicável</option>
        </select>
      </div>

      {/* Lista de Controles */}
      <div className="space-y-3">
        {filteredControls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum controle encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          filteredControls.map((control) => (
            <div
              key={control.clause}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-medium text-indigo-600">
                      {control.clause}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm font-medium text-gray-900">
                      {control.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {control.applicable ? '✅ Aplicável' : '❌ Não Aplicável'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {control.objective}
                  </p>
                  {control.motivators && control.motivators.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {control.motivators.map((motivator, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {motivator}
                        </span>
                      ))}
                    </div>
                  )}
                  {control.justification && (
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">Justificativa:</span> {control.justification}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={control.status || ''}
                    onChange={(e) => handleUpdateStatus(control.clause, e.target.value as SoAControl['status'])}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="conforme">Conforme</option>
                    <option value="nao_conforme">Não Conforme</option>
                    <option value="parcial">Parcial</option>
                    <option value="nao_aplicavel">Não Aplicável</option>
                  </select>
                  {getStatusBadge(control.status || '')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Informações adicionais */}
      <div className="mt-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
        <p>
          Total de controles: {stats.total} • 
          Aplicáveis: {stats.applicable} • 
          Não Aplicáveis: {stats.notApplicable}
        </p>
      </div>
    </div>
  );
}