// frontend/src/pages/dashboard/Categorization.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { DashboardPageWrapper } from '../../components/dashboard/DashboardPageWrapper.js';
import { DataTable } from '../../components/dashboard/DataTable.js';
import { PieChart } from '../../components/dashboard/PieChart.js';
import { BarChart } from '../../components/dashboard/BarChart.js';
import { DashboardData } from '../../services/dashboard.service.js';
import { Info } from 'lucide-react';

// CORREÇÃO: Categorias com suporte a múltiplos nomes (plural e singular)
const CATEGORIES = [
  { key: 'Controles Organizacionais', label: 'Controles Organizacionais', altKeys: ['Organizacionais'] },
  { key: 'Controles de Pessoas', label: 'Controles de Pessoas', altKeys: ['Pessoas'] },
  { key: 'Controles Físicos', label: 'Controles Físicos', altKeys: ['Físicos'] },
  { key: 'Controles Tecnológicos', label: 'Controles Tecnológicos', altKeys: ['Tecnológicos'] },
];

const STATUS_COLORS = {
  'Implementado': 'hsl(142,70%,45%)',
  'Parcialmente implementado': 'hsl(38,92%,50%)',
  'Não implementado': 'hsl(0,72%,51%)',
  'Não se aplica': 'hsl(215,20%,55%)',
};

const CategorizationContent: React.FC<{ data: DashboardData }> = ({ data }) => {
  console.log('🔍 CategorizationContent - data recebido:', data);
  console.log('🔍 CategorizationContent - controls:', data?.controls);

  const controls = data?.controls || [];

  // CORREÇÃO: Verificar a estrutura do primeiro controle
  if (controls.length > 0) {
    console.log('🔍 CategorizationContent - primeiro controle:', controls[0]);
    console.log('🔍 CategorizationContent - tiposDeControles:', controls[0]?.control?.tiposDeControles);
  }

  const categoryData = CATEGORIES.map(cat => {
    // CORREÇÃO: Buscar controles que pertencem à categoria (com suporte a altKeys)
    const filtered = controls.filter(c => {
      const control = c.control || c;
      const tipos = control?.tiposDeControles || control?.tipoDeControle || [];
      
      // Converter para array se for string
      let tiposArray = Array.isArray(tipos) ? tipos : [tipos];
      
      // Verificar se algum dos tipos corresponde à categoria principal ou às alternativas
      const allKeys = [cat.key, ...(cat.altKeys || [])];
      return tiposArray.some((t: string) => allKeys.includes(t));
    });

    const total = filtered.length;
    const implemented = filtered.filter(c => c.status === 'Implementado').length;
    const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
    const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
    const na = filtered.filter(c => c.status === 'Não se aplica').length;
    
    console.log(`🔍 Categorization - ${cat.label}: total=${total}, impl=${implemented}, partial=${partial}, not=${notImpl}, na=${na}`);
    
    return {
      name: cat.label,
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

  const totals = categoryData.reduce((acc, c) => ({
    implemented: acc.implemented + c.implemented,
    partial: acc.partial + c.partial,
    notImpl: acc.notImpl + c.notImpl,
    na: acc.na + c.na,
    total: acc.total + c.total,
  }), { implemented: 0, partial: 0, notImpl: 0, na: 0, total: 0 });

  const columns = [
    { key: 'name', label: 'Categorias' },
    { key: 'implemented', label: 'Implementado', align: 'center' as const },
    { key: 'partial', label: 'Parcial', align: 'center' as const },
    { key: 'notImpl', label: 'Não Implementado', align: 'center' as const },
    { key: 'na', label: 'Não se aplica', align: 'center' as const },
    { key: 'total', label: 'Total', align: 'center' as const },
    { 
      key: 'pImpl', 
      label: 'Implementado %', 
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

  const pieData = [
    { name: 'Implementado', value: totals.implemented, color: STATUS_COLORS['Implementado'] },
    { name: 'Parcial', value: totals.partial, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementado', value: totals.notImpl, color: STATUS_COLORS['Não implementado'] },
    { name: 'Não se aplica', value: totals.na, color: STATUS_COLORS['Não se aplica'] },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Implementados', value: totals.implemented, color: STATUS_COLORS['Implementado'] },
    { name: 'Parciais', value: totals.partial, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementados', value: totals.notImpl, color: STATUS_COLORS['Não implementado'] },
  ].filter(d => d.value > 0);

  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Análise por Categoria</h2>
          <p className="text-sm text-gray-500">Distribuição dos controles por categoria da ISO 27002</p>
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
              <li>• <strong>Categorias:</strong> Organizacionais, Pessoas, Físicos, Tecnológicos</li>
            </ul>
          </div>
        </div>
      </div>

      <DataTable
        data={categoryData}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PieChart
          data={pieData}
          title="Distribuição por Status"
          subtitle={`${totals.total} controles analisados`}
        />
        <BarChart
          data={barData}
          title="Contagem por Status"
          subtitle="Total absoluto de controles por status"
        />
      </div>
    </>
  );
};

export const Categorization: React.FC = () => {
  console.log('🚀 Categorization - componente renderizado!');
  
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  
  console.log('🔍 Categorization - paramCompanyId:', paramCompanyId);
  console.log('🔍 Categorization - user:', user);
  
  let companyId = paramCompanyId;
  
  if (!companyId && user) {
    const userAny = user as any;
    companyId = userAny.companyId || 
                userAny.company?._id || 
                userAny.company || 
                null;
    
    console.log('🔍 Categorization - companyId obtido:', companyId);
  }

  if (!companyId) {
    console.error('❌ Categorization - companyId não encontrado!');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">ID da empresa não informado</p>
          <p className="text-sm text-gray-500 mt-2">Faça logout e login novamente para atualizar seus dados.</p>
        </div>
      </div>
    );
  }

  console.log('✅ Categorization - companyId final:', companyId);

  return (
    <DashboardPageWrapper
      title="Categorização"
      subtitle="Análise por tipo de controle da norma ISO/IEC 27002:2022"
      companyId={companyId}
    >
      {(data) => <CategorizationContent data={data} />}
    </DashboardPageWrapper>
  );
};