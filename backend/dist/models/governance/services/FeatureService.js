"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureService = void 0;
const PlanFeature_js_1 = require("../models/PlanFeature.js");
const logger_js_1 = require("../../../utils/logger.js");
/**
 * Features padrão para fallback (caso não exista na tabela)
 */
const DEFAULT_FEATURES = {
    basic: { governance: false },
    pro: { governance: false },
    enterprise: { governance: true },
    trial: { governance: false },
};
class FeatureService {
    /**
     * Verifica se um plano tem acesso a uma feature específica
     * Busca primeiro na tabela PlanFeature, se não existir usa fallback
     */
    static async hasFeature(planName, feature) {
        try {
            // Normalizar nome do plano
            const normalizedPlan = planName?.toLowerCase() || 'basic';
            // Buscar na tabela PlanFeature
            const planFeature = await PlanFeature_js_1.PlanFeature.findOne({
                planName: normalizedPlan
            }).lean();
            if (planFeature) {
                // Verificar se a feature existe no documento
                if (feature in planFeature) {
                    return planFeature[feature] === true;
                }
                // Verificar em customFeatures
                if (planFeature.customFeatures && feature in planFeature.customFeatures) {
                    return planFeature.customFeatures[feature] === true;
                }
            }
            // Fallback para valores padrão
            const defaultFeatures = DEFAULT_FEATURES[normalizedPlan];
            if (defaultFeatures && feature in defaultFeatures) {
                return defaultFeatures[feature] === true;
            }
            return false;
        }
        catch (error) {
            logger_js_1.logger.error(`❌ Erro ao verificar feature ${feature} para plano ${planName}:`, error);
            return false;
        }
    }
    /**
     * Verifica se um plano tem acesso ao módulo de governança
     */
    static async hasGovernanceAccess(planName) {
        return this.hasFeature(planName, 'governance');
    }
    /**
     * Obtém todas as features de um plano
     */
    static async getPlanFeatures(planName) {
        try {
            const normalizedPlan = planName?.toLowerCase() || 'basic';
            const planFeature = await PlanFeature_js_1.PlanFeature.findOne({
                planName: normalizedPlan
            }).lean();
            if (planFeature) {
                const { _id, planName: name, createdAt, updatedAt, __v, ...features } = planFeature;
                return features;
            }
            return DEFAULT_FEATURES[normalizedPlan] || {};
        }
        catch (error) {
            logger_js_1.logger.error(`❌ Erro ao buscar features para plano ${planName}:`, error);
            return {};
        }
    }
    /**
     * Cria ou atualiza features de um plano
     */
    static async setPlanFeatures(planName, features) {
        try {
            const normalizedPlan = planName?.toLowerCase() || 'basic';
            const result = await PlanFeature_js_1.PlanFeature.findOneAndUpdate({ planName: normalizedPlan }, {
                $set: {
                    ...features,
                    planName: normalizedPlan
                }
            }, {
                upsert: true,
                new: true,
                runValidators: true,
            });
            logger_js_1.logger.info(`✅ Features atualizadas para plano ${normalizedPlan}`);
            return result;
        }
        catch (error) {
            logger_js_1.logger.error(`❌ Erro ao atualizar features para plano ${planName}:`, error);
            throw error;
        }
    }
    /**
     * Inicializa as features padrão para todos os planos
     * (Para ser usado no seed)
     */
    static async initializeDefaultFeatures() {
        try {
            const planNames = ['basic', 'pro', 'enterprise', 'trial'];
            for (const planName of planNames) {
                await PlanFeature_js_1.PlanFeature.findOneAndUpdate({ planName }, {
                    $set: {
                        planName,
                        governance: planName === 'enterprise',
                        customFeatures: {},
                    }
                }, { upsert: true, new: true });
                logger_js_1.logger.info(`✅ Feature inicializada para plano ${planName}`);
            }
            logger_js_1.logger.info('✅ Todas as features padrão inicializadas');
        }
        catch (error) {
            logger_js_1.logger.error('❌ Erro ao inicializar features padrão:', error);
            throw error;
        }
    }
}
exports.FeatureService = FeatureService;
//# sourceMappingURL=FeatureService.js.map