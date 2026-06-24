// frontend/src/pages/dashboard/Capabilities.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { DashboardPageWrapper } from '../../components/dashboard/DashboardPageWrapper.js';
import { DataTable } from '../../components/dashboard/DataTable.js';
import { RadarChart } from '../../components/dashboard/RadarChart.js';
import { DashboardData } from '../../services/dashboard.service.js';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const CAPABILITIES = [
  { key: 'Governança', label: 'Governança' },
  { key: 'Gestão de ativos', label: 'Gestão de ativos' },
  { key: 'Proteção da informação', label: 'Proteção da informação' },
  { key: 'Gestão de identidade e acesso', label: 'Gestão de identidade e acesso' },
  { key: 'Segurança nas relações com fornecedores', label: 'Segurança nas relações com fornecedores' },
  { key: 'Gestão de evento de segurança da informação', label: 'Gestão de eventos de SI' },
  { key: 'Gestão de ameaças e vulnerabilidades', label: 'Gestão de ameaças e vulnerabilidades' },
  { key: 'Gestão de continuidade do negócio', label: 'Gestão de continuidade' },
  { key: 'Segurança física', label: 'Segurança física' },
  { key: 'Desenvolvimento seguro', label: 'Desenvolvimento seguro' },
  { key: 'Gestão de redes', label: 'Gestão de redes' },
  { key: 'Monitoramento e análise', label: 'Monitoramento e análise' },
  { key: 'Gestão de pessoas', label: 'Gestão de pessoas' },
  { key: 'Gestão de criptografia', label: 'Gestão de criptografia' },
  { key: 'Garantia de segurança da informação', label: 'Garantia de SI' },
];

const CapabilitiesContent: React.FC<{ data: DashboardData }> = ({ data }) => {
  // Debug: verificar dados recebidos
  console.log('🔍 Capabilities - data recebido:', data);
  console.log('🔍 Capabilities - controls:', data?.controls);

  const controls = data?.controls || [];

  const capData = CAPABILITIES.map(cap => {
    const filtered = controls.filter(c => {
      const control = c.control || c;
      const capacidades = control?.capacidadesOperacionais || [];
      if (Array.isArray(capacidades)) {
        return capacidades.includes(cap.key);
      }
      return capacidades === cap.key;
    });
    const total = filtered.length;
    const implemented = filtered.filter(c => c.status === 'Implementado').length;
    const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
    const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
    const na = filtered.filter(c => c.status === 'Não se aplica').length;
    const aderente = total > 0 ? Math.round((implemented / total) * 100) : 0;
    const naoAderente = total > 0 ? Math.round(((partial + notImpl) / total) * 100) : 0;
    
    console.log(`🔍 Capabilities - ${cap.key}: total=${total}, impl=${implemented}, partial=${partial}, not=${notImpl}, na=${na}`);
    
    return {
      name: cap.label,
      key: cap.key,
      total,
      implemented,
      partial,
      notImpl,
      na,
      aderente,
      naoAderente,
    };
  });

  const totals = capData.reduce((acc, c) => ({
    implemented: acc.implemented + c.implemented,
    partial: acc.partial + c.partial,
    notImpl: acc.notImpl + c.notImpl,
    na: acc.na + c.na,
    total: acc.total + c.total,
  }), { implemented: 0, partial: 0, notImpl: 0, na: 0, total: 0 });

  const totalAderente = totals.total > 0 ? Math.round((totals.implemented / totals.total) * 100) : 0;
  const totalNaoAderente = totals.total > 0 ? Math.round(((totals.partial + totals.notImpl) / totals.total) * 100) : 0;

  const radarData = capData.map(c => ({
    subject: c.name.length > 28 ? c.name.substring(0, 28) + '…' : c.name,
    fullLabel: c.name,
    Implementado: c.aderente,
    Recomendado: 100,
  }));

  const attentionPoints = capData.filter(c => c.aderente < 50).sort((a, b) => a.aderente - b.aderente);

  const columns = [
    { key: 'name', label: 'Capacidades Operacionais' },
    { key: 'na', label: 'Não se aplica', align: 'center' as const },
    { key: 'notImpl', label: 'Não Impl.', align: 'center' as const },
    { key: 'partial', label: 'Parcial', align: 'center' as const },
    { key: 'implemented', label: 'Implementados', align: 'center' as const },
    { key: 'total', label: 'Total', align: 'center' as const },
    { 
      key: 'aderente', 
      label: 'Aderente', 
      align: 'center' as const,
      format: (v: number) => (
        <span className={`font-bold ${v >= 70 ? 'text-emerald-400' : v >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
          {v}%
        </span>
      )
    },
    { 
      key: 'naoAderente', 
      label: 'Não aderente', 
      align: 'center' as const,
      format: (v: number) => <span className="text-red-400 font-medium">{v}%</span>
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header com Ícone de Metodologia */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacidades Operacionais</h1>
          <p className="text-sm text-gray-500 mt-1">
            Análise das 15 capacidades ISO/IEC 27002:2022 com percentual de aderência
          </p>
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
              <li>• <strong>Aderente:</strong> (Implementados / Total) × 100</li>
              <li>• <strong>Não Aderente:</strong> ((Parciais + Não Implementados) / Total) × 100</li>
              <li>• <strong>Implementado:</strong> Nível de maturidade <strong>2</strong></li>
              <li>• <strong>Parcial:</strong> Nível de maturidade <strong>1</strong></li>
              <li>• <strong>Não Implementado:</strong> Nível de maturidade <strong>0</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-blue-600">{totalAderente}%</div>
          <p className="text-xs text-gray-500">Aderência Global</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-red-400">{totalNaoAderente}%</div>
          <p className="text-xs text-gray-500">Não Aderente</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{totals.total}</div>
          <p className="text-xs text-gray-500">Total de Controles</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="text-2xl font-bold text-amber-400">{attentionPoints.length}</div>
          <p className="text-xs text-gray-500">Pontos de Atenção</p>
        </div>
      </div>

      <DataTable 
        data={capData} 
        columns={columns}
        footer={
          <>
            <td className="px-4 py-3 text-gray-900 font-bold">Total</td>
            <td className="px-3 py-3 text-center text-gray-500">{totals.na}</td>
            <td className="px-3 py-3 text-center text-red-400 font-bold">{totals.notImpl}</td>
            <td className="px-3 py-3 text-center text-amber-400 font-bold">{totals.partial}</td>
            <td className="px-3 py-3 text-center text-emerald-400 font-bold">{totals.implemented}</td>
            <td className="px-3 py-3 text-center text-gray-900 font-bold">{totals.total}</td>
            <td className="px-3 py-3 text-center text-blue-600 font-bold">{totalAderente}%</td>
            <td className="px-3 py-3 text-center text-red-400 font-bold">{totalNaoAderente}%</td>
          </>
        }
      />

      {/* Radar Chart */}
      <RadarChart
        data={radarData}
        title="Radar de Capacidades Operacionais"
        subtitle="Comparação entre o nível implementado e o recomendado (100%) por capacidade"
        height={520}
      />

      {/* Points of Attention */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-semibold text-gray-900">Pontos de Atenção</h3>
          <span className="ml-auto text-xs text-gray-500">{attentionPoints.length} capacidades com aderência abaixo de 50%</span>
        </div>
        {attentionPoints.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Todas as capacidades estão com aderência acima de 50%.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attentionPoints.map((cap, i) => (
              <motion.div
                key={cap.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-lg border p-4 ${cap.aderente === 0 ? 'border-red-500/30 bg-red-50' : 'border-amber-500/30 bg-amber-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${cap.aderente === 0 ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-gray-900">{cap.name}</p>
                      <span className={`text-sm font-bold ml-2 ${cap.aderente === 0 ? 'text-red-500' : 'text-amber-500'}`}>{cap.aderente}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${cap.aderente === 0 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${cap.aderente}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
                      <span>✅ {cap.implemented} implementados</span>
                      <span>🔄 {cap.partial} parciais</span>
                      <span>❌ {cap.notImpl} não implementados</span>
                      <span className="ml-auto">{cap.total} controles</span>
                    </div>
                    {cap.aderente === 0 && (
                      <div className="flex items-start gap-1.5 mt-2 text-[10px] text-red-600 bg-red-100 rounded px-2 py-1.5">
                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>Nenhum controle implementado. Ação imediata necessária.</span>
                      </div>
                    )}
                    {cap.aderente > 0 && cap.aderente < 25 && (
                      <div className="flex items-start gap-1.5 mt-2 text-[10px] text-amber-600 bg-amber-100 rounded px-2 py-1.5">
                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>Aderência crítica. Priorize a implementação.</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const Capabilities: React.FC = () => {
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
    
    console.log('🔍 Capabilities - user:', user);
    console.log('🔍 Capabilities - companyId obtido:', companyId);
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
      title="Capacidades Operacionais"
      subtitle="Análise das 15 capacidades ISO/IEC 27002:2022 com percentual de aderência"
      companyId={companyId}
    >
      {(data) => <CapabilitiesContent data={data} />}
    </DashboardPageWrapper>
  );
};