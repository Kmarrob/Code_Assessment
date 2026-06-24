// frontend/src/pages/DashboardOverview.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { DashboardPageWrapper } from '../components/dashboard/DashboardPageWrapper.js';
import { Building2, ClipboardList, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.js';
import { PieChart } from '../components/dashboard/PieChart.js';
import { BarChart } from '../components/dashboard/BarChart.js';
import { DashboardData } from '../services/dashboard.service.js';

const STATUS_COLORS = {
  'Implementado': 'hsl(142,70%,45%)',
  'Parcialmente implementado': 'hsl(38,92%,50%)',
  'Não implementado': 'hsl(0,72%,51%)',
  'Não se aplica': 'hsl(215,20%,55%)',
};

const DashboardOverviewContent: React.FC<{ data: DashboardData }> = ({ data }) => {
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Maturidade</h1>
        <div className="flex items-center gap-2 mt-1">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{company?.name || 'Carregando...'}</span>
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
  );
};

export const DashboardOverview: React.FC = () => {
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  
  // CORREÇÃO: Buscar companyId de diferentes locais no objeto user
  let companyId = paramCompanyId;
  
  if (!companyId && user) {
    // Tentar obter companyId de diferentes campos
    const userAny = user as any;
    companyId = userAny.companyId || 
                userAny.company?._id || 
                userAny.company || 
                null;
    
    // Log para debug (remover em produção)
    console.log('🔍 DashboardOverview - user:', user);
    console.log('🔍 DashboardOverview - companyId obtido:', companyId);
  }

  // Se não encontrou companyId, exibir mensagem de erro
  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Empresa não identificada</h3>
          <p className="text-gray-600 mt-2">
            Não foi possível identificar a empresa associada ao seu perfil.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Entre em contato com o administrador para configurar sua empresa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardPageWrapper
      title="Dashboard de Maturidade"
      subtitle="Visão geral da maturidade em segurança da informação"
      companyId={companyId}
    >
      {(data) => <DashboardOverviewContent data={data} />}
    </DashboardPageWrapper>
  );
};