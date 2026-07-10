import { IReviewRequest, IAttachment } from '../models/ReviewRequest.js';
interface CreateReviewRequestDTO {
    companyId: string;
    responseId: string;
    userId: string;
    repId: string;
    controlId: string;
    justification: string;
    attachments?: IAttachment[];
}
interface UpdateReviewStatusDTO {
    reviewId: string;
    status: 'approved' | 'rejected';
    companyId: string;
    reviewNotes?: string;
}
export declare class ReviewService {
    /**
     * Cria uma nova solicitação de revisão
     */
    static createReviewRequest(data: CreateReviewRequestDTO): Promise<IReviewRequest>;
    /**
     * Busca todas as solicitações de revisão de uma empresa
     */
    static getReviewRequestsByCompany(companyId: string, page?: number, limit?: number, status?: string): Promise<{
        reviews: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Busca solicitações de revisão por usuário
     */
    static getReviewRequestsByUser(userId: string, companyId: string, page?: number, limit?: number): Promise<{
        reviews: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Busca uma solicitação de revisão por ID
     */
    static getReviewRequestById(reviewId: string, companyId: string): Promise<any | null>;
    /**
     * Atualiza o status de uma solicitação de revisão
     */
    static updateReviewStatus(data: UpdateReviewStatusDTO): Promise<IReviewRequest>;
    /**
     * Remove uma solicitação de revisão (apenas se estiver pendente)
     */
    static deleteReviewRequest(reviewId: string, companyId: string): Promise<void>;
    /**
     * Adiciona anexos a uma solicitação de revisão existente
     */
    static addAttachments(reviewId: string, companyId: string, attachments: IAttachment[]): Promise<IReviewRequest>;
    /**
     * Estatísticas de solicitações de revisão
     */
    static getReviewStats(companyId: string): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }>;
}
export {};
//# sourceMappingURL=ReviewService.d.ts.map