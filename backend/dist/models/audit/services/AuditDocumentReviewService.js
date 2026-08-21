"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditDocumentReviewService = exports.AuditDocumentReviewService = void 0;
const AuditDocumentReview_1 = require("../models/AuditDocumentReview");
class AuditDocumentReviewService {
    async create(data) {
        const review = new AuditDocumentReview_1.AuditDocumentReview(data);
        await review.save();
        return review.toObject();
    }
    async findById(id) {
        const doc = await AuditDocumentReview_1.AuditDocumentReview.findById(id).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    async findByAuditPlanId(auditPlanId) {
        const doc = await AuditDocumentReview_1.AuditDocumentReview.findOne({ auditPlanId }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    async findAllByCompany(companyId) {
        const docs = await AuditDocumentReview_1.AuditDocumentReview.find({ companyId }).sort({ createdAt: -1 }).lean();
        return docs.map(doc => ({
            id: doc._id.toString(),
            ...doc,
        }));
    }
    async update(id, data) {
        const doc = await AuditDocumentReview_1.AuditDocumentReview.findByIdAndUpdate(id, data, { new: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    async updateDocument(id, clause, data) {
        const review = await AuditDocumentReview_1.AuditDocumentReview.findById(id);
        if (!review)
            return null;
        const docIndex = review.documents.findIndex((d) => d.clause === clause);
        if (docIndex === -1)
            throw new Error(`Cláusula ${clause} não encontrada`);
        const document = review.documents[docIndex];
        if (!document)
            throw new Error(`Documento da cláusula ${clause} não encontrado`);
        Object.assign(document, data);
        review.markModified('documents');
        await review.save();
        return review.toObject();
    }
    async updateDocumentStatus(id, clause, status, observations) {
        const review = await AuditDocumentReview_1.AuditDocumentReview.findById(id);
        if (!review)
            return null;
        const docIndex = review.documents.findIndex((d) => d.clause === clause);
        if (docIndex === -1)
            throw new Error(`Cláusula ${clause} não encontrada`);
        const document = review.documents[docIndex];
        if (!document)
            throw new Error(`Documento da cláusula ${clause} não encontrado`);
        document.status = status;
        if (observations)
            document.observations = observations;
        review.markModified('documents');
        await review.save();
        return review.toObject();
    }
    async addDocument(id, document) {
        const review = await AuditDocumentReview_1.AuditDocumentReview.findById(id);
        if (!review)
            return null;
        const existing = review.documents.find((d) => d.clause === document.clause);
        if (existing)
            throw new Error(`Cláusula ${document.clause} já existe`);
        review.documents.push(document);
        review.markModified('documents');
        await review.save();
        return review.toObject();
    }
    async removeDocument(id, clause) {
        const review = await AuditDocumentReview_1.AuditDocumentReview.findById(id);
        if (!review)
            return null;
        review.documents = review.documents.filter((d) => d.clause !== clause);
        review.markModified('documents');
        await review.save();
        return review.toObject();
    }
    async completeReview(id, reviewedBy, observations) {
        const review = await AuditDocumentReview_1.AuditDocumentReview.findById(id);
        if (!review)
            return null;
        review.reviewedBy = reviewedBy;
        review.reviewedAt = new Date();
        if (observations)
            review.observations = observations;
        await review.save();
        return review.toObject();
    }
    async delete(id) {
        const doc = await AuditDocumentReview_1.AuditDocumentReview.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    async getSummary(id) {
        const review = await AuditDocumentReview_1.AuditDocumentReview.findById(id);
        if (!review)
            return null;
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
                ok: review.documents.filter((d) => d.status === 'OK').length,
                ncA: review.documents.filter((d) => d.status === 'NC_A').length,
                ncB: review.documents.filter((d) => d.status === 'NC_B').length,
                pi: review.documents.filter((d) => d.status === 'PI').length,
                gp: review.documents.filter((d) => d.status === 'GP').length,
                cm: review.documents.filter((d) => d.status === 'CM').length,
                notAssessed: review.documents.filter((d) => d.status === '--').length,
            },
            documents: review.documents.map((doc) => ({
                ...doc,
                statusLabel: statusLabels[doc.status] || doc.status,
            })),
        };
    }
    async getNonconformities(id) {
        const review = await AuditDocumentReview_1.AuditDocumentReview.findById(id);
        if (!review)
            return [];
        return review.documents.filter((d) => d.status === 'NC_A' || d.status === 'NC_B');
    }
    async getRecommendations(id) {
        const review = await AuditDocumentReview_1.AuditDocumentReview.findById(id);
        if (!review)
            return [];
        return review.documents.filter((d) => d.status === 'PI');
    }
}
exports.AuditDocumentReviewService = AuditDocumentReviewService;
exports.auditDocumentReviewService = new AuditDocumentReviewService();
//# sourceMappingURL=AuditDocumentReviewService.js.map