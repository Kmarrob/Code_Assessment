import { IRecommendation } from '../models/Recommendation.js';
export interface CreateRecommendationData {
    controlId: string;
    titulo: string;
    dominio: string;
    recomendacoes: string[];
    solucoesTecnicas?: string[];
}
export interface UpdateRecommendationData {
    titulo?: string;
    dominio?: string;
    recomendacoes?: string[];
    solucoesTecnicas?: string[];
}
export interface RecommendationWithResponse {
    controlId: string;
    titulo: string;
    dominio: string;
    status: string;
    cenarioIdentificado: string;
    recomendacoes: string[];
    solucoesTecnicas?: string[];
    maturityLevel: number;
}
export declare class RecommendationService {
    /**
     * Criar uma recomendação para um controle
     */
    static createRecommendation(data: CreateRecommendationData, userId: string): Promise<IRecommendation>;
    /**
     * Buscar recomendação por ID do controle
     */
    static getByControlId(controlId: string): Promise<IRecommendation | null>;
    /**
     * Buscar recomendação por ObjectId do controle
     */
    static getByControlObjectId(controlObjectId: string): Promise<IRecommendation | null>;
    /**
     * Listar todas as recomendações - COM TOTAL CORRETO
     */
    static listRecommendations(filters?: {
        dominio?: string;
        search?: string;
    }, pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        recommendations: IRecommendation[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Atualizar uma recomendação
     */
    static updateRecommendation(controlId: string, data: UpdateRecommendationData, userId: string): Promise<IRecommendation>;
    /**
     * Deletar uma recomendação
     */
    static deleteRecommendation(controlId: string): Promise<void>;
    /**
     * Buscar recomendações com respostas para o relatório
     */
    static getRecommendationsWithResponses(companyId: string): Promise<RecommendationWithResponse[]>;
    /**
     * 🔴 NOVO: Buscar recomendações para o relatório (formato simplificado para PDF)
     * GET /api/reports/:companyId/pdf
     * Acesso: ADMIN ou REP (da empresa)
     */
    static getRecommendationsForReport(companyId: string): Promise<any[]>;
    /**
     * Obter domínios disponíveis para filtro
     */
    static getDominios(): Promise<string[]>;
}
export default RecommendationService;
//# sourceMappingURL=RecommendationService.d.ts.map