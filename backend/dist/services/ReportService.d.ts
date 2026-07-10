import { IReport } from '../models/Report.js';
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
}
//# sourceMappingURL=ReportService.d.ts.map