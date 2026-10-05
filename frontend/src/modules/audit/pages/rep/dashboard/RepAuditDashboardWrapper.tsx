import React from 'react';
import { AdminAuditDashboard } from '../../admin/dashboard/AdminAuditDashboard';

// ============================================================
// REP AUDIT DASHBOARD WRAPPER — v51.0
// ============================================================
//
// Reutiliza o componente AdminAuditDashboard, mas o backend
// filtra automaticamente pela empresa do REP (via authorize).
//
// O REP vê o dashboard completo, mas como "leitor":
// - Não consegue editar/excluir planos diretamente daqui.
// - Os botões de gestão (Gerenciar Perguntas, Perguntas de
//   Controles, Relatórios) só aparecem para ADMIN.
//
// ============================================================

export function RepAuditDashboardWrapper() {
  return <AdminAuditDashboard />;
}

export default RepAuditDashboardWrapper;