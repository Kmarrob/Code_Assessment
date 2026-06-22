// frontend/src/pages/dashboard/DashboardOverview.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Building2, Users, ClipboardList, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.js';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout.js';
import { dashboardService, DashboardData } from '../../services/dashboard.service.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { PieChart } from '../../components/dashboard/PieChart.js';
import { BarChart } from '../../components/dashboard/BarChart.js';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'Implementado': 'hsl(142,70%,45%)',
  'Parcialmente implementado': 'hsl(38,92%,50%)',
  'Não implementado': 'hsl(0,72%,51%)',
  'Não se aplica': 'hsl(215,20%,55%)',
};

export const DashboardOverview: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Se for admin e não tiver companyId, listar empresas para selecionar
  useEffect(() => {
    const loadData = async () => {
      if (!companyId) {
        // Se for admin sem companyId, pode mostrar lista de empresas ou redirecionar
        if (user?.role === 'admin') {
          // TODO: Implementar página de seleção de empresas
          setError('Selecione uma empresa para visualizar o dashboard');
          setLoading(false);
          return;
        }
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
        setError('Erro ao carregar dados do dashboard');
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
          Carregando dados do dashboard...
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
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/empresas')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ir para Empresas
              </button>
            )}
            {user?.role === 'rep' && (
              <button
                onClick={() => navigate('/rep')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Voltar ao Painel
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, company } = data;
  const pieData = [
    { name: 'Implementado', value: summary.Implementado || 0, color: STATUS_COLORS['Implementado'] },
    { name: 'Parcialmente implementado', value: summary.Parcialmente || 0, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não implementado', value: summary.NaoImplementado || 0, color: STATUS_COLORS['Não implementado'] },
    { name: 'Não se aplica', value: summary.NaoSeAplica || 0, color: STATUS_COLORS['Não se aplica'] },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Implementados', value: summary.Implementado || 0, color: STATUS_COLORS['Implementado'] },
    { name: 'Parciais', value: summary.Parcialmente || 0, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementados', value: summary.NaoImplementado || 0, color: STATUS_COLORS['Não implementado'] },
  ].filter(d => d.value > 0);

  const completionRate = summary.totalControls > 0 
    ? Math.round((summary.Implementado / summary.totalControls) * 100) 
    : 0;

  return (
    <DashboardLayout companyId={companyId}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Maturidade</h1>
          <div className="flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{company.name}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Controles</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalControls}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Implementados</p>
                  <p className="text-2xl font-bold text-green-600">{summary.Implementado || 0}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Parciais</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.Parcialmente || 0}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Não Implementados</p>
                  <p className="text-2xl font-bold text-red-600">{summary.NaoImplementado || 0}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PieChart
            data={pieData}
            title="Distribuição de Status"
            subtitle={`${summary.totalControls} controles analisados`}
          />
          <BarChart
            data={barData}
            title="Contagem por Status"
            subtitle="Distribuição dos controles por nível de implementação"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};