import { Request, Response } from 'express';
import { AuditEvidenceService } from '../../models/audit/services/AuditEvidenceService';

const auditEvidenceService = new AuditEvidenceService();

export class AuditEvidenceController {
  // ============================================================
  // UPLOAD DE EVIDÊNCIA
  // ============================================================
  async upload(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const { auditPlanId, findingId, description } = req.body;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
      }

      const evidence = await auditEvidenceService.create(
        {
          auditPlanId,
          findingId,
          filename: file.originalname,
          filepath: file.path,
          mimeType: file.mimetype,
          size: file.size,
          description,
        },
        userId
      );

      return res.status(201).json({ success: true, data: evidence });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR EVIDÊNCIAS POR PLANO
  // ============================================================
  async findByPlanId(req: Request, res: Response): Promise<Response> {
    try {
      const { auditPlanId } = req.params;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const evidences = await auditEvidenceService.findByPlanId(auditPlanId);

      return res.status(200).json({ success: true, data: evidences });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // LISTAR EVIDÊNCIAS POR NC
  // ============================================================
  async findByFindingId(req: Request, res: Response): Promise<Response> {
    try {
      const { findingId } = req.params;

      if (!findingId) {
        return res.status(400).json({ success: false, message: 'ID da NC é obrigatório' });
      }

      const evidences = await auditEvidenceService.findByFindingId(findingId);

      return res.status(200).json({ success: true, data: evidences });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // BUSCAR EVIDÊNCIA POR ID
  // ============================================================
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      const evidence = await auditEvidenceService.findById(id);

      if (!evidence) {
        return res.status(404).json({ success: false, message: 'Evidência não encontrada' });
      }

      return res.status(200).json({ success: true, data: evidence });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============================================================
  // EXCLUIR EVIDÊNCIA
  // ============================================================
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID não informado' });
      }

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      await auditEvidenceService.delete(id, userId);

      return res.status(200).json({ success: true, message: 'Evidência excluída com sucesso' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}