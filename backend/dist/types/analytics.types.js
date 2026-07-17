"use strict";
/**
 * ============================================
 * ANALYTICS TYPES - SISTEMA DE FUNIL DE CONVERSÃO
 * ============================================
 *
 * Este arquivo contém todos os tipos e interfaces
 * para o sistema de análise de funil de conversão
 * da área administrativa.
 *
 * @module AnalyticsTypes
 * @since v30.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartColors = exports.PlanColors = exports.FunnelStatusColors = exports.FunnelStatusLabels = void 0;
// ============================================
// 10. ENUMS E CONSTANTES
// ============================================
/**
 * Labels amigáveis para status
 */
exports.FunnelStatusLabels = {
    registered: 'Cadastrado',
    trialing: 'Em Trial',
    trial_expired: 'Trial Expirado',
    converted: 'Convertido',
    active: 'Ativo',
    past_due: 'Pagamento em Atraso',
    cancelled: 'Cancelado',
    churned: 'Desistiu'
};
/**
 * Cores por status
 */
exports.FunnelStatusColors = {
    registered: '#6B7280', // gray
    trialing: '#3B82F6', // blue
    trial_expired: '#F59E0B', // yellow
    converted: '#10B981', // green
    active: '#059669', // emerald
    past_due: '#EF4444', // red
    cancelled: '#6B7280', // gray
    churned: '#DC2626' // red-dark
};
/**
 * Cores por plano
 * 🔴 CORRIGIDO: Removida duplicata 'Enterprise'
 */
exports.PlanColors = {
    'Básico': '#6B7280',
    'Profissional': '#3B82F6',
    'Enterprise': '#8B5CF6',
    'Basic': '#6B7280',
    'Pro': '#3B82F6'
};
/**
 * Cores para gráficos
 */
exports.ChartColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // yellow
    '#EF4444', // red
    '#06B6D4', // cyan
    '#F472B6', // pink
    '#6366F1', // indigo
];
//# sourceMappingURL=analytics.types.js.map