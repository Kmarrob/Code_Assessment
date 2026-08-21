"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditProgramService = exports.AuditProgramService = void 0;
const AuditProgram_1 = require("../models/AuditProgram");
class AuditProgramService {
    /**
     * Criar um novo programa de auditorias
     */
    async create(data) {
        const program = new AuditProgram_1.AuditProgram(data);
        await program.save();
        return program.toObject();
    }
    /**
     * Buscar programa por ID
     */
    async findById(id) {
        const doc = await AuditProgram_1.AuditProgram.findById(id).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Buscar programa por empresa e ano
     */
    async findByCompanyAndYear(companyId, year) {
        const doc = await AuditProgram_1.AuditProgram.findOne({ companyId, year }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Listar programas de uma empresa
     */
    async findAllByCompany(companyId, options) {
        const query = { companyId };
        if (options?.status) {
            query.status = options.status;
        }
        let findQuery = AuditProgram_1.AuditProgram.find(query).sort({ year: -1 });
        if (options?.skip) {
            findQuery = findQuery.skip(options.skip);
        }
        if (options?.limit) {
            findQuery = findQuery.limit(options.limit);
        }
        const docs = await findQuery.lean();
        return docs.map(doc => ({
            id: doc._id.toString(),
            ...doc,
        }));
    }
    /**
     * Atualizar programa
     */
    async update(id, data) {
        const doc = await AuditProgram_1.AuditProgram.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Aprovar programa
     */
    async approve(id, approvedBy) {
        const doc = await AuditProgram_1.AuditProgram.findByIdAndUpdate(id, {
            status: 'approved',
            approvedBy,
            approvedAt: new Date(),
            updatedAt: new Date(),
        }, { new: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Ativar programa (iniciar execução)
     */
    async activate(id) {
        const doc = await AuditProgram_1.AuditProgram.findByIdAndUpdate(id, {
            status: 'active',
            updatedAt: new Date(),
        }, { new: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Arquivar programa
     */
    async archive(id) {
        const doc = await AuditProgram_1.AuditProgram.findByIdAndUpdate(id, {
            status: 'archived',
            updatedAt: new Date(),
        }, { new: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Adicionar setor ao programa
     */
    async addSector(id, sector) {
        // ✅ CORREÇÃO: Verificar se sector existe
        if (!sector) {
            throw new Error('Dados do setor são obrigatórios');
        }
        const totalScore = (sector.scoreA || 0) + (sector.scoreB || 0);
        const doc = await AuditProgram_1.AuditProgram.findByIdAndUpdate(id, {
            $push: {
                sectors: {
                    ...sector,
                    totalScore,
                    status: 'scheduled',
                },
            },
            updatedAt: new Date(),
        }, { new: true, runValidators: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Atualizar setor do programa
     */
    async updateSector(id, sectorIndex, data) {
        const program = await AuditProgram_1.AuditProgram.findById(id);
        if (!program)
            return null;
        if (sectorIndex < 0 || sectorIndex >= program.sectors.length) {
            throw new Error('Setor não encontrado');
        }
        const sector = program.sectors[sectorIndex];
        if (!sector) { // ✅ CORREÇÃO: verificar se sector existe
            throw new Error('Setor não encontrado');
        }
        Object.assign(sector, data);
        // Recalcular totalScore se scoreA ou scoreB foram alterados
        if (data.scoreA !== undefined || data.scoreB !== undefined) {
            sector.totalScore = (data.scoreA ?? sector.scoreA) + (data.scoreB ?? sector.scoreB);
        }
        program.markModified('sectors');
        program.updatedAt = new Date();
        await program.save();
        return program.toObject();
    }
    /**
     * Adicionar auditoria de fornecedor
     */
    async addSupplierAudit(id, supplierAudit) {
        // ✅ CORREÇÃO: Verificar se supplierAudit existe
        if (!supplierAudit) {
            throw new Error('Dados da auditoria de fornecedor são obrigatórios');
        }
        const doc = await AuditProgram_1.AuditProgram.findByIdAndUpdate(id, {
            $push: {
                supplierAudits: {
                    ...supplierAudit,
                    status: 'scheduled',
                },
            },
            updatedAt: new Date(),
        }, { new: true, runValidators: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Atualizar auditoria de fornecedor
     */
    async updateSupplierAudit(id, supplierIndex, data) {
        const program = await AuditProgram_1.AuditProgram.findById(id);
        if (!program)
            return null;
        if (supplierIndex < 0 || supplierIndex >= program.supplierAudits.length) {
            throw new Error('Auditoria de fornecedor não encontrada');
        }
        const supplierAudit = program.supplierAudits[supplierIndex];
        if (!supplierAudit) { // ✅ CORREÇÃO: verificar se existe
            throw new Error('Auditoria de fornecedor não encontrada');
        }
        Object.assign(supplierAudit, data);
        program.markModified('supplierAudits');
        program.updatedAt = new Date();
        await program.save();
        return program.toObject();
    }
    /**
     * Atualizar auditoria externa
     */
    async updateExternalAudit(id, data) {
        const program = await AuditProgram_1.AuditProgram.findById(id);
        if (!program)
            return null;
        Object.assign(program.externalAudit, data);
        program.markModified('externalAudit');
        program.updatedAt = new Date();
        await program.save();
        return program.toObject();
    }
    /**
     * Adicionar atividade ao programa
     */
    async addActivity(id, activity) {
        // ✅ CORREÇÃO: Verificar se activity existe
        if (!activity) {
            throw new Error('Dados da atividade são obrigatórios');
        }
        const doc = await AuditProgram_1.AuditProgram.findByIdAndUpdate(id, {
            $push: {
                otherActivities: {
                    ...activity,
                    status: 'pending',
                },
            },
            updatedAt: new Date(),
        }, { new: true, runValidators: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Atualizar atividade
     */
    async updateActivity(id, activityIndex, data) {
        const program = await AuditProgram_1.AuditProgram.findById(id);
        if (!program)
            return null;
        if (activityIndex < 0 || activityIndex >= program.otherActivities.length) {
            throw new Error('Atividade não encontrada');
        }
        const activity = program.otherActivities[activityIndex];
        if (!activity) { // ✅ CORREÇÃO: verificar se existe
            throw new Error('Atividade não encontrada');
        }
        Object.assign(activity, data);
        program.markModified('otherActivities');
        program.updatedAt = new Date();
        await program.save();
        return program.toObject();
    }
    /**
     * Excluir programa (soft delete)
     */
    async delete(id) {
        const doc = await AuditProgram_1.AuditProgram.findByIdAndUpdate(id, {
            deletedAt: new Date(),
            updatedAt: new Date(),
        }, { new: true }).lean();
        if (!doc)
            return null;
        return {
            id: doc._id.toString(),
            ...doc,
        };
    }
    /**
     * Obter estatísticas do programa
     */
    async getStatistics(id) {
        const program = await AuditProgram_1.AuditProgram.findById(id);
        if (!program)
            return null;
        const totalSectors = program.sectors.length;
        const completedSectors = program.sectors.filter(s => s.status === 'completed').length;
        const inProgressSectors = program.sectors.filter(s => s.status === 'in_progress').length;
        const scheduledSectors = program.sectors.filter(s => s.status === 'scheduled').length;
        const totalSupplierAudits = program.supplierAudits.length;
        const completedSupplierAudits = program.supplierAudits.filter(s => s.status === 'completed').length;
        return {
            sectors: {
                total: totalSectors,
                completed: completedSectors,
                inProgress: inProgressSectors,
                scheduled: scheduledSectors,
                completionRate: totalSectors > 0 ? (completedSectors / totalSectors) * 100 : 0,
            },
            supplierAudits: {
                total: totalSupplierAudits,
                completed: completedSupplierAudits,
                completionRate: totalSupplierAudits > 0 ? (completedSupplierAudits / totalSupplierAudits) * 100 : 0,
            },
            externalAudit: {
                status: program.externalAudit.status,
                plannedDate: program.externalAudit.plannedDate,
            },
            otherActivities: {
                total: program.otherActivities.length,
                completed: program.otherActivities.filter(a => a.status === 'completed').length,
            },
        };
    }
    /**
     * Gerar próximas auditorias baseado no programa
     */
    async generateNextAudits(id) {
        const program = await AuditProgram_1.AuditProgram.findById(id);
        if (!program)
            return null;
        const nextAudits = [];
        // Para cada setor, calcular próxima auditoria
        for (const sector of program.sectors) {
            if (!sector)
                continue; // ✅ CORREÇÃO: verificar se sector existe
            if (sector.status === 'completed' && sector.nextAuditDate) {
                nextAudits.push({
                    type: 'sector',
                    name: sector.name,
                    date: sector.nextAuditDate,
                    frequency: sector.frequency,
                });
            }
            else if (sector.status === 'scheduled' && sector.nextAuditDate) {
                nextAudits.push({
                    type: 'sector',
                    name: sector.name,
                    date: sector.nextAuditDate,
                    frequency: sector.frequency,
                });
            }
        }
        // Próximas auditorias de fornecedores
        const nextSupplierAudits = program.supplierAudits
            .filter(s => s.status === 'scheduled')
            .sort((a, b) => a.auditDate.getTime() - b.auditDate.getTime());
        for (const supplier of nextSupplierAudits) {
            if (!supplier)
                continue; // ✅ CORREÇÃO: verificar se supplier existe
            nextAudits.push({
                type: 'supplier',
                name: supplier.supplierName,
                date: supplier.auditDate,
            });
        }
        // Auditoria externa
        if (program.externalAudit.status === 'scheduled' && program.externalAudit.plannedDate) {
            nextAudits.push({
                type: 'external',
                name: 'Auditoria Externa',
                date: program.externalAudit.plannedDate,
                certificationBody: program.externalAudit.certificationBody,
            });
        }
        // Ordenar por data
        nextAudits.sort((a, b) => a.date.getTime() - b.date.getTime());
        return nextAudits;
    }
}
exports.AuditProgramService = AuditProgramService;
exports.auditProgramService = new AuditProgramService();
//# sourceMappingURL=AuditProgramService.js.map