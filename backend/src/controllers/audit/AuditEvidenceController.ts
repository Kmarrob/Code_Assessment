import { Response } from 'express';
import { AuditEvidenceService } from '../../models/audit/services/AuditEvidenceService';
import { AuthenticatedRequest } from '../../types';

const auditEvidenceService = new AuditEvidenceService();

export class AuditEvidenceController {
  // ============================================================
  // UPLOAD DE EVIDÊNCIA
  // ============================================================
  //
  // 🆕 v51.1 — CAMPO `questionRef` (OPCIONAL)
  // ------------------------------------------
  // O corpo da requisição pode agora incluir `questionRef`,
  // que chega como string JSON (FormData) e precisa ser
  // parseado antes de ir para o service.
  //
  // Formato aceito:
  //   questionRef = '{"controlId":"5.12","questionIndex":2}'
  //   questionRef = '{"controlId":"5.12"}'  ← constatação final
  //
  // Se ausente ou malformado, é silenciosamente ignorado
  // (comportamento antigo, 100% compatível).
  //
  // ============================================================

  async upload(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const { auditPlanId, findingId, description, questionRef } = req.body;

      if (!auditPlanId) {
        return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
      }

      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
      }

      // ============================================================
      // 🆕 v51.1 — PARSE DEFENSIVO DO `questionRef`
      // ============================================================
      //
      // MOTIVO:
      //   O `questionRef` chega como string via FormData
      //   (`multipart/form-data` não suporta objetos aninhados).
      //   Precisamos fazer JSON.parse antes de passar ao service.
      //
      // SEGURANÇA:
      //   - Se `questionRef` não vier, `parsedQuestionRef` fica
      //     undefined (comportamento antigo).
      //   - Se vier como string inválida, o parse falha e o
      //     campo é silenciosamente ignorado (não quebra o upload).
      //
      // ============================================================

      let parsedQuestionRef:
        | { controlId: string; questionIndex?: number }
        | undefined;

      if (typeof questionRef === 'string' && questionRef.trim().length > 0) {
        try {
          const obj = JSON.parse(questionRef);
          if (obj && typeof obj.controlId === 'string' && obj.controlId.length > 0) {
            parsedQuestionRef = {
              controlId: obj.controlId,
              questionIndex:
                typeof obj.questionIndex === 'number'
                  ? obj.questionIndex
                  : undefined,
            };
          }
        } catch (parseErr) {
          // Não falha o upload — apenas ignora o vínculo
          console.warn(
            '[AuditEvidenceController] questionRef inválido, ignorado:',
            questionRef
          );
        }
      } else if (questionRef && typeof questionRef === 'object') {
        // Se por algum motivo o body-parser já parseou o objeto
        if (
          typeof (questionRef as any).controlId === 'string' &&
          (questionRef as any).controlId.length > 0
        ) {
          parsedQuestionRef = {
            controlId: (questionRef as any).controlId,
            questionIndex:
              typeof (questionRef as any).questionIndex === 'number'
                ? (questionRef as any).questionIndex
                : undefined,
          };
        }
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
          // 🆕 v51.1 — repassa o vínculo já parseado
          questionRef: parsedQuestionRef,
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
  async findByPlanId(req: AuthenticatedRequest, res: Response): Promise<Response> {
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
  async findByFindingId(req: AuthenticatedRequest, res: Response): Promise<Response> {
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
  async findById(req: AuthenticatedRequest, res: Response): Promise<Response> {
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
  async delete(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

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