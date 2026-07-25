interface DashboardPDFData {
    company: {
        id: string;
        name: string;
    };
    summary: {
        totalControls: number;
        Implementado: number;
        Parcialmente: number;
        NaoImplementado: number;
        NaoSeAplica: number;
        percentages: {
            Implementado: number;
            Parcialmente: number;
            NaoImplementado: number;
            NaoSeAplica: number;
        };
    };
    byDomain: Record<string, any>;
    byCategory: Record<string, any>;
    byType: Record<string, any>;
    byCyberConcept: Record<string, any>;
    byCapability: Record<string, any>;
    user: {
        name: string;
        email: string;
    };
    generatedAt: string;
}
export declare class DashboardPDFService {
    /**
     * Gera o PDF do Dashboard de Maturidade usando Puppeteer
     */
    static generateDashboardPDF(data: DashboardPDFData): Promise<Buffer>;
    /**
     * Gera o HTML do Dashboard para o PDF
     */
    private static generateDashboardHTML;
}
export {};
//# sourceMappingURL=DashboardPDFService.d.ts.map