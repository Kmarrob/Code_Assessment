// frontend/src/components/dashboard/DashboardLayout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar.js';
import { brandingService, PublicBrandingData } from '../../services/branding.service.js';

// Cores da paleta MRS
const MRS_COLORS = {
  primary: '#122A40',
  secondary: '#1E5359',
  accent: '#30736C',
  background: '#F2F2F2',
  text: '#122A40',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  companyId?: string;
  showBack?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  companyId,
  showBack = true
}) => {
  const navigate = useNavigate();
  const [branding, setBranding] = useState<PublicBrandingData | null>(null);

  // Buscar branding ao carregar
  useEffect(() => {
    const loadBranding = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const companyIdToUse = companyId || user?.companyId;
        if (companyIdToUse) {
          const data = await brandingService.getPublicBranding(companyIdToUse as string);
          setBranding(data);
        }
      } catch (error) {
        console.error('Erro ao carregar branding no dashboard:', error);
      }
    };
    loadBranding();
  }, [companyId]);

  const handleBack = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'rep') {
      navigate('/rep');
    } else {
      navigate('/dashboard');
    }
  };

  // Obter cores do branding ou usar padrão
  const colors = branding?.colors || MRS_COLORS;
  const backgroundColor = colors.background || '#F2F2F2';

  return (
    <div className="flex min-h-screen" style={{ backgroundColor }}>
      <DashboardSidebar 
        companyId={companyId} 
        onBack={showBack ? handleBack : undefined}
        branding={branding}
      />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
};