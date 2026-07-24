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
// 🔴 NOVO: Import do EmailJSService
import { emailjsService } from './EmailJSService.js';
// 🔴 NOVO: Import do NotificationService
import { NotificationService } from './NotificationService.js';
import crypto from 'crypto';

// Tipo de retorno para listUsers
interface ListUsersResult {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

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
  ): Promise<ListUsersResult> {
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
        .select('_id name email role company department isActive lastLogin createdAt updatedAt')
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
   * Criar usuário pelo preposto (com senha automática)
   */
  static async createUser(
    repId: string,
    userData: {
      name: string;
      email: string;
      password?: string;
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

    // ============================================
    // 🔴 CORREÇÃO: VALIDAR LIMITE DE USUÁRIOS DO PLANO
    // ============================================
    // Buscar a empresa para obter o plano e limite
    const company = await Company.findById(companyId);
    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    // Contar usuários ativos da empresa (excluindo o preposto)
    const activeUserCount = await User.countDocuments({
      companyId: companyId,
      isActive: true,
      role: { $ne: UserRole.REP } // não contar o preposto
    });

    // Verificar se atingiu o limite
    if (activeUserCount >= company.maxUsers) {
      const planName = company.plan === 'enterprise' ? 'Enterprise' : 
                       company.plan === 'pro' ? 'Profissional' : 'Básico';
      throw new AppError(
        `Limite de usuários do plano ${planName} atingido (${company.maxUsers}). Faça upgrade para adicionar mais usuários.`,
        403
      );
    }

    // ============================================
    // CORREÇÃO: Senha NÃO é gerada para primeiro acesso
    // O usuário deve criar a senha via link de redefinição
    // ============================================
    let generatedPassword = userData.password;

    if (!generatedPassword) {
      generatedPassword = undefined as any;
      logger.info(`Usuário criado para primeiro acesso (sem senha): ${userData.email}`);
    }

    // Criar usuário
    const user = new User({
      name: userData.name,
      email: userData.email,
      ...(generatedPassword && { password: generatedPassword }),
      department: userData.department || '',
      role: UserRole.USER,
      createdBy: repId,
      companyId: companyId,
      isActive: true,
      mustChangePassword: true,
    });

    await user.save();

    logger.info(`Usuário criado pelo preposto ${rep.email}: ${user.email} (Empresa: ${companyId})`);

    // Enviar e-mail de boas-vindas com link para criar senha
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com';
      const resetToken = user._id;
      const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

      await emailjsService.sendPasswordResetEmail({
        to: user.email,
        userName: user.name,
        userEmail: user.email,
        resetLink: resetLink,
        expiryTime: '24 horas',
      });

      logger.info(`📧 E-mail de boas-vindas enviado para ${user.email}`);
    } catch (emailError) {
      logger.error(`❌ Erro ao enviar e-mail de boas-vindas para ${user.email}:`, emailError);
    }

    const userResponse = user.toJSON();
    delete userResponse.password;
    return userResponse;
  }

  /**
   * Editar usuário pelo preposto
   */
  static async updateUser(
    repId: string,
    userId: string,
    data: {
      name?: string;
      email?: string;
      department?: string;
    }
  ) {
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (user.createdBy?.toString() !== repId) {
      throw new AppError('Usuário não pertence a este preposto', 403);
    }

    if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
      throw new AppError('Usuário não pertence à mesma empresa do preposto', 403);
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({
        email: data.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new ValidationError({ email: ['Email já está em uso por outro usuário'] });
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.department !== undefined) updateData.department = data.department;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('_id name email department role isActive');

    logger.info(`Usuário ${user.email} atualizado pelo preposto ${rep.email}`);

    return updatedUser;
  }

  /**
   * Inativar usuário com justificativa
   */
  static async inactivateUser(
    repId: string,
    userId: string,
    data: {
      reason: 'Desligado' | 'Mudou de setor' | 'Outros';
      description: string;
    }
  ) {
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (user.createdBy?.toString() !== repId) {
      throw new AppError('Usuário não pertence a este preposto', 403);
    }

    if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
      throw new AppError('Usuário não pertence à mesma empresa do preposto', 403);
    }

    if (!user.isActive) {
      throw new AppError('Usuário já está inativo', 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isActive: false,
          inactivationReason: data.reason,
          inactivationDescription: data.description || '',
          inactivatedAt: new Date(),
          inactivatedBy: repId,
        },
      },
      { new: true }
    ).select('_id name email role isActive inactivationReason inactivationDescription inactivatedAt');

    logger.info(`Usuário ${user.email} inativado pelo preposto ${rep.email}. Motivo: ${data.reason}`);

    await Assignment.updateMany(
      { userId, status: ResponseStatus.PENDING },
      { $set: { status: ResponseStatus.REVOKED } }
    );

    // 🔴 NOTIFICAÇÃO: Usuário inativado
    try {
      await NotificationService.notifyUserInactivated(
        userId,
        rep.companyId?.toString() || '',
        rep.name || rep.email,
        `${data.reason} - ${data.description || ''}`
      );
    } catch (notifyError) {
      logger.error('❌ Erro ao enviar notificação de inativação:', notifyError);
    }

    return updatedUser;
  }

  /**
   * Revogar controle com reatribuição
   */
  static async revokeControl(
    repId: string,
    assignmentId: string,
    newUserId: string | null
  ) {
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate('userId', 'name email')
      .populate('controlId', 'id nome');

    if (!assignment) {
      throw new NotFoundError('Atribuição não encontrada');
    }

    const currentUser = await User.findById(assignment.userId);
    if (!currentUser || currentUser.companyId?.toString() !== rep.companyId?.toString()) {
      throw new AppError('Atribuição não pertence à sua empresa', 403);
    }

    if (assignment.status === ResponseStatus.COMPLETED) {
      throw new AppError('Não é possível revogar um controle já respondido', 400);
    }

    const oldUserId = assignment.userId;
    const oldUser = currentUser;
    const control = assignment.controlId as any;

    // 🔴 NOTIFICAÇÃO: Controle revogado (antes de deletar)
    try {
      await NotificationService.notifyControlRevoked(
        oldUserId.toString(),
        rep.companyId?.toString() || '',
        control?.nome || 'Controle',
        control?.id || assignment.controlId,
        `Revogado por ${rep.name || rep.email}${newUserId ? ' e reatribuído' : ''}`
      );
    } catch (notifyError) {
      logger.error('❌ Erro ao enviar notificação de revogação:', notifyError);
    }

    // Remover a atribuição atual
    await Assignment.findByIdAndDelete(assignmentId);

    let newAssignment = null;

    // Se novo usuário foi especificado, criar nova atribuição
    if (newUserId) {
      const newUser = await User.findOne({
        _id: newUserId,
        createdBy: repId,
        role: UserRole.USER,
        isActive: true,
      });

      if (!newUser) {
        throw new NotFoundError('Usuário destino não encontrado ou inativo');
      }

      if (newUser.companyId?.toString() !== rep.companyId?.toString()) {
        throw new AppError('Usuário destino não pertence à mesma empresa', 403);
      }

      const existingAssignment = await Assignment.findOne({
        userId: newUserId,
        controlId: assignment.controlId,
      });

      if (existingAssignment) {
        throw new AppError('Este controle já está atribuído ao usuário destino', 400);
      }

      // Criar nova atribuição
      newAssignment = new Assignment({
        userId: newUserId,
        controlId: assignment.controlId,
        assignedBy: repId,
        assignedAt: new Date(),
        status: ResponseStatus.PENDING,
        dueDate: assignment.dueDate,
      });

      await newAssignment.save();
      await newAssignment.populate('userId', 'name email');
      await newAssignment.populate('controlId', 'id nome');

      // 🔴 NOTIFICAÇÃO: Novo controle atribuído (para o novo usuário)
      try {
        await NotificationService.notifyAssignment(
          newUserId,
          rep.companyId?.toString() || '',
          control?.nome || 'Controle',
          control?.id || assignment.controlId,
          rep.name || rep.email
        );
      } catch (notifyError) {
        logger.error('❌ Erro ao enviar notificação de atribuição para novo usuário:', notifyError);
      }

      logger.info(
        `Controle ${control?.id || assignment.controlId} revogado do usuário ${oldUser?.email} e reatribuído para ${newUser.email} pelo preposto ${rep.email}`
      );
    } else {
      logger.info(
        `Controle ${control?.id || assignment.controlId} revogado do usuário ${oldUser?.email} pelo preposto ${rep.email}`
      );
    }

    return {
      revoked: true,
      oldUserId,
      oldUserEmail: oldUser?.email,
      controlId: assignment.controlId,
      controlName: control?.nome || 'Controle',
      newUserId: newUserId || null,
      newAssignment: newAssignment || null,
    };
  }

  /**
   * Atribuir controles a um usuário (sem repetição)
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

    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (user.createdBy?.toString() !== repId) {
      throw new AppError('Usuário não pertence a este preposto', 403);
    }

    if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
      throw new AppError('Usuário não pertence à mesma empresa do preposto', 403);
    }

    const controls = await Control.find({ _id: { $in: controlIds } });
    if (controls.length !== controlIds.length) {
      throw new NotFoundError('Um ou mais controles não foram encontrados');
    }

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

    if (otherAssignedControlIds.length > 0 && !force) {
      return {
        assigned: 0,
        skipped: controlIds.length,
        conflicts: otherAssignedControlIds,
        conflictMessage: `Os seguintes controles já estão atribuídos a outros usuários: ${otherAssignedControlIds.join(', ')}. Use force=true para substituir.`,
      };
    }

    let removedCount = 0;
    if (force && otherAssignedControlIds.length > 0) {
      const removed = await Assignment.deleteMany({
        userId: { $in: otherUserIds },
        controlId: { $in: otherAssignedControlIds },
      });
      removedCount = removed.deletedCount || 0;
      logger.info(`Removidas ${removedCount} atribuições de controles para outros usuários`);
    }

    const existingAssignments = await Assignment.find({
      userId,
      controlId: { $in: controlIds },
    });

    const existingControlIds = existingAssignments.map((a) => a.controlId.toString());
    const newControlIds = controlIds.filter((id) => !existingControlIds.includes(id));

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

      // 🔴 NOTIFICAÇÃO: Para cada controle atribuído
      for (const assignmentData of assignments) {
        const control = controls.find(c => c._id.toString() === assignmentData.controlId);
        if (control) {
          try {
            await NotificationService.notifyAssignment(
              userId,
              rep.companyId?.toString() || '',
              control.nome || control.id || assignmentData.controlId,
              control.id || assignmentData.controlId,
              rep.name || rep.email
            );
          } catch (notifyError) {
            logger.error('❌ Erro ao enviar notificação de atribuição:', notifyError);
          }
        }
      }
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
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (user.createdBy?.toString() !== repId) {
      throw new AppError('Usuário não pertence a este preposto', 403);
    }

    if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
      throw new AppError('Usuário não pertence à mesma empresa do preposto', 403);
    }

    const assignments = await Assignment.find({ userId })
      .populate('controlId', 'id nome')
      .lean();

    const responses = await Response.find({ userId })
      .populate('controlId', 'id nome')
      .lean();

    const responseMap = new Map();
    responses.forEach((r) => {
      responseMap.set(r.assignmentId.toString(), r);
    });

    const total = assignments.length;
    const completed = responses.length;
    const pending = total - completed;

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

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const details = assignments.map((assignment) => {
      const control = assignment.controlId as any;
      return {
        assignmentId: assignment._id,
        controlId: control?._id || assignment.controlId,
        controlName: control?.nome || 'Controle não encontrado',
        status: assignment.status,
        response: responseMap.get(assignment._id.toString()) || null,
      };
    });

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
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    const filter: any = {
      createdBy: repId,
      role: UserRole.USER,
    };

    if (rep.companyId) {
      filter.companyId = rep.companyId;
    }

    const users = await User.find(filter).select('_id name email');

    const userIds = users.map((u) => u._id);

    const [assignments, responses] = await Promise.all([
      Assignment.find({ userId: { $in: userIds } }),
      Response.find({ userId: { $in: userIds } }),
    ]);

    const totalAssignments = assignments.length;
    const totalResponses = responses.length;
    const overallPercentage = totalAssignments > 0
      ? Math.round((totalResponses / totalAssignments) * 100)
      : 0;

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
    const rep = await User.findById(repId);
    if (!rep) {
      throw new NotFoundError('Preposto não encontrado');
    }

    const filter: any = {
      createdBy: repId,
      role: UserRole.USER,
      isActive: true,
    };

    if (rep.companyId) {
      filter.companyId = rep.companyId;
    }

    const activeUsers = await User.find(filter).select('_id');
    const activeUserIds = activeUsers.map(u => u._id);

    const totalUsers = await User.countDocuments(filter);

    const totalAssignments = await Assignment.countDocuments({
      assignedBy: repId,
      userId: { $in: activeUserIds },
    });

    const statusCounts = await Assignment.aggregate([
      { 
        $match: { 
          assignedBy: new mongoose.Types.ObjectId(repId),
          userId: { $in: activeUserIds }
        } 
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((item) => {
      statusMap[item._id] = item.count;
    });

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
      { 
        $match: { 
          'assignment.assignedBy': new mongoose.Types.ObjectId(repId),
          'assignment.userId': { $in: activeUserIds }
        } 
      },
      { $count: 'total' },
    ]);

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
      { 
        $match: { 
          'assignment.assignedBy': new mongoose.Types.ObjectId(repId),
          'assignment.userId': { $in: activeUserIds }
        } 
      },
      {
        $group: {
          _id: null,
          avgMaturity: { $avg: { $toDouble: '$maturityLevel' } },
        },
      },
    ]);

    const totalResponsesCount = totalResponses[0]?.total || 0;

    const completionRate = totalAssignments > 0
      ? Math.round((totalResponsesCount / totalAssignments) * 100)
      : 0;

    return {
      totalUsers,
      totalAssignments,
      totalResponses: totalResponsesCount,
      statusDistribution: statusMap,
      averageMaturity: maturityAvg[0]?.avgMaturity || 0,
      completionRate,
    };
  }
}