"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const GovernanceDocument_1 = require("../models/GovernanceDocument");
const logger_js_1 = require("../../../utils/logger.js");
class GovernanceService {
    // 🆕 CORREÇÃO v41.3: ADMIN cria documentos globais (companyId: null, isGlobal: true)
    async create(data, userId, companyId, userRole) {
        // 🆕 Se for ADMIN, criar como documento global
        const isAdmin = userRole === 'ADMIN' || userRole === 'admin';
        const finalCompanyId = isAdmin ? null : companyId;
        const isGlobal = isAdmin ? true : false;
        logger_js_1.logger.info(`📝 [GovernanceService.create] Criando documento:`, {
            code: data.code,
            title: data.title,
            isAdmin,
            companyId: finalCompanyId,
            isGlobal
        });
        const doc = new GovernanceDocument_1.GovernanceDocument({
            ...data,
            createdBy: userId,
            updatedBy: userId,
            companyId: finalCompanyId,
            isGlobal: isGlobal,
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
    // 🔧 CORREÇÃO v41.4: Combinar $or com $and para não sobrescrever a visibilidade
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
        // 🔧 CORREÇÃO v41.4: Combinar $or de busca com $or de visibilidade usando $and
        if (filters.search) {
            // Criar um $and que combina a visibilidade com a busca
            query.$and = [
                {
                    $or: [
                        { companyId: companyId },
                        { isGlobal: true }
                    ]
                },
                {
                    $or: [
                        { title: { $regex: filters.search, $options: 'i' } },
                        { code: { $regex: filters.search, $options: 'i' } },
                        { content: { $regex: filters.search, $options: 'i' } },
                    ]
                }
            ];
            // Remover o $or original para evitar duplicidade
            delete query.$or;
        }
        if (filters.framework) {
            query[`frameworks.${filters.framework}`] = { $exists: true, $not: { $size: 0 } };
        }
        const docs = await GovernanceDocument_1.GovernanceDocument.find(query)
            .sort({ code: 1 })
            .exec();
        return docs;
    }
    // 🔧 CORREÇÃO v41.1: Adicionar $or com isGlobal no update
    // 🆕 CORREÇÃO v41.2: Adicionar bypass para ADMIN
    async update(id, data, userId, companyId, userRole) {
        // 🆕 BYPASS PARA ADMIN: Se for admin, busca apenas por ID e deletedAt
        let query = { _id: id, deletedAt: null };
        // Se NÃO for admin, aplica as regras de empresa
        if (userRole !== 'ADMIN' && userRole !== 'admin') {
            query = {
                _id: id,
                $or: [
                    { companyId: companyId },
                    { isGlobal: true }
                ],
                deletedAt: null
            };
        }
        const doc = await GovernanceDocument_1.GovernanceDocument.findOne(query).exec();
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
    // 🆕 CORREÇÃO v41.2: Adicionar bypass para ADMIN no delete
    async delete(id, companyId, userRole) {
        // 🆕 BYPASS PARA ADMIN: Se for admin, busca apenas por ID e deletedAt
        let query = { _id: id, deletedAt: null };
        // Se NÃO for admin, aplica as regras de empresa
        if (userRole !== 'ADMIN' && userRole !== 'admin') {
            query = {
                _id: id,
                $or: [
                    { companyId: companyId },
                    { isGlobal: true }
                ],
                deletedAt: null
            };
        }
        const doc = await GovernanceDocument_1.GovernanceDocument.findOne(query).exec();
        if (!doc)
            return false;
        doc.deletedAt = new Date();
        doc.status = 'archived';
        await doc.save();
        return true;
    }
    // 🆕 CORREÇÃO v41.2: Adicionar bypass para ADMIN no approve
    async approve(id, userId, companyId, userRole) {
        // 🆕 BYPASS PARA ADMIN: Se for admin, busca apenas por ID e deletedAt
        let query = { _id: id, deletedAt: null };
        // Se NÃO for admin, aplica as regras de empresa
        if (userRole !== 'ADMIN' && userRole !== 'admin') {
            query = {
                _id: id,
                $or: [
                    { companyId: companyId },
                    { isGlobal: true }
                ],
                deletedAt: null
            };
        }
        const doc = await GovernanceDocument_1.GovernanceDocument.findOne(query).exec();
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