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
     * Gera PDF completo do Dashboard de Maturidade
     */
    static generateDashboardPDF(data: DashboardPDFData): Promise<Buffer>;
    /**
     * 🔴 NOVO: Gera PDF apenas da seção de Categorização
     */
    static generateCategorizationPDF(data: DashboardPDFData): Promise<Buffer>;
    /**
     * 🔴 NOVO: Gera PDF apenas da seção de Tipos de Controle
     */
    static generateControlTypesPDF(data: DashboardPDFData): Promise<Buffer>;
    /**
     * 🔴 NOVO: Gera PDF apenas da seção de Conceitos Cibernéticos
     */
    static generateCyberConceptsPDF(data: DashboardPDFData): Promise<Buffer>;
    /**
     * 🔴 NOVO: Gera PDF apenas da seção de Capacidades Operacionais
     */
    static generateCapabilitiesPDF(data: DashboardPDFData): Promise<Buffer>;
    /**
     * 🔴 NOVO: Gera PDF apenas da seção de Domínios
     */
    static generateDomainsPDF(data: DashboardPDFData): Promise<Buffer>;
    private static getColorForIndex;
    private static escapeHtml;
    private static prepareData;
    private static generateHTML;
    /**
     * 🔴 NOVO: Gera HTML apenas da seção de Categorização
     */
    private static generateCategorizationHTML;
    /**
     * 🔴 NOVO: Gera HTML apenas da seção de Tipos de Controle
     */
    private static generateControlTypesHTML;
    /**
     * 🔴 NOVO: Gera HTML apenas da seção de Conceitos Cibernéticos
     */
    private static generateCyberConceptsHTML;
    /**
     * 🔴 NOVO: Gera HTML apenas da seção de Capacidades Operacionais
     */
    private static generateCapabilitiesHTML;
    /**
     * 🔴 NOVO: Gera HTML apenas da seção de Domínios
     */
    private static generateDomainsHTML;
}
export {};
//# sourceMappingURL=DashboardPDFService.d.ts.map