// frontend/src/components/billing/PlanCard.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Crown, 
  Sparkles, 
  TrendingUp, 
  Rocket,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Plan, formatPrice, getPlanColor, getUserLimitDisplay } from '../../types/plan';
import FeatureList from './FeatureList';
import { useAuth } from '../../contexts/AuthContext';

interface PlanCardProps {
  /** Plano a ser exibido */
  plan: Plan;
  /** Se este plano é o mais popular (destacado) */
  isPopular?: boolean;
  /** Se está em modo de seleção (com botão) ou apenas visualização */
  selectable?: boolean;
  /** Callback quando o plano é selecionado */
  onSelectPlan?: (planId: string) => void;
  /** Plano atualmente selecionado (para highlight) */
  selectedPlanId?: string | null;
}

/**
 * Componente Card para exibição de um plano de assinatura
 * 
 * @example
 * <PlanCard 
 *   plan={plan} 
 *   isPopular={true} 
 *   onSelectPlan={handleSelect} 
 * />
 */
const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isPopular = false,
  selectable = true,
  onSelectPlan,
  selectedPlanId = null,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se este plano está selecionado
  const isSelected = selectedPlanId === plan._id;

  // Obter cores baseadas no plano
  const color = getPlanColor(plan.name);

  // Mapear cores para cada tipo de plano
  const colorMap = {
    basic: {
      border: 'border-blue-200 hover:border-blue-400',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      gradient: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      shadow: 'shadow-blue-100',
      iconBg: 'bg-blue-100',
    },
    pro: {
      border: 'border-purple-200 hover:border-purple-400',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      gradient: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
      shadow: 'shadow-purple-100',
      iconBg: 'bg-purple-100',
    },
    enterprise: {
      border: 'border-amber-200 hover:border-amber-400',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      gradient: 'from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800',
      shadow: 'shadow-amber-100',
      iconBg: 'bg-amber-100',
    },
    trial: {
      border: 'border-green-200 hover:border-green-400',
      bg: 'bg-green-50',
      text: 'text-green-600',
      gradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
      shadow: 'shadow-green-100',
      iconBg: 'bg-green-100',
    },
  };

  const colors = colorMap[plan.name as keyof typeof colorMap] || colorMap.basic;

  // Obter ícone do plano
  const getPlanIcon = () => {
    switch (plan.name) {
      case 'basic':
        return <TrendingUp className={`h-6 w-6 ${colors.text}`} />;
      case 'pro':
        return <Sparkles className={`h-6 w-6 ${colors.text}`} />;
      case 'enterprise':
        return <Crown className={`h-6 w-6 ${colors.text}`} />;
      case 'trial':
        return <Rocket className={`h-6 w-6 ${colors.text}`} />;
      default:
        return <Check className={`h-6 w-6 ${colors.text}`} />;
    }
  };

  // Obter preço para exibição
  const getPriceDisplay = () => {
    const price = plan.customPriceMonthly && plan.allowCustomPricing
      ? plan.customPriceMonthly
      : plan.priceMonthly;
    return formatPrice(price);
  };

  // Obter preço anual para exibição
  const getPriceAnnualDisplay = () => {
    const price = plan.customPriceAnnual && plan.allowCustomPricing
      ? plan.customPriceAnnual
      : plan.priceAnnual;
    return formatPrice(price);
  };

  // Verificar se tem desconto anual
  const hasAnnualDiscount = () => {
    const monthly = plan.customPriceMonthly && plan.allowCustomPricing
      ? plan.customPriceMonthly
      : plan.priceMonthly;
    const annual = plan.customPriceAnnual && plan.allowCustomPricing
      ? plan.customPriceAnnual
      : plan.priceAnnual;
    return annual < (monthly * 12);
  };

  // Calcular economia anual
  const getAnnualSavings = () => {
    const monthly = plan.customPriceMonthly && plan.allowCustomPricing
      ? plan.customPriceMonthly
      : plan.priceMonthly;
    const annual = plan.customPriceAnnual && plan.allowCustomPricing
      ? plan.customPriceAnnual
      : plan.priceAnnual;
    const monthlyTotal = monthly * 12;
    const savings = monthlyTotal - annual;
    if (savings <= 0) return null;
    return formatPrice(savings);
  };

  // Lidar com seleção do plano
  const handleSelect = async () => {
    if (!selectable) return;
    if (!isAuthenticated) {
      // Redirecionar para registro com o plano selecionado
      navigate(`/register?plan=${plan._id}`);
      return;
    }

    // Usuário logado
    if (onSelectPlan) {
      setIsLoading(true);
      try {
        await onSelectPlan(plan._id);
      } catch (error) {
        console.error('Erro ao selecionar plano:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Texto do botão
  const getButtonText = () => {
    if (isLoading) return 'Processando...';
    if (!isAuthenticated) return 'Começar Agora';
    if (isSelected) return 'Plano Selecionado ✓';
    return 'Selecionar Plano';
  };

  // Estilo do botão
  const getButtonStyle = () => {
    if (isSelected) {
      return 'bg-green-600 text-white hover:bg-green-700';
    }
    if (isPopular) {
      return `bg-gradient-to-r ${colors.gradient} text-white`;
    }
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md';
  };

  const savings = getAnnualSavings();

  return (
    <div
      className={`
        relative bg-white rounded-2xl shadow-lg 
        border-2 ${colors.border}
        transition-all duration-300 
        ${isHovered ? 'shadow-2xl -translate-y-1' : ''}
        ${isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''}
        ${isPopular ? 'border-purple-500 shadow-xl' : ''}
        flex flex-col
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge Mais Popular */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            MAIS POPULAR
          </span>
        </div>
      )}

      {/* Badge Trial */}
      {plan.trialDays > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            {plan.trialDays} dias grátis
          </span>
        </div>
      )}

      {/* Badge Selecionado */}
      {isSelected && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            SELECIONADO
          </span>
        </div>
      )}

      {/* Conteúdo do Card */}
      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="text-center mb-5">
          <div className={`
            inline-flex items-center justify-center w-14 h-14 rounded-full mb-3
            ${colors.iconBg}
            transition-transform duration-300
            ${isHovered ? 'scale-110' : ''}
          `}>
            {getPlanIcon()}
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {plan.displayName}
          </h3>
          {plan.badge && (
            <span className={`
              inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1
              ${colors.bg} ${colors.text}
            `}>
              {plan.badge}
            </span>
          )}
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Preço */}
        <div className="text-center mb-5">
          <div className="flex items-end justify-center gap-1">
            <span className="text-4xl font-bold text-gray-900">
              {getPriceDisplay()}
            </span>
            <span className="text-gray-500 text-sm mb-1">
              /mês
            </span>
          </div>
          {plan.priceAnnual > 0 && (
            <div className="mt-1">
              <span className="text-sm text-gray-400">
                ou {getPriceAnnualDisplay()} /ano
              </span>
              {savings && (
                <span className="text-xs text-green-600 font-medium ml-2">
                  (Economize {savings})
                </span>
              )}
            </div>
          )}
          {plan.features.maxUsers > 0 && plan.features.maxUsers < 999 && (
            <p className="text-xs text-gray-400 mt-1">
              {getUserLimitDisplay(plan.features)}
            </p>
          )}
        </div>

        {/* Features */}
        <div className="flex-1 mb-6">
          <FeatureList 
            features={plan.features} 
            compact={true} 
            textSize="sm"
          />
        </div>

        {/* Botão */}
        {selectable && (
          <button
            onClick={handleSelect}
            disabled={isLoading || isSelected}
            className={`
              w-full py-3 px-4 rounded-xl font-medium 
              transition-all duration-300
              flex items-center justify-center gap-2
              ${getButtonStyle()}
              ${isLoading ? 'opacity-70 cursor-wait' : ''}
              ${isSelected ? 'cursor-default' : 'cursor-pointer'}
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processando...
              </>
            ) : (
              <>
                {getButtonText()}
                {!isSelected && <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </button>
        )}

        {/* Nota adicional para usuários extras */}
        {plan.pricePerUser > 0 && plan.features.maxUsers > 0 && plan.features.maxUsers < 999 && (
          <p className="text-xs text-center text-gray-400 mt-3">
            * Usuários adicionais: {formatPrice(plan.pricePerUser)}/mês cada
          </p>
        )}
      </div>

      {/* Linha inferior colorida */}
      <div
        className={`
          h-1.5 w-full rounded-b-2xl transition-all duration-300
          ${isHovered ? 'h-2' : ''}
          ${isPopular ? 'bg-purple-500' : ''}
          ${!isPopular && plan.name === 'basic' ? 'bg-blue-500' : ''}
          ${!isPopular && plan.name === 'pro' ? 'bg-purple-500' : ''}
          ${!isPopular && plan.name === 'enterprise' ? 'bg-amber-500' : ''}
          ${!isPopular && plan.name === 'trial' ? 'bg-green-500' : ''}
        `}
        style={{ 
          opacity: isSelected ? 1 : 0.6,
          backgroundColor: isSelected ? '#22c55e' : undefined
        }}
      />
    </div>
  );
};

export default PlanCard;

// ============================================
// EXPORTAÇÃO PARA O ÍNDICE
// ============================================
// Para facilitar importações:
// import { PlanCard } from '../components/billing';