// frontend/src/pages/dashboard/Domains.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { DashboardPageWrapper } from '../../components/dashboard/DashboardPageWrapper.js';
import { DataTable } from '../../components/dashboard/DataTable.js';
import { PieChart } from '../../components/dashboard/PieChart.js';
import { BarChart } from '../../components/dashboard/BarChart.js';
import { DashboardData } from '../../services/dashboard.service.js';

const DOMAINS = ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção'];
const STATUS_COLORS = {
  'Implementado': 'hsl(142,70%,45%)',
  'Parcialmente implementado': 'hsl(38,92%,50%)',
  'Não implementado': 'hsl(0,72%,51%)',
  'Não se aplica': 'hsl(215,20%,55%)',
};

const DomainsContent: React.FC<{ data: DashboardData }> = ({ data }) => {
  const domainData = DOMAINS.map(domain => {
    const controls = data.controls.filter(c => 
      c.control?.dominioDeSI?.includes(domain)
    );
    const total = controls.length;
    const implemented = controls.filter(c => c.status === 'Implementado').length;
    const partial = controls.filter(c => c.status === 'Parcialmente implementado').length;
    const notImpl = controls.filter(c => c.status === 'Não implementado').length;
    const na = controls.filter(c => c.status === 'Não se aplica').length;
    
    return {
      name: domain,
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

  const totals = domainData.reduce((acc, c) => ({
    implemented: acc.implemented + c.implemented,
    partial: acc.partial + c.partial,
    notImpl: acc.notImpl + c.notImpl,
    na: acc.na + c.na,
    total: acc.total + c.total,
  }), { implemented: 0, partial: 0, notImpl: 0, na: 0, total: 0 });

  const columns = [
    { key: 'name', label: 'Domínios de SI' },
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Domínios de SI</h1>
        <p className="text-sm text-gray-500 mt-1">
          Análise de Governança, Proteção, Defesa e Resiliência — ISO/IEC 27002:2022
        </p>
      </div>

      <DataTable data={domainData} columns={columns} />

      {domainData.map((row, index) => {
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
          <div key={row.name} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
};

export const Domains: React.FC = () => {
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  
  // Para admin: usa da URL; para rep: usa do usuário
  const companyId = paramCompanyId || user?.companyId;

  return (
    <DashboardPageWrapper
      title="Domínios de SI"
      subtitle="Análise de Governança, Proteção, Defesa e Resiliência — ISO/IEC 27002:2022"
      companyId={companyId}
    >
      {(data) => <DomainsContent data={data} />}
    </DashboardPageWrapper>
  );
};