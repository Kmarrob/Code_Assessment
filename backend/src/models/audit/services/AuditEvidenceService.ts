import { AuditEvidence } from '../models/AuditEvidence';
import { IAuditEvidence } from '../types/audit.types';

export class AuditEvidenceService {
  // ============================================================
  // CRIAR EVIDÊNCIA
  // ============================================================
  async create(
    data: {
      auditPlanId: string;
      findingId?: string;
      filename: string;
      filepath: string;
      mimeType: string;
      size: number;
      description?: string;
    },
    uploadedBy: string
  ): Promise<IAuditEvidence> {
    const evidence = new AuditEvidence({
      ...data,
      uploadedBy,
      uploadedAt: new Date(),
    });

    await evidence.save();
    return evidence.toObject();
  }

  // ============================================================
  // LISTAR EVIDÊNCIAS POR PLANO
  // ============================================================
  async findByPlanId(auditPlanId: string): Promise<IAuditEvidence[]> {
    return AuditEvidence.find({ auditPlanId }).sort({ uploadedAt: -1 }).lean();
  }

  // ============================================================
  // LISTAR EVIDÊNCIAS POR NC
  // ============================================================
  async findByFindingId(findingId: string): Promise<IAuditEvidence[]> {
    return AuditEvidence.find({ findingId }).sort({ uploadedAt: -1 }).lean();
  }

  // ============================================================
  // BUSCAR EVIDÊNCIA POR ID
  // ============================================================
  async findById(id: string): Promise<IAuditEvidence | null> {
    return AuditEvidence.findById(id).lean();
  }

  // ============================================================
  // EXCLUIR EVIDÊNCIA
  // ============================================================
  async delete(id: string, userId: string): Promise<boolean> {
    const evidence = await AuditEvidence.findById(id);
    if (!evidence) throw new Error('Evidência não encontrada');

    // Apenas o uploader ou ADMIN pode excluir
    if (evidence.uploadedBy !== userId) {
      // TODO: Verificar se é ADMIN
    }

    // TODO: Excluir arquivo físico do disco
    await AuditEvidence.findByIdAndDelete(id);
    return true;
  }
}