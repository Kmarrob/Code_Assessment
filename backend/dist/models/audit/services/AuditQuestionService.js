"use strict";
// ============================================================
// AuditQuestionService.ts
// ============================================================
//
// SERVIÇO: Gerenciamento de perguntas de auditoria de cláusulas
//
// RESPONSABILIDADES:
//   - CRUD de perguntas (create, findAll, findById, update, delete)
//   - Filtros por cláusula, grupo, criticidade, ativo
//   - Estatísticas (total, por grupo, por criticidade)
//   - Soft delete
//
// ACESSO:
//   Apenas ADMIN (a validação de role fica nas rotas)
//
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditQuestionService = exports.AuditQuestionService = void 0;
const AuditQuestion_1 = require("../models/AuditQuestion");
// ============================================================
// HELPER
// ============================================================
function mapToIAuditQuestion(doc) {
    if (!doc)
        return null;
    const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return {
        ...obj,
        id: obj._id ? obj._id.toString() : obj.id,
    };
}
function isValidObjectId(id) {
    return require('mongoose').Types.ObjectId.isValid(id);
}
// ============================================================
// SERVICE
// ============================================================
class AuditQuestionService {
    /**
     * Cria uma nova pergunta de auditoria.
     */
    async create(data, createdBy) {
        if (!data.clauseId || !data.clauseId.trim()) {
            throw new Error('ID da cláusula é obrigatório');
        }
        if (!data.text || data.text.trim().length < 5) {
            throw new Error('Texto da pergunta deve ter no mínimo 5 caracteres');
        }
        if (!createdBy) {
            throw new Error('Usuário criador é obrigatório');
        }
        const question = new AuditQuestion_1.AuditQuestion({
            clauseId: data.clauseId.trim(),
            clauseTitle: data.clauseTitle?.trim() || '',
            clauseGroup: data.clauseGroup?.trim() || '',
            text: data.text.trim(),
            objective: data.objective?.trim() || '',
            guidance: data.guidance?.trim() || '',
            evidenceExpected: data.evidenceExpected?.trim() || '',
            conformityCriteria: data.conformityCriteria?.trim() || '',
            nonconformityCriteria: data.nonconformityCriteria?.trim() || '',
            criticality: data.criticality || 'medium',
            relatedControls: Array.isArray(data.relatedControls) ? data.relatedControls : [],
            relatedDocuments: Array.isArray(data.relatedDocuments) ? data.relatedDocuments : [],
            order: typeof data.order === 'number' ? data.order : 1,
            active: data.active !== undefined ? data.active : true,
            createdBy,
        });
        await question.save();
        return mapToIAuditQuestion(question.toObject());
    }
    /**
     * Lista todas as perguntas com filtros opcionais.
     */
    async findAll(filters = {}) {
        const query = {};
        if (filters.clauseId) {
            query.clauseId = filters.clauseId;
        }
        if (filters.clauseGroup) {
            query.clauseGroup = filters.clauseGroup;
        }
        if (filters.criticality) {
            query.criticality = filters.criticality;
        }
        if (filters.active !== undefined) {
            query.active = filters.active;
        }
        if (filters.search && filters.search.trim()) {
            const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { text: { $regex: escaped, $options: 'i' } },
                { clauseTitle: { $regex: escaped, $options: 'i' } },
                { clauseId: { $regex: escaped, $options: 'i' } },
            ];
        }
        const docs = await AuditQuestion_1.AuditQuestion.find(query)
            .sort({ clauseGroup: 1, clauseId: 1, order: 1 })
            .lean();
        return docs.map((doc) => mapToIAuditQuestion(doc));
    }
    /**
     * Busca uma pergunta por ID.
     */
    async findById(id) {
        if (!isValidObjectId(id)) {
            throw new Error('ID da pergunta inválido');
        }
        const doc = await AuditQuestion_1.AuditQuestion.findById(id).lean();
        if (!doc)
            return null;
        return mapToIAuditQuestion(doc);
    }
    /**
     * Atualiza uma pergunta.
     */
    async update(id, data) {
        if (!isValidObjectId(id)) {
            throw new Error('ID da pergunta inválido');
        }
        const question = await AuditQuestion_1.AuditQuestion.findById(id);
        if (!question) {
            throw new Error('Pergunta não encontrada');
        }
        // Atualiza campos permitidos
        if (data.clauseId !== undefined)
            question.clauseId = data.clauseId.trim();
        if (data.clauseTitle !== undefined)
            question.clauseTitle = data.clauseTitle.trim();
        if (data.clauseGroup !== undefined)
            question.clauseGroup = data.clauseGroup.trim();
        if (data.text !== undefined) {
            const trimmed = data.text.trim();
            if (trimmed.length < 5) {
                throw new Error('Texto da pergunta deve ter no mínimo 5 caracteres');
            }
            question.text = trimmed;
        }
        if (data.objective !== undefined)
            question.objective = data.objective.trim();
        if (data.guidance !== undefined)
            question.guidance = data.guidance.trim();
        if (data.evidenceExpected !== undefined)
            question.evidenceExpected = data.evidenceExpected.trim();
        if (data.conformityCriteria !== undefined)
            question.conformityCriteria = data.conformityCriteria.trim();
        if (data.nonconformityCriteria !== undefined)
            question.nonconformityCriteria = data.nonconformityCriteria.trim();
        if (data.criticality !== undefined)
            question.criticality = data.criticality;
        if (data.relatedControls !== undefined)
            question.relatedControls = data.relatedControls;
        if (data.relatedDocuments !== undefined)
            question.relatedDocuments = data.relatedDocuments;
        if (data.order !== undefined)
            question.order = data.order;
        if (data.active !== undefined)
            question.active = data.active;
        await question.save();
        return mapToIAuditQuestion(question.toObject());
    }
    /**
     * Soft delete — marca como deletada, não remove fisicamente.
     */
    async delete(id) {
        if (!isValidObjectId(id)) {
            throw new Error('ID da pergunta inválido');
        }
        const question = await AuditQuestion_1.AuditQuestion.findById(id);
        if (!question) {
            throw new Error('Pergunta não encontrada');
        }
        question.deletedAt = new Date();
        await question.save();
        return true;
    }
    /**
     * Estatísticas das perguntas.
     */
    async getStats() {
        const total = await AuditQuestion_1.AuditQuestion.countDocuments();
        const active = await AuditQuestion_1.AuditQuestion.countDocuments({ active: true });
        const inactive = await AuditQuestion_1.AuditQuestion.countDocuments({ active: false });
        const byCriticality = {
            critical: await AuditQuestion_1.AuditQuestion.countDocuments({ criticality: 'critical' }),
            high: await AuditQuestion_1.AuditQuestion.countDocuments({ criticality: 'high' }),
            medium: await AuditQuestion_1.AuditQuestion.countDocuments({ criticality: 'medium' }),
            low: await AuditQuestion_1.AuditQuestion.countDocuments({ criticality: 'low' }),
        };
        const groupAgg = await AuditQuestion_1.AuditQuestion.aggregate([
            { $match: { deletedAt: null } },
            { $group: { _id: '$clauseGroup', count: { $sum: 1 } } },
        ]);
        const byClauseGroup = {};
        groupAgg.forEach((g) => {
            byClauseGroup[g._id || 'Sem grupo'] = g.count;
        });
        return { total, active, inactive, byCriticality, byClauseGroup };
    }
}
exports.AuditQuestionService = AuditQuestionService;
// ============================================================
// INSTÂNCIA SINGLETON (padrão do projeto)
// ============================================================
exports.auditQuestionService = new AuditQuestionService();
//# sourceMappingURL=AuditQuestionService.js.map