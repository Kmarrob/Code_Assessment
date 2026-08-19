import { AuditDocumentReview, IAuditDocumentReview } from '../models/AuditDocumentReview';

export class AuditDocumentReviewService {
  async create(data: Partial<IAuditDocumentReview>): Promise<IAuditDocumentReview> {
    const review = new AuditDocumentReview(data);
    await review.save();
    return review.toObject();
  }

  async findById(id: string): Promise<IAuditDocumentReview | null> {
    const doc = await AuditDocumentReview.findById(id).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      ...doc,
    } as IAuditDocumentReview;
  }

  async findByAuditPlanId(auditPlanId: string): Promise<IAuditDocumentReview | null> {
    const doc = await AuditDocumentReview.findOne({ auditPlanId }).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      ...doc,
    } as IAuditDocumentReview;
  }

  async findAllByCompany(companyId: string): Promise<IAuditDocumentReview[]> {
    const docs = await AuditDocumentReview.find({ companyId }).sort({ createdAt: -1 }).lean();
    return docs.map(doc => ({
      id: doc._id.toString(),
      ...doc,
    })) as IAuditDocumentReview[];
  }

  async update(id: string, data: Partial<IAuditDocumentReview>): Promise<IAuditDocumentReview | null> {
    const doc = await AuditDocumentReview.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      ...doc,
    } as IAuditDocumentReview;
  }

  async updateDocument(id: string, clause: string, data: any): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;

    const docIndex = review.documents.findIndex((d: any) => d.clause === clause);
    if (docIndex === -1) throw new Error(`Cláusula ${clause} não encontrada`);

    Object.assign(review.documents[docIndex], data);
    review.markModified('documents');
    await review.save();
    return review.toObject();
  }

  async updateDocumentStatus(id: string, clause: string, status: string, observations?: string): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;

    const docIndex = review.documents.findIndex((d: any) => d.clause === clause);
    if (docIndex === -1) throw new Error(`Cláusula ${clause} não encontrada`);

    review.documents[docIndex].status = status as any;
    if (observations) review.documents[docIndex].observations = observations;
    review.markModified('documents');
    await review.save();
    return review.toObject();
  }

  async addDocument(id: string, document: any): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;

    const existing = review.documents.find((d: any) => d.clause === document.clause);
    if (existing) throw new Error(`Cláusula ${document.clause} já existe`);

    review.documents.push(document);
    review.markModified('documents');
    await review.save();
    return review.toObject();
  }

  async removeDocument(id: string, clause: string): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;

    review.documents = review.documents.filter((d: any) => d.clause !== clause);
    review.markModified('documents');
    await review.save();
    return review.toObject();
  }

  async completeReview(id: string, reviewedBy: string, observations?: string): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;

    review.reviewedBy = reviewedBy;
    review.reviewedAt = new Date();
    if (observations) review.observations = observations;
    await review.save();
    return review.toObject();
  }

  async delete(id: string): Promise<IAuditDocumentReview | null> {
    const doc = await AuditDocumentReview.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      ...doc,
    } as IAuditDocumentReview;
  }

  async getSummary(id: string): Promise<any> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;

    const statusLabels = {
      OK: 'Conforme',
      NC_A: 'Não Conformidade Maior',
      NC_B: 'Não Conformidade Menor',
      PI: 'Potencial de Melhoria',
      GP: 'Boas Práticas',
      CM: 'Comentário',
      '--': 'Não Avaliado',
    };

    return {
      summary: {
        totalDocuments: review.documents.length,
        ok: review.documents.filter((d: any) => d.status === 'OK').length,
        ncA: review.documents.filter((d: any) => d.status === 'NC_A').length,
        ncB: review.documents.filter((d: any) => d.status === 'NC_B').length,
        pi: review.documents.filter((d: any) => d.status === 'PI').length,
        gp: review.documents.filter((d: any) => d.status === 'GP').length,
        cm: review.documents.filter((d: any) => d.status === 'CM').length,
        notAssessed: review.documents.filter((d: any) => d.status === '--').length,
      },
      documents: review.documents.map((doc: any) => ({
        ...doc,
        statusLabel: statusLabels[doc.status as keyof typeof statusLabels] || doc.status,
      })),
    };
  }

  async getNonconformities(id: string): Promise<any[]> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return [];
    return review.documents.filter((d: any) => d.status === 'NC_A' || d.status === 'NC_B');
  }

  async getRecommendations(id: string): Promise<any[]> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return [];
    return review.documents.filter((d: any) => d.status === 'PI');
  }
}

export const auditDocumentReviewService = new AuditDocumentReviewService();