// frontend/src/pages/dashboard/Capabilities.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { DashboardPageWrapper } from '../../components/dashboard/DashboardPageWrapper.js';
import { DataTable } from '../../components/dashboard/DataTable.js';
import { RadarChart } from '../../components/dashboard/RadarChart.js';
import { DashboardData } from '../../services/dashboard.service.js';
import { 
  AlertTriangle, CheckCircle, Info, X, Lightbulb, Target, Clock, 
  ClipboardList, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CAPABILITIES = [
  { key: 'Governança', label: 'Governança', altKeys: ['Governança'] },
  { key: 'Gestão de ativos', label: 'Gestão de ativos', altKeys: ['Gestão de ativos'] },
  { key: 'Proteção da informação', label: 'Proteção da informação', altKeys: ['Proteção da informação'] },
  { key: 'Gestão de identidade e acesso', label: 'Gestão de identidade e acesso', altKeys: ['Gestão de identidade e acesso'] },
  { key: 'Segurança nas relações com fornecedores', label: 'Segurança nas relações com fornecedores', altKeys: ['Segurança nas relações com fornecedores'] },
  { key: 'Gestão de evento de segurança da informação', label: 'Gestão de eventos de SI', altKeys: ['Gestão de incidentes', 'Gestão de eventos de SI'] },
  { key: 'Gestão de ameaças e vulnerabilidades', label: 'Gestão de ameaças e vulnerabilidades', altKeys: ['Gestão de ameaças e vulnerabilidades'] },
  { key: 'Gestão de continuidade do negócio', label: 'Gestão de continuidade', altKeys: ['Gestão de continuidade'] },
  { key: 'Segurança física', label: 'Segurança física', altKeys: ['Segurança física'] },
  { key: 'Desenvolvimento seguro', label: 'Desenvolvimento seguro', altKeys: ['Desenvolvimento seguro'] },
  { key: 'Gestão de redes', label: 'Gestão de redes', altKeys: ['Gestão de redes'] },
  { key: 'Monitoramento e análise', label: 'Monitoramento e análise', altKeys: ['Monitoramento e análise'] },
  { key: 'Gestão de pessoas', label: 'Gestão de pessoas', altKeys: ['Gestão de pessoas'] },
  { key: 'Gestão de criptografia', label: 'Gestão de criptografia', altKeys: ['Gestão de criptografia'] },
  { key: 'Garantia de segurança da informação', label: 'Garantia de SI', altKeys: ['Garantia de SI'] },
];

const RADAR_COLORS = {
  Implementado: '#10b981',
  Recomendado: '#94a3b8',
};

const CapabilitiesContent: React.FC<{ data: DashboardData }> = ({ data }) => {
  const [selectedCapability, setSelectedCapability] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [listModal, setListModal] = useState<{
    isOpen: boolean;
    title: string;
    controls: any[];
    status: string;
    capKey: string;
  }>({
    isOpen: false,
    title: '',
    controls: [],
    status: '',
    capKey: '',
  });

  const controls = data?.controls || [];

  const capData = CAPABILITIES.map(cap => {
    const filtered = controls.filter(c => {
      const control = c.control || c;
      const capacidades = control?.capacidadesOperacionais || [];
      if (Array.isArray(capacidades)) {
        const allKeys = [cap.key, ...(cap.altKeys || [])];
        return capacidades.some((c: string) => allKeys.includes(c));
      }
      return capacidades === cap.key;
    });
    const total = filtered.length;
    const implemented = filtered.filter(c => c.status === 'Implementado').length;
    const partial = filtered.filter(c => c.status === 'Parcialmente implementado').length;
    const notImpl = filtered.filter(c => c.status === 'Não implementado').length;
    const aderente = total > 0 ? Math.round((implemented / total) * 100) : 0;
    const naoAderente = total > 0 ? Math.round(((partial + notImpl) / total) * 100) : 0;
    
    console.log(`🔍 Capabilities - ${cap.key}: total=${total}, impl=${implemented}, partial=${partial}, not=${notImpl}`);
    
    return {
      name: cap.label,
      key: cap.key,
      total,
      implemented,
      partial,
      notImpl,
      aderente,
      naoAderente,
    };
  });

  const totals = capData.reduce((acc, c) => ({
    implemented: acc.implemented + c.implemented,
    partial: acc.partial + c.partial,
    notImpl: acc.notImpl + c.notImpl,
    total: acc.total + c.total,
  }), { implemented: 0, partial: 0, notImpl: 0, total: 0 });

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

  const handleCardClick = (cap: any) => {
    setSelectedCapability(cap);
    setIsModalOpen(true);
  };

  const openControlList = (capKey: string, status: string, statusLabel: string) => {
    const capability = capData.find(c => c.key === capKey);
    
    const filtered = controls.filter(c => {
      const control = c.control || c;
      const capacidades = control?.capacidadesOperacionais || [];
      const hasCapability = Array.isArray(capacidades) 
        ? capacidades.some((cap: string) => cap === capKey)
        : capacidades === capKey;
      return hasCapability && c.status === status;
    });
    
    setListModal({
      isOpen: true,
      title: `${statusLabel} - ${capability?.name || capKey}`,
      controls: filtered,
      status: status,
      capKey: capKey,
    });
  };

  const getRecommendations = (cap: any): string[] => {
    const recommendations: string[] = [];
    
    if (cap.aderente === 0) {
      recommendations.push('Nenhum controle implementado. Ação imediata necessária.');
      recommendations.push('Realizar diagnóstico completo da capacidade.');
      recommendations.push('Elaborar plano de ação prioritário.');
    } else if (cap.aderente < 25) {
      recommendations.push('Aderência crítica. Priorize a implementação.');
      recommendations.push('Identificar controles mais simples de implementar.');
      recommendations.push('Estabelecer metas de curto prazo.');
    } else if (cap.aderente < 50) {
      recommendations.push('Aderência abaixo do esperado.');
      recommendations.push('Revisar os controles parciais e não implementados.');
      recommendations.push('Alocar recursos para acelerar a implementação.');
    }
    
    if (cap.partial > 0) {
      recommendations.push(`${cap.partial} controle(s) parcial(is) - revisar e completar.`);
    }
    
    if (cap.notImpl > 0) {
      recommendations.push(`${cap.notImpl} controle(s) não implementado(s) - priorizar.`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Capacidade em conformidade. Manter monitoramento.');
    }
    
    return recommendations;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
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

      {/* DataTable */}
      <DataTable 
        data={capData} 
        columns={columns}
        footer={
          <>
            <td className="px-4 py-3 text-gray-900 font-bold">Total</td>
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
        colors={RADAR_COLORS}
      />

      {/* Pontos de Atenção */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-semibold text-gray-900">📋 Plano de Ação Prioritário</h3>
          <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            {attentionPoints.length} capacidades em estado crítico
          </span>
        </div>

        {attentionPoints.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 rounded-lg p-4">
            <CheckCircle className="w-5 h-5" />
            <span>Todas as capacidades operacionais estão com aderência acima de 50%.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {attentionPoints.map((cap, index) => {
              const isCritical = cap.aderente === 0;
              const isHigh = cap.aderente > 0 && cap.aderente < 25;
              const severity = isCritical ? 'critical' : isHigh ? 'high' : 'medium';
              
              const colors = {
                critical: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-500' },
                high: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-500' },
                medium: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-500' },
              };

              return (
                <motion.div
                  key={cap.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`rounded-lg border-2 ${colors[severity].border} ${colors[severity].bg} p-5 hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => handleCardClick(cap)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[severity].badge}`} />
                        <h4 className="text-sm font-bold text-gray-900">{cap.name}</h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 text-gray-700`}>
                          {cap.aderente}% de aderência
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Diagnóstico:</span> 
                        {' '}{cap.implemented} implementados, {cap.partial} parciais, {cap.notImpl} não implementados
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs bg-white/60 px-2 py-1.5 rounded-lg">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openControlList(cap.key, 'Implementado', 'Implementados');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
                        title="Ver controles implementados"
                      >
                        <span className="font-bold text-emerald-600">{cap.implemented}</span>
                        <span className="text-emerald-600">✅</span>
                      </button>
                      <div className="w-px h-4 bg-gray-300" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openControlList(cap.key, 'Parcialmente implementado', 'Parciais');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                        title="Ver controles parciais"
                      >
                        <span className="font-bold text-amber-600">{cap.partial}</span>
                        <span className="text-amber-600">🔄</span>
                      </button>
                      <div className="w-px h-4 bg-gray-300" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openControlList(cap.key, 'Não implementado', 'Não Implementados');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                        title="Ver controles não implementados"
                      >
                        <span className="font-bold text-red-500">{cap.notImpl}</span>
                        <span className="text-red-500">❌</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          cap.aderente >= 70 ? 'bg-emerald-500' :
                          cap.aderente >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${cap.aderente}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Lista de Controles por Status */}
      <AnimatePresence>
        {listModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setListModal({ ...listModal, isOpen: false })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{listModal.title}</h3>
                  <p className="text-sm text-gray-500">{listModal.controls.length} controles encontrados</p>
                </div>
                <button
                  onClick={() => setListModal({ ...listModal, isOpen: false })}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {listModal.controls.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum controle encontrado com este status.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listModal.controls.map((item, idx) => {
                      const control = item.control || item;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                {control?.id || 'N/A'}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {control?.nome || 'Controle sem nome'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>
                                Status: {item.status === 'Implementado' ? '✅' : 
                                         item.status === 'Parcialmente implementado' ? '🔄' : '❌'}
                                {' '}{item.status}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setListModal({ ...listModal, isOpen: false })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Detalhes da Capacidade */}
      <AnimatePresence>
        {isModalOpen && selectedCapability && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCapability.name}</h3>
                  <p className="text-sm text-gray-500">Análise detalhada da capacidade</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedCapability.total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{selectedCapability.implemented}</div>
                  <div className="text-xs text-gray-500">Implementados</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600">{selectedCapability.partial}</div>
                  <div className="text-xs text-gray-500">Parciais</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">{selectedCapability.notImpl}</div>
                  <div className="text-xs text-gray-500">Não Impl.</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Aderência</span>
                  <span className={`text-sm font-bold ${selectedCapability.aderente >= 70 ? 'text-emerald-600' : selectedCapability.aderente >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                    {selectedCapability.aderente}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${selectedCapability.aderente >= 70 ? 'bg-emerald-500' : selectedCapability.aderente >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${selectedCapability.aderente}%` }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Recomendações</h4>
                </div>
                <ul className="space-y-2">
                  {getRecommendations(selectedCapability).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Próximos Passos</h4>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span>Priorizar controles com maior impacto para esta capacidade.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span>Revisar controles parciais para identificar gargalos.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span>Estabelecer metas de curto, médio e longo prazo.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Capabilities: React.FC = () => {
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  
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