"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const GovernanceDocument_1 = require("../models/GovernanceDocument");
class GovernanceService {
    async create(data, userId, companyId) {
        const doc = new GovernanceDocument_1.GovernanceDocument({
            ...data,
            createdBy: userId,
            updatedBy: userId,
            companyId,
            version: 'v1.0',
            status: 'draft',
            versionHistory: [
                {
                    version: 'v1.0',
                    date: new Date(),
                    user: userId,
                    changes: 'Criação inicial do documento',
                },
            ],
        });
        await doc.save();
        return doc;
    }
    async findById(id, companyId) {
        // 🆕 Buscar documento da empresa OU documento global
        return GovernanceDocument_1.GovernanceDocument.findOne({
            _id: id,
            $or: [
                { companyId: companyId },
                { isGlobal: true }
            ],
            deletedAt: null
        }).exec();
    }
    async findAll(companyId, filters = {}) {
        // 🆕 NOVO (v40) - Buscar documentos da empresa OU documentos globais
        const query = {
            $or: [
                { companyId: companyId },
                { isGlobal: true }
            ],
            deletedAt: null
        };
        // 🔧 CORREÇÃO: Converter level para número
        if (filters.level)
            query.level = Number(filters.level);
        if (filters.status)
            query.status = filters.status;
        if (filters.category)
            query.category = filters.category;
        // 🔧 CORREÇÃO: O $or para busca já existe, não sobrescrever
        if (filters.search) {
            // Adicionar busca ao query existente
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { code: { $regex: filters.search, $options: 'i' } },
                { content: { $regex: filters.search, $options: 'i' } },
            ];
        }
        if (filters.framework) {
            query[`frameworks.${filters.framework}`] = { $exists: true, $not: { $size: 0 } };
        }
        const docs = await GovernanceDocument_1.GovernanceDocument.find(query)
            .sort({ code: 1 })
            .exec();
        return docs;
    }
    async update(id, data, userId, companyId) {
        const doc = await GovernanceDocument_1.GovernanceDocument.findOne({ _id: id, companyId, deletedAt: null }).exec();
        if (!doc)
            return null;
        const updateData = { ...data, updatedBy: userId };
        // Se houver mudança de versão, adicionar ao histórico
        if (data.version && data.versionChanges) {
            if (!doc.versionHistory) {
                doc.versionHistory = [];
            }
            doc.versionHistory.push({
                version: data.version,
                date: new Date(),
                user: userId,
                changes: data.versionChanges,
            });
            updateData.versionHistory = doc.versionHistory;
        }
        Object.assign(doc, updateData);
        await doc.save();
        return doc;
    }
    async delete(id, companyId) {
        const doc = await GovernanceDocument_1.GovernanceDocument.findOne({ _id: id, companyId, deletedAt: null }).exec();
        if (!doc)
            return false;
        doc.deletedAt = new Date();
        doc.status = 'archived';
        await doc.save();
        return true;
    }
    async approve(id, userId, companyId) {
        const doc = await GovernanceDocument_1.GovernanceDocument.findOne({ _id: id, companyId, deletedAt: null }).exec();
        if (!doc)
            return null;
        doc.status = 'approved';
        doc.approvedBy = userId;
        doc.approvedAt = new Date();
        await doc.save();
        return doc;
    }
    async getByLevel(companyId, level) {
        const docs = await GovernanceDocument_1.GovernanceDocument.find({
            $or: [
                { companyId: companyId },
                { isGlobal: true }
            ],
            level,
            status: 'approved',
            deletedAt: null,
        })
            .sort({ code: 1 })
            .exec();
        return docs;
    }
    async getByCategory(companyId, category) {
        const docs = await GovernanceDocument_1.GovernanceDocument.find({
            $or: [
                { companyId: companyId },
                { isGlobal: true }
            ],
            category,
            status: 'approved',
            deletedAt: null,
        })
            .sort({ code: 1 })
            .exec();
        return docs;
    }
    async getTree(companyId) {
        const allDocs = await this.findAll(companyId, { status: 'approved' });
        // Construir árvore hierárquica
        const tree = {};
        const levelMap = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        allDocs.forEach(doc => {
            const level = doc.level;
            if (!levelMap[level]) {
                levelMap[level] = [];
            }
            levelMap[level].push(doc);
        });
        // Organizar por hierarquia
        Object.keys(levelMap).forEach(level => {
            const levelNum = Number(level);
            const docs = levelMap[levelNum] || [];
            docs.forEach((doc) => {
                if (doc.parentId) {
                    // Encontrar pai e adicionar como filho
                }
            });
        });
        return levelMap;
    }
    async searchByKeyword(companyId, keyword) {
        const docs = await GovernanceDocument_1.GovernanceDocument.find({
            $or: [
                { companyId: companyId },
                { isGlobal: true }
            ],
            keywords: { $in: [new RegExp(keyword, 'i')] },
            status: 'approved',
            deletedAt: null,
        })
            .sort({ code: 1 })
            .exec();
        return docs;
    }
}
exports.GovernanceService = GovernanceService;
//# sourceMappingURL=GovernanceService.js.map