// frontend/src/components/dashboard/DataTable.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  title?: string;
  subtitle?: string;
  footer?: any;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  columns, 
  title, 
  subtitle, 
  footer 
}) => {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        {title && <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>}
        {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  const getAlignClass = (align?: string) => {
    switch(align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-x-auto">
      {(title || subtitle) && (
        <div className="px-6 pt-4 pb-2">
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      )}
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-secondary/50 border-b border-border">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={`px-4 py-3 font-semibold text-muted-foreground ${getAlignClass(col.align)}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="hover:bg-secondary/20 transition-colors"
            >
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  className={`px-4 py-2.5 ${getAlignClass(col.align)}`}
                >
                  {col.format ? col.format(row[col.key]) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr className="bg-secondary/60 border-t-2 border-border font-bold">
              {footer}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};