import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Send,
  Plus,
} from 'lucide-react';

export type AuditStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'open'
  | 'pending_validation'
  | 'reopened'
  | 'pending'
  | 'rejected'
  | 'pending_review';

interface AuditStatusBadgeProps {
  status: AuditStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<
  AuditStatus,
  {
    label: string;
    color: string;
    icon: React.ElementType;
  }
> = {
  draft: {
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: FileText,
  },
  pending_approval: {
    label: 'Aguardando Aprovação',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Send,
  },
  approved: {
    label: 'Aprovado',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle,
  },
  in_progress: {
    label: 'Em Andamento',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: Clock,
  },
  completed: {
    label: 'Concluído',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
  open: {
    label: 'Aberta',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertCircle,
  },
  pending_validation: {
    label: 'Aguardando Validação',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Eye,
  },
  reopened: {
    label: 'Reaberta',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: AlertCircle,
  },
  pending: {
    label: 'Pendente',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: Clock,
  },
  rejected: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
  pending_review: {
    label: 'Aguardando Revisão',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Eye,
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-1.5 text-base gap-2',
};

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function AuditStatusBadge({
  status,
  size = 'md',
  className = '',
  showIcon = true,
  showLabel = true,
}: AuditStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const sizeClass = SIZE_CLASSES[size];
  const iconSize = ICON_SIZES[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClass} ${className}`}
    >
      {showIcon && <Icon className={iconSize} />}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

// ============================================================
// COMPONENTES ESPECÍFICOS POR TIPO
// ============================================================

export function PlanStatusBadge({ status, size = 'md' }: { status: AuditStatus; size?: 'sm' | 'md' | 'lg' }) {
  return <AuditStatusBadge status={status} size={size} />;
}

export function FindingStatusBadge({ status, size = 'md' }: { status: AuditStatus; size?: 'sm' | 'md' | 'lg' }) {
  return <AuditStatusBadge status={status} size={size} />;
}

export function ActionStatusBadge({ status, size = 'md' }: { status: AuditStatus; size?: 'sm' | 'md' | 'lg' }) {
  return <AuditStatusBadge status={status} size={size} />;
}

export function ReportStatusBadge({ status, size = 'md' }: { status: AuditStatus; size?: 'sm' | 'md' | 'lg' }) {
  return <AuditStatusBadge status={status} size={size} />;
}