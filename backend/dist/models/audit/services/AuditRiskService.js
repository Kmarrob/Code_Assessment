"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRiskService = exports.AuditRiskService = void 0;
const AuditRisk_1 = require("../models/AuditRisk");
class AuditRiskService {
    /**
     * ============================================================
     * GERAR PRÓXIMO IDENTIFICADOR DO RISCO
     * ============================================================
     *
     * O identificador é sequencial dentro da empresa.
     *
     * Exemplo:
     *
     * Empresa A:
     * R-001
     * R-002
     *
     * Empresa B:
     * R-001
     * R-002
     */
    async generateNextRiskId(companyId) {
        const lastRisk = await AuditRisk_1.AuditRisk.findOne({
            companyId,
        })
            .sort({
            createdAt: -1,
        })
            .select('id')
            .lean();
        if (!lastRisk?.id) {
            return 'R-001';
        }
        const match = lastRisk.id.match(/^R-(\d+)$/);
        if (!match) {
            return 'R-001';
        }
        const currentNumber = parseInt(match[1], 10);
        return `R-${String(currentNumber + 1).padStart(3, '0')}`;
    }
    /**
     * ============================================================
     * CRIAR NOVO RISCO
     * ============================================================
     */
    async create(data) {
        if (!data.companyId) {
            throw new Error('companyId é obrigatório para criação do risco');
        }
        const companyId = data.companyId.toString();
        const riskId = await this.generateNextRiskId(companyId);
        const risk = new AuditRisk_1.AuditRisk({
            ...data,
            /**
             * O companyId utilizado aqui é aquele já validado pelo
             * controller contra o usuário autenticado.
             */
            companyId,
            id: riskId,
        });
        return await risk.save();
    }
    /**
     * ============================================================
     * BUSCAR RISCO POR OBJECT ID
     * ============================================================
     *
     * IMPORTANTE:
     *
     * Nunca buscar somente pelo _id.
     *
     * A empresa também precisa fazer parte do filtro.
     */
    async findById(companyId, id) {
        return await AuditRisk_1.AuditRisk.findOne({
            _id: id,
            companyId,
        }).lean();
    }
    /**
     * ============================================================
     * BUSCAR RISCO PELO IDENTIFICADOR FUNCIONAL
     * ============================================================
     */
    async findByRiskId(companyId, riskId) {
        return await AuditRisk_1.AuditRisk.findOne({
            companyId,
            id: riskId,
        }).lean();
    }
    /**
     * ============================================================
     * LISTAR RISCOS DE UMA EMPRESA
     * ============================================================
     */
    async findAllByCompany(companyId, options) {
        const query = {
            companyId,
            deletedAt: null,
        };
        if (options?.status) {
            query.status = options.status;
        }
        if (options?.riskLevel) {
            query.riskLevel = options.riskLevel;
        }
        if (options?.auditPlanId) {
            query.auditPlanId = options.auditPlanId;
        }
        let findQuery = AuditRisk_1.AuditRisk.find(query)
            .sort({
            createdAt: -1,
        });
        if (options?.skip !== undefined &&
            options.skip >= 0) {
            findQuery = findQuery.skip(options.skip);
        }
        if (options?.limit !== undefined &&
            options.limit > 0) {
            findQuery = findQuery.limit(options.limit);
        }
        return await findQuery.lean();
    }
    /**
     * ============================================================
     * ATUALIZAR RISCO
     * ============================================================
     *
     * O risco somente pode ser atualizado se pertencer à empresa.
     */
    async update(companyId, id, data) {
        const risk = await AuditRisk_1.AuditRisk.findOne({
            _id: id,
            companyId,
            deletedAt: null,
        });
        if (!risk) {
            return null;
        }
        /**
         * Nunca permitir alteração do tenant através do update.
         */
        delete data.companyId;
        delete data._id;
        /**
         * O identificador funcional também não deve ser alterado
         * arbitrariamente.
         */
        delete data.id;
        Object.assign(risk, data);
        if (data.updatedBy) {
            risk.updatedBy = data.updatedBy;
        }
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * ============================================================
     * ATUALIZAR AVALIAÇÃO DO RISCO
     * ============================================================
     */
    async updateAssessment(companyId, id, data) {
        const risk = await AuditRisk_1.AuditRisk.findOne({
            _id: id,
            companyId,
            deletedAt: null,
        });
        if (!risk) {
            return null;
        }
        risk.probability = data.probability;
        risk.impact = data.impact;
        risk.updatedBy = data.updatedBy;
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * ============================================================
     * TRATAR RISCO
     * ============================================================
     */
    async treatRisk(companyId, id, data) {
        const risk = await AuditRisk_1.AuditRisk.findOne({
            _id: id,
            companyId,
            deletedAt: null,
        });
        if (!risk) {
            return null;
        }
        risk.treatment = data.treatment;
        risk.treatmentPlan = data.treatmentPlan;
        risk.probabilityAfter = data.probabilityAfter;
        risk.impactAfter = data.impactAfter;
        risk.status = 'treated';
        risk.treatmentDeadline =
            data.treatmentDeadline;
        risk.treatedAt = new Date();
        risk.treatedBy = data.treatedBy;
        risk.updatedBy = data.treatedBy;
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * ============================================================
     * MONITORAR RISCO
     * ============================================================
     */
    async monitorRisk(companyId, id, data) {
        const risk = await AuditRisk_1.AuditRisk.findOne({
            _id: id,
            companyId,
            deletedAt: null,
        });
        if (!risk) {
            return null;
        }
        risk.status = data.status;
        risk.updatedBy = data.updatedBy;
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * ============================================================
     * REABRIR RISCO
     * ============================================================
     */
    async reopenRisk(companyId, id, data) {
        const risk = await AuditRisk_1.AuditRisk.findOne({
            _id: id,
            companyId,
            deletedAt: null,
        });
        if (!risk) {
            return null;
        }
        /**
         * O motivo atualmente não possui campo próprio no model.
         *
         * Mantemos a assinatura para preservar a API existente.
         */
        risk.status = 'identified';
        risk.updatedBy = data.updatedBy;
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * ============================================================
     * SOFT DELETE
     * ============================================================
     */
    async delete(companyId, id) {
        return await AuditRisk_1.AuditRisk.findOneAndUpdate({
            _id: id,
            companyId,
            deletedAt: null,
        }, {
            deletedAt: new Date(),
            updatedAt: new Date(),
        }, {
            new: true,
        }).lean();
    }
    /**
     * ============================================================
     * ESTATÍSTICAS
     * ============================================================
     */
    async getStatistics(companyId) {
        const match = {
            companyId,
            deletedAt: null,
        };
        const total = await AuditRisk_1.AuditRisk.countDocuments(match);
        const byStatus = await AuditRisk_1.AuditRisk.aggregate([
            {
                $match: match,
            },
            {
                $group: {
                    _id: '$status',
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);
        const byRiskLevel = await AuditRisk_1.AuditRisk.aggregate([
            {
                $match: match,
            },
            {
                $group: {
                    _id: '$riskLevel',
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);
        const byTreatment = await AuditRisk_1.AuditRisk.aggregate([
            {
                $match: match,
            },
            {
                $group: {
                    _id: '$treatment',
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);
        const byResidualRisk = await AuditRisk_1.AuditRisk.aggregate([
            {
                $match: {
                    ...match,
                    status: 'treated',
                },
            },
            {
                $group: {
                    _id: '$residualRisk',
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);
        return {
            total,
            byStatus: byStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byRiskLevel: byRiskLevel.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byTreatment: byTreatment.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byResidualRisk: byResidualRisk.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
        };
    }
    /**
     * ============================================================
     * RISCOS CRÍTICOS
     * ============================================================
     */
    async getCriticalRisks(companyId) {
        return await AuditRisk_1.AuditRisk.find({
            companyId,
            deletedAt: null,
            riskLevel: {
                $in: ['high', 'critical'],
            },
            status: {
                $ne: 'closed',
            },
        })
            .sort({
            riskLevel: -1,
            createdAt: -1,
        })
            .lean();
    }
    /**
     * ============================================================
     * EXPORTAÇÃO
     * ============================================================
     */
    async exportToSpreadsheet(companyId) {
        const risks = await AuditRisk_1.AuditRisk.find({
            companyId,
            deletedAt: null,
        })
            .sort({
            id: 1,
        })
            .lean();
        return risks.map((risk) => ({
            ID: risk.id,
            'Descrição do Risco': risk.description,
            'Evento ou Ativo': risk.eventOrAsset,
            'Proprietário do Risco': risk.owner,
            Ameaça: risk.threat,
            Vulnerabilidade: risk.vulnerability,
            'Controle Existente': risk.existingControl,
            Probabilidade: risk.probability,
            Impacto: risk.impact,
            'Nível do Risco': risk.riskLevel,
            'Classificação do Risco': risk.riskClassification,
            Tratamento: risk.treatment,
            'Plano de Tratamento': risk.treatmentPlan,
            'Probabilidade Após': risk.probabilityAfter,
            'Impacto Após': risk.impactAfter,
            'Risco Residual': risk.residualRisk,
            Status: risk.status,
            Prazo: risk.treatmentDeadline
                ?.toLocaleDateString() || '',
        }));
    }
}
exports.AuditRiskService = AuditRiskService;
exports.auditRiskService = new AuditRiskService();
//# sourceMappingURL=AuditRiskService.js.map