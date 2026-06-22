// frontend/src/components/dashboard/RadarChart.tsx
import React from 'react';
import { RadarChart as RechartsRadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
}

export const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  title, 
  subtitle, 
  height = 520 
}) => {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        {title && <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>}
        {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
        <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {title && <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>}
      {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart data={data} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
          <PolarGrid stroke="hsl(222,30%,18%)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'hsl(210,40%,75%)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'hsl(215,20%,50%)', fontSize: 9 }}
            tickCount={6}
          />
          <Radar
            name="Recomendado"
            dataKey="Recomendado"
            stroke="hsl(187,60%,70%)"
            fill="hsl(187,60%,70%)"
            fillOpacity={0.08}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <Radar
            name="Implementado"
            dataKey="Implementado"
            stroke="hsl(187,80%,48%)"
            fill="hsl(187,80%,48%)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{ 
              background: 'hsl(222,44%,10%)', 
              border: '1px solid hsl(222,30%,16%)', 
              borderRadius: 8, 
              color: '#fff', 
              fontSize: 11 
            }}
            formatter={(value: any, name: any, props: any) => [`${value}%`, name]}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel || label}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} iconType="square" />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};