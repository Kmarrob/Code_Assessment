import mongoose from 'mongoose';
export declare class DashboardService {
    /**
     * Obter dados de maturidade de uma empresa
     */
    static getCompanyMaturity(companyId: string, filters?: {
        userId?: string;
    }): Promise<{
        company: {
            id: null;
            name: null;
        };
        totalControls: number;
        controls: never[];
        assignments: never[];
        users: number;
    } | {
        company: {
            id: mongoose.Types.ObjectId;
            name: string;
        };
        totalControls: number;
        controls: any[];
        assignments: {
            controlId: any;
            control: any;
            status: string;
            maturityLevel: any;
            response: any;
            assignedBy: mongoose.Types.ObjectId;
            assignedAt: Date;
        }[];
        users: number;
    }>;
    /**
     * Obter dados vazios (quando não há usuários)
     */
    private static getEmptyMaturityData;
    /**
     * Calcular estatísticas de maturidade
     */
    static calculateMaturityStats(maturityData: any): {
        total: any;
        statusCounts: {
            Implementado: number;
            'Parcialmente implementado': number;
            'N\u00E3o implementado': number;
            'N\u00E3o se aplica': number;
        };
        percentages: {
            Implementado: number;
            Parcialmente: number;
            NaoImplementado: number;
            NaoSeAplica: number;
        };
        maturityLevels: {
            'N/A': number;
            '0': number;
            '1': number;
            '2': number;
            '3': number;
            '4': number;
            '5': number;
        };
    };
    /**
     * Calcular níveis de maturidade
     */
    private static calculateMaturityLevels;
    /**
     * Agrupar controles por domínio
     */
    static groupByDomain(controls: any[]): any;
    /**
     * Agrupar controles por categoria
     */
    static groupByCategory(controls: any[]): any;
    /**
     * Agrupar controles por tipo
     */
    static groupByType(controls: any[]): any;
    /**
     * Agrupar controles por conceito cibernético
     */
    static groupByCyberConcept(controls: any[]): any;
    /**
     * Agrupar controles por capacidade operacional
     */
    static groupByCapability(controls: any[]): any;
}
//# sourceMappingURL=DashboardService.d.ts.map