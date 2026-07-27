// frontend/src/components/dashboard/PieChart.tsx

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const RADIAN = Math.PI / 180;

const renderLabel =
  (isPrinting: boolean) =>
  ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.03) return null;

    const r = innerRadius + (outerRadius - innerRadius) * 0.6;

    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={isPrinting ? 10 : 12}
        fontWeight="bold"
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;

  title?: string;
  subtitle?: string;
  height?: number;
  isPrinting?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  subtitle,
  height = 280,
  isPrinting = false,
}) => {
  const filteredData = data.filter((d) => d.value > 0);

  const chartHeight = isPrinting ? 220 : height;

  if (filteredData.length === 0) {
    return (
      <div
        className={`bg-card border border-border rounded-xl ${
          isPrinting ? 'p-3' : 'p-6'
        }`}
      >
        {title && (
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {title}
          </h3>
        )}

        {subtitle && (
          <p className="text-xs text-muted-foreground mb-4">
            {subtitle}
          </p>
        )}

        <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  const pieContent = (
    <>
      <Pie
        data={filteredData}
        cx="50%"
        cy={isPrinting ? '44%' : '50%'}
        innerRadius={isPrinting ? 18 : 0}
        outerRadius={isPrinting ? 58 : 80}
        dataKey="value"
        labelLine={false}
        label={renderLabel(isPrinting)}
      >
        {filteredData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={entry.color}
          />
        ))}
      </Pie>

      {!isPrinting && (
        <Tooltip
          contentStyle={{
            background: 'hsl(222,44%,10%)',
            border: '1px solid hsl(222,30%,16%)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 11,
          }}
          formatter={(v: any, n: any) => [v, n]}
        />
      )}

      <Legend
        wrapperStyle={{
          fontSize: isPrinting ? 8 : 11,
          paddingTop: isPrinting ? 4 : 10,
        }}
        iconSize={isPrinting ? 8 : 10}
      />
    </>
  );

  return (
    <div
      className={`bg-card border border-border rounded-xl ${
        isPrinting ? 'p-3' : 'p-6'
      }`}
      style={
        isPrinting
          ? {
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
            }
          : undefined
      }
    >
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-1">
          {title}
        </h3>
      )}

      {subtitle && (
        <p className="text-xs text-muted-foreground mb-4">
          {subtitle}
        </p>
      )}

      {!isPrinting ? (
        <ResponsiveContainer
          width="100%"
          height={chartHeight}
        >
          <RechartsPieChart>{pieContent}</RechartsPieChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            width: 300,
            height: chartHeight,
            margin: '0 auto',
          }}
        >
          <RechartsPieChart
            width={300}
            height={chartHeight}
          >
            {pieContent}
          </RechartsPieChart>
        </div>
      )}
    </div>
  );
};

export default PieChart;