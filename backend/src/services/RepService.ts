// backend/src/services/RepService.ts
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Assignment } from '../models/Assignment.js';
import { Response } from '../models/Response.js';
import { Control } from '../models/Control.js';
import { Company } from '../models/Company.js';
import { AppError, NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { UserRole, ResponseStatus } from '../types/index.js';

export class RepService {
  /**
   * Listar usuários de um preposto (usuários que ele cadastrou)
   */
  static async listUsers(
    repId: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      status?: 'all' | 'active' | 'inactive';
    } = {}
  ) {
    const { page = 1, limit = 10, search = '', status = 'all' } = filters;

    // Verificar se o preposto existe e obter sua empresa
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    // Construir filtro - USANDO companyId para isolamento
    const filter: any = {
      createdBy: repId,
      role: UserRole.USER,
    };

    // Se o preposto tem companyId, garantir que os usuários também tenham
    if (rep.companyId) {
      filter.companyId = rep.companyId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('_id name email role company department isActive lastLoginAt createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Buscar contagem de atribuições para cada usuário
    const userIds = users.map((u) => u._id);
    const assignmentCounts = await Assignment.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    assignmentCounts.forEach((item) => {
      countMap.set(item._id.toString(), item.count);
    });

    // Buscar contagem de respostas para cada usuário
    const responseCounts = await Response.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const responseMap = new Map();
    responseCounts.forEach((item) => {
      responseMap.set(item._id.toString(), item.count);
    });

    const usersWithStats = users.map((user) => ({
      ...user,
      assignmentsCount: countMap.get(user._id.toString()) || 0,
      responsesCount: responseMap.get(user._id.toString()) || 0,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      users: usersWithStats,
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
   * Criar usuário pelo preposto
   */
  static async createUser(
    repId: string,
    userData: {
      name: string;
      email: string;
      password: string;
      department?: string;
    }
  ) {
    // Verificar se o preposto existe
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    // Verificar se email já está em uso
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ValidationError({ email: ['Email já está em uso'] });
    }

    // ============================================
    // VERIFICAR E CORRIGIR companyId DO REP
    // ============================================
    let companyId = rep.companyId;

    // Se o rep não tem companyId, buscar pelo nome da empresa
    if (!companyId && rep.company) {
      const company = await Company.findOne({ name: rep.company });
      if (company) {
        companyId = company._id;
        // Atualizar o rep com o companyId correto
        await User.findByIdAndUpdate(repId, { companyId: company._id });
        logger.info(`CompanyId corrigido para o rep ${rep.email}: ${company._id}`);
      }
    }

    // Se ainda não tiver companyId, lançar erro
    if (!companyId) {
      throw new AppError(
        'Preposto não possui empresa associada. Contate o administrador.',
        400
      );
    }

    // Criar usuário - MAPEANDO EXPLICITAMENTE os campos
    const user = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      department: userData.department || '',
      role: UserRole.USER,
      createdBy: repId,
      companyId: companyId, // Usando o companyId verificado/corrigido
      isActive: true,
    });

    await user.save();

    logger.info(`Usuário criado pelo preposto ${rep.email}: ${user.email} (Empresa: ${companyId})`);

    return user.toJSON();
  }

  /**
   * Atribuir controles a um usuário (sem repetição)
   * Se um controle já estiver atribuído a outro usuário, pode ser movido com force=true
   */
  static async assignControls(
    repId: string,
    data: {
      userId: string;
      controlIds: string[];
      force?: boolean;
    }
  ) {
    const { userId, controlIds, force = false } = data;

    // Verificar se o preposto existe
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Verificar se o usuário pertence ao preposto
    if (user.createdBy?.toString() !== repId) {
      throw new AppError('Usuário não pertence a este preposto', 403);
    }

    // Verificar se o usuário está na mesma empresa do preposto
    if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
      throw new AppError('Usuário não pertence à mesma empresa do preposto', 403);
    }

    // Verificar se os controles existem
    const controls = await Control.find({ _id: { $in: controlIds } });
    if (controls.length !== controlIds.length) {
      throw new NotFoundError('Um ou mais controles não foram encontrados');
    }

    // Verificar quais controles já estão atribuídos a OUTROS usuários da mesma empresa
    const otherUsers = await User.find({
      companyId: rep.companyId,
      _id: { $ne: userId },
      role: UserRole.USER,
    }).select('_id');

    const otherUserIds = otherUsers.map(u => u._id);

    const existingOtherAssignments = await Assignment.find({
      userId: { $in: otherUserIds },
      controlId: { $in: controlIds },
    });

    const otherAssignedControlIds = existingOtherAssignments.map(a => a.controlId.toString());

    // Se houver controles atribuídos a outros usuários e force=false, retornar conflitos
    if (otherAssignedControlIds.length > 0 && !force) {
      return {
        assigned: 0,
        skipped: controlIds.length,
        conflicts: otherAssignedControlIds,
        conflictMessage: `Os seguintes controles já estão atribuídos a outros usuários: ${otherAssignedControlIds.join(', ')}. Use force=true para substituir.`,
      };
    }

    // Se force=true, remover atribuições existentes para outros usuários
    let removedCount = 0;
    if (force && otherAssignedControlIds.length > 0) {
      const removed = await Assignment.deleteMany({
        userId: { $in: otherUserIds },
        controlId: { $in: otherAssignedControlIds },
      });
      removedCount = removed.deletedCount || 0;
      logger.info(`Removidas ${removedCount} atribuições de controles para outros usuários`);
    }

    // Verificar quais controles já estão atribuídos a este usuário
    const existingAssignments = await Assignment.find({
      userId,
      controlId: { $in: controlIds },
    });

    const existingControlIds = existingAssignments.map((a) => a.controlId.toString());
    const newControlIds = controlIds.filter((id) => !existingControlIds.includes(id));

    // Criar novas atribuições para este usuário
    const assignments = newControlIds.map((controlId) => ({
      userId,
      controlId,
      assignedBy: repId,
      assignedAt: new Date(),
      status: ResponseStatus.PENDING,
    }));

    let created = 0;
    if (assignments.length > 0) {
      const result = await Assignment.insertMany(assignments);
      created = result.length;
    }

    logger.info(`${created} controles atribuídos ao usuário ${user.email} pelo preposto ${rep.email}`);

    return {
      assigned: created,
      removed: removedCount,
      skipped: controlIds.length - created - removedCount,
      conflicts: otherAssignedControlIds,
      assignments: assignments,
    };
  }

  /**
   * Obter progresso de um usuário
   */
  static async getUserProgress(repId: string, userId: string) {
    // Verificar se o preposto existe
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Verificar se o usuário pertence ao preposto
    if (user.createdBy?.toString() !== repId) {
      throw new AppError('Usuário não pertence a este preposto', 403);
    }

    // Verificar se o usuário está na mesma empresa do preposto
    if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
      throw new AppError('Usuário não pertence à mesma empresa do preposto', 403);
    }

    // Buscar todas as atribuições do usuário
    const assignments = await Assignment.find({ userId })
      .populate('controlId', 'id nome')
      .lean();

    // Buscar respostas do usuário
    const responses = await Response.find({ userId })
      .populate('controlId', 'id nome')
      .lean();

    // Mapear respostas por assignmentId
    const responseMap = new Map();
    responses.forEach((r) => {
      responseMap.set(r.assignmentId.toString(), r);
    });

    // Calcular estatísticas
    const total = assignments.length;
    const completed = responses.length;
    const pending = total - completed;

    // Calcular distribuição de maturidade
    const maturityDistribution = {
      'N/A': 0,
      '0': 0,
      '1': 0,
      '2': 0,
    };

    responses.forEach((r) => {
      const level = r.maturityLevel;
      if (level in maturityDistribution) {
        maturityDistribution[level as keyof typeof maturityDistribution]++;
      }
    });

    // Calcular porcentagem
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Detalhar cada atribuição
    const details = assignments.map((assignment) => ({
      assignmentId: assignment._id,
      controlId: assignment.controlId._id,
      controlName: assignment.controlId.nome,
      status: assignment.status,
      response: responseMap.get(assignment._id.toString()) || null,
    }));

    return {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      total,
      completed,
      pending,
      percentage,
      maturityDistribution,
      details,
    };
  }

  /**
   * Obter progresso geral do preposto
   */
  static async getOverallProgress(repId: string) {
    // Verificar se o preposto existe
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    // Buscar todos os usuários do preposto (mesma empresa)
    const filter: any = {
      createdBy: repId,
      role: UserRole.USER,
    };
    
    if (rep.companyId) {
      filter.companyId = rep.companyId;
    }

    const users = await User.find(filter).select('_id name email');

    const userIds = users.map((u) => u._id);

    // Buscar atribuições e respostas
    const [assignments, responses] = await Promise.all([
      Assignment.find({ userId: { $in: userIds } }),
      Response.find({ userId: { $in: userIds } }),
    ]);

    // Estatísticas gerais
    const totalAssignments = assignments.length;
    const totalResponses = responses.length;
    const overallPercentage = totalAssignments > 0
      ? Math.round((totalResponses / totalAssignments) * 100)
      : 0;

    // Progresso por usuário
    const userProgress = users.map((user) => {
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
        total: userAssignments.length,
        completed: userResponses.length,
        percentage: userAssignments.length > 0
          ? Math.round((userResponses.length / userAssignments.length) * 100)
          : 0,
      };
    });

    return {
      totalUsers: users.length,
      totalAssignments,
      totalResponses,
      overallPercentage,
      userProgress,
    };
  }

  /**
   * Obter estatísticas do preposto
   */
  static async getStats(repId: string) {
    // Verificar se o preposto existe
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    // Total de usuários do preposto (mesma empresa)
    const filter: any = {
      createdBy: repId,
      role: UserRole.USER,
    };
    
    if (rep.companyId) {
      filter.companyId = rep.companyId;
    }

    const totalUsers = await User.countDocuments(filter);

    // Total de atribuições
    const totalAssignments = await Assignment.countDocuments({
      assignedBy: repId,
    });

    // Atribuições por status
    const statusCounts = await Assignment.aggregate([
      { $match: { assignedBy: new mongoose.Types.ObjectId(repId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    // Total de respostas
    const totalResponses = await Response.aggregate([
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignmentId',
          foreignField: '_id',
          as: 'assignment',
        },
      },
      { $unwind: '$assignment' },
      { $match: { 'assignment.assignedBy': new mongoose.Types.ObjectId(repId) } },
      { $count: 'total' },
    ]);

    // Média de maturidade
    const maturityAvg = await Response.aggregate([
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignmentId',
          foreignField: '_id',
          as: 'assignment',
        },
      },
      { $unwind: '$assignment' },
      { $match: { 'assignment.assignedBy': new mongoose.Types.ObjectId(repId) } },
      {
        $group: {
          _id: null,
          avgMaturity: { $avg: { $toDouble: '$maturityLevel' } },
        },
      },
    ]);

    return {
      totalUsers,
      totalAssignments,
      totalResponses: totalResponses[0]?.total || 0,
      statusDistribution: statusMap,
      averageMaturity: maturityAvg[0]?.avgMaturity || 0,
      completionRate: totalAssignments > 0
        ? Math.round(((totalResponses[0]?.total || 0) / totalAssignments) * 100)
        : 0,
    };
  }
}