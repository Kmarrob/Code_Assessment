// frontend/src/components/billing/FeatureList.tsx

import React from 'react';
import { Check, X } from 'lucide-react';
import { PlanFeature } from '../../types/plan';

interface FeatureListProps {
  /** Features do plano a serem exibidas */
  features: PlanFeature;
  /** Se deve exibir apenas as features mais importantes (modo compacto) */
  compact?: boolean;
  /** Se deve exibir todas as features, inclusive as negativas */
  showAll?: boolean;
  /** Tamanho do texto: 'sm' | 'base' */
  textSize?: 'sm' | 'base';
}

/**
 * Componente que exibe a lista de features de um plano
 * 
 * @example
 * <FeatureList features={plan.features} compact={true} />
 */
const FeatureList: React.FC<FeatureListProps> = ({
  features,
  compact = false,
  showAll = false,
  textSize = 'sm',
}) => {
  // Definição de todas as features com suas labels e categorias
  const featureItems: Array<{
    key: keyof PlanFeature;
    label: string;
    category: 'users' | 'reports' | 'support' | 'advanced';
    isBoolean: boolean;
    getDisplayValue: (value: any) => string;
  }> = [
    {
      key: 'maxUsers',
      label: 'Usuários máximos',
      category: 'users',
      isBoolean: false,
      getDisplayValue: (value) => value === 0 ? 'Ilimitado' : `${value} usuários`,
    },
    {
      key: 'maxControls',
      label: 'Controles máximos',
      category: 'users',
      isBoolean: false,
      getDisplayValue: (value) => value === 0 ? 'Ilimitado' : `${value} controles`,
    },
    {
      key: 'canViewReport',
      label: 'Visualizar relatório',
      category: 'reports',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
    {
      key: 'canPrintReport',
      label: 'Imprimir relatório',
      category: 'reports',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
    {
      key: 'canDownloadReport',
      label: 'Baixar relatório',
      category: 'reports',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
    {
      key: 'canViewRoadmap',
      label: 'Roadmap de implementação',
      category: 'reports',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
    {
      key: 'canViewComparative',
      label: 'Análise comparativa',
      category: 'reports',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
    {
      key: 'canExportData',
      label: 'Exportar dados',
      category: 'reports',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
    {
      key: 'hasConsultingHours',
      label: 'Consultoria inclusa',
      category: 'support',
      isBoolean: false,
      getDisplayValue: (value) => {
        if (!value) return 'Não incluído';
        return `${features.consultingHours}h`;
      },
    },
    {
      key: 'consultingHours',
      label: 'Horas de consultoria',
      category: 'support',
      isBoolean: false,
      getDisplayValue: (value) => `${value}h`,
    },
    {
      key: 'consultingHoursUsed',
      label: 'Horas utilizadas',
      category: 'support',
      isBoolean: false,
      getDisplayValue: (value) => `${value}h`,
    },
    {
      key: 'supportPriority',
      label: 'Prioridade de suporte',
      category: 'support',
      isBoolean: false,
      getDisplayValue: (value) => {
        const map: Record<string, string> = {
          low: 'Baixa',
          medium: 'Média',
          high: 'Alta',
          critical: 'Crítica',
        };
        return map[value] || 'Média';
      },
    },
    {
      key: 'supportHours',
      label: 'Horário de suporte',
      category: 'support',
      isBoolean: false,
      getDisplayValue: (value) => {
        const map: Record<string, string> = {
          business: 'Comercial',
          extended: 'Estendido',
          '24x7': '24x7',
        };
        return map[value] || 'Comercial';
      },
    },
    {
      key: 'canCustomizeBranding',
      label: 'Branding personalizado',
      category: 'advanced',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
    {
      key: 'canAddCustomControls',
      label: 'Controles personalizados',
      category: 'advanced',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
    {
      key: 'canIntegrateAPI',
      label: 'Integração com API',
      category: 'advanced',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
    {
      key: 'canIntegrateSSO',
      label: 'Integração com SSO',
      category: 'advanced',
      isBoolean: true,
      getDisplayValue: (value) => value ? '✓' : '✗',
    },
  ];

  // Filtrar features baseado no modo
  const getDisplayItems = () => {
    let items = featureItems;

    // Em modo compacto, mostrar apenas as principais features
    if (compact) {
      const compactKeys: Array<keyof PlanFeature> = [
        'maxUsers',
        'canViewReport',
        'canPrintReport',
        'canDownloadReport',
        'hasConsultingHours',
        'supportPriority',
        'canCustomizeBranding',
        'canIntegrateAPI',
      ];
      items = items.filter((item) => compactKeys.includes(item.key));
    }

    // Se showAll for false, esconder features com valor falso
    if (!showAll) {
      items = items.filter((item) => {
        const value = features[item.key];
        if (item.isBoolean) {
          return value === true;
        }
        // Para valores numéricos ou strings, mostrar se for útil
        if (item.key === 'maxUsers' || item.key === 'maxControls') {
          return Number(value) > 0;
        }
        if (item.key === 'consultingHours') {
          return features.hasConsultingHours && Number(value) > 0;
        }
        if (item.key === 'consultingHoursUsed') {
          return features.hasConsultingHours && Number(value) > 0;
        }
        return true;
      });
    }

    return items;
  };

  const displayItems = getDisplayItems();

  // Se não houver items para mostrar, exibir mensagem
  if (displayItems.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-2">
        Nenhuma feature disponível
      </p>
    );
  }

  const textClass = textSize === 'sm' ? 'text-sm' : 'text-base';

  return (
    <ul className={`space-y-2 ${textClass}`}>
      {displayItems.map((item) => {
        const value = features[item.key];
        const displayValue = item.getDisplayValue(value);
        const isBoolean = item.isBoolean;
        const isPositive = isBoolean && value === true;
        const isNegative = isBoolean && value === false;
        const isNumeric = !isBoolean && typeof value === 'number';

        return (
          <li
            key={item.key}
            className="flex items-start gap-2.5 py-0.5"
          >
            {/* Ícone */}
            <span className="mt-0.5 flex-shrink-0">
              {isPositive && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {isNegative && (
                <X className="h-4 w-4 text-red-400" />
              )}
              {!isBoolean && (
                <span className="text-gray-300 text-xs">•</span>
              )}
            </span>

            {/* Conteúdo */}
            <span className="text-gray-600">
              <span className="font-medium text-gray-700">
                {item.label}:
              </span>{' '}
              <span
                className={
                  isPositive
                    ? 'text-green-600 font-medium'
                    : isNegative
                    ? 'text-red-400'
                    : 'text-gray-800'
                }
              >
                {displayValue}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default FeatureList;

// ============================================
// EXPORTAÇÃO PARA O ÍNDICE
// ============================================
// Para facilitar importações:
// import { FeatureList } from '../components/billing';