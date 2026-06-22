// frontend/src/components/dashboard/DashboardPageWrapper.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout.js';
import { dashboardService, DashboardData } from '../../services/dashboard.service.js';
import { useAuth } from '../../contexts/AuthContext.js';
import toast from 'react-hot-toast';

interface DashboardPageWrapperProps {
  children: (data: DashboardData) => React.ReactNode;
  title: string;
  subtitle: string;
  companyId?: string; // NOVA PROP OPCIONAL
}

export const DashboardPageWrapper: React.FC<DashboardPageWrapperProps> = ({ 
  children, 
  title, 
  subtitle,
  companyId: propCompanyId // RENOMEADO PARA EVITAR CONFLITO
}) => {
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  
  // PRIORIDADE: prop > param > user.companyId
  const companyId = propCompanyId || paramCompanyId || user?.companyId;
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!companyId) {
        setError('ID da empresa não informado');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let dashboardData;
        if (user?.role === 'admin') {
          dashboardData = await dashboardService.getAdminCompanyDashboard(companyId);
        } else {
          dashboardData = await dashboardService.getRepDashboard(companyId);
        }
        setData(dashboardData);
      } catch (err: any) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Erro ao carregar dados');
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [companyId, user?.role]);

  if (loading) {
    return (
      <DashboardLayout companyId={companyId}>
        <div className="flex items-center justify-center py-32 gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          Carregando dados...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout companyId={companyId}>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || 'Dados não disponíveis'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout companyId={companyId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        {children(data)}
      </div>
    </DashboardLayout>
  );
};