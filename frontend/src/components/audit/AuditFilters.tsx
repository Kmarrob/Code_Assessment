import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, FileText, AlertCircle } from 'lucide-react';

export interface AuditFiltersProps {
  onFilterChange: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
  placeholder?: string;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  showTypeFilter?: boolean;
  showAreaFilter?: boolean;
  statusOptions?: Array<{ value: string; label: string }>;
  typeOptions?: Array<{ value: string; label: string }>;
  areaOptions?: string[];
  className?: string;
}

export function AuditFilters({
  onFilterChange,
  initialFilters = {},
  placeholder = 'Buscar...',
  showStatusFilter = true,
  showDateFilter = true,
  showTypeFilter = false,
  showAreaFilter = false,
  statusOptions = [],
  typeOptions = [],
  areaOptions = [],
  className = '',
}: AuditFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [status, setStatus] = useState(initialFilters.status || 'all');
  const [type, setType] = useState(initialFilters.type || 'all');
  const [area, setArea] = useState(initialFilters.area || 'all');
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const applyFilters = () => {
    const filters: Record<string, any> = {};

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }

    if (status && status !== 'all') {
      filters.status = status;
    }

    if (type && type !== 'all') {
      filters.type = type;
    }

    if (area && area !== 'all') {
      filters.area = area;
    }

    if (startDate) {
      filters.startDate = startDate;
    }

    if (endDate) {
      filters.endDate = endDate;
    }

    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatus('all');
    setType('all');
    setArea('all');
    setStartDate('');
    setEndDate('');
    onFilterChange({});
  };

  const hasActiveFilters = searchTerm || status !== 'all' || type !== 'all' || area !== 'all' || startDate || endDate;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Toggle filters button (mobile) */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
          )}
        </button>

        {/* Desktop filters */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          {showStatusFilter && statusOptions.length > 0 && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {showTypeFilter && typeOptions.length > 0 && (
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {showAreaFilter && areaOptions.length > 0 && (
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="all">Todas as Áreas</option>
              {areaOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {showDateFilter && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-36"
                placeholder="Data inicial"
              />
              <span className="text-gray-400 text-sm">até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-36"
                placeholder="Data final"
              />
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Mobile expanded filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 md:hidden">
          {showStatusFilter && statusOptions.length > 0 && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {showTypeFilter && typeOptions.length > 0 && (
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {showAreaFilter && areaOptions.length > 0 && (
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="all">Todas as Áreas</option>
              {areaOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {showDateFilter && (
            <div className="flex flex-col gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Data inicial"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Data final"
              />
            </div>
          )}

          <button
            type="button"
            onClick={clearFilters}
            className="w-full flex items-center justify-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}