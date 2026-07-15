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
import { Calendar, ChevronDown } from 'lucide-react';
import { AnalyticsPeriod } from '../../../../types/analytics';

interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod, startDate?: Date, endDate?: Date) => void;
  className?: string;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const periods: { label: string; value: AnalyticsPeriod }[] = [
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Últimos 90 dias', value: '90d' }
  ];

  const handlePeriodClick = (period: AnalyticsPeriod) => {
    if (period === 'custom') {
      setShowCustom(!showCustom);
      if (showCustom) {
        // Se estava aberto e clicou novamente, fecha e reseta
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

  const getButtonClass = (period: AnalyticsPeriod) => {
    const baseClass =
      'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200';
    const isActive = value === period || (period === 'custom' && showCustom);

    if (isActive) {
      return `${baseClass} bg-blue-600 text-white shadow-sm`;
    }
    return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <div className="flex gap-1">
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
    </div>
  );
};

export default PeriodSelector;