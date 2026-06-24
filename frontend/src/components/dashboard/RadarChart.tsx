// frontend/src/components/dashboard/RadarChart.tsx
import React from 'react';
import { 
  RadarChart as RechartsRadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip
} from 'recharts';

interface RadarChartProps {
  data: Array<{
    subject: string;
    fullLabel: string;
    Implementado: number;
    Recomendado: number;
  }>;
  title?: string;
  subtitle?: string;
  height?: number;
  colors?: {
    Implementado?: string;
    Recomendado?: string;
  };
}

// Paleta de cores para os domínios
const DOMAIN_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violeta
  '#a855f7', // Roxo
  '#d946ef', // Magenta
  '#ec4899', // Rosa
  '#f43f5e', // Vermelho
  '#ef4444', // Vermelho claro
  '#f97316', // Laranja
  '#f59e0b', // Amarelo
  '#eab308', // Amarelo escuro
  '#84cc16', // Verde limão
  '#22c55e', // Verde
  '#10b981', // Esmeralda
  '#14b8a6', // Turquesa
  '#06b6d4', // Ciano
];

const DEFAULT_COLORS = {
  Implementado: '#6366f1',
  Recomendado: '#94a3b8',
};

export const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  title, 
  subtitle, 
  height = 480,
  colors = {}
}) => {
  const finalColors = {
    Implementado: colors.Implementado || DEFAULT_COLORS.Implementado,
    Recomendado: colors.Recomendado || DEFAULT_COLORS.Recomendado,
  };

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {title && <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>}
        {subtitle && <p className="text-xs text-gray-500 mb-4">{subtitle}</p>}
        <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  // Gerar dados para cada série (capacidade) com sua cor
  const seriesData = data.map((item, index) => ({
    name: item.fullLabel || item.subject,
    key: item.subject,
    value: item.Implementado,
    color: DOMAIN_COLORS[index % DOMAIN_COLORS.length],
    fullLabel: item.fullLabel || item.subject,
  }));

  // Formatar dados para o gráfico
  const chartData = data.map((item, index) => ({
    subject: item.subject,
    fullLabel: item.fullLabel || item.subject,
    ...seriesData.reduce((acc, series) => ({
      ...acc,
      [series.name]: series.value,
    }), {}),
    Recomendado: 100,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart 
          data={chartData} 
          margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
        >
          {/* Teia de aranha visível */}
          <PolarGrid 
            stroke="#94a3b8" 
            strokeWidth={1.5}
            gridType="polygon"
          />
          
          <PolarAngleAxis
            dataKey="subject"
            tick={{ 
              fill: '#334155', 
              fontSize: 11, 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
          />
          
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ 
              fill: '#94a3b8', 
              fontSize: 10,
              fontFamily: 'Inter, sans-serif',
            }}
            tickCount={6}
            axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
          />

          {/* Cada domínio como uma série com sua cor */}
          {seriesData.map((series) => (
            <Radar
              key={series.key}
              name={series.name}
              dataKey={series.name}
              stroke={series.color}
              fill={series.color}
              fillOpacity={0.1}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          ))}

          {/* Recomendado - linha de referência */}
          <Radar
            name="Recomendado"
            dataKey="Recomendado"
            stroke={finalColors.Recomendado}
            fill={finalColors.Recomendado}
            fillOpacity={0.05}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            strokeLinejoin="round"
          />

          <Tooltip
            contentStyle={{ 
              background: 'rgba(15, 23, 42, 0.95)', 
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: 12, 
              color: '#f1f5f9', 
              fontSize: 12,
              padding: '10px 16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              minWidth: '160px',
            }}
            formatter={(value: any, name: any) => [`${value}%`, name]}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel || label}
          />
          
          {/* CORREÇÃO: Legenda REMOVIDA - informações já estão na tabela */}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};