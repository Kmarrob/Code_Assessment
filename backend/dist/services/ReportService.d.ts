import { IReport } from '../models/Report.js';
import { RoadmapData } from '../types/index.js';
export declare class ReportService {
    /**
     * 🔴 NOVO: Gerar número do projeto automaticamente
     * Formato: ANO + CONTADOR (ex: 2026001)
     */
    private static generateProjectNumber;
    /**
     * Obter ou criar relatório para uma empresa
     */
    static getOrCreateReport(companyId: string): Promise<IReport>;
    /**
     * Gerar dados automáticos do relatório
     */
    static generateReportData(companyId: string): Promise<IReport>;
    /**
     * Atualizar relatório (apenas campos editáveis)
     */
    static updateReport(companyId: string, data: {
        projectNumber?: string;
        scope?: string;
        status?: 'draft' | 'in_review' | 'finalized' | 'archived';
    }, userId: string): Promise<IReport>;
    /**
     * Listar todos os relatórios (para admin)
     */
    static listReports(filters?: {
        status?: string;
        search?: string;
    }, pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        reports: any[];
        total: number;
    }>;
    /**
     * 🔴 NOVO: Obter Roadmap de Implementação
     * Retorna dados estruturados do roadmap com medidas processuais, políticas e soluções técnicas
     */
    static getRoadmap(companyId: string): Promise<RoadmapData>;
    /**
     * 🔴 CORRIGIDO: Gerar dados para a Matriz de Priorização
     * Retorna apenas controles com RESPOSTA E maturidade 0 (Não implementado) ou 1 (Parcial)
     */
    static getPriorizationMatrix(companyId: string): Promise<any[]>;
}
//# sourceMappingURL=ReportService.d.ts.map