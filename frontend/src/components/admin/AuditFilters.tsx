// frontend/src/components/admin/AuditFilters.tsx
import React, { useState } from 'react';
import { Search, Filter, X, Calendar, User, Building, Tag, AlertCircle } from 'lucide-react';
import { AuditFilters as IAuditFilters } from '../../services/audit.service.js';

interface AuditFiltersProps {
  filters: IAuditFilters;
  onFilterChange: (filters: IAuditFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  { value: 'auth', label: 'Autenticação' },
  { value: 'user', label: 'Usuários' },
  { value: 'company', label: 'Empresas' },
  { value: 'document', label: 'Documentos' },
  { value: 'governance', label: 'Governança' },
  { value: 'control', label: 'Controles' },
  { value: 'report', label: 'Relatórios' },
  { value: 'payment', label: 'Pagamentos' },
  { value: 'subscription', label: 'Assinaturas' },
  { value: 'system', label: 'Sistema' },
  { value: 'notification', label: 'Notificações' },
  { value: 'security', label: 'Segurança' },
];

const LEVELS = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Aviso' },
  { value: 'error', label: 'Erro' },
  { value: 'critical', label: 'Crítico' },
];

export function AuditFilters({ filters, onFilterChange, onReset, isLoading }: AuditFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof IAuditFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
    onFilterChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Filtros</h3>
          {Object.keys(filters).filter(k => filters[k as keyof IAuditFilters] !== undefined && k !== 'page' && k !== 'limit').length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-[#30736C]/10 text-[#30736C] text-xs rounded-full">
              {Object.keys(filters).filter(k => filters[k as keyof IAuditFilters] !== undefined && k !== 'page' && k !== 'limit').length} ativos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showAdvanced ? 'Ocultar avançados' : 'Avançados'}
          </button>
          <button
            onClick={onReset}
            disabled={isLoading}
            className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por email, ação, recurso..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value || undefined)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-sm"
          />
        </div>

        {/* Categoria */}
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-sm bg-white"
        >
          <option value="">Todas categorias</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        {/* Nível */}
        <select
          value={filters.level || ''}
          onChange={(e) => handleChange('level', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-sm bg-white"
        >
          <option value="">Todos níveis</option>
          {LEVELS.map((level) => (
            <option key={level.value} value={level.value}>{level.label}</option>
          ))}
        </select>

        {/* Sucesso */}
        <select
          value={filters.success === undefined ? '' : String(filters.success)}
          onChange={(e) => {
            const val = e.target.value;
            handleChange('success', val === '' ? undefined : val === 'true');
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-sm bg-white"
        >
          <option value="">Todos (sucesso/erro)</option>
          <option value="true">✅ Sucesso</option>
          <option value="false">❌ Erro</option>
        </select>
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Email do usuário"
            value={filters.userEmail || ''}
            onChange={(e) => handleChange('userEmail', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-sm"
          />
          <input
            type="text"
            placeholder="ID da empresa"
            value={filters.companyId || ''}
            onChange={(e) => handleChange('companyId', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-sm"
          />
          <input
            type="text"
            placeholder="Ação específica (ex: LOGIN)"
            value={filters.action || ''}
            onChange={(e) => handleChange('action', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-sm"
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data Inicial</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data Final</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30736C] focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const today = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                onFilterChange({
                  ...filters,
                  startDate: sevenDaysAgo.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0],
                  page: 1,
                });
              }}
              className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
            >
              Últimos 7 dias
            </button>
          </div>
        </div>
      )}
    </div>
  );
}