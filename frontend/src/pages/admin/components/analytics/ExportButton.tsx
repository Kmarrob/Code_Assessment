/**
 * ============================================
 * EXPORT BUTTON
 * ============================================
 * 
 * Componente para exportação de dados do analytics
 * em CSV ou Excel.
 * 
 * @module ExportButton
 * @since v30.0
 */

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { analyticsService } from '../../../../services/analytics.service';
import { AnalyticsPeriod } from '../../../../types/analytics';

interface ExportButtonProps {
  period: AnalyticsPeriod;
  startDate?: Date;
  endDate?: Date;
  className?: string;
}

type ExportFormat = 'csv' | 'excel';

export const ExportButton: React.FC<ExportButtonProps> = ({
  period,
  startDate,
  endDate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<'csv' | 'excel' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsLoading(format);
      setError(null);
      setIsOpen(false);

      const blob = await analyticsService.exportData({
        period,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        format
      });

      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const extension = format === 'csv' ? 'csv' : 'xlsx';
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `analytics_${dateStr}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar dados:', err);
      setError('Falha ao exportar dados. Tente novamente.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!!isLoading}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isLoading ? 'Exportando...' : 'Exportar'}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 min-w-[180px] rounded-lg border bg-white py-1 shadow-lg">
          <button
            onClick={() => handleExport('csv')}
            disabled={isLoading === 'excel'}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            <FileText className="h-4 w-4 text-blue-500" />
            <span>Exportar CSV</span>
            {isLoading === 'csv' && (
              <span className="ml-auto text-xs text-gray-400">Carregando...</span>
            )}
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={isLoading === 'csv'}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span>Exportar Excel</span>
            {isLoading === 'excel' && (
              <span className="ml-auto text-xs text-gray-400">Carregando...</span>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExportButton;