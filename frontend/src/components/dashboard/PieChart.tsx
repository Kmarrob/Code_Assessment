// frontend/src/components/dashboard/PieChart.tsx
import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RADIAN = Math.PI / 180;

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.03) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title?: string;
  subtitle?: string;
  height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title, 
  subtitle, 
  height = 280 
}) => {
  const filteredData = data.filter(d => d.value > 0);

  if (filteredData.length === 0) {
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
        <RechartsPieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ 
              background: 'hsl(222,44%,10%)', 
              border: '1px solid hsl(222,30%,16%)', 
              borderRadius: 8, 
              color: '#fff', 
              fontSize: 11 
            }}
            formatter={(v: any, n: any) => [v, n]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};