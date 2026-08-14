import React from 'react';
import {
  ClipboardList,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Building,
  FileText,
  XCircle,
  Eye,
} from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, icon: Icon, color, subtitle, onClick }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STATS CARDS COLLECTION
// ============================================================

export interface AuditStats {
  total: number;
  inProgress: number;
  completed: number;
  approved: number;
  cancelled: number;
}

export interface FindingStats {
  total: number;
  open: number;
  closed: number;
  ncA: number;
  ncB: number;
  pendingValidation: number;
}

export interface ReportStats {
  total: number;
  draft: number;
  pendingReview: number;
  approved: number;
  rejected: number;
}

interface AuditStatsCardsProps {
  stats: AuditStats;
  findingStats?: FindingStats;
  reportStats?: ReportStats;
  isLoading?: boolean;
  onCardClick?: (card: string) => void;
}

export function AuditStatsCards({
  stats,
  findingStats,
  reportStats,
  isLoading = false,
  onCardClick,
}: AuditStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Stats */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Planos de Auditoria</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total de Planos"
            value={stats.total || 0}
            icon={ClipboardList}
            color="bg-indigo-500"
            onClick={() => onCardClick?.('plans')}
          />
          <StatCard
            label="Em Andamento"
            value={stats.inProgress || 0}
            icon={Clock}
            color="bg-blue-500"
            onClick={() => onCardClick?.('in_progress')}
          />
          <StatCard
            label="Concluídos"
            value={stats.completed || 0}
            icon={CheckCircle}
            color="bg-green-500"
            onClick={() => onCardClick?.('completed')}
          />
          <StatCard
            label="Aprovados"
            value={stats.approved || 0}
            icon={FileCheck}
            color="bg-yellow-500"
            onClick={() => onCardClick?.('approved')}
          />
        </div>
      </div>

      {/* Finding Stats */}
      {findingStats && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Não Conformidades</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total de NCs"
              value={findingStats.total || 0}
              icon={AlertTriangle}
              color="bg-gray-500"
              onClick={() => onCardClick?.('findings')}
            />
            <StatCard
              label="Abertas"
              value={findingStats.open || 0}
              icon={AlertTriangle}
              color="bg-red-500"
              onClick={() => onCardClick?.('open')}
            />
            <StatCard
              label="Fechadas"
              value={findingStats.closed || 0}
              icon={CheckCircle}
              color="bg-green-500"
              onClick={() => onCardClick?.('closed')}
            />
            <StatCard
              label="NC A (Maior)"
              value={findingStats.ncA || 0}
              icon={XCircle}
              color="bg-red-600"
              onClick={() => onCardClick?.('nc_a')}
            />
            <StatCard
              label="Aguardando Validação"
              value={findingStats.pendingValidation || 0}
              icon={Eye}
              color="bg-blue-500"
              onClick={() => onCardClick?.('pending_validation')}
            />
          </div>
        </div>
      )}

      {/* Report Stats */}
      {reportStats && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Relatórios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total de Relatórios"
              value={reportStats.total || 0}
              icon={FileText}
              color="bg-gray-500"
              onClick={() => onCardClick?.('reports')}
            />
            <StatCard
              label="Rascunho"
              value={reportStats.draft || 0}
              icon={FileText}
              color="bg-gray-500"
              onClick={() => onCardClick?.('draft')}
            />
            <StatCard
              label="Aguardando Revisão"
              value={reportStats.pendingReview || 0}
              icon={Eye}
              color="bg-yellow-500"
              onClick={() => onCardClick?.('pending_review')}
            />
            <StatCard
              label="Aprovados"
              value={reportStats.approved || 0}
              icon={CheckCircle}
              color="bg-green-500"
              onClick={() => onCardClick?.('approved')}
            />
            <StatCard
              label="Rejeitados"
              value={reportStats.rejected || 0}
              icon={XCircle}
              color="bg-red-500"
              onClick={() => onCardClick?.('rejected')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTES ESPECÍFICOS
// ============================================================

export function PlanStatsCards({ stats, isLoading, onCardClick }: { stats: AuditStats; isLoading?: boolean; onCardClick?: (card: string) => void }) {
  return <AuditStatsCards stats={stats} isLoading={isLoading} onCardClick={onCardClick} />;
}

export function FindingStatsCards({ stats, isLoading, onCardClick }: { stats: FindingStats; isLoading?: boolean; onCardClick?: (card: string) => void }) {
  const planStats: AuditStats = {
    total: stats.total,
    inProgress: 0,
    completed: stats.closed,
    approved: 0,
    cancelled: 0,
  };
  return (
    <AuditStatsCards
      stats={planStats}
      findingStats={stats}
      isLoading={isLoading}
      onCardClick={onCardClick}
    />
  );
}

export function ReportStatsCards({ stats, isLoading, onCardClick }: { stats: ReportStats; isLoading?: boolean; onCardClick?: (card: string) => void }) {
  const planStats: AuditStats = {
    total: stats.total,
    inProgress: 0,
    completed: stats.approved,
    approved: 0,
    cancelled: 0,
  };
  return (
    <AuditStatsCards
      stats={planStats}
      reportStats={stats}
      isLoading={isLoading}
      onCardClick={onCardClick}
    />
  );
}