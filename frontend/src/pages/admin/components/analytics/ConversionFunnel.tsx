/**
 * ============================================
 * CONVERSION FUNNEL
 * ============================================
 * 
 * Componente de visualização do funil de conversão
 * 
 * @module ConversionFunnel
 * @since v31.0
 */

import React from 'react';
import { FunnelStep } from '../../../../types/analytics';
import { Users, UserCheck, UserPlus, UserX } from 'lucide-react';

interface ConversionFunnelProps {
  steps: FunnelStep[];
  isLoading?: boolean;
}

interface FunnelStepItemProps {
  step: FunnelStep;
  index: number;
  total: number;
}

const FunnelStepItem: React.FC<FunnelStepItemProps> = ({ step, index, total }) => {
  const percentage = total > 0 ? (step.count / total) * 100 : 0;
  const width = Math.max(percentage, 10); // Mínimo 10% para visibilidade

  const getIcon = (stepName: string) => {
    switch (stepName) {
      case 'registrations':
        return <Users className="h-5 w-5" />;
      case 'trials':
        return <UserPlus className="h-5 w-5" />;
      case 'conversions':
        return <UserCheck className="h-5 w-5" />;
      case 'active':
        return <UserCheck className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getColor = (stepName: string) => {
    switch (stepName) {
      case 'registrations':
        return '#3B82F6'; // blue
      case 'trials':
        return '#F59E0B'; // yellow
      case 'conversions':
        return '#10B981'; // green
      case 'active':
        return '#059669'; // emerald
      default:
        return '#6B7280'; // gray
    }
  };

  return (
    <div className="relative">
      {/* Linha de conexão entre etapas */}
      {index > 0 && (
        <div className="absolute left-1/2 -top-6 h-6 w-0.5 bg-gray-300" />
      )}

      <div className="flex items-center gap-4">
        {/* Ícone e Label */}
        <div className="flex w-32 flex-shrink-0 items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: getColor(step.step) }}
          >
            {getIcon(step.step)}
          </div>
          <span className="text-sm font-medium text-gray-700">{step.label}</span>
        </div>

        {/* Barra de progresso */}
        <div className="flex-1">
          <div className="relative h-8 overflow-hidden rounded-lg bg-gray-100">
            <div
              className="absolute left-0 top-0 h-full rounded-lg transition-all duration-700 ease-out"
              style={{
                width: `${width}%`,
                backgroundColor: getColor(step.step),
              }}
            />
            <div className="absolute inset-0 flex items-center px-4">
              <span className="text-sm font-medium text-white drop-shadow-sm">
                {step.count} ({step.percentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Percentual da etapa anterior */}
        <div className="w-16 flex-shrink-0 text-right">
          <span className="text-sm text-gray-500">
            {index > 0 ? `${step.percentage.toFixed(0)}%` : '100%'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({
  steps,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Carregando funil...</p>
        </div>
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-sm">Nenhum dado de funil disponível</p>
        </div>
      </div>
    );
  }

  const total = steps[0]?.count || 1;

  return (
    <div className="space-y-6 py-4">
      {steps.map((step, index) => (
        <FunnelStepItem
          key={step.step}
          step={step}
          index={index}
          total={total}
        />
      ))}

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-gray-200 pt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
          Cadastros
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
          Trials
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
          Conversões
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#059669' }} />
          Ativos
        </span>
      </div>
    </div>
  );
};

export default ConversionFunnel;