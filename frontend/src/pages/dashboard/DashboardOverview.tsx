// frontend/src/pages/dashboard/DashboardOverview.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Building2, ClipboardList, TrendingUp, CheckCircle, Clock, Info, Printer } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card.js';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout.js';
import { dashboardService, DashboardData } from '../../services/dashboard.service.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { PieChart } from '../../components/dashboard/PieChart.js';
import { BarChart } from '../../components/dashboard/BarChart.js';
import { RadarChart } from '../../components/dashboard/RadarChart.js';
import { DataTable } from '../../components/dashboard/DataTable.js';
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
// FUNÇÕES PARA GERAR DADOS DE CADA PÁGINA
// ============================================

const generateTypeData = (data: DashboardData) => {
  if (!data?.byType) return [];
  const types = ['Preventivo', 'Detectivo', 'Corretivo'];
  const colors = ['#6366f1', '#8b5cf6', '#a855f7'];
  
  return types.map((type, index) => {
    const typeData = data.byType?.[type];
    return {
      name: type,
      total: typeData?.total || 0,
      implemented: typeData?.implemented || 0,
      partial: typeData?.partial || 0,
      notImpl: typeData?.notImpl || 0,
      na: typeData?.na || 0,
      color: colors[index % colors.length],
      pImpl: typeData?.total > 0 ? Math.round((typeData.implemented / typeData.total) * 100) : 0,
      pPartial: typeData?.total > 0 ? Math.round((typeData.partial / typeData.total) * 100) : 0,
      pNot: typeData?.total > 0 ? Math.round((typeData.notImpl / typeData.total) * 100) : 0,
    };
  });
};

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
      na: conceptData?.na || 0,
      color: colors[index % colors.length],
      pImpl: conceptData?.total > 0 ? Math.round((conceptData.implemented / conceptData.total) * 100) : 0,
      pPartial: conceptData?.total > 0 ? Math.round((conceptData.partial / conceptData.total) * 100) : 0,
      pNot: conceptData?.total > 0 ? Math.round((conceptData.notImpl / conceptData.total) * 100) : 0,
    };
  });
};

const generateCapabilityData = (data: DashboardData) => {
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
    return {
      name: cap.label,
      key: cap.key,
      total: capData?.total || 0,
      implemented: capData?.implemented || 0,
      partial: capData?.partial || 0,
      notImpl: capData?.notImpl || 0,
      na: capData?.na || 0,
      aderente: capData?.aderente || 0,
    };
  });
};

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
      na: domainData?.na || 0,
      color: colors[index % colors.length],
      pImpl: domainData?.total > 0 ? Math.round((domainData.implemented / domainData.total) * 100) : 0,
      pPartial: domainData?.total > 0 ? Math.round((domainData.partial / domainData.total) * 100) : 0,
      pNot: domainData?.total > 0 ? Math.round((domainData.notImpl / domainData.total) * 100) : 0,
    };
  });
};

const generateCategoryData = (data: DashboardData) => {
  if (!data?.byCategory) return [];
  const categories = [
    { key: 'Controles Organizacionais', label: 'Organizacionais' },
    { key: 'Controles de Pessoas', label: 'Pessoas' },
    { key: 'Controles Físicos', label: 'Físicos' },
    { key: 'Controles Tecnológicos', label: 'Tecnológicos' },
  ];
  
  return categories.map(cat => {
    const catData = data.byCategory?.[cat.key];
    return {
      name: cat.label,
      key: cat.key,
      total: catData?.total || 0,
      implemented: catData?.implemented || 0,
      partial: catData?.partial || 0,
      notImpl: catData?.notImpl || 0,
      na: catData?.na || 0,
    };
  });
};

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

const generateTypePieData = (data: DashboardData) => {
  if (!data?.byType) return [];
  const types = ['Preventivo', 'Detectivo', 'Corretivo'];
  const colors = ['#6366f1', '#8b5cf6', '#a855f7'];
  
  return types.map((type, index) => {
    const typeData = data.byType?.[type];
    return {
      name: type,
      value: typeData?.total || 0,
      color: colors[index % colors.length],
    };
  }).filter(d => d.value > 0);
};

const generateConceptBarData = (data: DashboardData) => {
  if (!data?.byCyberConcept) return [];
  const concepts = ['Identificar', 'Proteger', 'Detectar', 'Responder', 'Restaurar'];
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
  
  return concepts.map((concept, index) => {
    const conceptData = data.byCyberConcept?.[concept];
    return {
      name: concept,
      value: conceptData?.total || 0,
      color: colors[index % colors.length],
      implemented: conceptData?.implemented || 0,
      partial: conceptData?.partial || 0,
      notImpl: conceptData?.notImpl || 0,
    };
  }).filter(d => d.value > 0);
};

const generateDomainBarData = (data: DashboardData) => {
  if (!data?.byDomain) return [];
  const domains = ['Defesa', 'Resiliência', 'Governança e ecossistema', 'Proteção'];
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  
  return domains.map((domain, index) => {
    const domainData = data.byDomain?.[domain];
    return {
      name: domain,
      value: domainData?.total || 0,
      color: colors[index % colors.length],
      implemented: domainData?.implemented || 0,
      partial: domainData?.partial || 0,
      notImpl: domainData?.notImpl || 0,
    };
  }).filter(d => d.value > 0);
};

const generateTypeDetailData = (data: DashboardData, type: string) => {
  if (!data?.byType) return [];
  const typeData = data.byType?.[type];
  if (!typeData) return [];
  
  return [
    { name: 'Implementado', value: typeData.implemented || 0, color: STATUS_COLORS['Implementado'] },
    { name: 'Parcial', value: typeData.partial || 0, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementado', value: typeData.notImpl || 0, color: STATUS_COLORS['Não implementado'] },
    { name: 'Não se aplica', value: typeData.na || 0, color: STATUS_COLORS['Não se aplica'] },
  ].filter(d => d.value > 0);
};

const generateConceptDetailData = (data: DashboardData, concept: string) => {
  if (!data?.byCyberConcept) return [];
  const conceptData = data.byCyberConcept?.[concept];
  if (!conceptData) return [];
  
  return [
    { name: 'Implementado', value: conceptData.implemented || 0, color: STATUS_COLORS['Implementado'] },
    { name: 'Parcial', value: conceptData.partial || 0, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementado', value: conceptData.notImpl || 0, color: STATUS_COLORS['Não implementado'] },
    { name: 'Não se aplica', value: conceptData.na || 0, color: STATUS_COLORS['Não se aplica'] },
  ].filter(d => d.value > 0);
};

const generateDomainDetailData = (data: DashboardData, domain: string) => {
  if (!data?.byDomain) return [];
  const domainData = data.byDomain?.[domain];
  if (!domainData) return [];
  
  return [
    { name: 'Implementado', value: domainData.implemented || 0, color: STATUS_COLORS['Implementado'] },
    { name: 'Parcial', value: domainData.partial || 0, color: STATUS_COLORS['Parcialmente implementado'] },
    { name: 'Não Implementado', value: domainData.notImpl || 0, color: STATUS_COLORS['Não implementado'] },
    { name: 'Não se aplica', value: domainData.na || 0, color: STATUS_COLORS['Não se aplica'] },
  ].filter(d => d.value > 0);
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const DashboardOverview: React.FC = () => {
  const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const getCompanyId = (): string | undefined => {
    if (paramCompanyId) return paramCompanyId;
    if (user) {
      const userAny = user as any;
      return userAny.companyId || userAny.company?._id || userAny.company || undefined;
    }
    return undefined;
  };

  const companyId = getCompanyId();

  // 🔴 CORREÇÃO: Função de impressão com requestAnimationFrame
  const handlePrint = async () => {
    // Ativa o modo de impressão
    setIsPrinting(true);
    
    // Aguarda 2 ciclos de renderização para o React atualizar o DOM
    await new Promise(resolve => 
      requestAnimationFrame(() => 
        requestAnimationFrame(resolve)
      )
    );
    
    // Agora imprime
    window.print();
  };

  // 🔴 CORREÇÃO: Restaura o estado após a impressão
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

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

  // ============================================
  // ESTILOS DE IMPRESSÃO — CORREÇÃO ESTRUTURAL
  // ============================================
  const PrintStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
      @media print {
        /* ─── 1. RESET GLOBAL ─── */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box !important;
        }

        /* ─── 2. OCULTAR CHROME DA APLICAÇÃO ─── */
        aside, nav, header,
        .dashboard-sidebar,
        .dashboard-header,
        .no-print {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          left: -9999px !important;
        }

        /* ─── 3. EXPANDIR CONTAINER PRINCIPAL ─── */
        body, #root,
        main, .dashboard-main,
        div[class*="layout"],
        div[class*="content"] {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          float: none !important;
          position: static !important;
          overflow: visible !important;
        }

        /* ─── 4. PÁGINA EM PAISAGEM ─── */
        @page {
          size: A4 landscape;
          margin: 8mm 8mm 8mm 8mm;
        }

        /* ─── 5. CAPA DO RELATÓRIO ─── */
        .report-cover {
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          height: 100vh !important;
          min-height: 100vh !important;
          text-align: center !important;
          page-break-after: always !important;
          break-after: page !important;
          border: none !important;
          background: #f8fafc !important;
        }
        .report-cover .logo-large {
          font-size: 48px !important;
          font-weight: 900 !important;
          color: #0f172a !important;
          letter-spacing: -2px !important;
          margin-bottom: 8px !important;
        }
        .report-cover .logo-large span {
          color: #2563eb !important;
        }
        .report-cover .title {
          font-size: 36px !important;
          font-weight: 700 !important;
          color: #1e293b !important;
          margin-top: 16px !important;
        }
        .report-cover .subtitle {
          font-size: 20px !important;
          color: #475569 !important;
          margin-top: 8px !important;
        }
        .report-cover .company-name {
          font-size: 28px !important;
          font-weight: 600 !important;
          color: #2563eb !important;
          margin-top: 24px !important;
          padding: 8px 32px !important;
          border-top: 2px solid #2563eb !important;
          border-bottom: 2px solid #2563eb !important;
        }
        .report-cover .meta-info {
          font-size: 14px !important;
          color: #64748b !important;
          margin-top: 32px !important;
          line-height: 2 !important;
        }
        .report-cover .footer-text {
          font-size: 12px !important;
          color: #94a3b8 !important;
          margin-top: 48px !important;
          border-top: 1px solid #e2e8f0 !important;
          padding-top: 16px !important;
          width: 60% !important;
        }

        /* ─── 6. CABEÇALHO DAS PÁGINAS SEGUINTES ─── */
        .report-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          border-bottom: 2px solid #2563eb !important;
          padding-bottom: 4px !important;
          margin-bottom: 10px !important;
        }
        .report-header .logo-small {
          font-size: 14px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
        }
        .report-header .logo-small span {
          color: #2563eb !important;
        }
        .report-header .meta-small {
          font-size: 8px !important;
          color: #64748b !important;
          text-align: right !important;
          line-height: 1.3 !important;
        }
        .report-header .meta-small strong {
          color: #1e293b !important;
        }

        /* ─── 7. SEÇÕES ─── */
        .print-section {
          margin-top: 0 !important;
          padding-top: 8px !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .print-section-title {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          margin-bottom: 8px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding-bottom: 3px !important;
        }

        /* ─── 8. CARDS ─── */
        .print-card {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 4px !important;
          padding: 4px !important;
          margin-bottom: 4px !important;
          background: #fff !important;
        }

        /* ─── 9. GRIDS ─── */
        .print-grid-2 {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .print-grid-3 {
          display: grid !important;
          grid-template-columns: 1fr 1fr 1fr !important;
          gap: 6px !important;
          width: 100% !important;
        }
        .print-grid-4 {
          display: grid !important;
          grid-template-columns: 1fr 1fr 1fr 1fr !important;
          gap: 5px !important;
          width: 100% !important;
        }
        .print-grid-5 {
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          gap: 5px !important;
          width: 100% !important;
        }

        /* ─── 10. GRÁFICOS — CORREÇÃO ESTRUTURAL ─── */
        /* Forçar visibilidade de todos os elementos do Recharts */
        .recharts-wrapper,
        .recharts-responsive-container,
        .recharts-surface,
        .recharts-layer,
        .recharts-pie,
        .recharts-pie-sector,
        .recharts-bar,
        .recharts-bar-rectangle,
        .recharts-radar,
        .recharts-radar-polygon,
        .recharts-radar-dot,
        .recharts-polar-grid,
        .recharts-polar-angle-axis,
        .recharts-polar-radius-axis,
        .recharts-legend-wrapper,
        .recharts-tooltip-wrapper,
        .recharts-cartesian-axis,
        .recharts-cartesian-grid,
        .recharts-cartesian-axis-line,
        .recharts-cartesian-axis-tick {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Containers de gráficos devem ter altura total */
        .recharts-responsive-container {
          width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
          max-height: 100% !important;
          overflow: visible !important;
        }

        .recharts-responsive-container > svg {
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
          display: block !important;
        }

        .recharts-wrapper {
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
        }

        .recharts-surface {
          overflow: visible !important;
        }

        /* Legendas */
        .recharts-legend-item {
          display: inline-block !important;
        }
        .recharts-legend-item-text {
          font-size: 8px !important;
        }

        .recharts-legend-item::before {
          display: none !important;
          content: none !important;
        }
        ul.recharts-default-legend {
          list-style: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .recharts-text {
          font-size: 8px !important;
          fill: #1e293b !important;
        }
        .recharts-cartesian-axis-tick-value {
          font-size: 7px !important;
        }

        .recharts-pie-sector {
          stroke: #ffffff !important;
          stroke-width: 1px !important;
        }
        .recharts-bar-rectangle {
          fill-opacity: 1 !important;
        }
        .recharts-radar-polygon {
          fill-opacity: 0.3 !important;
        }

        .recharts-wrapper * {
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* ─── 11. TABELAS ─── */
        .print-table {
          font-size: 8px !important;
          width: 100% !important;
          break-inside: auto !important;
        }
        .print-table thead { display: table-header-group !important; }
        .print-table tr { break-inside: avoid !important; page-break-inside: avoid !important; }
        .print-table th,
        .print-table td { padding: 2px 3px !important; }

        /* ─── 12. RODAPÉ ─── */
        .report-footer {
          text-align: center !important;
          font-size: 8px !important;
          color: #94a3b8 !important;
          border-top: 1px solid #e2e8f0 !important;
          padding-top: 4px !important;
          margin-top: 8px !important;
        }

        /* ─── 13. QUEBRAS DE PÁGINA ─── */
        .section-break {
          page-break-before: always !important;
          break-before: page !important;
        }

        /* ─── 14. FORÇA DE RENDERIZAÇÃO ─── */
        .recharts-wrapper,
        .recharts-responsive-container {
          transform: none !important;
          -webkit-transform: none !important;
        }

        /* ─── 15. VERSÃO DE IMPRESSÃO DOS GRÁFICOS ─── */
        .print-only {
          display: block !important;
        }
        
        .screen-only {
          display: none !important;
        }
      }

      /* ─── 16. TELA: OCULTAR VERSÃO DE IMPRESSÃO ─── */
      @media screen {
        .print-only {
          display: none !important;
        }
        
        .screen-only {
          display: block !important;
        }
      }
    `}} />
  );

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
            {user?.role === 'admin' ? (
              <button
                onClick={() => navigate('/admin/empresas')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ir para Empresas
              </button>
            ) : (
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

  const typeData = generateTypeData(data);
  const conceptData = generateConceptData(data);
  const capabilityData = generateCapabilityData(data);
  const domainData = generateDomainData(data);
  const categoryData = generateCategoryData(data);
  const radarData = generateRadarData(data);

  const typePieData = generateTypePieData(data);
  const conceptBarData = generateConceptBarData(data);
  const domainBarData = generateDomainBarData(data);

  const totalTypes = typeData.reduce((acc, t) => acc + t.total, 0);
  const totalConcepts = conceptData.reduce((acc, c) => acc + c.total, 0);
  const totalDomains = domainData.reduce((acc, d) => acc + d.total, 0);
  const totalCapabilities = capabilityData.reduce((acc, c) => acc + c.total, 0);
  const totalCategories = categoryData.reduce((acc, c) => acc + c.total, 0);

  const capabilityColumns = [
    { key: 'name', label: 'Capacidade' },
    { key: 'implemented', label: '✅ Imp.', align: 'center' as const },
    { key: 'partial', label: '🔄 Parc.', align: 'center' as const },
    { key: 'notImpl', label: '❌ N.I.', align: 'center' as const },
    { key: 'total', label: 'Total', align: 'center' as const },
    { 
      key: 'aderente', 
      label: 'Aderência', 
      align: 'center' as const,
      format: (v: number) => (
        <span className={`font-bold ${v >= 70 ? 'text-emerald-600' : v >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
          {v}%
        </span>
      )
    },
  ];

  const userName = user?.name || 'Usuário não identificado';
  const userEmail = user?.email || 'email@nao.informado';
  const printDate = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <DashboardLayout companyId={companyId}>
      <PrintStyles />
      
      {/* ============================================ */}
      {/* CAPA DO RELATÓRIO (apenas na impressão) */}
      {/* ============================================ */}
      <div className="report-cover" style={{ display: 'none' }}>
        <div className="logo-large">Code<span>_Assessment</span></div>
        <div className="title">Relatório Executivo</div>
        <div className="subtitle">Avaliação de Maturidade ISO 27001</div>
        <div className="company-name">{company?.name || 'Empresa não informada'}</div>
        <div className="meta-info">
          <div><strong>Responsável:</strong> {userName}</div>
          <div><strong>E-mail:</strong> {userEmail}</div>
          <div><strong>Data de emissão:</strong> {printDate}</div>
          <div><strong>Período de análise:</strong> {new Date().toLocaleDateString('pt-BR')}</div>
        </div>
        <div className="footer-text">
          Este relatório consolida todas as métricas de maturidade da empresa<br />
          com base nos 93 controles da norma ISO 27001:2022
        </div>
      </div>

      {/* ============================================ */}
      {/* CABEÇALHO DAS PÁGINAS SEGUINTES (apenas na impressão) */}
      {/* ============================================ */}
      <div className="report-header" style={{ display: 'none' }}>
        <div className="logo-small">Code<span>_Assessment</span></div>
        <div className="meta-small">
          <div><strong>{company?.name || 'Empresa'}</strong></div>
          <div>{printDate}</div>
        </div>
      </div>

      {/* ============================================ */}
      {/* CONTEÚDO PRINCIPAL (TELA) */}
      {/* ============================================ */}
      <div className="space-y-6" ref={printRef}>
        
        {/* ============================================ */}
        {/* HEADER DO RELATÓRIO EXECUTIVO (TELA) */}
        {/* ============================================ */}
        <div className="flex items-start justify-between no-print">
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
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm font-medium">🖨️ Imprimir Relatório</span>
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
        {/* SEÇÃO 1: VISÃO GERAL */}
        {/* ============================================ */}
        <div className="border-t-4 border-blue-600 pt-4 print-section">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4 print-section-title">
            <span className="text-blue-600">📊</span> 1. Visão Geral
            <span className="text-xs font-normal text-gray-400 ml-2">
              Resumo consolidado da maturidade
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 print-grid-5">
            <Card className="print-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Controles</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalControls}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg no-print">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="print-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Implementados</p>
                    <p className="text-2xl font-bold text-green-600">{summary.Implementado || 0}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg no-print">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="print-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Parciais</p>
                    <p className="text-2xl font-bold text-yellow-600">{summary.Parcialmente || 0}</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg no-print">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="print-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Não Implementados</p>
                    <p className="text-2xl font-bold text-red-600">{summary.NaoImplementado || 0}</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg no-print">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="print-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg no-print">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 🔴 CORREÇÃO: Versão para TELA e versão para IMPRESSÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-grid-2">
            {/* Versão para TELA */}
            <div className="print-card screen-only">
              <PieChart
                data={pieData}
                title="Distribuição de Status"
                subtitle={`${summary.totalControls} controles analisados`}
                isPrinting={false}
              />
            </div>
            <div className="print-card screen-only">
              <BarChart
                data={barData}
                title="Contagem por Status"
                subtitle="Distribuição dos controles por nível de implementação"
                isPrinting={false}
              />
            </div>
            
            {/* Versão para IMPRESSÃO - ALTURA REDUZIDA */}
            <div className="print-card print-only">
              <PieChart
                data={pieData}
                title="Distribuição de Status"
                subtitle={`${summary.totalControls} controles analisados`}
                height={260}
                isPrinting={true}
              />
            </div>
            <div className="print-card print-only">
              <BarChart
                data={barData}
                title="Contagem por Status"
                subtitle="Distribuição dos controles por nível de implementação"
                height={260}
                isPrinting={true}
              />
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* SEÇÃO 2: CATEGORIZAÇÃO */}
        {/* ============================================ */}
        {totalCategories > 0 && (
          <div className="border-t-4 border-purple-600 pt-4 print-section section-break">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4 print-section-title">
              <span className="text-purple-600">📂</span> 2. Categorização
              <span className="text-xs font-normal text-gray-400 ml-2">
                Distribuição por categoria
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print-grid-4">
              {categoryData.map((cat) => (
                <div key={cat.name} className="bg-gray-50 rounded-lg p-3 border border-gray-200 print-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="text-sm font-bold text-gray-900">{cat.total}</span>
                  </div>
                  <div className="mt-2 flex gap-1 text-[10px]">
                    <span className="text-emerald-600">✅ {cat.implemented}</span>
                    <span className="text-amber-600">🔄 {cat.partial}</span>
                    <span className="text-red-600">❌ {cat.notImpl}</span>
                  </div>
                  <div className="mt-1 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-purple-500"
                      style={{ width: `${cat.total > 0 ? Math.round((cat.implemented / cat.total) * 100) : 0}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {cat.total > 0 ? Math.round((cat.implemented / cat.total) * 100) : 0}% implementados
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SEÇÃO 3: TIPOS DE CONTROLE */}
        {/* ============================================ */}
        {totalTypes > 0 && (
          <div className="border-t-4 border-indigo-600 pt-4 print-section section-break">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4 print-section-title">
              <span className="text-indigo-600">🏷️</span> 3. Tipos de Controle
              <span className="text-xs font-normal text-gray-400 ml-2">
                {totalTypes} controles analisados
              </span>
            </h2>
            
            {/* Versão para TELA */}
            <div className="mb-4 print-card screen-only">
              <PieChart
                data={typePieData}
                title="Distribuição por Tipo de Controle"
                subtitle="Preventivo, Detectivo e Corretivo"
                isPrinting={false}
              />
            </div>
            
            {/* Versão para IMPRESSÃO - ALTURA REDUZIDA */}
            <div className="mb-4 print-card print-only">
              <PieChart
                data={typePieData}
                title="Distribuição por Tipo de Controle"
                subtitle="Preventivo, Detectivo e Corretivo"
                height={260}
                isPrinting={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-grid-3">
              {typeData.map((type) => (
                <div key={type.name} className="bg-gray-50 rounded-lg p-3 border border-gray-200 print-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{type.name}</span>
                    <span className="text-sm font-bold text-gray-900">{type.total}</span>
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
                        width: `${type.pImpl}%`,
                        backgroundColor: type.color 
                      }}
                    />
                  </div>
                  <div className="text-[10px] font-medium mt-0.5" style={{ color: type.color }}>
                    {type.pImpl}% implementados
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 print-grid-3">
              {typeData.map((type) => {
                const detailData = generateTypeDetailData(data, type.name);
                if (detailData.length === 0) return null;
                return (
                  <div key={`detail-${type.name}`} className="bg-white border border-gray-200 rounded-lg p-3 print-card">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">{type.name}</h4>
                    {/* Versão para TELA */}
                    <div className="screen-only">
                      <PieChart
                        data={detailData}
                        title=""
                        subtitle={`${type.total} controles`}
                        isPrinting={false}
                      />
                    </div>
                    {/* Versão para IMPRESSÃO - ALTURA REDUZIDA */}
                    <div className="print-only">
                      <PieChart
                        data={detailData}
                        title=""
                        subtitle={`${type.total} controles`}
                        height={200}
                        isPrinting={true}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SEÇÃO 4: CONCEITOS CIBERNÉTICOS */}
        {/* ============================================ */}
        {totalConcepts > 0 && (
          <div className="border-t-4 border-pink-600 pt-4 print-section section-break">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4 print-section-title">
              <span className="text-pink-600">🛡️</span> 4. Conceitos Cibernéticos
              <span className="text-xs font-normal text-gray-400 ml-2">
                {totalConcepts} controles analisados
              </span>
            </h2>

            {/* Versão para TELA */}
            <div className="mb-4 print-card screen-only">
              <BarChart
                data={conceptBarData}
                title="Distribuição por Conceito Cibernético"
                subtitle="Identificar, Proteger, Detectar, Responder, Restaurar"
                isPrinting={false}
              />
            </div>
            
            {/* Versão para IMPRESSÃO - ALTURA REDUZIDA */}
            <div className="mb-4 print-card print-only">
              <BarChart
                data={conceptBarData}
                title="Distribuição por Conceito Cibernético"
                subtitle="Identificar, Proteger, Detectar, Responder, Restaurar"
                height={260}
                isPrinting={true}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 print-grid-5">
              {conceptData.map((concept) => (
                <div key={concept.name} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 print-card">
                  <div className="text-xs font-medium text-gray-600">{concept.name}</div>
                  <div className="text-lg font-bold text-gray-900">{concept.implemented}</div>
                  <div className="text-[10px] text-gray-400">de {concept.total}</div>
                  <div className="mt-1 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
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

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 print-grid-5">
              {conceptData.map((concept) => {
                const detailData = generateConceptDetailData(data, concept.name);
                if (detailData.length === 0) return null;
                return (
                  <div key={`detail-${concept.name}`} className="bg-white border border-gray-200 rounded-lg p-2 print-card">
                    <h4 className="text-[10px] font-semibold text-gray-700 mb-1 text-center">{concept.name}</h4>
                    {/* Versão para TELA */}
                    <div className="screen-only">
                      <PieChart
                        data={detailData}
                        title=""
                        subtitle=""
                        isPrinting={false}
                      />
                    </div>
                    {/* Versão para IMPRESSÃO - ALTURA REDUZIDA */}
                    <div className="print-only">
                      <PieChart
                        data={detailData}
                        title=""
                        subtitle=""
                        height={170}
                        isPrinting={true}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SEÇÃO 5: CAPACIDADES OPERACIONAIS */}
        {/* ============================================ */}
        {totalCapabilities > 0 && (
          <div className="border-t-4 border-teal-600 pt-4 print-section section-break">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4 print-section-title">
              <span className="text-teal-600">🎯</span> 5. Capacidades Operacionais
              <span className="text-xs font-normal text-gray-400 ml-2">
                {totalCapabilities} controles analisados
              </span>
            </h2>
            
            {radarData.length > 0 && radarData.some(d => d.Implementado > 0) && (
              <>
                {/* Versão para TELA */}
                <div className="mb-4 print-card print-radar screen-only">
                  <RadarChart
                    data={radarData}
                    title="Radar de Capacidades Operacionais"
                    subtitle="Comparação entre o nível implementado e o recomendado (100%)"
                    height={400}
                    colors={RADAR_COLORS}
                    isPrinting={false}
                  />
                </div>
                
                {/* Versão para IMPRESSÃO - ALTURA REDUZIDA */}
                <div className="mb-4 print-card print-radar print-only">
                  <RadarChart
                    data={radarData}
                    title="Radar de Capacidades Operacionais"
                    subtitle="Comparação entre o nível implementado e o recomendado (100%)"
                    height={350}
                    colors={RADAR_COLORS}
                    isPrinting={true}
                  />
                </div>
              </>
            )}

            <div className="print-table">
              <DataTable 
                data={capabilityData} 
                columns={capabilityColumns}
              />
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SEÇÃO 6: DOMÍNIOS DE SI */}
        {/* ============================================ */}
        {totalDomains > 0 && (
          <div className="border-t-4 border-emerald-600 pt-4 print-section section-break">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4 print-section-title">
              <span className="text-emerald-600">🏛️</span> 6. Domínios de SI
              <span className="text-xs font-normal text-gray-400 ml-2">
                {totalDomains} controles analisados
              </span>
            </h2>

            {/* Versão para TELA */}
            <div className="mb-4 print-card screen-only">
              <BarChart
                data={domainBarData}
                title="Distribuição por Domínio de SI"
                subtitle="Defesa, Resiliência, Governança e ecossistema, Proteção"
                isPrinting={false}
              />
            </div>
            
            {/* Versão para IMPRESSÃO - ALTURA REDUZIDA */}
            <div className="mb-4 print-card print-only">
              <BarChart
                data={domainBarData}
                title="Distribuição por Domínio de SI"
                subtitle="Defesa, Resiliência, Governança e ecossistema, Proteção"
                height={260}
                isPrinting={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print-grid-4">
              {domainData.map((domain) => (
                <div key={domain.name} className="bg-gray-50 rounded-lg p-3 border border-gray-200 print-card">
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
                  <div className="text-[10px] font-medium mt-0.5" style={{ color: domain.color }}>
                    {domain.pImpl}% implementados
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 print-grid-4">
              {domainData.map((domain) => {
                const detailData = generateDomainDetailData(data, domain.name);
                if (detailData.length === 0) return null;
                return (
                  <div key={`detail-${domain.name}`} className="bg-white border border-gray-200 rounded-lg p-2 print-card">
                    <h4 className="text-[10px] font-semibold text-gray-700 mb-1 text-center truncate">{domain.name}</h4>
                    {/* Versão para TELA */}
                    <div className="screen-only">
                      <PieChart
                        data={detailData}
                        title=""
                        subtitle=""
                        isPrinting={false}
                      />
                    </div>
                    {/* Versão para IMPRESSÃO - ALTURA REDUZIDA */}
                    <div className="print-only">
                      <PieChart
                        data={detailData}
                        title=""
                        subtitle=""
                        height={170}
                        isPrinting={true}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* RODAPÉ DO RELATÓRIO */}
        {/* ============================================ */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-4 report-footer">
          <p>© {new Date().getFullYear()} Code_Assessment - Sistema de Avaliação de Maturidade ISO 27001</p>
          <p>Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          <p className="mt-1">Este relatório consolida todas as métricas de maturidade da empresa {company?.name}.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};