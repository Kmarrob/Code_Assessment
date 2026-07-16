/**
 * ============================================
 * PERIOD SELECTOR
 * ============================================
 * 
 * Componente para seleção de período nos dashboards
 * de analytics.
 * 
 * @module PeriodSelector
 * @since v30.0
 */

import React, { useState } from 'react';
import { Calendar, ChevronDown, Filter, X } from 'lucide-react';
import { AnalyticsPeriod, ClientFunnelStatus } from '../../../../types/analytics';

// 🔴 NOVO: Opções de filtros avançados
export interface AdvancedFilters {
  plan?: 'basic' | 'pro' | 'enterprise' | 'all';
  status?: ClientFunnelStatus | 'all';
  daysSinceJoin?: '7d' | '15d' | '30d' | '60d' | '90d' | 'all';
}

interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod, startDate?: Date, endDate?: Date) => void;
  onAdvancedFilter?: (filters: AdvancedFilters) => void;
  className?: string;
  showAdvancedFilters?: boolean;
  advancedFilters?: AdvancedFilters;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  onChange,
  onAdvancedFilter,
  className = '',
  showAdvancedFilters = true,
  advancedFilters: initialFilters = {}
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>({
    plan: initialFilters.plan || 'all',
    status: initialFilters.status || 'all',
    daysSinceJoin: initialFilters.daysSinceJoin || 'all'
  });

  const periods: { label: string; value: AnalyticsPeriod }[] = [
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Últimos 90 dias', value: '90d' }
  ];

  // 🔴 NOVO: Opções de filtros
  const planOptions = [
    { label: 'Todos os planos', value: 'all' },
    { label: 'Básico', value: 'basic' },
    { label: 'Profissional', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' }
  ];

  const statusOptions = [
    { label: 'Todos os status', value: 'all' },
    { label: 'Ativo', value: 'active' },
    { label: 'Em Trial', value: 'trialing' },
    { label: 'Trial Expirado', value: 'trial_expired' },
    { label: 'Convertido', value: 'converted' },
    { label: 'Pagamento em Atraso', value: 'past_due' },
    { label: 'Cancelado', value: 'cancelled' },
    { label: 'Desistiu', value: 'churned' },
    { label: 'Cadastrado', value: 'registered' }
  ];

  const daysOptions = [
    { label: 'Todos os períodos', value: 'all' },
    { label: 'Últimos 7 dias', value: '7d' },
    { label: 'Últimos 15 dias', value: '15d' },
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Últimos 60 dias', value: '60d' },
    { label: 'Últimos 90 dias', value: '90d' }
  ];

  const handlePeriodClick = (period: AnalyticsPeriod) => {
    if (period === 'custom') {
      setShowCustom(!showCustom);
      if (showCustom) {
        setCustomStart('');
        setCustomEnd('');
      }
      return;
    }

    setShowCustom(false);
    onChange(period);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      onChange('custom', start, end);
      setShowCustom(false);
    }
  };

  // 🔴 NOVO: Aplicar filtros
  const handleApplyFilters = () => {
    if (onAdvancedFilter) {
      onAdvancedFilter(filters);
    }
    setShowFilters(false);
  };

  // 🔴 NOVO: Limpar filtros
  const handleClearFilters = () => {
    const clearedFilters = {
      plan: 'all',
      status: 'all',
      daysSinceJoin: 'all'
    };
    setFilters(clearedFilters);
    if (onAdvancedFilter) {
      onAdvancedFilter(clearedFilters);
    }
    setShowFilters(false);
  };

  // 🔴 NOVO: Verificar se há filtros ativos
  const hasActiveFilters = filters.plan !== 'all' || 
    filters.status !== 'all' || 
    filters.daysSinceJoin !== 'all';

  // 🔴 NOVO: Contar filtros ativos
  const activeFilterCount = [
    filters.plan !== 'all',
    filters.status !== 'all',
    filters.daysSinceJoin !== 'all'
  ].filter(Boolean).length;

  const getButtonClass = (period: AnalyticsPeriod) => {
    const baseClass =
      'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200';
    const isActive = value === period || (period === 'custom' && showCustom);

    if (isActive) {
      return `${baseClass} bg-blue-600 text-white shadow-sm`;
    }
    return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };

  // 🔴 NOVO: Label do filtro ativo
  const getFilterLabel = () => {
    if (!hasActiveFilters) return 'Filtros';
    return `Filtros (${activeFilterCount})`;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar className="h-4 w-4 text-gray-500" />
        <div className="flex gap-1 flex-wrap">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodClick(p.value)}
              className={getButtonClass(p.value)}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => handlePeriodClick('custom')}
            className={getButtonClass('custom')}
          >
            <span className="flex items-center gap-1">
              Personalizado
              <ChevronDown className={`h-3 w-3 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
            </span>
          </button>
        </div>

        {/* 🔴 NOVO: Botão de Filtros Avançados */}
        {showAdvancedFilters && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              hasActiveFilters
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            {getFilterLabel()}
            {hasActiveFilters && (
              <span className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Custom Period Dropdown */}
      {showCustom && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border bg-white p-4 shadow-lg">
          <h4 className="mb-3 text-sm font-medium text-gray-700">Selecionar Período</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">Data Inicial</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Data Final</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCustomApply}
                disabled={!customStart || !customEnd}
                className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Aplicar
              </button>
              <button
                onClick={() => {
                  setShowCustom(false);
                  setCustomStart('');
                  setCustomEnd('');
                }}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔴 NOVO: Filtros Avançados Dropdown */}
      {showFilters && showAdvancedFilters && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Filtros Avançados</h4>
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Limpar todos
            </button>
          </div>

          <div className="space-y-4">
            {/* Filtro por Plano */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Plano</label>
              <select
                value={filters.plan}
                onChange={(e) => setFilters({ ...filters, plan: e.target.value as any })}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {planOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Tempo de Cadastro */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tempo de Cadastro</label>
              <select
                value={filters.daysSinceJoin}
                onChange={(e) => setFilters({ ...filters, daysSinceJoin: e.target.value as any })}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {daysOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={handleApplyFilters}
                className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;