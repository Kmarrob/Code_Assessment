import mongoose from 'mongoose';
export declare class DashboardService {
    /**
     * Obter dados de maturidade de uma empresa - CORRIGIDO
     */
    static getCompanyMaturity(companyId: string, filters?: {
        userId?: string;
    }): Promise<{
        company: {
            id: null;
            name: null;
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
            maturityLevels: {};
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
            maturityLevels: Record<string, number>;
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
        maturityLevels: Record<string, number>;
    };
    /**
     * Calcular níveis de maturidade - CORRIGIDO com nullish coalescing
     */
    private static calculateMaturityLevels;
    /**
     * Agrupar controles por domínio
     */
    static groupByDomain(controls: any[]): {
        [k: string]: any;
    };
    /**
     * Agrupar controles por categoria
     */
    static groupByCategory(controls: any[]): {
        [k: string]: any;
    };
    /**
     * Agrupar controles por tipo - Evita dupla contagem
     */
    static groupByType(controls: any[]): {
        [k: string]: any;
    };
    /**
     * Agrupar controles por conceito cibernético
     */
    static groupByCyberConcept(controls: any[]): {
        [k: string]: any;
    };
    /**
     * Agrupar controles por capacidade operacional
     */
    static groupByCapability(controls: any[]): {
        [k: string]: any;
    };
    /**
     * Busca todos os controles com maturidade Nível 0 (Não Implementado)
     * ou Nível 1 (Parcial) para uma empresa específica.
     *
     * Estes controles devem ser priorizados em auditorias internas.
     *
     * @param companyId - ID da empresa
     * @returns Lista de controles críticos com respostas dos usuários
     */
    static getCriticalControlsForAudit(companyId: string): Promise<{
        controls: Array<{
            controlId: string;
            controlName: string;
            controlCategory: string;
            maturityLevel: '0' | '1';
            maturityLabel: string;
            scenarioDescription: string;
            observations: string;
            assignedUsers: string[];
            responsesCount: number;
            lastResponseDate: Date | null;
        }>;
        summary: {
            total: number;
            level0: number;
            level1: number;
            byCategory: Record<string, number>;
        };
    }>;
}
//# sourceMappingURL=DashboardService.d.ts.map