// backend/src/services/CompanyService.ts
import mongoose from 'mongoose';
import { Company, ICompany } from '../models/Company.js';
import { User } from '../models/User.js';
import { AppError, NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export interface CreateCompanyData {
  name: string;
  cnpj?: string;
  plan?: 'basic' | 'pro' | 'enterprise';
  maxUsers?: number;
  maxControls?: number;
  createdBy?: string;
}

export class CompanyService {
  /**
   * Listar todas as empresas (Admin)
   */
  static async listCompanies(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}) {
    const { page = 1, limit = 10, search = '', status = '' } = filters;

    const filter: any = {};

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
      Company.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    // Buscar contagem de usuários por empresa
    const companyIds = companies.map((c) => c._id);
    const userCounts = await User.aggregate([
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
  static async getCompanyById(companyId: string) {
    const company = await Company.findById(companyId)
      .populate('assignedControls', 'id nome')
      .lean();

    if (!company) {
      throw new NotFoundError('Empresa não encontrada');
    }

    // Buscar usuários da empresa
    const users = await User.find({ companyId })
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
  static async createCompany(data: CreateCompanyData) {
    // Verificar se já existe empresa com mesmo nome
    const existing = await Company.findOne({ name: data.name });
    if (existing) {
      throw new ValidationError({ name: ['Já existe uma empresa com este nome'] });
    }

    const company = new Company({
      name: data.name,
      cnpj: data.cnpj || '',
      plan: data.plan || 'basic',
      maxUsers: data.maxUsers || 10,
      maxControls: data.maxControls || 93,
      status: 'active',
      assignedControls: [],
      createdBy: data.createdBy ? new mongoose.Types.ObjectId(data.createdBy) : undefined,
    });

    await company.save();

    logger.info(`Empresa criada: ${company.name}`);

    return company;
  }

  /**
   * Atualizar empresa
   */
  static async updateCompany(
    companyId: string,
    data: {
      name?: string;
      cnpj?: string;
      plan?: 'basic' | 'pro' | 'enterprise';
      maxUsers?: number;
      maxControls?: number;
      status?: 'active' | 'inactive' | 'suspended';
      consultantId?: string | null;
    }
  ) {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada');
    }

    // Verificar se nome já está em uso (se estiver mudando)
    if (data.name && data.name !== company.name) {
      const existing = await Company.findOne({ name: data.name });
      if (existing) {
        throw new ValidationError({ name: ['Já existe uma empresa com este nome'] });
      }
    }

    // Atualizar apenas os campos que vieram no data
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.cnpj !== undefined) updateData.cnpj = data.cnpj;
    if (data.plan !== undefined) updateData.plan = data.plan;
    if (data.maxUsers !== undefined) updateData.maxUsers = data.maxUsers;
    if (data.maxControls !== undefined) updateData.maxControls = data.maxControls;
    if (data.status !== undefined) updateData.status = data.status;

    // Tratar consultantId
    if (data.consultantId !== undefined) {
      if (data.consultantId === null || data.consultantId === '') {
        updateData.consultantId = null;
      } else {
        // Validar se o consultantId existe
        const consultant = await User.findById(data.consultantId);
        if (!consultant) {
          throw new ValidationError({ consultantId: ['Consultor não encontrado'] });
        }
        if (consultant.role !== 'consultant') {
          throw new ValidationError({ consultantId: ['Usuário não é um consultor'] });
        }
        updateData.consultantId = data.consultantId;
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(`Empresa atualizada: ${updatedCompany?.name}`);

    return updatedCompany;
  }

  /**
   * Desativar empresa
   */
  static async deactivateCompany(companyId: string) {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada');
    }

    company.status = 'inactive';
    await company.save();

    // Desativar todos os usuários da empresa
    await User.updateMany(
      { companyId },
      { isActive: false }
    );

    logger.info(`Empresa desativada: ${company.name} (${companyId})`);

    return company;
  }

  /**
   * Reativar empresa
   */
  static async reactivateCompany(companyId: string) {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada');
    }

    company.status = 'active';
    await company.save();

    // Reativar todos os usuários da empresa
    await User.updateMany(
      { companyId },
      { isActive: true }
    );

    logger.info(`Empresa reativada: ${company.name} (${companyId})`);

    return company;
  }

  // ============================================
  // ATRIBUIR TODOS OS CONTROLES À EMPRESA
  // ============================================
  static async assignAllControls(companyId: string): Promise<{
    company: ICompany;
    assigned: number;
    total: number;
  }> {
    const { Control } = await import('../models/Control.js');

    const company = await Company.findById(companyId);
    if (!company) {
      throw new NotFoundError('Empresa não encontrada');
    }

    const allControls = await Control.find({}).select('_id').lean();
    const total = allControls.length;

    if (total === 0) {
      throw new AppError('Nenhum controle encontrado para atribuir', 404);
    }

    const controlIds = allControls.map((c) => c._id);

    company.assignedControls = controlIds as mongoose.Types.ObjectId[];
    await company.save();

    logger.info(`Todos os ${total} controles atribuídos à empresa ${company.name}`);

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
      Company.countDocuments({}),
      User.countDocuments({}),
      Company.countDocuments({ status: 'active' }),
      Company.countDocuments({ status: 'inactive' }),
    ]);

    const usersPerCompany = await User.aggregate([
      { $match: { companyId: { $ne: null } } },
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
    ]);

    const topCompanies = await Company.aggregate([
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