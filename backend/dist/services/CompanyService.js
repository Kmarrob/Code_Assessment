"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
// backend/src/services/CompanyService.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Company_js_1 = require("../models/Company.js");
const User_js_1 = require("../models/User.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
class CompanyService {
    /**
     * Listar todas as empresas (Admin)
     */
    static async listCompanies(filters = {}) {
        const { page = 1, limit = 10, search = '', status = '' } = filters;
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { cnpj: { $regex: search, $options: 'i' } },
            ];
        }
        if (status) {
            filter.status = status;
        }
        const skip = (page - 1) * limit;
        const [companies, total] = await Promise.all([
            Company_js_1.Company.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Company_js_1.Company.countDocuments(filter),
        ]);
        // Buscar contagem de usuários por empresa
        const companyIds = companies.map((c) => c._id);
        const userCounts = await User_js_1.User.aggregate([
            { $match: { companyId: { $in: companyIds } } },
            { $group: { _id: '$companyId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map();
        userCounts.forEach((item) => {
            countMap.set(item._id.toString(), item.count);
        });
        const companiesWithStats = companies.map((company) => ({
            ...company,
            userCount: countMap.get(company._id.toString()) || 0,
            assignedControlsCount: company.assignedControls?.length || 0,
        }));
        const totalPages = Math.ceil(total / limit);
        return {
            companies: companiesWithStats,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        };
    }
    /**
     * Buscar empresa por ID
     */
    static async getCompanyById(companyId) {
        const company = await Company_js_1.Company.findById(companyId)
            .populate('assignedControls', 'id nome')
            .lean();
        if (!company) {
            throw new errorHandler_js_1.NotFoundError('Empresa não encontrada');
        }
        // Buscar usuários da empresa
        const users = await User_js_1.User.find({ companyId })
            .select('_id name email role isActive')
            .lean();
        return {
            ...company,
            users,
            userCount: users.length,
        };
    }
    /**
     * Criar empresa
     */
    static async createCompany(data) {
        // Verificar se já existe empresa com mesmo nome
        const existing = await Company_js_1.Company.findOne({ name: data.name });
        if (existing) {
            throw new errorHandler_js_1.ValidationError({ name: ['Já existe uma empresa com este nome'] });
        }
        const company = new Company_js_1.Company({
            name: data.name,
            cnpj: data.cnpj || '',
            plan: data.plan || 'basic',
            maxUsers: data.maxUsers || 10,
            maxControls: data.maxControls || 93,
            status: 'active',
            assignedControls: [],
            createdBy: data.createdBy ? new mongoose_1.default.Types.ObjectId(data.createdBy) : undefined,
        });
        await company.save();
        logger_js_1.logger.info(`Empresa criada: ${company.name}`);
        return company;
    }
    /**
     * Atualizar empresa
     */
    static async updateCompany(companyId, data) {
        const company = await Company_js_1.Company.findById(companyId);
        if (!company) {
            throw new errorHandler_js_1.NotFoundError('Empresa não encontrada');
        }
        // Verificar se nome já está em uso (se estiver mudando)
        if (data.name && data.name !== company.name) {
            const existing = await Company_js_1.Company.findOne({ name: data.name });
            if (existing) {
                throw new errorHandler_js_1.ValidationError({ name: ['Já existe uma empresa com este nome'] });
            }
        }
        // Atualizar apenas os campos que vieram no data
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.cnpj !== undefined)
            updateData.cnpj = data.cnpj;
        if (data.plan !== undefined)
            updateData.plan = data.plan;
        if (data.maxUsers !== undefined)
            updateData.maxUsers = data.maxUsers;
        if (data.maxControls !== undefined)
            updateData.maxControls = data.maxControls;
        if (data.status !== undefined)
            updateData.status = data.status;
        // Tratar consultantId
        if (data.consultantId !== undefined) {
            if (data.consultantId === null || data.consultantId === '') {
                updateData.consultantId = null;
            }
            else {
                // Validar se o consultantId existe
                const consultant = await User_js_1.User.findById(data.consultantId);
                if (!consultant) {
                    throw new errorHandler_js_1.ValidationError({ consultantId: ['Consultor não encontrado'] });
                }
                if (consultant.role !== 'consultant') {
                    throw new errorHandler_js_1.ValidationError({ consultantId: ['Usuário não é um consultor'] });
                }
                updateData.consultantId = data.consultantId;
            }
        }
        const updatedCompany = await Company_js_1.Company.findByIdAndUpdate(companyId, updateData, { new: true, runValidators: true });
        logger_js_1.logger.info(`Empresa atualizada: ${updatedCompany?.name}`);
        return updatedCompany;
    }
    /**
     * Desativar empresa
     */
    static async deactivateCompany(companyId) {
        const company = await Company_js_1.Company.findById(companyId);
        if (!company) {
            throw new errorHandler_js_1.NotFoundError('Empresa não encontrada');
        }
        company.status = 'inactive';
        await company.save();
        // Desativar todos os usuários da empresa
        await User_js_1.User.updateMany({ companyId }, { isActive: false });
        logger_js_1.logger.info(`Empresa desativada: ${company.name} (${companyId})`);
        return company;
    }
    /**
     * Reativar empresa
     */
    static async reactivateCompany(companyId) {
        const company = await Company_js_1.Company.findById(companyId);
        if (!company) {
            throw new errorHandler_js_1.NotFoundError('Empresa não encontrada');
        }
        company.status = 'active';
        await company.save();
        // Reativar todos os usuários da empresa
        await User_js_1.User.updateMany({ companyId }, { isActive: true });
        logger_js_1.logger.info(`Empresa reativada: ${company.name} (${companyId})`);
        return company;
    }
    // ============================================
    // ATRIBUIR TODOS OS CONTROLES À EMPRESA
    // ============================================
    static async assignAllControls(companyId) {
        const { Control } = await import('../models/Control.js');
        const company = await Company_js_1.Company.findById(companyId);
        if (!company) {
            throw new errorHandler_js_1.NotFoundError('Empresa não encontrada');
        }
        const allControls = await Control.find({}).select('_id').lean();
        const total = allControls.length;
        if (total === 0) {
            throw new errorHandler_js_1.AppError('Nenhum controle encontrado para atribuir', 404);
        }
        const controlIds = allControls.map((c) => c._id);
        company.assignedControls = controlIds;
        await company.save();
        logger_js_1.logger.info(`Todos os ${total} controles atribuídos à empresa ${company.name}`);
        return {
            company,
            assigned: total,
            total,
        };
    }
    /**
     * Obter estatísticas das empresas
     */
    static async getStats() {
        const [totalCompanies, totalUsers, activeCompanies, inactiveCompanies] = await Promise.all([
            Company_js_1.Company.countDocuments({}),
            User_js_1.User.countDocuments({}),
            Company_js_1.Company.countDocuments({ status: 'active' }),
            Company_js_1.Company.countDocuments({ status: 'inactive' }),
        ]);
        const usersPerCompany = await User_js_1.User.aggregate([
            { $match: { companyId: { $ne: null } } },
            { $group: { _id: '$companyId', count: { $sum: 1 } } },
        ]);
        const topCompanies = await Company_js_1.Company.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'companyId',
                    as: 'users',
                },
            },
            {
                $project: {
                    name: 1,
                    userCount: { $size: '$users' },
                },
            },
            { $sort: { userCount: -1 } },
            { $limit: 5 },
        ]);
        return {
            totalCompanies,
            totalUsers,
            activeCompanies,
            inactiveCompanies,
            usersPerCompany,
            topCompanies,
        };
    }
}
exports.CompanyService = CompanyService;
//# sourceMappingURL=CompanyService.js.map