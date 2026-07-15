// frontend/src/components/dashboard/DashboardSidebar.tsx
import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import {
  LayoutDashboard,
  PieChart,
  Shield,
  Brain,
  Cpu,
  Layers,
  Building2,
  ArrowLeft,
  TrendingUp  // 🔴 NOVO - Funil de Conversão
} from 'lucide-react';
import { PublicBrandingData } from '../../services/branding.service.js';

// Cores da paleta MRS
const MRS_COLORS = {
  primary: '#122A40',
  secondary: '#1E5359',
  accent: '#30736C',
  background: '#F2F2F2',
  text: '#122A40',
};

interface DashboardSidebarProps {
  companyId?: string;
  onBack?: () => void;
  branding?: PublicBrandingData | null;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  companyId, 
  onBack,
  branding
}) => {
  const { user } = useAuth();
  const params = useParams();
  const location = useLocation();
  
  // Prioridade: prop > params
  const currentCompanyId = companyId || params.companyId;
  
  // Verifica se está no seletor de empresas (admin)
  const isCompanySelector = location.pathname === '/admin/dashboard';
  
  // Verifica se há um companyId válido
  const hasValidCompany = !!currentCompanyId && currentCompanyId !== 'undefined';

  // Obter cores do branding ou usar padrão
  const colors = branding?.colors || MRS_COLORS;

  const basePath = user?.role === 'admin' ? '/admin/dashboard' : '/rep/dashboard';

  const navItems = [
    {
      to: user?.role === 'admin' 
        ? (hasValidCompany ? `/admin/dashboard/empresas/${currentCompanyId}` : '/admin/dashboard')
        : basePath,
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: user?.role === 'admin' && !hasValidCompany ? 'Selecionar Empresa' : 'Visão Geral',
      exact: true,
      disabled: false,
    },
    {
      to: hasValidCompany && user?.role === 'admin' 
        ? `/admin/dashboard/categorizacao/${currentCompanyId}`
        : user?.role === 'rep' 
          ? '/rep/dashboard/categorizacao'
          : '#',
      icon: <PieChart className="w-4 h-4" />,
      label: 'Categorização',
      disabled: !hasValidCompany && user?.role === 'admin',
    },
    {
      to: hasValidCompany && user?.role === 'admin' 
        ? `/admin/dashboard/tipos-controle/${currentCompanyId}`
        : user?.role === 'rep' 
          ? '/rep/dashboard/tipos-controle'
          : '#',
      icon: <Shield className="w-4 h-4" />,
      label: 'Tipos de Controle',
      disabled: !hasValidCompany && user?.role === 'admin',
    },
    {
      to: hasValidCompany && user?.role === 'admin' 
        ? `/admin/dashboard/conceitos-ciberneticos/${currentCompanyId}`
        : user?.role === 'rep' 
          ? '/rep/dashboard/conceitos-ciberneticos'
          : '#',
      icon: <Brain className="w-4 h-4" />,
      label: 'Conceitos Cibernéticos',
      disabled: !hasValidCompany && user?.role === 'admin',
    },
    {
      to: hasValidCompany && user?.role === 'admin' 
        ? `/admin/dashboard/capacidades/${currentCompanyId}`
        : user?.role === 'rep' 
          ? '/rep/dashboard/capacidades'
          : '#',
      icon: <Cpu className="w-4 h-4" />,
      label: 'Capacidades Operacionais',
      disabled: !hasValidCompany && user?.role === 'admin',
    },
    {
      to: hasValidCompany && user?.role === 'admin' 
        ? `/admin/dashboard/dominios/${currentCompanyId}`
        : user?.role === 'rep' 
          ? '/rep/dashboard/dominios'
          : '#',
      icon: <Layers className="w-4 h-4" />,
      label: 'Domínios de SI',
      disabled: !hasValidCompany && user?.role === 'admin',
    },
    // 🔴 NOVO: Funil de Conversão - Admin apenas
    {
      to: user?.role === 'admin' ? '/admin/analytics' : '#',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Funil de Conversão',
      disabled: user?.role !== 'admin',
    },
  ];

  return (
    <aside 
      className="w-64 border-r min-h-screen flex-shrink-0 sticky top-0 flex flex-col"
      style={{ 
        backgroundColor: colors.background || '#FFFFFF',
        borderColor: colors.accent || '#E5E7EB'
      }}
    >
      {/* Header da Sidebar */}
      <div className="p-4 border-b" style={{ borderColor: colors.accent || '#E5E7EB' }}>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5" style={{ color: colors.primary || '#122A40' }} />
          <span className="font-semibold" style={{ color: colors.primary || '#122A40' }}>
            Maturidade
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: colors.secondary || '#1E5359' }}>
          Dashboard Analítico
        </p>
      </div>

      {/* Botão Voltar */}
      {onBack && (
        <button
          onClick={onBack}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b"
          style={{ 
            color: colors.text || '#122A40',
            borderColor: colors.accent || '#E5E7EB'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.accent + '15' || '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      )}

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => (
          item.disabled ? (
            <div
              key={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-not-allowed opacity-50"
              style={{ color: colors.text || '#122A40' }}
              title="Selecione uma empresa primeiro"
            >
              {item.icon}
              {item.label}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'font-medium'
                    : 'hover:bg-opacity-10'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? colors.primary || '#122A40' : colors.text || '#122A40',
                backgroundColor: isActive ? (colors.accent || '#30736C') + '15' : 'transparent',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('font-medium')) {
                  e.currentTarget.style.backgroundColor = (colors.accent || '#30736C') + '10';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('font-medium')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.icon}
              {item.label}
            </NavLink>
          )
        ))}
      </nav>

      {/* Rodapé */}
      <div className="p-4 border-t" style={{ borderColor: colors.accent || '#E5E7EB' }}>
        <div className="rounded-lg p-3" style={{ backgroundColor: colors.accent + '10' || '#f9fafb' }}>
          <p className="text-[10px]" style={{ color: colors.secondary || '#1E5359' }}>
            ISO/IEC 27002:2022
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: colors.text || '#122A40' }}>
            Análise de maturidade em tempo real
          </p>
        </div>
      </div>
    </aside>
  );
};