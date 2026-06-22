// frontend/src/components/ui/Fallback.tsx
import React from 'react';
import { Button } from './Button.js';
import { 
  AlertCircle, 
  WifiOff, 
  ServerOff, 
  ShieldOff,
  RefreshCw,
  Home,
  LogIn
} from 'lucide-react';

interface FallbackProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const Fallback: React.FC<FallbackProps> = ({
  title = 'Algo deu errado',
  message = 'Ocorreu um erro ao carregar o conteúdo.',
  icon,
  actionLabel = 'Tentar novamente',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="max-w-md w-full text-center p-8">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-100 rounded-full">
          {icon || <AlertCircle className="h-12 w-12 text-gray-600" />}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onAction && (
          <Button onClick={onAction} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction} className="gap-2">
            <Home className="h-4 w-4" />
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  </div>
);

export const NetworkErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Fallback
    title="Erro de conexão"
    message="Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
    icon={<WifiOff className="h-12 w-12 text-yellow-600" />}
    actionLabel="Tentar novamente"
    onAction={onRetry}
  />
);

export const ServerErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Fallback
    title="Erro no servidor"
    message="O servidor está temporariamente indisponível. Tente novamente mais tarde."
    icon={<ServerOff className="h-12 w-12 text-red-600" />}
    actionLabel="Tentar novamente"
    onAction={onRetry}
  />
);

export const AuthErrorFallback: React.FC<{ onLogin?: () => void }> = ({ onLogin }) => (
  <Fallback
    title="Sessão expirada"
    message="Sua sessão expirou. Por favor, faça login novamente."
    icon={<ShieldOff className="h-12 w-12 text-orange-600" />}
    actionLabel="Fazer login"
    onAction={onLogin}
    secondaryActionLabel="Ir para o início"
    onSecondaryAction={() => window.location.href = '/'}
  />
);

export const NotFoundFallback: React.FC = () => (
  <Fallback
    title="Página não encontrada"
    message="A página que você está procurando não existe ou foi removida."
    icon={<AlertCircle className="h-12 w-12 text-gray-600" />}
    actionLabel="Ir para o início"
    onAction={() => window.location.href = '/'}
  />
);
