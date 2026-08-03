import { IPlanFeature } from '../models/PlanFeature.js';
export declare class FeatureService {
    /**
     * Verifica se um plano tem acesso a uma feature específica
     * Busca primeiro na tabela PlanFeature, se não existir usa fallback
     */
    static hasFeature(planName: string, feature: string): Promise<boolean>;
    /**
     * Verifica se um plano tem acesso ao módulo de governança
     */
    static hasGovernanceAccess(planName: string): Promise<boolean>;
    /**
     * Obtém todas as features de um plano
     */
    static getPlanFeatures(planName: string): Promise<Record<string, any>>;
    /**
     * Cria ou atualiza features de um plano
     */
    static setPlanFeatures(planName: string, features: Partial<IPlanFeature>): Promise<IPlanFeature>;
    /**
     * Inicializa as features padrão para todos os planos
     * (Para ser usado no seed)
     */
    static initializeDefaultFeatures(): Promise<void>;
}
//# sourceMappingURL=FeatureService.d.ts.map