// frontend/src/components/admin/ActivityLog.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage.js';

export const ActivityLog: React.FC = () => {
  const activities = [
    { id: 1, action: 'Usuário João fez login', time: '5 min atrás', type: 'success' },
    { id: 2, action: 'Controle 5.1 atualizado', time: '15 min atrás', type: 'info' },
    { id: 3, action: 'Novo usuário cadastrado', time: '1 hora atrás', type: 'success' },
    { id: 4, action: 'Falha de autenticação', time: '2 horas atrás', type: 'error' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" aria-hidden="true" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
              {activity.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" aria-hidden="true" />}
              {activity.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" aria-hidden="true" />}
              {activity.type === 'info' && <Clock className="h-4 w-4 text-blue-500 mt-0.5" aria-hidden="true" />}
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-8">
              <OptimizedImage
                src="/empty-activity.svg"
                alt="Nenhuma atividade recente no sistema Code_Assessment"
                width={120}
                height={80}
                className="mx-auto mb-3"
                fallbackSrc="/empty-activity-fallback.png"
              />
              <p className="text-gray-500">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
