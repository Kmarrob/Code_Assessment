// frontend/src/pages/dashboard/DashboardOverview.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Building2, Users, ClipboardList, TrendingUp, CheckCircle, Clock, Info, Printer, Download } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.js';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout.js';
import { dashboardService, DashboardData } from '../../services/dashboard.service.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { PieChart } from '../../components/dashboard/PieChart.js';
import { BarChart } from '../../components/dashboard/BarChart.js';
import { RadarChart } from '../../components/dashboard/RadarChart.js';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'Implementado': 'hsl(142,70%,45%)',
  'Parcialmente implementado': 'hsl(38,92%,50%)',
  'Não implementado': 'hsl(0,72%,51%)',
  'Não se aplica': 'hsl(215,20%,55%)',
};

const RADAR_COLORS = {
  Implementado: '#10b981',
  Recomendado: '#94a3b8',
};

// ============================================
// NOVA FUNÇÃO: Gerar dados para o Radar Chart
// ============================================
const generateRadarData = (data: DashboardData) => {
  if (!data?.byCapability) return [];
  
  const capabilities = [
    { key: 'Governança', label: 'Governança' },
    { key: 'Gestão de ativos', label: 'Gestão de ativos' },
    { key: 'Proteção da informação', label: 'Proteção da informação' },
    { key: 'Gestão de identidade e acesso', label: 'Gestão de identidade e acesso' },
    { key: 'Segurança nas relações com fornecedores', label: 'Relações com fornecedores' },
    { key: 'Gestão de evento de segurança da informação', label: 'Eventos de SI' },
    { key: 'Gestão de ameaças e vulnerabilidades', label: 'Ameaças e vulnerabilidades' },
    { key: 'Gestão de continuidade do negócio', label: 'Continuidade' },
    { key: 'Segurança física', label: 'Segurança física' },
    { key: 'Desenvolvimento seguro', label: 'Desenvolvimento seguro' },
    { key: 'Gestão de redes', label: 'Gestão de redes' },
    { key: 'Monitoramento e análise', label: 'Monitoramento e análise' },
    { key: 'Gestão de pessoas', label: 'Gestão de pessoas' },
    { key: 'Gestão de criptografia', label: 'Criptografia' },
    { key: 'Garantia de segurança da informação', label: 'Garantia de SI' },
  ];

  return capabilities.map(cap => {
    const capData = data.byCapability?.[cap.key];
    const aderente = capData?.aderente || 0;
    return {
      subject: cap.label.length > 20 ? cap.label.substring(0, 20) + '…' : cap.label,
      fullLabel: cap.label,
      Implementado: aderente,
      Recomendado: 100,
    };
  });
};

// ============================================
// NOVA FUNÇÃO: Gerar dados de Tipos de Controle
// ============================================
const generateTypeData = (data: DashboardData) => {
  if (!data?.byType) return [];
  
  const types = ['Preventivo', 'Detectivo', 'Corretivo'];
  const colors = ['#6366f1', '#8b5cf6', '#a855f7'];
  
  return types.map((type, index) => {
    const typeData = data.byType?.[type];
    return {
      name: type,
      value: typeData?.total || 0,
      color: colors[index % colors.length],
      implemented: typeData?.implemented || 0,
      partial: typeData?.partial || 0,
      notImpl: typeData?.notImpl || 0,
    };
  });
};

// ============================================
// NOVA FUNÇÃO: Gerar dados de Domínios de SI
// ============================================
const generateDomainData = (data: DashboardData) => {
  if (!data?.byDomain) return [];
  
  const domains = ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção'];
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  
  return domains.map((domain, index) => {
    const domainData = data.byDomain?.[domain];
    return {
      name: domain,
      total: domainData?.total || 0,
      implemented: domainData?.implemented || 0,
      partial: domainData?.partial || 0,
      notImpl: domainData?.notImpl || 0,
      color: colors[index % colors.length],
      pImpl: domainData?.total > 0 ? Math.round((domainData.implemented / domainData.total) * 100) : 0,
    };
  });
};

// ============================================
// NOVA FUNÇÃO: Gerar dados de Conceitos Cibernéticos
// ============================================
const generateConceptData = (data: DashboardData) => {
  if (!data?.byCyberConcept) return [];
  
  const concepts = ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'];
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
  
  return concepts.map((concept, index) => {
    const conceptData = data.byCyberConcept?.[concept];
    return {
      name: concept,
      total: conceptData?.total || 0,
      implemented: conceptData?.implemented || 0,
      partial: conceptData?.partial || 0,
      notImpl: conceptData?.notImpl || 0,
      color: colors[index % colors.length],
      pImpl: conceptData?.total > 0 ? Math.round((conceptData.implemented / conceptData.total) * 100) : 0,
    };
  });
};

export const DashboardOverview: React.FC = () => {
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // CORREÇÃO: Obter companyId da URL ou do usuário
  // ============================================
  const getCompanyId = (): string | undefined => {
    if (paramCompanyId) return paramCompanyId;
    if (user) {
      const userAny = user as any;
      const id = userAny.companyId || 
                 userAny.company?._id || 
                 userAny.company || 
                 null;
      if (id) {
        console.log('🔍 DashboardOverview - companyId obtido do usuário:', id);
        return id;
      }
    }
    return undefined;
  };

  const companyId = getCompanyId();

  // ============================================
  // FUNÇÃO PARA IMPRIMIR O RELATÓRIO
  // ============================================
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const loadData = async () => {
      if (!companyId) {
        if (user?.role === 'admin') {
          setError('Selecione uma empresa para visualizar o dashboard');
          setLoading(false);
          return;
        }
        if (user?.role === 'rep' && user) {
          const userAny = user as any;
          const id = userAny.companyId || userAny.company?._id || userAny.company || null;
          if (id) {
            setLoading(false);
            window.location.reload();
            return;
          }
        }
        setError('ID da empresa não informado. Faça logout e login novamente.');
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

  // ============================================
  // DADOS CONSOLIDADOS PARA O RELATÓRIO
  // ============================================
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

  // ============================================
  // DADOS DAS DEMAIS PÁGINAS
  // ============================================
  const typeData = generateTypeData(data);
  const conceptData = generateConceptData(data);
  const domainData = generateDomainData(data);
  const radarData = generateRadarData(data);

  // Totais para os gráficos de tipos
  const totalTypes = typeData.reduce((acc, t) => acc + t.value, 0);

  // Totais para os gráficos de conceitos
  const totalConcepts = conceptData.reduce((acc, c) => acc + c.total, 0);

  // Totais para os gráficos de domínios
  const totalDomains = domainData.reduce((acc, d) => acc + d.total, 0);

  return (
    <DashboardLayout companyId={companyId}>
      <div className="space-y-6">
        {/* ============================================ */}
        {/* HEADER DO RELATÓRIO EXECUTIVO */}
        {/* ============================================ */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Relatório Executivo</h1>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{company?.name || 'Carregando...'}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Botão de Impressão */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm font-medium">Imprimir Relatório</span>
            </button>
            
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
                  <li>• <strong>Implementado:</strong> Controles com nível de maturidade <strong>2</strong></li>
                  <li>• <strong>Parcial:</strong> Controles com nível de maturidade <strong>1</strong></li>
                  <li>• <strong>Não Implementado:</strong> Controles com nível de maturidade <strong>0</strong></li>
                  <li>• <strong>Não se Aplica:</strong> Controles com nível <strong>N/A</strong></li>
                  <li>• <strong>Taxa de Conclusão:</strong> (Implementados / Total) × 100</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CARDS DE RESUMO */}
        {/* ============================================ */}
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

        {/* ============================================ */}
        {/* SEÇÃO 1: STATUS GERAL (Visão Geral) */}
        {/* ============================================ */}
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

        {/* ============================================ */}
        {/* SEÇÃO 2: TIPOS DE CONTROLE */}
        {/* ============================================ */}
        {totalTypes > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">📋</span> Tipos de Controle
              <span className="text-xs font-normal text-gray-400 ml-2">
                {totalTypes} controles analisados
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {typeData.map((type) => (
                <div key={type.name} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{type.name}</span>
                    <span className="text-sm font-bold text-gray-900">{type.value}</span>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="text-emerald-600">✅ {type.implemented}</span>
                    <span className="text-amber-600">🔄 {type.partial}</span>
                    <span className="text-red-600">❌ {type.notImpl}</span>
                  </div>
                  <div className="mt-1 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${type.value > 0 ? Math.round((type.implemented / type.value) * 100) : 0}%`,
                        backgroundColor: type.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SEÇÃO 3: CONCEITOS CIBERNÉTICOS */}
        {/* ============================================ */}
        {totalConcepts > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-purple-600">🛡️</span> Conceitos Cibernéticos
              <span className="text-xs font-normal text-gray-400 ml-2">
                {totalConcepts} controles analisados
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {conceptData.map((concept) => (
                <div key={concept.name} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                  <div className="text-xs font-medium text-gray-600">{concept.name}</div>
                  <div className="text-lg font-bold text-gray-900">{concept.implemented}</div>
                  <div className="text-[10px] text-gray-400">de {concept.total}</div>
                  <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${concept.pImpl}%`,
                        backgroundColor: concept.color 
                      }}
                    />
                  </div>
                  <div className="text-[10px] font-medium mt-0.5" style={{ color: concept.color }}>
                    {concept.pImpl}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SEÇÃO 4: CAPACIDADES OPERACIONAIS */}
        {/* ============================================ */}
        {radarData.length > 0 && radarData.some(d => d.Implementado > 0) && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-teal-600">🎯</span> Capacidades Operacionais
              <span className="text-xs font-normal text-gray-400 ml-2">
                Análise das 15 capacidades
              </span>
            </h2>
            <RadarChart
              data={radarData}
              title="Radar de Capacidades Operacionais"
              subtitle="Comparação entre o nível implementado e o recomendado (100%)"
              height={400}
              colors={RADAR_COLORS}
            />
          </div>
        )}

        {/* ============================================ */}
        {/* SEÇÃO 5: DOMÍNIOS DE SI */}
        {/* ============================================ */}
        {totalDomains > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-indigo-600">🏛️</span> Domínios de SI
              <span className="text-xs font-normal text-gray-400 ml-2">
                {totalDomains} controles analisados
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {domainData.map((domain) => (
                <div key={domain.name} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{domain.name}</span>
                    <span className="text-sm font-bold text-gray-900">{domain.total}</span>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="text-emerald-600">✅ {domain.implemented}</span>
                    <span className="text-amber-600">🔄 {domain.partial}</span>
                    <span className="text-red-600">❌ {domain.notImpl}</span>
                  </div>
                  <div className="mt-1 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${domain.pImpl}%`,
                        backgroundColor: domain.color 
                      }}
                    />
                  </div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: domain.color }}>
                    {domain.pImpl}% implementados
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* RODAPÉ DO RELATÓRIO */}
        {/* ============================================ */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-4">
          <p>© {new Date().getFullYear()} Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001</p>
          <p>Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          <p className="mt-1">Este relatório consolida todas as métricas de maturidade da empresa {company?.name}.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};