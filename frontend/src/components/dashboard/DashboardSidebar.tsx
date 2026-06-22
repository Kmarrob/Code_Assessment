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
  ArrowLeft
} from 'lucide-react';

interface DashboardSidebarProps {
  companyId?: string;
  onBack?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  companyId, 
  onBack 
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
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex-shrink-0 sticky top-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900">Maturidade</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Dashboard Analítico</p>
      </div>

      {/* Botão Voltar */}
      {onBack && (
        <button
          onClick={onBack}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      )}

      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          item.disabled ? (
            <div
              key={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 cursor-not-allowed opacity-50"
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
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500">ISO/IEC 27002:2022</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Análise de maturidade em tempo real
          </p>
        </div>
      </div>
    </aside>
  );
};