import { Request, Response } from 'express';
import { auditDocumentReviewService } from '../../models/audit/services/AuditDocumentReviewService';

export class AuditDocumentReviewController {
  /**
   * Criar nova revisão de documentação
   * POST /api/internal-audit/document-review
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId, auditPlanId, documents, observations } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se já existe revisão para este plano
      const existing = await auditDocumentReviewService.findByAuditPlanId(auditPlanId);
      if (existing) {
        return res.status(409).json({ error: 'Já existe uma revisão de documentação para este plano de auditoria' });
      }

      const review = await auditDocumentReviewService.create({
        companyId,
        auditPlanId,
        documents: documents || [],
        createdBy: userId,
        observations,
      });

      return res.status(201).json(review);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Buscar revisão por ID
   * GET /api/internal-audit/document-review/:id
   */
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const review = await auditDocumentReviewService.findById(id);

      if (!review) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(review);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Buscar revisão por plano de auditoria
   * GET /api/internal-audit/document-review/plan/:auditPlanId
   */
  async findByAuditPlanId(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;
      const review = await auditDocumentReviewService.findByAuditPlanId(auditPlanId);

      if (!review) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(review);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Buscar revisões por empresa
   * GET /api/internal-audit/document-review/company/:companyId
   */
  async findAllByCompany(req: Request, res: Response): Promise<Response> {
    try {
      const { companyId } = req.params;
      const reviews = await auditDocumentReviewService.findAllByCompany(companyId);

      return res.json(reviews);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar revisão
   * PUT /api/internal-audit/document-review/:id
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { documents, observations } = req.body;

      const review = await auditDocumentReviewService.update(id, {
        documents,
        observations,
      });

      if (!review) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(review);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar um documento específico da revisão
   * PUT /api/internal-audit/document-review/:id/document/:clause
   */
  async updateDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { id, clause } = req.params;
      const { requirement, status, observations, reviewer, reviewDate, documentId, documentName } = req.body;

      const data: any = {};
      if (requirement !== undefined) data.requirement = requirement;
      if (status !== undefined) data.status = status;
      if (observations !== undefined) data.observations = observations;
      if (reviewer !== undefined) data.reviewer = reviewer;
      if (reviewDate !== undefined) data.reviewDate = new Date(reviewDate);
      if (documentId !== undefined) data.documentId = documentId;
      if (documentName !== undefined) data.documentName = documentName;

      const review = await auditDocumentReviewService.updateDocument(id, clause, data);

      if (!review) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(review);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar status de um documento
   * PUT /api/internal-audit/document-review/:id/document/:clause/status
   */
  async updateDocumentStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id, clause } = req.params;
      const { status, observations } = req.body;

      if (!['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--'].includes(status)) {
        return res.status(400).json({ 
          error: 'Status inválido. Use: OK, NC_A, NC_B, PI, GP, CM, --' 
        });
      }

      const review = await auditDocumentReviewService.updateDocumentStatus(
        id,
        clause,
        status,
        observations
      );

      if (!review) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(review);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Adicionar documento à revisão
   * POST /api/internal-audit/document-review/:id/document
   */
  async addDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { clause, requirement, status, observations, reviewer, reviewDate, documentId, documentName } = req.body;

      if (!clause || !requirement || !reviewer) {
        return res.status(400).json({ error: 'Clause, requirement e reviewer são obrigatórios' });
      }

      const review = await auditDocumentReviewService.addDocument(id, {
        clause,
        requirement,
        status: status || '--',
        observations: observations || '',
        reviewer,
        reviewDate: reviewDate ? new Date(reviewDate) : new Date(),
        documentId,
        documentName,
      });

      if (!review) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(review);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Remover documento da revisão
   * DELETE /api/internal-audit/document-review/:id/document/:clause
   */
  async removeDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { id, clause } = req.params;

      const review = await auditDocumentReviewService.removeDocument(id, clause);

      if (!review) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json({ message: 'Documento removido com sucesso' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Finalizar revisão
   * POST /api/internal-audit/document-review/:id/complete
   */
  async completeReview(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { observations } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const review = await auditDocumentReviewService.completeReview(
        id,
        userId,
        observations
      );

      if (!review) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(review);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Excluir revisão
   * DELETE /api/internal-audit/document-review/:id
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const review = await auditDocumentReviewService.delete(id);

      if (!review) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json({ message: 'Revisão excluída com sucesso' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter resumo da revisão
   * GET /api/internal-audit/document-review/:id/summary
   */
  async getSummary(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const summary = await auditDocumentReviewService.getSummary(id);

      if (!summary) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(summary);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter não conformidades da revisão
   * GET /api/internal-audit/document-review/:id/nonconformities
   */
  async getNonconformities(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const nonconformities = await auditDocumentReviewService.getNonconformities(id);

      if (!nonconformities) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(nonconformities);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter recomendações da revisão
   * GET /api/internal-audit/document-review/:id/recommendations
   */
  async getRecommendations(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const recommendations = await auditDocumentReviewService.getRecommendations(id);

      if (!recommendations) {
        return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
      }

      return res.json(recommendations);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export const auditDocumentReviewController = new AuditDocumentReviewController();