// frontend/src/components/ui/EmptyState.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';
import { Button } from './Button.js';
import { Plus, Search, FileText, Users, ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: {
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-sm',
    spacing: 'space-y-3',
  },
  md: {
    icon: 'h-16 w-16',
    title: 'text-xl',
    description: 'text-base',
    spacing: 'space-y-4',
  },
  lg: {
    icon: 'h-20 w-20',
    title: 'text-2xl',
    description: 'text-lg',
    spacing: 'space-y-6',
  },
};

const emptyStateIcons = {
  plus: Plus,
  search: Search,
  file: FileText,
  users: Users,
  clipboard: ClipboardList,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  size = 'md',
}) => {
  const IconComponent = typeof icon === 'string' ? emptyStateIcons[icon as keyof typeof emptyStateIcons] : null;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50',
      sizes[size].spacing,
      className
    )}>
      {icon && (
        <div className={cn(
          'flex items-center justify-center rounded-full bg-gray-100',
          size === 'lg' ? 'p-6' : size === 'md' ? 'p-4' : 'p-3'
        )}>
          {IconComponent ? (
            <IconComponent className={cn('text-gray-400', sizes[size].icon)} />
          ) : (
            <span className={cn('text-gray-400', sizes[size].icon)}>{icon}</span>
          )}
        </div>
      )}

      <div className="space-y-1">
        <h3 className={cn('font-semibold text-gray-900', sizes[size].title)}>
          {title}
        </h3>
        {description && (
          <p className={cn('text-gray-500 max-w-md mx-auto', sizes[size].description)}>
            {description}
          </p>
        )}
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          {actionLabel && onAction && (
            <Button onClick={onAction} size={size === 'sm' ? 'sm' : 'default'}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const NoDataEmptyState: React.FC<{
  title?: string;
  description?: string;
  onAction?: () => void;
}> = ({
  title = 'Nenhum dado encontrado',
  description = 'Não há registros para exibir no momento.',
  onAction,
}) => (
  <EmptyState
    icon="search"
    title={title}
    description={description}
    actionLabel={onAction ? 'Recarregar' : undefined}
    onAction={onAction}
  />
);

export const NoUsersEmptyState: React.FC<{
  onAddUser?: () => void;
}> = ({ onAddUser }) => (
  <EmptyState
    icon="users"
    title="Nenhum usuário cadastrado"
    description="Comece adicionando seu primeiro usuário ao sistema."
    actionLabel="Adicionar usuário"
    onAction={onAddUser}
  />
);

export const NoControlsEmptyState: React.FC<{
  onAssign?: () => void;
}> = ({ onAssign }) => (
  <EmptyState
    icon="clipboard"
    title="Nenhum controle atribuído"
    description="Os controles da ISO 27001 serão atribuídos a você em breve."
    actionLabel="Ver controles disponíveis"
    onAction={onAssign}
  />
);

export const NoResultsEmptyState: React.FC<{
  query?: string;
  onClear?: () => void;
}> = ({ query, onClear }) => (
  <EmptyState
    icon="search"
    title="Nenhum resultado encontrado"
    description={query 
      ? `Nenhum resultado encontrado para "${query}". Tente ajustar sua busca.`
      : 'Nenhum resultado encontrado. Tente ajustar seus filtros.'
    }
    actionLabel="Limpar busca"
    onAction={onClear}
  />
);
