// backend/src/services/ConsultantService.ts
import mongoose, { Types } from 'mongoose';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Assignment } from '../models/Assignment.js';
import { Response } from '../models/Response.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { UserRole } from '../types/index.js';

export class ConsultantService {
  /**
   * Listar empresas de um consultor
   */
  static async listCompanies(
    consultantId: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, search = '', status = '' } = filters;

    // Verificar se o consultor existe
    const consultant = await User.findById(consultantId);
    if (!consultant) {
      throw new NotFoundError('Consultor não encontrado');
    }

    if (consultant.role !== UserRole.CONSULTANT) {
      throw new AppError('Usuário não é um consultor', 403);
    }

    // Construir filtro
    const filter: any = {
      consultantId: consultantId,
    };

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

    // Buscar contagem de usuários e respostas para cada empresa
    const companyIds = companies.map((c) => c._id);

    const [userCounts, responseCounts, assignmentCounts] = await Promise.all([
      User.aggregate([
        { $match: { companyId: { $in: companyIds } } },
        { $group: { _id: '$companyId', count: { $sum: 1 } } },
      ]),
      Response.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: { 'user.companyId': { $in: companyIds } } },
        { $group: { _id: '$user.companyId', count: { $sum: 1 } } },
      ]),
      Assignment.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: { 'user.companyId': { $in: companyIds } } },
        { $group: { _id: '$user.companyId', count: { $sum: 1 } } },
      ]),
    ]);

    const userMap = new Map();
    userCounts.forEach((item) => {
      userMap.set(item._id.toString(), item.count);
    });

    const responseMap = new Map();
    responseCounts.forEach((item) => {
      responseMap.set(item._id.toString(), item.count);
    });

    const assignmentMap = new Map();
    assignmentCounts.forEach((item) => {
      assignmentMap.set(item._id.toString(), item.count);
    });

    const companiesWithStats = companies.map((company) => {
      const totalAssignments = assignmentMap.get(company._id.toString()) || 0;
      const totalResponses = responseMap.get(company._id.toString()) || 0;
      const completionRate = totalAssignments > 0
        ? Math.round((totalResponses / totalAssignments) * 100)
        : 0;

      return {
        ...company,
        userCount: userMap.get(company._id.toString()) || 0,
        assignedControlsCount: company.assignedControls?.length || 0,
        totalAssignments,
        totalResponses,
        completionRate,
      };
    });

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
   * Obter estatísticas do consultor
   */
  static async getStats(consultantId: string) {
    // Verificar se o consultor existe
    const consultant = await User.findById(consultantId);
    if (!consultant) {
      throw new NotFoundError('Consultor não encontrado');
    }

    if (consultant.role !== UserRole.CONSULTANT) {
      throw new AppError('Usuário não é um consultor', 403);
    }

    // Buscar empresas do consultor
    const companies = await Company.find({
      consultantId: consultantId,
      status: 'active',
    }).select('_id');

    const companyIds = companies.map((c) => c._id);

    // Buscar usuários das empresas
    const users = await User.find({
      companyId: { $in: companyIds },
      isActive: true,
    }).select('_id');

    const userIds = users.map((u) => u._id);

    // Buscar atribuições e respostas
    const [totalAssignments, totalResponses] = await Promise.all([
      Assignment.countDocuments({ userId: { $in: userIds } }),
      Response.countDocuments({ userId: { $in: userIds } }),
    ]);

    const completionRate = totalAssignments > 0
      ? Math.round((totalResponses / totalAssignments) * 100)
      : 0;

    // Respostas por nível de maturidade
    const maturityDistribution = await Response.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$maturityLevel', count: { $sum: 1 } } },
    ]);

    const distributionMap: Record<string, number> = {};
    maturityDistribution.forEach((item) => {
      distributionMap[item._id] = item.count;
    });

    return {
      totalCompanies: companies.length,
      totalUsers: users.length,
      totalAssignments,
      totalResponses,
      completionRate,
      maturityDistribution: distributionMap,
    };
  }

  /**
   * Obter detalhes de uma empresa para o consultor
   */
  static async getCompanyDetails(consultantId: string, companyId: string) {
    // Verificar se o consultor existe
    const consultant = await User.findById(consultantId);
    if (!consultant) {
      throw new NotFoundError('Consultor não encontrado');
    }

    // Verificar se a empresa pertence ao consultor
    const company = await Company.findOne({
      _id: companyId,
      consultantId: consultantId,
    }).lean();

    if (!company) {
      throw new NotFoundError('Empresa não encontrada ou não pertence a este consultor');
    }

    // Buscar usuários da empresa
    const users = await User.find({
      companyId: companyId,
      isActive: true,
    }).select('_id name email role');

    const userIds = users.map((u) => u._id);

    // Buscar atribuições e respostas
    const [assignments, responses] = await Promise.all([
      Assignment.find({ userId: { $in: userIds } }).populate('controlId', 'id nome'),
      Response.find({ userId: { $in: userIds } }).populate('controlId', 'id nome'),
    ]);

    // Estatísticas por usuário
    const userStats = users.map((user) => {
      const userAssignments = assignments.filter(
        (a) => a.userId.toString() === user._id.toString()
      );
      const userResponses = responses.filter(
        (r) => r.userId.toString() === user._id.toString()
      );

      return {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        total: userAssignments.length,
        completed: userResponses.length,
        percentage: userAssignments.length > 0
          ? Math.round((userResponses.length / userAssignments.length) * 100)
          : 0,
      };
    });

    // Respostas por nível de maturidade
    const maturityDistribution = await Response.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$maturityLevel', count: { $sum: 1 } } },
    ]);

    const distributionMap: Record<string, number> = {};
    maturityDistribution.forEach((item) => {
      distributionMap[item._id] = item.count;
    });

    return {
      company,
      users: userStats,
      totalUsers: users.length,
      totalAssignments: assignments.length,
      totalResponses: responses.length,
      maturityDistribution: distributionMap,
    };
  }
}