export interface CategoryData {
    name: string;
    total: number;
    implemented: number;
    partial: number;
    notImpl: number;
    na: number;
    pImpl: number;
    pPartial: number;
    pNot: number;
    pNa: number;
}
export interface CategoryResult {
    categories: CategoryData[];
    totals: {
        implemented: number;
        partial: number;
        notImpl: number;
        na: number;
        total: number;
    };
}
export interface CapabilityData {
    name: string;
    key: string;
    total: number;
    implemented: number;
    partial: number;
    notImpl: number;
    aderente: number;
    naoAderente: number;
}
export interface CapabilityResult {
    capabilities: CapabilityData[];
    totals: {
        implemented: number;
        partial: number;
        notImpl: number;
        total: number;
    };
    totalAderente: number;
    totalNaoAderente: number;
    radarData: Array<{
        subject: string;
        fullLabel: string;
        Implementado: number;
        Recomendado: number;
    }>;
}
export interface ResultadosData {
    categorizacao: CategoryResult;
    capacidades: CapabilityResult;
}
export declare class ReportResultService {
    /**
     * Obter todos os dados de resultados consolidados
     */
    static getResultadosData(companyId: string): Promise<ResultadosData>;
    /**
     * Retornar dados vazios
     */
    private static getEmptyResultadosData;
    /**
     * Calcular dados de categorização (4 temas)
     */
    private static calculateCategorization;
    /**
     * Calcular dados de capacidades operacionais (15 capacidades)
     */
    private static calculateCapabilities;
}
export default ReportResultService;
//# sourceMappingURL=ReportResultService.d.ts.map