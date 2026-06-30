// frontend/src/components/dashboard/BarChart.tsx
import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title?: string;
  subtitle?: string;
  height?: number;
  isPrinting?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  subtitle, 
  height = 280,
  isPrinting = false
}) => {
  const hasData = data.some(d => d.value > 0);

  if (!hasData) {
    return (
      <div className={`bg-card border border-border rounded-xl ${isPrinting ? 'p-3' : 'p-6'}`}>
        {title && <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>}
        {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
        <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  // 🔴 CORREÇÃO 1: Tooltip não aparece na impressão
  // 🔴 CORREÇÃO 2: Largura do gráfico na impressão reduzida para 450px
  // 🔴 CORREÇÃO 3: Fontes menores na impressão
  // 🔴 CORREÇÃO 4: Labels das barras menores na impressão
  // 🔴 CORREÇÃO 5: Padding do card reduzido na impressão

  const barContent = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,14%)" />
      <XAxis 
        dataKey="name" 
        tick={{ 
          fill: 'hsl(210,40%,80%)', 
          fontSize: isPrinting ? 8 : 10 
        }} 
      />
      <YAxis 
        tick={{ 
          fill: 'hsl(215,20%,55%)', 
          fontSize: isPrinting ? 9 : 11 
        }} 
        allowDecimals={false} 
      />
      {!isPrinting && (
        <Tooltip
          contentStyle={{ 
            background: 'hsl(222,44%,10%)', 
            border: '1px solid hsl(222,30%,16%)', 
            borderRadius: 8, 
            color: '#fff', 
            fontSize: 11 
          }}
          formatter={(v: any) => [v, 'Controles']}
        />
      )}
      <Bar 
        dataKey="value" 
        name="Controles" 
        radius={[4, 4, 0, 0]} 
        label={{ 
          position: 'top', 
          fill: 'hsl(210,40%,90%)', 
          fontSize: isPrinting ? 9 : 12, 
          fontWeight: 'bold' 
        }}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Bar>
    </>
  );

  return (
    <div className={`bg-card border border-border rounded-xl ${isPrinting ? 'p-3' : 'p-6'}`}>
      {title && <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>}
      {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
      
      {!isPrinting ? (
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart data={data} margin={{ top: 20 }}>
            {barContent}
          </RechartsBarChart>
        </ResponsiveContainer>
      ) : (
        // 🔴 CORREÇÃO: largura reduzida para 450px
        <RechartsBarChart width={450} height={height} data={data} margin={{ top: 20 }}>
          {barContent}
        </RechartsBarChart>
      )}
    </div>
  );
};