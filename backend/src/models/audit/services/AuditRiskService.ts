import { AuditDocumentReview, IAuditDocumentReview, IDocumentReviewItem } from '../models/AuditDocumentReview';
import { AuditPlan } from '../models/AuditPlan';

// Cláusulas da ISO 27001:2022 para revisão
const ISO_27001_CLAUSES = [
  { clause: '4.1', requirement: 'Compreender a organização e seu contexto' },
  { clause: '4.2', requirement: 'Compreender as necessidades e expectativas das partes interessadas' },
  { clause: '4.3', requirement: 'Determinar o escopo do SGSI' },
  { clause: '4.4', requirement: 'Sistema de gestão de segurança da informação' },
  { clause: '5.1', requirement: 'Liderança e comprometimento' },
  { clause: '5.2', requirement: 'Política' },
  { clause: '5.3', requirement: 'Papéis, responsabilidades e autoridades organizacionais' },
  { clause: '6.1.1', requirement: 'Geral (Ação para lidar com riscos e oportunidades)' },
  { clause: '6.1.2', requirement: 'Avaliação de risco de segurança da informação' },
  { clause: '6.1.3', requirement: 'Tratamento de riscos de segurança da informação' },
  { clause: '6.2', requirement: 'Objetivos de segurança da informação e planejamento para alcançá-los' },
  { clause: '6.3', requirement: 'Planejamento de mudanças' },
  { clause: '7.1', requirement: 'Recursos' },
  { clause: '7.2', requirement: 'Competência' },
  { clause: '7.3', requirement: 'Conscientização' },
  { clause: '7.4', requirement: 'Comunicação' },
  { clause: '7.5.1', requirement: 'Geral (Informação documentada)' },
  { clause: '7.5.2', requirement: 'Criando e atualizando (Informação documentada)' },
  { clause: '7.5.3', requirement: 'Controle de informações documentadas' },
  { clause: '8.1', requirement: 'Planejamento e controle operacional' },
  { clause: '8.2', requirement: 'Avaliação de riscos de segurança da informação' },
  { clause: '8.3', requirement: 'Tratamento de riscos de segurança da informação' },
  { clause: '9.1', requirement: 'Monitoramento, medição e análise e avaliação' },
  { clause: '9.2.1', requirement: 'Geral (Auditorias internas)' },
  { clause: '9.2.2', requirement: 'Programa de auditoria interna' },
  { clause: '9.3.1', requirement: 'Geral (Análise crítica pela direção)' },
  { clause: '9.3.2', requirement: 'Entradas da análise crítica da direção' },
  { clause: '9.3.3', requirement: 'Resultados da revisão da direção' },
  { clause: '10.1', requirement: 'Melhoria contínua' },
  { clause: '10.2', requirement: 'Não conformidade e ação corretiva' },
];

export class AuditDocumentReviewService {
  /**
   * Criar nova revisão de documentação
   */
  async create(data: Partial<IAuditDocumentReview>): Promise<IAuditDocumentReview> {
    // Se não houver documentos, inicializar com todas as cláusulas
    if (!data.documents || data.documents.length === 0) {
      data.documents = ISO_27001_CLAUSES.map(clause => ({
        clause: clause.clause,
        requirement: clause.requirement,
        status: '--',
        observations: '',
        reviewer: data.createdBy || '',
        reviewDate: new Date(),
      }));
    }
    
    const review = new AuditDocumentReview(data);
    review.updateSummary();
    return await review.save();
  }

  /**
   * Buscar revisão por ID
   */
  async findById(id: string): Promise<IAuditDocumentReview | null> {
    return await AuditDocumentReview.findById(id).lean();
  }

  /**
   * Buscar revisão por plano de auditoria
   */
  async findByAuditPlanId(auditPlanId: string): Promise<IAuditDocumentReview | null> {
    return await AuditDocumentReview.findOne({ auditPlanId }).lean();
  }

  /**
   * Buscar revisões por empresa
   */
  async findAllByCompany(companyId: string): Promise<IAuditDocumentReview[]> {
    return await AuditDocumentReview.find({ companyId })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Atualizar revisão
   */
  async update(id: string, data: Partial<IAuditDocumentReview>): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;
    
    Object.assign(review, data);
    review.updateSummary();
    review.updatedAt = new Date();
    await review.save();
    
    return review.toObject();
  }

  /**
   * Atualizar um documento específico da revisão
   */
  async updateDocument(
    id: string,
    clause: string,
    data: Partial<IDocumentReviewItem>
  ): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;
    
    const docIndex = review.documents.findIndex(d => d.clause === clause);
    if (docIndex === -1) {
      throw new Error(`Cláusula ${clause} não encontrada`);
    }
    
    Object.assign(review.documents[docIndex], data);
    review.markModified('documents');
    review.updateSummary();
    review.updatedAt = new Date();
    await review.save();
    
    return review.toObject();
  }

  /**
   * Atualizar status de um documento
   */
  async updateDocumentStatus(
    id: string,
    clause: string,
    status: 'OK' | 'NC_A' | 'NC_B' | 'PI' | 'GP' | 'CM' | '--',
    observations?: string
  ): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;
    
    const docIndex = review.documents.findIndex(d => d.clause === clause);
    if (docIndex === -1) {
      throw new Error(`Cláusula ${clause} não encontrada`);
    }
    
    review.documents[docIndex].status = status;
    if (observations !== undefined) {
      review.documents[docIndex].observations = observations;
    }
    
    review.markModified('documents');
    review.updateSummary();
    review.updatedAt = new Date();
    await review.save();
    
    return review.toObject();
  }

  /**
   * Adicionar documento à revisão
   */
  async addDocument(
    id: string,
    document: IDocumentReviewItem
  ): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;
    
    // Verificar se a cláusula já existe
    const existing = review.documents.find(d => d.clause === document.clause);
    if (existing) {
      throw new Error(`Cláusula ${document.clause} já existe na revisão`);
    }
    
    review.documents.push(document);
    review.markModified('documents');
    review.updateSummary();
    review.updatedAt = new Date();
    await review.save();
    
    return review.toObject();
  }

  /**
   * Remover documento da revisão
   */
  async removeDocument(id: string, clause: string): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;
    
    review.documents = review.documents.filter(d => d.clause !== clause);
    review.markModified('documents');
    review.updateSummary();
    review.updatedAt = new Date();
    await review.save();
    
    return review.toObject();
  }

  /**
   * Finalizar revisão
   */
  async completeReview(
    id: string,
    reviewedBy: string,
    observations?: string
  ): Promise<IAuditDocumentReview | null> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return null;
    
    review.reviewedBy = reviewedBy;
    review.reviewedAt = new Date();
    if (observations) {
      review.observations = observations;
    }
    review.updatedAt = new Date();
    await review.save();
    
    return review.toObject();
  }

  /**
   * Excluir revisão (soft delete)
   */
  async delete(id: string): Promise<IAuditDocumentReview | null> {
    return await AuditDocumentReview.findByIdAndUpdate(
      id,
      {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();
  }

  /**
   * Obter resumo da revisão
   */
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
      summary: review.summary,
      documents: review.documents.map(doc => ({
        ...doc,
        statusLabel: statusLabels[doc.status as keyof typeof statusLabels] || doc.status,
      })),
      totalByStatus: Object.keys(statusLabels).reduce((acc, key) => {
        acc[key] = review.documents.filter(d => d.status === key).length;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Obter não conformidades da revisão
   */
  async getNonconformities(id: string): Promise<IDocumentReviewItem[]> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return [];
    
    return review.documents.filter(d => d.status === 'NC_A' || d.status === 'NC_B');
  }

  /**
   * Obter recomendações da revisão
   */
  async getRecommendations(id: string): Promise<IDocumentReviewItem[]> {
    const review = await AuditDocumentReview.findById(id);
    if (!review) return [];
    
    return review.documents.filter(d => d.status === 'PI' || d.status === 'OM');
  }
}

export const auditDocumentReviewService = new AuditDocumentReviewService();