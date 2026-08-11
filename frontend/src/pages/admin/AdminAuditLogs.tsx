// frontend/src/pages/admin/AdminAuditLogs.tsx
import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  FileText,
  Eye,
  ArrowLeft, // 🆕 NOVO - ícone de voltar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 🆕 NOVO - para navegação
import { auditService, AuditLog, AuditFilters } from '../../services/audit.service.js';
import { AuditFilters as AuditFiltersComponent } from '../../components/admin/AuditFilters.js';

const LEVEL_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  critical: 'bg-purple-100 text-purple-700',
};

const LEVEL_ICONS: Record<string, React.ReactNode> = {
  info: <Activity className="w-3 h-3" />,
  warning: <AlertCircle className="w-3 h-3" />,
  error: <XCircle className="w-3 h-3" />,
  critical: <AlertCircle className="w-3 h-3" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  auth: 'Autenticação',
  user: 'Usuários',
  company: 'Empresas',
  document: 'Documentos',
  governance: 'Governança',
  control: 'Controles',
  report: 'Relatórios',
  payment: 'Pagamentos',
  subscription: 'Assinaturas',
  system: 'Sistema',
  notification: 'Notificações',
  security: 'Segurança',
};

const CATEGORY_COLORS: Record<string, string> = {
  auth: 'bg-indigo-100 text-indigo-700',
  user: 'bg-blue-100 text-blue-700',
  company: 'bg-green-100 text-green-700',
  document: 'bg-cyan-100 text-cyan-700',
  governance: 'bg-teal-100 text-teal-700',
  control: 'bg-purple-100 text-purple-700',
  report: 'bg-amber-100 text-amber-700',
  payment: 'bg-emerald-100 text-emerald-700',
  subscription: 'bg-violet-100 text-violet-700',
  system: 'bg-gray-100 text-gray-700',
  notification: 'bg-pink-100 text-pink-700',
  security: 'bg-rose-100 text-rose-700',
};

export default function AdminAuditLogs() {
  const navigate = useNavigate(); // 🆕 NOVO - hook de navegação
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState<AuditFilters>({ page: 1, limit: 50 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await auditService.listLogs(filters);
      setLogs(result.logs);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await auditService.getStats(30);
      setStats({
        total: data?.total || 0,
        days: data?.days || 30,
        byCategory: data?.byCategory || [],
        byAction: data?.byAction || [],
        byLevel: data?.byLevel || [],
        bySuccess: data?.bySuccess || [],
        byDay: data?.byDay || [],
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setStats({
        total: 0,
        days: 30,
        byCategory: [],
        byAction: [],
        byLevel: [],
        bySuccess: [],
        byDay: [],
      });
    }
  };

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [filters]);

  const handleFilterChange = (newFilters: AuditFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 50 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleExport = async (format: 'csv' | 'json' = 'json') => {
    setExporting(true);
    try {
      const blob = await auditService.exportLogs(filters, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao exportar logs');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const safeStats = stats || { total: 0, days: 30, byCategory: [], byAction: [], byLevel: [], bySuccess: [], byDay: [] };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header com botão Voltar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* 🆕 NOVO - Botão Voltar */}
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar para o Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📋 Auditoria do Sistema</h1>
            <p className="text-gray-500 mt-1">
              Visualize todos os logs de atividades do sistema
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exportando...' : 'Exportar JSON'}
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#30736C] text-white rounded-lg hover:bg-[#1E5359] transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            onClick={() => { loadLogs(); loadStats(); }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {safeStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total de Logs</span>
              <Activity className="w-5 h-5 text-[#30736C]" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{safeStats.total || 0}</p>
            <p className="text-xs text-gray-400">Últimos {safeStats.days || 30} dias</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Categorias</span>
              <Tag className="w-5 h-5 text-[#30736C]" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{(safeStats.byCategory || []).length}</p>
            <p className="text-xs text-gray-400">Diferentes tipos</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Sucesso</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {(safeStats.bySuccess || []).find((s: any) => s._id === true)?.count || 0}
            </p>
            <p className="text-xs text-gray-400">Operações bem-sucedidas</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Erros</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {(safeStats.bySuccess || []).find((s: any) => s._id === false)?.count || 0}
            </p>
            <p className="text-xs text-gray-400">Operações com erro</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <AuditFiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        isLoading={isLoading}
      />

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30736C]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center m-6">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800">Erro ao carregar logs</h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Nenhum log encontrado</h3>
            <p className="text-gray-400 mt-2">
              {Object.keys(filters).filter(k => filters[k as keyof AuditFilters] !== undefined && k !== 'page' && k !== 'limit').length > 0
                ? 'Tente ajustar os filtros para ver mais resultados'
                : 'Ainda não há logs de auditoria no sistema'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{log.userEmail || 'Sistema'}</span>
                          <span className="text-xs text-gray-400">{log.userName || ''}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[log.category] || 'bg-gray-100'}`}>
                          {CATEGORY_LABELS[log.category] || log.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[log.level]}`}>
                          {LEVEL_ICONS[log.level]}
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700">{log.resource}</span>
                          <span className="text-xs text-gray-400">{log.resourceName || log.resourceId || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Sucesso
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            Erro
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewLog(log)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalhes do Log */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Detalhes do Log</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">ID</label>
                  <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">{selectedLog._id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Data/Hora</label>
                  <p className="text-sm font-medium">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Usuário</label>
                  <p className="text-sm font-medium">{selectedLog.userEmail || 'Sistema'}</p>
                  <p className="text-xs text-gray-400">{selectedLog.userName || ''}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Empresa</label>
                  <p className="text-sm font-medium">{selectedLog.companyName || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Ação</label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Categoria</label>
                  <p className={`text-sm font-medium px-2 py-1 rounded ${CATEGORY_COLORS[selectedLog.category]}`}>
                    {CATEGORY_LABELS[selectedLog.category] || selectedLog.category}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Nível</label>
                  <p className={`text-sm font-medium px-2 py-1 rounded ${LEVEL_COLORS[selectedLog.level]}`}>
                    {selectedLog.level.toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <p className={`text-sm font-medium ${selectedLog.success ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedLog.success ? '✅ Sucesso' : '❌ Erro'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Duração</label>
                  <p className="text-sm font-medium">{formatDuration(selectedLog.duration)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">IP</label>
                  <p className="text-sm font-mono">{selectedLog.ip}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">User Agent</label>
                  <p className="text-sm text-gray-600 truncate">{selectedLog.userAgent}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Método</label>
                  <p className="text-sm font-mono">{selectedLog.method || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Path</label>
                  <p className="text-sm font-mono">{selectedLog.path || '-'}</p>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <label className="text-xs text-gray-500">Mensagem de Erro</label>
                  <p className="text-sm text-red-600">{selectedLog.errorMessage}</p>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <label className="text-xs text-gray-500">Detalhes</label>
                  <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}