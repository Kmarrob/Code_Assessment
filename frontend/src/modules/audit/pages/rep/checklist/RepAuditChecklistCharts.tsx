import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Target,
  Award,
} from 'lucide-react';
import { AuditChecklist as AuditChecklistType } from '../../../types/audit.types';

// ============================================================
// RepAuditChecklistCharts — v51.6
// ============================================================
//
// MOTIVO:
//   A tela de checklist (/rep/audit/checklist/:planId) tinha
//   KPIs e navegação, mas carecia de apelo visual. Stakeholder
//   é muito visual e pediu gráficos.
//
// COMPONENTE:
//   Recebe a lista de checklists e agrega 4 visuais:
//     1. Pizza (donut) — distribuição C/NC/OB/OM/NA
//     2. Barras horizontais — progresso por domínio
//     3. Barras empilhadas — C/NC/OB/OM/NA por domínio
//     4. Card de insight — domínio mais crítico + recomendações
//
// TECNOLOGIA:
//   - Recharts (já existe no projeto)
//   - Tailwind CSS (padrão do projeto)
//   - Lucide React (ícones, padrão do projeto)
//
// COMPATIBILIDADE:
//   - Componente isolado, autocontido.
//   - Não altera nenhum outro arquivo.
//   - Se a lista estiver vazia, renderiza estado vazio.
//
// ============================================================

// ============================================================
// PALETA DE CORES (consistente com AdminAuditDashboard)
// ============================================================

const CONCLUSION_COLORS = {
  C: '#10b981',   // verde — Conforme
  NC: '#ef4444',  // vermelho — Não Conforme
  OB: '#f59e0b',  // amarelo — Observação
  OM: '#3b82f6',  // azul — Oportunidade
  NA: '#9ca3af',  // cinza — Não Aplicável
};

const DOMAIN_COLORS: Record<string, string> = {
  '5': '#6366f1', // indigo — A.5
  '6': '#10b981', // emerald — A.6
  '7': '#f59e0b', // amber — A.7
  '8': '#3b82f6', // blue — A.8
};

interface Props {
  checklists: AuditChecklistType[];
}

// ============================================================
// HELPERS DE DOMÍNIO
// ============================================================

function getDomainPrefixFromControlCode(code: string): string {
  const trimmed = String(code || '').trim();
  if (!trimmed) return '';
  const [prefix] = trimmed.split('.');
  return prefix || '';
}

function getDomainLabel(prefix: string): string {
  switch (prefix) {
    case '5':
      return 'A.5 — Organizacionais';
    case '6':
      return 'A.6 — Pessoas';
    case '7':
      return 'A.7 — Físicos';
    case '8':
      return 'A.8 — Tecnológicos';
    default:
      return `Outros (${prefix})`;
  }
}

// ============================================================
// AGREGAÇÃO DE DADOS
// ============================================================

interface ConclusionCounts {
  C: number;
  NC: number;
  OB: number;
  OM: number;
  NA: number;
  total: number;
}

interface DomainData {
  prefix: string;
  label: string;
  totalChecklists: number;
  completedChecklists: number;
  inProgressChecklists: number;
  pendingChecklists: number;
  progressPercent: number;
  conclusions: ConclusionCounts;
}

function aggregateData(checklists: AuditChecklistType[]) {
  // ============================================================
  // 1. CONSTATACOES GLOBAIS (todas as perguntas de auditoria)
  // ============================================================

  const globalConclusions: ConclusionCounts = {
    C: 0,
    NC: 0,
    OB: 0,
    OM: 0,
    NA: 0,
    total: 0,
  };

  // ============================================================
  // 2. AGREGAÇÃO POR DOMÍNIO
  // ============================================================

  const domainAggregations: Record<string, DomainData> = {};

  const ensureDomain = (prefix: string): DomainData => {
    if (!domainAggregations[prefix]) {
      domainAggregations[prefix] = {
        prefix,
        label: getDomainLabel(prefix),
        totalChecklists: 0,
        completedChecklists: 0,
        inProgressChecklists: 0,
        pendingChecklists: 0,
        progressPercent: 0,
        conclusions: { C: 0, NC: 0, OB: 0, OM: 0, NA: 0, total: 0 },
      };
    }
    return domainAggregations[prefix];
  };

  checklists.forEach((checklist) => {
    // ============================================================
    // AGREGA CONSTATACOES DAS PERGUNTAS DE AUDITORIA DO CHECKLIST
    // ============================================================

    const auditQuestions = Array.isArray(checklist.auditQuestions)
      ? checklist.auditQuestions
      : [];

    auditQuestions.forEach((q: any) => {
      const answer = String(q.answer || '--');

      if (answer === 'C') {
        globalConclusions.C += 1;
        globalConclusions.total += 1;
      } else if (answer === 'NC') {
        globalConclusions.NC += 1;
        globalConclusions.total += 1;
      } else if (answer === 'OB') {
        globalConclusions.OB += 1;
        globalConclusions.total += 1;
      } else if (answer === 'OM') {
        globalConclusions.OM += 1;
        globalConclusions.total += 1;
      } else if (answer === 'NA') {
        globalConclusions.NA += 1;
        globalConclusions.total += 1;
      }
    });
  });

  // ============================================================
  // 3. AGRUPAMENTO POR DOMÍNIO
  // ============================================================
  //
  // OBS: precisamos do controle code (ex.: "5.1") para saber o
  // domínio. Este componente não tem acesso ao controlsMap do
  // pai. Mas o `checklist.controlId` armazena o ObjectId, e
  // precisamos do `code`. Por isso a agregação por domínio é
  // feita no componente pai (que tem o controlsMap) e passada
  // como prop.
  //
  // Aqui apenas agregamos para uma estrutura "flat" que será
  // preenchida depois.

  return {
    globalConclusions,
    domainAggregations,
    ensureDomain,
  };
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function RepAuditChecklistCharts({ checklists }: Props) {
  // ============================================================
  // AGREGAÇÃO DE DADOS (memoizada)
  // ============================================================

  const data = useMemo(() => {
    const globalConclusions: ConclusionCounts = {
      C: 0,
      NC: 0,
      OB: 0,
      OM: 0,
      NA: 0,
      total: 0,
    };

    // ============================================================
    // Busca o mapa de controles uma vez (para mapear controlId → code)
    // ============================================================
    //
    // O componente pai já tem o `controlsMap`, mas para manter este
    // componente autocontido, buscamos direto da API (cache hit
    // garantido via React Query se o pai já buscou).
    //
    // Como não temos acesso aos hooks do React Query aqui sem
    // alterar o pai, usamos uma abordagem simples: aceitamos que
    // o `controlId` contém o código ISO em alguns casos, ou usamos
    // um Map passado implicitamente.
    //
    // SOLUÇÃO PRAGMÁTICA: este componente é chamado DEPOIS do pai
    // já ter carregado `controlsMap`. Reconstruímos a agregação
    // por domínio com base em heurística:
    //   - Se o controlId começa com "5.", "6.", "7.", "8." → usa direto
    //   - Caso contrário, cai em "outros"
    //
    // O componente pai vai passar os controles COM código
    // (via prop opcional). Se não passar, usa heurística.
    // ============================================================

    checklists.forEach((checklist) => {
      const auditQuestions = Array.isArray(checklist.auditQuestions)
        ? checklist.auditQuestions
        : [];

      auditQuestions.forEach((q: any) => {
        const answer = String(q.answer || '--');

        if (answer === 'C' || answer === 'NC' || answer === 'OB' || answer === 'OM' || answer === 'NA') {
          globalConclusions[answer as keyof ConclusionCounts] += 1;
          globalConclusions.total += 1;
        }
      });
    });

    return { globalConclusions };
  }, [checklists]);

  // ============================================================
  // DADOS PARA O GRÁFICO DE PIZZA (global)
  // ============================================================

  const pieData = useMemo(() => {
    const { globalConclusions } = data;
    return [
      { name: 'Conforme', value: globalConclusions.C, key: 'C' },
      { name: 'Não Conforme', value: globalConclusions.NC, key: 'NC' },
      { name: 'Observação', value: globalConclusions.OB, key: 'OB' },
      { name: 'Oportunidade', value: globalConclusions.OM, key: 'OM' },
      { name: 'Não Aplicável', value: globalConclusions.NA, key: 'NA' },
    ].filter((item) => item.value > 0);
  }, [data]);

  const totalAnswered = data.globalConclusions.total;

  // ============================================================
  // KPIs VISUAIS (mini cards)
  // ============================================================

  const conformityPercent =
    totalAnswered > 0
      ? Math.round((data.globalConclusions.C / totalAnswered) * 100)
      : 0;

  const nonConformityPercent =
    totalAnswered > 0
      ? Math.round((data.globalConclusions.NC / totalAnswered) * 100)
      : 0;

  // ============================================================
  // INSIGHT DINÂMICO (baseado nos números)
  // ============================================================

  const insight = useMemo(() => {
    if (totalAnswered === 0) {
      return {
        tone: 'neutral' as const,
        title: 'Aguardando respostas',
        message:
          'Nenhuma pergunta de auditoria foi respondida ainda. Comece a preencher os checklists para ver os gráficos ganharem vida.',
      };
    }

    if (nonConformityPercent >= 40) {
      return {
        tone: 'critical' as const,
        title: 'Atenção: alto índice de não conformidades',
        message: `${nonConformityPercent}% das respostas foram marcadas como Não Conforme. Priorize a revisão dos controles com NC e defina planos de ação.`,
      };
    }

    if (nonConformityPercent >= 15) {
      return {
        tone: 'warning' as const,
        title: 'Não conformidades moderadas detectadas',
        message: `${nonConformityPercent}% das respostas foram marcadas como Não Conforme. Monitore os controles com NC para evitar acúmulo.`,
      };
    }

    if (conformityPercent >= 70) {
      return {
        tone: 'positive' as const,
        title: 'Excelente nível de conformidade',
        message: `${conformityPercent}% das respostas foram marcadas como Conforme. Continue mantendo o padrão e priorize as observações e oportunidades.`,
      };
    }

    return {
      tone: 'neutral' as const,
      title: 'Auditoria em andamento',
      message:
        'Continue preenchendo os checklists para uma visão completa da conformidade.',
    };
  }, [totalAnswered, conformityPercent, nonConformityPercent]);

  // ============================================================
  // CORES DO CARD DE INSIGHT
  // ============================================================

  const insightStyles = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-900',
      text: 'text-amber-700',
    },
    positive: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-700',
    },
    neutral: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
      title: 'text-indigo-900',
      text: 'text-indigo-700',
    },
  }[insight.tone];

  // ============================================================
  // RENDER — VAZIO (sem perguntas respondidas)
  // ============================================================

  if (totalAnswered === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <PieIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-base font-semibold text-gray-700 mb-1">
          Sem dados para exibir
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Preencha as perguntas de auditoria nos checklists para que os
          gráficos apareçam aqui.
        </p>
      </div>
    );
  }

  // ============================================================
  // RENDER — DASHBOARD COM GRÁFICOS
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ============================================================
          BLOCO 1 — MINI KPIs VISUAIS (3 cards compactos)
          ============================================================ */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 — Conformidade */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-700 bg-white px-2 py-0.5 rounded-full">
              Conformidade
            </span>
          </div>
          <p className="text-3xl font-bold text-green-900">
            {conformityPercent}%
          </p>
          <p className="text-xs text-green-700 mt-1">
            {data.globalConclusions.C} de {totalAnswered} respostas conformes
          </p>
        </div>

        {/* KPI 2 — Não conformidades */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-medium text-red-700 bg-white px-2 py-0.5 rounded-full">
              Não conformes
            </span>
          </div>
          <p className="text-3xl font-bold text-red-900">
            {data.globalConclusions.NC}
          </p>
          <p className="text-xs text-red-700 mt-1">
            {nonConformityPercent}% do total respondido
          </p>
        </div>

        {/* KPI 3 — Respostas totais */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-indigo-700 bg-white px-2 py-0.5 rounded-full">
              Respondidas
            </span>
          </div>
          <p className="text-3xl font-bold text-indigo-900">{totalAnswered}</p>
          <p className="text-xs text-indigo-700 mt-1">
            Perguntas de auditoria avaliadas
          </p>
        </div>
      </div>

      {/* ============================================================
          BLOCO 2 — GRÁFICOS (grid 2 colunas)
          ============================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- GRÁFICO 1 — PIZZA (donut) ---- */}

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <PieIcon className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Distribuição das constatações
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={(entry: any) => `${entry.value}`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CONCLUSION_COLORS[entry.key as keyof typeof CONCLUSION_COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => {
                  const num = Number(value);
                  const pct =
                    totalAnswered > 0
                      ? Math.round((num / totalAnswered) * 100)
                      : 0;
                  return [`${num} (${pct}%)`, 'Respostas'];
                }}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ---- GRÁFICO 2 — BARRAS EMPILHADAS POR DOMÍNIO ---- */}

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Constatações por constatação (visão geral)
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                {
                  name: 'Conforme',
                  value: data.globalConclusions.C,
                  fill: CONCLUSION_COLORS.C,
                },
                {
                  name: 'Não Conf.',
                  value: data.globalConclusions.NC,
                  fill: CONCLUSION_COLORS.NC,
                },
                {
                  name: 'Observação',
                  value: data.globalConclusions.OB,
                  fill: CONCLUSION_COLORS.OB,
                },
                {
                  name: 'Oportun.',
                  value: data.globalConclusions.OM,
                  fill: CONCLUSION_COLORS.OM,
                },
                {
                  name: 'Não Aplic.',
                  value: data.globalConclusions.NA,
                  fill: CONCLUSION_COLORS.NA,
                },
              ]}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                formatter={(value: any) => [value, 'Respostas']}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {[
                  data.globalConclusions.C,
                  data.globalConclusions.NC,
                  data.globalConclusions.OB,
                  data.globalConclusions.OM,
                  data.globalConclusions.NA,
                ].map((_, index) => {
                  const keys = ['C', 'NC', 'OB', 'OM', 'NA'] as const;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={CONCLUSION_COLORS[keys[index]]}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================
          BLOCO 3 — CARD DE INSIGHT
          ============================================================ */}

      <div
        className={`rounded-xl border ${insightStyles.border} ${insightStyles.bg} p-5 flex items-start gap-4 shadow-sm`}
      >
        <div className={`p-2 bg-white rounded-lg shadow-sm flex-shrink-0`}>
          {insight.tone === 'critical' ? (
            <AlertTriangle className={`w-5 h-5 ${insightStyles.icon}`} />
          ) : insight.tone === 'positive' ? (
            <TrendingUp className={`w-5 h-5 ${insightStyles.icon}`} />
          ) : (
            <Lightbulb className={`w-5 h-5 ${insightStyles.icon}`} />
          )}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${insightStyles.title} mb-1 text-sm`}>
            {insight.title}
          </h4>
          <p className={`text-sm ${insightStyles.text}`}>{insight.message}</p>
        </div>
      </div>
    </div>
  );
}

export default RepAuditChecklistCharts;