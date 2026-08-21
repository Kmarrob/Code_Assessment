"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditQuestionService = exports.AuditQuestionService = void 0;
const AuditQuestion_1 = require("../models/AuditQuestion");
class AuditQuestionService {
    /**
     * Criar uma nova pergunta
     */
    async create(data, userId) {
        const question = new AuditQuestion_1.AuditQuestion({
            ...data,
            createdBy: userId,
            updatedBy: userId,
        });
        return await question.save();
    }
    /**
     * Listar perguntas com filtros
     */
    async findAll(filters = {}) {
        const query = { deletedAt: null };
        if (filters.category) {
            query.category = filters.category;
        }
        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        if (filters.clause) {
            query.clause = filters.clause;
        }
        if (filters.section) {
            query.section = filters.section;
        }
        if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            query.$or = [
                { text: searchRegex },
                { clause: searchRegex },
                { section: searchRegex },
            ];
        }
        const results = await AuditQuestion_1.AuditQuestion.find(query)
            .sort({ section: 1, order: 1, clause: 1 })
            .exec();
        return results.map((doc) => doc.toObject());
    }
    /**
     * Buscar pergunta por ID
     */
    async findById(id) {
        const result = await AuditQuestion_1.AuditQuestion.findOne({ _id: id, deletedAt: null }).exec();
        return result ? result.toObject() : null;
    }
    /**
     * Atualizar pergunta
     */
    async update(id, data, userId) {
        const result = await AuditQuestion_1.AuditQuestion.findOneAndUpdate({ _id: id, deletedAt: null }, { ...data, updatedBy: userId }, { new: true, runValidators: true }).exec();
        return result ? result.toObject() : null;
    }
    /**
     * Ativar/Desativar pergunta
     */
    async toggleStatus(id, isActive, userId) {
        const result = await AuditQuestion_1.AuditQuestion.findOneAndUpdate({ _id: id, deletedAt: null }, { isActive, updatedBy: userId }, { new: true }).exec();
        return result ? result.toObject() : null;
    }
    /**
     * Excluir pergunta (soft delete)
     */
    async delete(id, userId) {
        const result = await AuditQuestion_1.AuditQuestion.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date(), updatedBy: userId }, { new: true }).exec();
        return result ? result.toObject() : null;
    }
    /**
     * Buscar perguntas por cláusula
     */
    async findByClause(clause, onlyActive = true) {
        const query = { clause, deletedAt: null };
        if (onlyActive) {
            query.isActive = true;
        }
        const results = await AuditQuestion_1.AuditQuestion.find(query)
            .sort({ order: 1 })
            .exec();
        return results.map((doc) => doc.toObject());
    }
    /**
     * Buscar perguntas por seção
     */
    async findBySection(section, onlyActive = true) {
        const query = { section, deletedAt: null };
        if (onlyActive) {
            query.isActive = true;
        }
        const results = await AuditQuestion_1.AuditQuestion.find(query)
            .sort({ clause: 1, order: 1 })
            .exec();
        return results.map((doc) => doc.toObject());
    }
    /**
     * Buscar perguntas por controle
     */
    async findByControlId(controlId, onlyActive = true) {
        const query = { controlId, category: 'control', deletedAt: null };
        if (onlyActive) {
            query.isActive = true;
        }
        const results = await AuditQuestion_1.AuditQuestion.find(query)
            .sort({ order: 1 })
            .exec();
        return results.map((doc) => doc.toObject());
    }
    /**
     * Obter estatísticas das perguntas
     */
    async getStats() {
        const total = await AuditQuestion_1.AuditQuestion.countDocuments({ deletedAt: null });
        const active = await AuditQuestion_1.AuditQuestion.countDocuments({ deletedAt: null, isActive: true });
        const inactive = await AuditQuestion_1.AuditQuestion.countDocuments({ deletedAt: null, isActive: false });
        const byCategory = {
            clause: await AuditQuestion_1.AuditQuestion.countDocuments({ deletedAt: null, category: 'clause' }),
            control: await AuditQuestion_1.AuditQuestion.countDocuments({ deletedAt: null, category: 'control' }),
        };
        const sections = await AuditQuestion_1.AuditQuestion.aggregate([
            { $match: { deletedAt: null } },
            { $group: { _id: '$section', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        const bySection = {};
        sections.forEach((s) => {
            bySection[s._id] = s.count;
        });
        return { total, active, inactive, byCategory, bySection };
    }
}
exports.AuditQuestionService = AuditQuestionService;
exports.auditQuestionService = new AuditQuestionService();
//# sourceMappingURL=AuditQuestionService.js.map