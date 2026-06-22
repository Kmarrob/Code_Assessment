// frontend/src/components/admin/AdminFallbacks.tsx
import React from 'react';
import { Button } from '../ui/Button.js';
import { RefreshCw, AlertCircle, ServerOff, WifiOff } from 'lucide-react';

interface AdminFallbackProps {
  onRetry?: () => void;
}

export const AdminLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="loading-spinner" />
    <p className="mt-4 text-gray-500">Carregando dados administrativos...</p>
  </div>
);

export const AdminErrorFallback: React.FC<AdminFallbackProps> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Erro ao carregar dados
    </h3>
    <p className="text-gray-500 mb-4">
      Não foi possível carregar os dados administrativos.
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    )}
  </div>
);

export const AdminNetworkFallback: React.FC<AdminFallbackProps> = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <WifiOff className="h-12 w-12 text-yellow-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Erro de conexão
    </h3>
    <p className="text-gray-500 mb-4">
      Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    )}
  </div>
);

export const AdminEmptyFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <ServerOff className="h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Nenhum dado disponível
    </h3>
    <p className="text-gray-500">
      Não há dados para exibir no momento.
    </p>
  </div>
);
