import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { auditDashboardService } from '../../models/audit/services/AuditDashboardService';

// ============================================================
// AUDIT DASHBOARD CONTROLLER — v50.2.15
// ============================================================
//
// Endpoint único que retorna as estatísticas agregadas para o
// dashboard de auditoria.
//
// Acesso:
//   - ADMIN vê tudo
//   - REP vê apenas os planos da sua empresa
//
// ============================================================

export class AuditDashboardController {

  /**
   * GET /api/internal-audit/dashboard/stats
   *
   * Query params opcionais:
   *   - companyId (apenas ADMIN pode passar; REP usa a sua)
   *   - planId    (filtra por um plano específico)
   */
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      const userId = user?._id?.toString();

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const role = String(user?.role || '').toLowerCase();
      const userCompanyId = user?.companyId?.toString();

      // Query params
      const queryCompanyId = req.query.companyId
        ? String(req.query.companyId)
        : undefined;
      const planId = req.query.planId
        ? String(req.query.planId)
        : undefined;

      // Define companyId efetivo:
      //   - ADMIN: usa o que vier na query (se vier)
      //   - REP:   força o companyId do próprio usuário
      let effectiveCompanyId: string | undefined;

      if (role === 'admin') {
        effectiveCompanyId = queryCompanyId;
      } else {
        if (!userCompanyId) {
          res.status(403).json({
            success: false,
            message: 'Usuário sem empresa associada',
          });
          return;
        }
        effectiveCompanyId = userCompanyId;
      }

      const stats = await auditDashboardService.getDashboardStats(
        effectiveCompanyId,
        planId
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('❌ [AuditDashboardController.getStats]', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao carregar estatísticas do dashboard',
      });
    }
  }
}

// ============================================================
// INSTÂNCIA SINGLETON
// ============================================================

export const auditDashboardController = new AuditDashboardController();