// frontend/src/pages/dashboard/ControlTypes.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { DashboardPageWrapper } from '../../components/dashboard/DashboardPageWrapper.js';
import { DataTable } from '../../components/dashboard/DataTable.js';
import { PieChart } from '../../components/dashboard/PieChart.js';
import { BarChart } from '../../components/dashboard/BarChart.js';
import { DashboardData } from '../../services/dashboard.service.js';
import { Info } from 'lucide-react';

const TYPES = ['Preventivo', 'Detectivo', 'Corretivo'];
const STATUS_COLORS = {
  'Implementado': 'hsl(142,70%,45%)',
  'Parcialmente implementado': 'hsl(38,92%,50%)',
  'Não implementado': 'hsl(0,72%,51%)',
  'Não se aplica': 'hsl(215,20%,55%)',
};

const ControlTypesContent: React.FC<{ data: DashboardData }> = ({ data }) => {
  // Debug: verificar dados recebidos
  console.log('🔍 ControlTypes - data recebido:', data);
  console.log('🔍 ControlTypes - controls:', data?.controls);

  const controls = data?.controls || [];

  const typeData = TYPES.map(type => {
    const filtered = controls.filter(c => {
      const control = c.control || c;
      // Verificar em tipoDeControle (array) ou tipoDeControle (string)
      const tipos = control?.tipoDeControle || [];
      if (Array.isArray(tipos)) {
        return tipos.includes(type);
      }
      return tipos === type;
    });
    const total = filtered.length;
    const implemented = filtered.filter(c => c.status === 'Implementado').length;
    const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
    const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
    const na = filtered.filter(c => c.status === 'Não se aplica').length;
    
    console.log(`🔍 ControlTypes - ${type}: total=${total}, impl=${implemented}, partial=${partial}, not=${notImpl}, na=${na}`);
    
    return {
      name: type,
      total,
      implemented,
      partial,
      notImpl,
      na,
      pImpl: total > 0 ? Math.round((implemented / total) * 100) : 0,
      pPartial: total > 0 ? Math.round((partial / total) * 100) : 0,
      pNot: total > 0 ? Math.round((notImpl / total) * 100) : 0,
      pNa: total > 0 ? Math.round((na / total) * 100) : 0,
    };
  });

  const totals = typeData.reduce((acc, c) => ({
    implemented: acc.implemented + c.implemented,
    partial: acc.partial + c.partial,
    notImpl: acc.notImpl + c.notImpl,
    na: acc.na + c.na,
    total: acc.total + c.total,
  }), { implemented: 0, partial: 0, notImpl: 0, na: 0, total: 0 });

  const columns = [
    { key: 'name', label: 'Tipo de Controle' },
    { key: 'implemented', label: 'Implementados', align: 'center' as const },
    { key: 'partial', label: 'Parciais', align: 'center' as const },
    { key: 'notImpl', label: 'Não Implementados', align: 'center' as const },
    { key: 'na', label: 'Não se aplica', align: 'center' as const },
    { key: 'total', label: 'Total', align: 'center' as const },
    { 
      key: 'pImpl', 
      label: 'Implementados %', 
      align: 'center' as const,
      format: (v: number) => <span className="text-emerald-400 font-bold">{v}%</span>
    },
    { 
      key: 'pPartial', 
      label: 'Parcial %', 
      align: 'center' as const,
      format: (v: number) => <span className="text-amber-400">{v}%</span>
    },
    { 
      key: 'pNot', 
      label: 'Não Impl. %', 
      align: 'center' as const,
      format: (v: number) => <span className="text-red-400">{v}%</span>
    },
  ];

  // Totais para o gráfico geral
  const totalPieData = [
    { name: 'Implementado', value: totals.implemented, color: STATUS_COLORS['Implementado'] },
    { name: 'Parcial', value: totals.partial, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementado', value: totals.notImpl, color: STATUS_COLORS['Não implementado'] },
    { name: 'Não se aplica', value: totals.na, color: STATUS_COLORS['Não se aplica'] },
  ].filter(d => d.value > 0);

  const totalBarData = [
    { name: 'Implementados', value: totals.implemented, color: STATUS_COLORS['Implementado'] },
    { name: 'Parciais', value: totals.partial, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementados', value: totals.notImpl, color: STATUS_COLORS['Não implementado'] },
  ].filter(d => d.value > 0);

  return (
    <>
      {/* Header com Ícone de Metodologia */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Análise por Tipo de Controle</h2>
          <p className="text-sm text-gray-500">Distribuição dos controles Preventivos, Detectivos e Corretivos</p>
        </div>
        <div className="relative group">
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Metodologia de cálculo"
            title="Clique para ver a metodologia"
          >
            <Info className="w-5 h-5" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">📊 Metodologia de Cálculo</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>Implementado:</strong> Nível de maturidade <strong>2</strong></li>
              <li>• <strong>Parcial:</strong> Nível de maturidade <strong>1</strong></li>
              <li>• <strong>Não Implementado:</strong> Nível de maturidade <strong>0</strong></li>
              <li>• <strong>Não se Aplica:</strong> Nível <strong>N/A</strong></li>
              <li>• <strong>Tipos:</strong> Preventivo, Detectivo, Corretivo</li>
            </ul>
          </div>
        </div>
      </div>

      <DataTable 
        data={typeData} 
        columns={columns}
        footer={
          <>
            <td className="px-4 py-3 text-gray-900 font-bold">Total</td>
            <td className="px-3 py-3 text-center text-emerald-400 font-bold">{totals.implemented}</td>
            <td className="px-3 py-3 text-center text-amber-400 font-bold">{totals.partial}</td>
            <td className="px-3 py-3 text-center text-red-400 font-bold">{totals.notImpl}</td>
            <td className="px-3 py-3 text-center text-gray-500">{totals.na}</td>
            <td className="px-3 py-3 text-center text-gray-900 font-bold">{totals.total}</td>
            <td className="px-3 py-3 text-center text-emerald-400 font-bold">{totals.total > 0 ? Math.round((totals.implemented/totals.total)*100) : 0}%</td>
            <td className="px-3 py-3 text-center text-amber-400">{totals.total > 0 ? Math.round((totals.partial/totals.total)*100) : 0}%</td>
            <td className="px-3 py-3 text-center text-red-400">{totals.total > 0 ? Math.round((totals.notImpl/totals.total)*100) : 0}%</td>
          </>
        }
      />

      {/* Gráficos Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <PieChart
          data={totalPieData}
          title="Distribuição por Status"
          subtitle={`${totals.total} controles analisados`}
        />
        <BarChart
          data={totalBarData}
          title="Contagem por Status"
          subtitle="Total absoluto de controles por status"
        />
      </div>

      {/* Charts por tipo */}
      {typeData.map((row, index) => {
        const pieData = [
          { name: 'Implementado', value: row.implemented, color: STATUS_COLORS['Implementado'] },
          { name: 'Parcial', value: row.partial, color: STATUS_COLORS['Parcialmente implementado'] },
          { name: 'Não Implementado', value: row.notImpl, color: STATUS_COLORS['Não implementado'] },
          { name: 'Não se aplica', value: row.na, color: STATUS_COLORS['Não se aplica'] },
        ].filter(d => d.value > 0);

        const barData = [
          { name: 'Implementados', value: row.implemented, color: STATUS_COLORS['Implementado'] },
          { name: 'Parciais', value: row.partial, color: STATUS_COLORS['Parcialmente implementado'] },
          { name: 'Não Implementados', value: row.notImpl, color: STATUS_COLORS['Não implementado'] },
        ].filter(d => d.value > 0);

        return (
          <div key={row.name} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <PieChart
              data={pieData}
              title={`Gráficos — ${row.name}`}
              subtitle={`${row.total} controles · ${row.pImpl}% implementados · ${row.pPartial}% parciais · ${row.pNot}% não implementados`}
            />
            <BarChart
              data={barData}
              title="Quantidade por Status"
              subtitle={`Distribuição dos controles ${row.name}`}
            />
          </div>
        );
      })}
    </>
  );
};

export const ControlTypes: React.FC = () => {
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  
  // CORREÇÃO: Buscar companyId de diferentes locais no objeto user
  let companyId = paramCompanyId;
  
  if (!companyId && user) {
    const userAny = user as any;
    companyId = userAny.companyId || 
                userAny.company?._id || 
                userAny.company || 
                null;
    
    console.log('🔍 ControlTypes - user:', user);
    console.log('🔍 ControlTypes - companyId obtido:', companyId);
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">ID da empresa não informado</p>
          <p className="text-sm text-gray-500 mt-2">Faça logout e login novamente para atualizar seus dados.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardPageWrapper
      title="Tipos de Controle"
      subtitle="Análise dos controles Preventivos, Detectivos e Corretivos da ISO/IEC 27002:2022"
      companyId={companyId}
    >
      {(data) => <ControlTypesContent data={data} />}
    </DashboardPageWrapper>
  );
};