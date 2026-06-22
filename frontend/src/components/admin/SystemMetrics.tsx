// frontend/src/components/admin/SystemMetrics.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage.js';

export const SystemMetrics: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-600" aria-hidden="true" />
          Métricas do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">CPU</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full" style={{ width: '45%' }} />
              </div>
              <span className="text-sm font-medium">45%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Memória</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: '62%' }} />
              </div>
              <span className="text-sm font-medium">62%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Disco</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-600 rounded-full" style={{ width: '78%' }} />
              </div>
              <span className="text-sm font-medium">78%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Rede</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '23%' }} />
              </div>
              <span className="text-sm font-medium">23%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <OptimizedImage
              src="/system-metrics-chart.svg"
              alt="Gráfico de métricas do sistema Code_Assessment mostrando uso de CPU, memória, disco e rede"
              width={300}
              height={150}
              className="mx-auto"
              fallbackSrc="/system-metrics-chart-fallback.png"
            />
            <p className="text-xs text-gray-400 text-center mt-2">
              Gráfico de métricas do sistema
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMetrics;
