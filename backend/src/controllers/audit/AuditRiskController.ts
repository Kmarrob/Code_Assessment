import { Response } from 'express';
import { auditRiskService } from '../../models/audit/services/AuditRiskService';
import { AuthenticatedRequest } from '../../types';

export class AuditRiskController {
  constructor() {
    this.create = this.create.bind(this);
    this.findById = this.findById.bind(this);
    this.findByRiskId = this.findByRiskId.bind(this);
    this.findAllByPlan = this.findAllByPlan.bind(this);
    this.findAllByCompany = this.findAllByCompany.bind(this);
    this.update = this.update.bind(this);
    this.updateAssessment = this.updateAssessment.bind(this);
    this.treatRisk = this.treatRisk.bind(this);
    this.monitorRisk = this.monitorRisk.bind(this);
    this.reopenRisk = this.reopenRisk.bind(this);
    this.delete = this.delete.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
    this.getCriticalRisks = this.getCriticalRisks.bind(this);
    this.exportToSpreadsheet = this.exportToSpreadsheet.bind(this);
  }
  /**
   * ============================================================
   * OBTÉM O COMPANY ID DO USUÁRIO AUTENTICADO
   * ============================================================
   *
   * Regra:
   *
   * - Usuários vinculados a empresa:
   *   sempre utilizam req.user.companyId.
   *
   * - ADMIN:
   *   pode operar sobre uma empresa informada explicitamente,
   *   caso a arquitetura atual permita administração global.
   *
   * Para usuários comuns, companyId enviado pelo frontend
   * nunca deve substituir o companyId da sessão.
   */
  private getAuthenticatedCompanyId(
    req: AuthenticatedRequest
  ): string | null {
    return req.user?.companyId?.toString() || null;
  }

  /**
   * Verifica se o usuário pode operar sobre determinada empresa.
   *
   * ADMIN é tratado como usuário de plataforma.
   *
   * Para qualquer outro perfil, o companyId deve ser exatamente
   * igual ao companyId presente no token/sessão.
   */
  private canAccessCompany(
    req: AuthenticatedRequest,
    companyId: string
  ): boolean {
    const user = req.user;

    if (!user) {
      return false;
    }

    /**
     * Administradores da plataforma podem operar sobre empresas
     * administradas pelo sistema.
     */
    if (user.role === 'admin') {
      return true;
    }

    const authenticatedCompanyId =
      this.getAuthenticatedCompanyId(req);

    if (!authenticatedCompanyId) {
      return false;
    }

    return authenticatedCompanyId === companyId;
  }

  /**
   * Obtém o tenant efetivo.
   *
   * Para usuários comuns:
   *   tenant = empresa da sessão.
   *
   * Para ADMIN:
   *   pode utilizar companyId fornecido na requisição.
   */
  private resolveCompanyId(
    req: AuthenticatedRequest,
    requestedCompanyId?: string
  ): string | null {
    const user = req.user;

    if (!user) {
      return null;
    }

    /**
     * Administrador da plataforma.
     *
     * Para manter compatibilidade com as rotas administrativas,
     * permite selecionar a empresa explicitamente.
     */
    if (user.role === 'admin') {
      return (
        requestedCompanyId ||
        this.getAuthenticatedCompanyId(req)
      );
    }

    /**
     * Usuário de empresa.
     *
     * Ignora qualquer companyId enviado pelo cliente e usa
     * exclusivamente o companyId autenticado.
     */
    return this.getAuthenticatedCompanyId(req);
  }

  /**
   * ============================================================
   * CRIAR NOVO RISCO
   * POST /api/internal-audit/risks
   * ============================================================
   */
  async create(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const {
        companyId: requestedCompanyId,
        auditPlanId,
        description,
        eventOrAsset,
        owner,
        threat,
        vulnerability,
        existingControl,
        probability,
        impact,
        riskClassification,
        treatment,
        treatmentPlan,
        probabilityAfter,
        impactAfter,
        treatmentDeadline,
        status,
      } = req.body;

      const userId =
        req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
        });
      }

      const companyId =
        this.resolveCompanyId(
          req,
          requestedCompanyId
        );

      if (!companyId) {
        return res.status(403).json({
          error:
            'Usuário não está vinculado a uma empresa',
        });
      }

      /**
       * Proteção adicional:
       *
       * Se um usuário comum tentar enviar outro companyId,
       * bloqueamos explicitamente.
       */
      if (
        requestedCompanyId &&
        req.user?.role !== 'admin' &&
        requestedCompanyId.toString() !== companyId
      ) {
        return res.status(403).json({
          error:
            'Acesso à empresa solicitada não autorizado',
        });
      }

      if (!description) {
        return res.status(400).json({
          error: 'description é obrigatório',
        });
      }

      if (!eventOrAsset) {
        return res.status(400).json({
          error: 'eventOrAsset é obrigatório',
        });
      }

      if (!owner) {
        return res.status(400).json({
          error: 'owner é obrigatório',
        });
      }

      if (!threat) {
        return res.status(400).json({
          error: 'threat é obrigatório',
        });
      }

      if (!vulnerability) {
        return res.status(400).json({
          error: 'vulnerability é obrigatório',
        });
      }

      if (!existingControl) {
        return res.status(400).json({
          error: 'existingControl é obrigatório',
        });
      }

      if (
        probability === undefined ||
        probability === null
      ) {
        return res.status(400).json({
          error: 'probability é obrigatório',
        });
      }

      if (
        impact === undefined ||
        impact === null
      ) {
        return res.status(400).json({
          error: 'impact é obrigatório',
        });
      }

      if (!riskClassification) {
        return res.status(400).json({
          error: 'riskClassification é obrigatório',
        });
      }

      /**
       * IMPORTANTE:
       *
       * companyId não vem do body.
       * Ele é definido pelo tenant autenticado.
       */
      const risk =
        await auditRiskService.create({
          companyId,

          auditPlanId,

          description,
          eventOrAsset,
          owner,
          threat,
          vulnerability,
          existingControl,

          probability,
          impact,

          riskClassification,

          treatment:
            treatment || 'mitigate',

          treatmentPlan:
            treatmentPlan || '',

          probabilityAfter:
            probabilityAfter || probability,

          impactAfter:
            impactAfter || impact,

          treatmentDeadline:
            treatmentDeadline
              ? new Date(treatmentDeadline)
              : undefined,

          status:
            status || 'identified',

          createdBy: userId,
          updatedBy: userId,
        });

      return res.status(201).json(risk);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * BUSCAR RISCO POR ID
   * GET /api/internal-audit/risks/:id
   * ============================================================
   */
  async findById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: 'ID é obrigatório',
        });
      }

      const companyId =
        this.resolveCompanyId(req);

      if (!companyId) {
        return res.status(403).json({
          error:
            'Usuário não está vinculado a uma empresa',
        });
      }

      /**
       * A consulta utiliza simultaneamente:
       *
       * _id
       * companyId
       *
       * Portanto um risco de outra empresa não será retornado.
       */
      const risk =
        await auditRiskService.findById(
          companyId,
          id
        );

      if (!risk) {
        return res.status(404).json({
          error: 'Risco não encontrado',
        });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * BUSCAR RISCO PELO ID FUNCIONAL
   * GET /risks/company/:companyId/risk-id/:riskId
   * ============================================================
   */
  async findByRiskId(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const {
        companyId: requestedCompanyId,
        riskId,
      } = req.params;

      if (!requestedCompanyId) {
        return res.status(400).json({
          error: 'companyId é obrigatório',
        });
      }

      if (!riskId) {
        return res.status(400).json({
          error: 'riskId é obrigatório',
        });
      }

      if (
        !this.canAccessCompany(
          req,
          requestedCompanyId
        )
      ) {
        return res.status(403).json({
          error:
            'Acesso à empresa solicitada não autorizado',
        });
      }

      const companyId =
        this.resolveCompanyId(
          req,
          requestedCompanyId
        );

      if (!companyId) {
        return res.status(403).json({
          error:
            'Empresa do usuário não identificada',
        });
      }

      const risk =
        await auditRiskService.findByRiskId(
          companyId,
          riskId
        );

      if (!risk) {
        return res.status(404).json({
          error: 'Risco não encontrado',
        });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * LISTAR RISCOS DE UMA EMPRESA
   * GET /risks/company/:companyId
   * ============================================================
   */
  /**
   * ============================================================
   * LISTAR RISCOS DE UM PLANO DE AUDITORIA
   * GET /risks/plan/:planId
   * ============================================================
   */
  async findAllByPlan(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { planId } = req.params;

      if (!planId) {
        return res.status(400).json({
          error: 'planId é obrigatório',
        });
      }

      const companyId = this.resolveCompanyId(req);

      if (!companyId) {
        return res.status(403).json({
          error:
            'Empresa do usuário não identificada',
        });
      }

      const risks =
        await auditRiskService.findAllByCompany(
          companyId,
          {
            auditPlanId: planId,
          }
        );

      return res.json(risks);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
  async findAllByCompany(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const {
        companyId: requestedCompanyId,
      } = req.params;

      if (!requestedCompanyId) {
        return res.status(400).json({
          error: 'companyId é obrigatório',
        });
      }

      /**
       * Impede que Empresa A consulte Empresa B.
       */
      if (
        !this.canAccessCompany(
          req,
          requestedCompanyId
        )
      ) {
        return res.status(403).json({
          error:
            'Acesso à empresa solicitada não autorizado',
        });
      }

      const companyId =
        this.resolveCompanyId(
          req,
          requestedCompanyId
        );

      if (!companyId) {
        return res.status(403).json({
          error:
            'Empresa do usuário não identificada',
        });
      }

      const {
        status,
        riskLevel,
        auditPlanId,
        limit,
        skip,
      } = req.query;

      const parsedLimit =
        limit !== undefined
          ? parseInt(limit as string, 10)
          : undefined;

      const parsedSkip =
        skip !== undefined
          ? parseInt(skip as string, 10)
          : undefined;

      const risks =
        await auditRiskService.findAllByCompany(
          companyId,
          {
            status: status as string,
            riskLevel: riskLevel as string,
            auditPlanId: auditPlanId as string,

            limit:
              parsedLimit &&
              parsedLimit > 0
                ? Math.min(parsedLimit, 100)
                : undefined,

            skip:
              parsedSkip !== undefined &&
              parsedSkip >= 0
                ? parsedSkip
                : undefined,
          }
        );

      return res.json(risks);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * ATUALIZAR RISCO
   * PUT /api/internal-audit/risks/:id
   * ============================================================
   */
  async update(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;

      const userId =
        req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
        });
      }

      if (!id) {
        return res.status(400).json({
          error: 'ID é obrigatório',
        });
      }

      const companyId =
        this.resolveCompanyId(req);

      if (!companyId) {
        return res.status(403).json({
          error:
            'Usuário não está vinculado a uma empresa',
        });
      }

      /**
       * Criamos uma cópia para não modificar diretamente
       * req.body.
       */
      const data = {
        ...req.body,
        updatedBy: userId,
      };

      /**
       * Nunca permitir que o frontend altere o tenant.
       */
      delete data.companyId;
      delete data._id;
      delete data.id;

      if (data.treatmentDeadline) {
        data.treatmentDeadline =
          new Date(data.treatmentDeadline);
      }

      if (data.treatedAt) {
        data.treatedAt =
          new Date(data.treatedAt);
      }

      const risk =
        await auditRiskService.update(
          companyId,
          id,
          data
        );

      if (!risk) {
        return res.status(404).json({
          error: 'Risco não encontrado',
        });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * ATUALIZAR AVALIAÇÃO
   * PUT /risks/:id/assessment
   * ============================================================
   */
  async updateAssessment(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;

      const {
        probability,
        impact,
      } = req.body;

      const userId =
        req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
        });
      }

      if (!id) {
        return res.status(400).json({
          error: 'ID é obrigatório',
        });
      }

      if (
        probability === undefined ||
        probability === null
      ) {
        return res.status(400).json({
          error: 'probability é obrigatório',
        });
      }

      if (
        impact === undefined ||
        impact === null
      ) {
        return res.status(400).json({
          error: 'impact é obrigatório',
        });
      }

      const companyId =
        this.resolveCompanyId(req);

      if (!companyId) {
        return res.status(403).json({
          error:
            'Usuário não está vinculado a uma empresa',
        });
      }

      const risk =
        await auditRiskService.updateAssessment(
          companyId,
          id,
          {
            probability,
            impact,
            updatedBy: userId,
          }
        );

      if (!risk) {
        return res.status(404).json({
          error: 'Risco não encontrado',
        });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * TRATAR RISCO
   * POST /risks/:id/treat
   * ============================================================
   */
  async treatRisk(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;

      const {
        treatment,
        treatmentPlan,
        probabilityAfter,
        impactAfter,
        treatmentDeadline,
      } = req.body;

      const userId =
        req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
        });
      }

      if (!id) {
        return res.status(400).json({
          error: 'ID é obrigatório',
        });
      }

      if (!treatment) {
        return res.status(400).json({
          error: 'treatment é obrigatório',
        });
      }

      if (!treatmentPlan) {
        return res.status(400).json({
          error: 'treatmentPlan é obrigatório',
        });
      }

      if (
        probabilityAfter === undefined ||
        probabilityAfter === null
      ) {
        return res.status(400).json({
          error:
            'probabilityAfter é obrigatório',
        });
      }

      if (
        impactAfter === undefined ||
        impactAfter === null
      ) {
        return res.status(400).json({
          error:
            'impactAfter é obrigatório',
        });
      }

      const companyId =
        this.resolveCompanyId(req);

      if (!companyId) {
        return res.status(403).json({
          error:
            'Usuário não está vinculado a uma empresa',
        });
      }

      const risk =
        await auditRiskService.treatRisk(
          companyId,
          id,
          {
            treatment,
            treatmentPlan,
            probabilityAfter,
            impactAfter,

            treatmentDeadline:
              treatmentDeadline
                ? new Date(
                    treatmentDeadline
                  )
                : undefined,

            treatedBy: userId,
          }
        );

      if (!risk) {
        return res.status(404).json({
          error: 'Risco não encontrado',
        });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * MONITORAR RISCO
   * PUT /risks/:id/monitor
   * ============================================================
   */
  async monitorRisk(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const userId =
        req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
        });
      }

      if (!id) {
        return res.status(400).json({
          error: 'ID é obrigatório',
        });
      }

      if (!status) {
        return res.status(400).json({
          error: 'status é obrigatório',
        });
      }

      if (
        status !== 'monitored' &&
        status !== 'closed'
      ) {
        return res.status(400).json({
          error:
            'Status inválido. Use "monitored" ou "closed"',
        });
      }

      const companyId =
        this.resolveCompanyId(req);

      if (!companyId) {
        return res.status(403).json({
          error:
            'Usuário não está vinculado a uma empresa',
        });
      }

      const risk =
        await auditRiskService.monitorRisk(
          companyId,
          id,
          {
            status,
            updatedBy: userId,
          }
        );

      if (!risk) {
        return res.status(404).json({
          error: 'Risco não encontrado',
        });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * REABRIR RISCO
   * POST /risks/:id/reopen
   * ============================================================
   */
  async reopenRisk(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const userId =
        req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
        });
      }

      if (!id) {
        return res.status(400).json({
          error: 'ID é obrigatório',
        });
      }

      if (!reason) {
        return res.status(400).json({
          error: 'reason é obrigatório',
        });
      }

      const companyId =
        this.resolveCompanyId(req);

      if (!companyId) {
        return res.status(403).json({
          error:
            'Usuário não está vinculado a uma empresa',
        });
      }

      const risk =
        await auditRiskService.reopenRisk(
          companyId,
          id,
          {
            reason,
            updatedBy: userId,
          }
        );

      if (!risk) {
        return res.status(404).json({
          error: 'Risco não encontrado',
        });
      }

      return res.json(risk);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * EXCLUIR RISCO
   * DELETE /risks/:id
   * ============================================================
   */
  async delete(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: 'ID é obrigatório',
        });
      }

      const companyId =
        this.resolveCompanyId(req);

      if (!companyId) {
        return res.status(403).json({
          error:
            'Usuário não está vinculado a uma empresa',
        });
      }

      const risk =
        await auditRiskService.delete(
          companyId,
          id
        );

      if (!risk) {
        return res.status(404).json({
          error: 'Risco não encontrado',
        });
      }

      return res.json({
        message: 'Risco excluído com sucesso',
      });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * ESTATÍSTICAS
   * GET /risks/company/:companyId/stats
   * ============================================================
   */
  async getStatistics(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const {
        companyId: requestedCompanyId,
      } = req.params;

      if (!requestedCompanyId) {
        return res.status(400).json({
          error: 'companyId é obrigatório',
        });
      }

      if (
        !this.canAccessCompany(
          req,
          requestedCompanyId
        )
      ) {
        return res.status(403).json({
          error:
            'Acesso à empresa solicitada não autorizado',
        });
      }

      const companyId =
        this.resolveCompanyId(
          req,
          requestedCompanyId
        );

      if (!companyId) {
        return res.status(403).json({
          error:
            'Empresa do usuário não identificada',
        });
      }

      const stats =
        await auditRiskService.getStatistics(
          companyId
        );

      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * RISCOS CRÍTICOS
   * GET /risks/company/:companyId/critical
   * ============================================================
   */
  async getCriticalRisks(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const {
        companyId: requestedCompanyId,
      } = req.params;

      if (!requestedCompanyId) {
        return res.status(400).json({
          error: 'companyId é obrigatório',
        });
      }

      if (
        !this.canAccessCompany(
          req,
          requestedCompanyId
        )
      ) {
        return res.status(403).json({
          error:
            'Acesso à empresa solicitada não autorizado',
        });
      }

      const companyId =
        this.resolveCompanyId(
          req,
          requestedCompanyId
        );

      if (!companyId) {
        return res.status(403).json({
          error:
            'Empresa do usuário não identificada',
        });
      }

      const risks =
        await auditRiskService.getCriticalRisks(
          companyId
        );

      return res.json(risks);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * ============================================================
   * EXPORTAR RISCOS
   * GET /risks/company/:companyId/export
   * ============================================================
   */
  async exportToSpreadsheet(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const {
        companyId: requestedCompanyId,
      } = req.params;

      if (!requestedCompanyId) {
        return res.status(400).json({
          error: 'companyId é obrigatório',
        });
      }

      if (
        !this.canAccessCompany(
          req,
          requestedCompanyId
        )
      ) {
        return res.status(403).json({
          error:
            'Acesso à empresa solicitada não autorizado',
        });
      }

      const companyId =
        this.resolveCompanyId(
          req,
          requestedCompanyId
        );

      if (!companyId) {
        return res.status(403).json({
          error:
            'Empresa do usuário não identificada',
        });
      }

      const data =
        await auditRiskService.exportToSpreadsheet(
          companyId
        );

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
}

export const auditRiskController =
  new AuditRiskController();
