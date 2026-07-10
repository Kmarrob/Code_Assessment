"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepService = void 0;
// backend/src/services/RepService.ts
const mongoose_1 = __importDefault(require("mongoose"));
const User_js_1 = require("../models/User.js");
const Assignment_js_1 = require("../models/Assignment.js");
const Response_js_1 = require("../models/Response.js");
const Control_js_1 = require("../models/Control.js");
const Company_js_1 = require("../models/Company.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const logger_js_1 = require("../utils/logger.js");
const index_js_1 = require("../types/index.js");
// 🔴 NOVO: Import do EmailJSService
const EmailJSService_js_1 = require("./EmailJSService.js");
// 🔴 NOVO: Import do NotificationService
const NotificationService_js_1 = require("./NotificationService.js");
class RepService {
    /**
     * Listar usuários de um preposto (usuários que ele cadastrou)
     */
    static async listUsers(repId, filters = {}) {
        const { page = 1, limit = 10, search = '', status = 'all' } = filters;
        // Verificar se o preposto existe e obter sua empresa
        const rep = await User_js_1.User.findById(repId);
        if (!rep) {
            throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
        }
        // Construir filtro - USANDO companyId para isolamento
        const filter = {
            createdBy: repId,
            role: index_js_1.UserRole.USER,
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
        }
        else if (status === 'inactive') {
            filter.isActive = false;
        }
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User_js_1.User.find(filter)
                .select('_id name email role company department isActive lastLogin createdAt updatedAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User_js_1.User.countDocuments(filter),
        ]);
        // Buscar contagem de atribuições para cada usuário
        const userIds = users.map((u) => u._id);
        const assignmentCounts = await Assignment_js_1.Assignment.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map();
        assignmentCounts.forEach((item) => {
            countMap.set(item._id.toString(), item.count);
        });
        // Buscar contagem de respostas para cada usuário
        const responseCounts = await Response_js_1.Response.aggregate([
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
    static async createUser(repId, userData) {
        // Verificar se o preposto existe
        const rep = await User_js_1.User.findById(repId);
        if (!rep) {
            throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
        }
        // Verificar se email já está em uso
        const existingUser = await User_js_1.User.findOne({ email: userData.email });
        if (existingUser) {
            throw new errorHandler_js_1.ValidationError({ email: ['Email já está em uso'] });
        }
        // ============================================
        // VERIFICAR E CORRIGIR companyId DO REP
        // ============================================
        let companyId = rep.companyId;
        // Se o rep não tem companyId, buscar pelo nome da empresa
        if (!companyId && rep.company) {
            const company = await Company_js_1.Company.findOne({ name: rep.company });
            if (company) {
                companyId = company._id;
                // Atualizar o rep com o companyId correto
                await User_js_1.User.findByIdAndUpdate(repId, { companyId: company._id });
                logger_js_1.logger.info(`CompanyId corrigido para o rep ${rep.email}: ${company._id}`);
            }
        }
        // Se ainda não tiver companyId, lançar erro
        if (!companyId) {
            throw new errorHandler_js_1.AppError('Preposto não possui empresa associada. Contate o administrador.', 400);
        }
        // ============================================
        // CORREÇÃO: Senha NÃO é gerada para primeiro acesso
        // O usuário deve criar a senha via link de redefinição
        // ============================================
        let generatedPassword = userData.password;
        if (!generatedPassword) {
            generatedPassword = undefined;
            logger_js_1.logger.info(`Usuário criado para primeiro acesso (sem senha): ${userData.email}`);
        }
        // Criar usuário
        const user = new User_js_1.User({
            name: userData.name,
            email: userData.email,
            ...(generatedPassword && { password: generatedPassword }),
            department: userData.department || '',
            role: index_js_1.UserRole.USER,
            createdBy: repId,
            companyId: companyId,
            isActive: true,
            mustChangePassword: true,
        });
        await user.save();
        logger_js_1.logger.info(`Usuário criado pelo preposto ${rep.email}: ${user.email} (Empresa: ${companyId})`);
        // Enviar e-mail de boas-vindas com link para criar senha
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'https://code-assessment-frontend.onrender.com';
            const resetToken = user._id;
            const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
            await EmailJSService_js_1.emailjsService.sendPasswordResetEmail({
                to: user.email,
                userName: user.name,
                userEmail: user.email,
                resetLink: resetLink,
                expiryTime: '24 horas',
            });
            logger_js_1.logger.info(`📧 E-mail de boas-vindas enviado para ${user.email}`);
        }
        catch (emailError) {
            logger_js_1.logger.error(`❌ Erro ao enviar e-mail de boas-vindas para ${user.email}:`, emailError);
        }
        const userResponse = user.toJSON();
        delete userResponse.password;
        return userResponse;
    }
    /**
     * Editar usuário pelo preposto
     */
    static async updateUser(repId, userId, data) {
        const rep = await User_js_1.User.findById(repId);
        if (!rep) {
            throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
        }
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.NotFoundError('Usuário não encontrado');
        }
        if (user.createdBy?.toString() !== repId) {
            throw new errorHandler_js_1.AppError('Usuário não pertence a este preposto', 403);
        }
        if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
            throw new errorHandler_js_1.AppError('Usuário não pertence à mesma empresa do preposto', 403);
        }
        if (data.email && data.email !== user.email) {
            const existingUser = await User_js_1.User.findOne({
                email: data.email,
                _id: { $ne: userId },
            });
            if (existingUser) {
                throw new errorHandler_js_1.ValidationError({ email: ['Email já está em uso por outro usuário'] });
            }
        }
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.email)
            updateData.email = data.email;
        if (data.department !== undefined)
            updateData.department = data.department;
        const updatedUser = await User_js_1.User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select('_id name email department role isActive');
        logger_js_1.logger.info(`Usuário ${user.email} atualizado pelo preposto ${rep.email}`);
        return updatedUser;
    }
    /**
     * Inativar usuário com justificativa
     */
    static async inactivateUser(repId, userId, data) {
        const rep = await User_js_1.User.findById(repId);
        if (!rep) {
            throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
        }
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.NotFoundError('Usuário não encontrado');
        }
        if (user.createdBy?.toString() !== repId) {
            throw new errorHandler_js_1.AppError('Usuário não pertence a este preposto', 403);
        }
        if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
            throw new errorHandler_js_1.AppError('Usuário não pertence à mesma empresa do preposto', 403);
        }
        if (!user.isActive) {
            throw new errorHandler_js_1.AppError('Usuário já está inativo', 400);
        }
        const updatedUser = await User_js_1.User.findByIdAndUpdate(userId, {
            $set: {
                isActive: false,
                inactivationReason: data.reason,
                inactivationDescription: data.description || '',
                inactivatedAt: new Date(),
                inactivatedBy: repId,
            },
        }, { new: true }).select('_id name email role isActive inactivationReason inactivationDescription inactivatedAt');
        logger_js_1.logger.info(`Usuário ${user.email} inativado pelo preposto ${rep.email}. Motivo: ${data.reason}`);
        await Assignment_js_1.Assignment.updateMany({ userId, status: index_js_1.ResponseStatus.PENDING }, { $set: { status: index_js_1.ResponseStatus.REVOKED } });
        // 🔴 NOTIFICAÇÃO: Usuário inativado
        try {
            await NotificationService_js_1.NotificationService.notifyUserInactivated(userId, rep.companyId?.toString() || '', rep.name || rep.email, `${data.reason} - ${data.description || ''}`);
        }
        catch (notifyError) {
            logger_js_1.logger.error('❌ Erro ao enviar notificação de inativação:', notifyError);
        }
        return updatedUser;
    }
    /**
     * Revogar controle com reatribuição
     */
    static async revokeControl(repId, assignmentId, newUserId) {
        const rep = await User_js_1.User.findById(repId);
        if (!rep) {
            throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
        }
        const assignment = await Assignment_js_1.Assignment.findById(assignmentId)
            .populate('userId', 'name email')
            .populate('controlId', 'id nome');
        if (!assignment) {
            throw new errorHandler_js_1.NotFoundError('Atribuição não encontrada');
        }
        const currentUser = await User_js_1.User.findById(assignment.userId);
        if (!currentUser || currentUser.companyId?.toString() !== rep.companyId?.toString()) {
            throw new errorHandler_js_1.AppError('Atribuição não pertence à sua empresa', 403);
        }
        if (assignment.status === index_js_1.ResponseStatus.COMPLETED) {
            throw new errorHandler_js_1.AppError('Não é possível revogar um controle já respondido', 400);
        }
        const oldUserId = assignment.userId;
        const oldUser = currentUser;
        const control = assignment.controlId;
        // 🔴 NOTIFICAÇÃO: Controle revogado (antes de deletar)
        try {
            await NotificationService_js_1.NotificationService.notifyControlRevoked(oldUserId.toString(), rep.companyId?.toString() || '', control?.nome || 'Controle', control?.id || assignment.controlId, `Revogado por ${rep.name || rep.email}${newUserId ? ' e reatribuído' : ''}`);
        }
        catch (notifyError) {
            logger_js_1.logger.error('❌ Erro ao enviar notificação de revogação:', notifyError);
        }
        // Remover a atribuição atual
        await Assignment_js_1.Assignment.findByIdAndDelete(assignmentId);
        let newAssignment = null;
        // Se novo usuário foi especificado, criar nova atribuição
        if (newUserId) {
            const newUser = await User_js_1.User.findOne({
                _id: newUserId,
                createdBy: repId,
                role: index_js_1.UserRole.USER,
                isActive: true,
            });
            if (!newUser) {
                throw new errorHandler_js_1.NotFoundError('Usuário destino não encontrado ou inativo');
            }
            if (newUser.companyId?.toString() !== rep.companyId?.toString()) {
                throw new errorHandler_js_1.AppError('Usuário destino não pertence à mesma empresa', 403);
            }
            const existingAssignment = await Assignment_js_1.Assignment.findOne({
                userId: newUserId,
                controlId: assignment.controlId,
            });
            if (existingAssignment) {
                throw new errorHandler_js_1.AppError('Este controle já está atribuído ao usuário destino', 400);
            }
            // Criar nova atribuição
            newAssignment = new Assignment_js_1.Assignment({
                userId: newUserId,
                controlId: assignment.controlId,
                assignedBy: repId,
                assignedAt: new Date(),
                status: index_js_1.ResponseStatus.PENDING,
                dueDate: assignment.dueDate,
            });
            await newAssignment.save();
            await newAssignment.populate('userId', 'name email');
            await newAssignment.populate('controlId', 'id nome');
            // 🔴 NOTIFICAÇÃO: Novo controle atribuído (para o novo usuário)
            try {
                await NotificationService_js_1.NotificationService.notifyAssignment(newUserId, rep.companyId?.toString() || '', control?.nome || 'Controle', control?.id || assignment.controlId, rep.name || rep.email);
            }
            catch (notifyError) {
                logger_js_1.logger.error('❌ Erro ao enviar notificação de atribuição para novo usuário:', notifyError);
            }
            logger_js_1.logger.info(`Controle ${control?.id || assignment.controlId} revogado do usuário ${oldUser?.email} e reatribuído para ${newUser.email} pelo preposto ${rep.email}`);
        }
        else {
            logger_js_1.logger.info(`Controle ${control?.id || assignment.controlId} revogado do usuário ${oldUser?.email} pelo preposto ${rep.email}`);
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
    static async assignControls(repId, data) {
        const { userId, controlIds, force = false } = data;
        const rep = await User_js_1.User.findById(repId);
        if (!rep) {
            throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
        }
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.NotFoundError('Usuário não encontrado');
        }
        if (user.createdBy?.toString() !== repId) {
            throw new errorHandler_js_1.AppError('Usuário não pertence a este preposto', 403);
        }
        if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
            throw new errorHandler_js_1.AppError('Usuário não pertence à mesma empresa do preposto', 403);
        }
        const controls = await Control_js_1.Control.find({ _id: { $in: controlIds } });
        if (controls.length !== controlIds.length) {
            throw new errorHandler_js_1.NotFoundError('Um ou mais controles não foram encontrados');
        }
        const otherUsers = await User_js_1.User.find({
            companyId: rep.companyId,
            _id: { $ne: userId },
            role: index_js_1.UserRole.USER,
        }).select('_id');
        const otherUserIds = otherUsers.map(u => u._id);
        const existingOtherAssignments = await Assignment_js_1.Assignment.find({
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
            const removed = await Assignment_js_1.Assignment.deleteMany({
                userId: { $in: otherUserIds },
                controlId: { $in: otherAssignedControlIds },
            });
            removedCount = removed.deletedCount || 0;
            logger_js_1.logger.info(`Removidas ${removedCount} atribuições de controles para outros usuários`);
        }
        const existingAssignments = await Assignment_js_1.Assignment.find({
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
            status: index_js_1.ResponseStatus.PENDING,
        }));
        let created = 0;
        if (assignments.length > 0) {
            const result = await Assignment_js_1.Assignment.insertMany(assignments);
            created = result.length;
            // 🔴 NOTIFICAÇÃO: Para cada controle atribuído
            for (const assignmentData of assignments) {
                const control = controls.find(c => c._id.toString() === assignmentData.controlId);
                if (control) {
                    try {
                        await NotificationService_js_1.NotificationService.notifyAssignment(userId, rep.companyId?.toString() || '', control.nome || control.id || assignmentData.controlId, control.id || assignmentData.controlId, rep.name || rep.email);
                    }
                    catch (notifyError) {
                        logger_js_1.logger.error('❌ Erro ao enviar notificação de atribuição:', notifyError);
                    }
                }
            }
        }
        logger_js_1.logger.info(`${created} controles atribuídos ao usuário ${user.email} pelo preposto ${rep.email}`);
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
    static async getUserProgress(repId, userId) {
        const rep = await User_js_1.User.findById(repId);
        if (!rep) {
            throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
        }
        const user = await User_js_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_js_1.NotFoundError('Usuário não encontrado');
        }
        if (user.createdBy?.toString() !== repId) {
            throw new errorHandler_js_1.AppError('Usuário não pertence a este preposto', 403);
        }
        if (rep.companyId && user.companyId?.toString() !== rep.companyId.toString()) {
            throw new errorHandler_js_1.AppError('Usuário não pertence à mesma empresa do preposto', 403);
        }
        const assignments = await Assignment_js_1.Assignment.find({ userId })
            .populate('controlId', 'id nome')
            .lean();
        const responses = await Response_js_1.Response.find({ userId })
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
                maturityDistribution[level]++;
            }
        });
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        const details = assignments.map((assignment) => {
            const control = assignment.controlId;
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
    static async getOverallProgress(repId) {
        const rep = await User_js_1.User.findById(repId);
        if (!rep) {
            throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
        }
        const filter = {
            createdBy: repId,
            role: index_js_1.UserRole.USER,
        };
        if (rep.companyId) {
            filter.companyId = rep.companyId;
        }
        const users = await User_js_1.User.find(filter).select('_id name email');
        const userIds = users.map((u) => u._id);
        const [assignments, responses] = await Promise.all([
            Assignment_js_1.Assignment.find({ userId: { $in: userIds } }),
            Response_js_1.Response.find({ userId: { $in: userIds } }),
        ]);
        const totalAssignments = assignments.length;
        const totalResponses = responses.length;
        const overallPercentage = totalAssignments > 0
            ? Math.round((totalResponses / totalAssignments) * 100)
            : 0;
        const userProgress = users.map((user) => {
            const userAssignments = assignments.filter((a) => a.userId.toString() === user._id.toString());
            const userResponses = responses.filter((r) => r.userId.toString() === user._id.toString());
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
    static async getStats(repId) {
        const rep = await User_js_1.User.findById(repId);
        if (!rep) {
            throw new errorHandler_js_1.NotFoundError('Preposto não encontrado');
        }
        const filter = {
            createdBy: repId,
            role: index_js_1.UserRole.USER,
            isActive: true,
        };
        if (rep.companyId) {
            filter.companyId = rep.companyId;
        }
        const activeUsers = await User_js_1.User.find(filter).select('_id');
        const activeUserIds = activeUsers.map(u => u._id);
        const totalUsers = await User_js_1.User.countDocuments(filter);
        const totalAssignments = await Assignment_js_1.Assignment.countDocuments({
            assignedBy: repId,
            userId: { $in: activeUserIds },
        });
        const statusCounts = await Assignment_js_1.Assignment.aggregate([
            {
                $match: {
                    assignedBy: new mongoose_1.default.Types.ObjectId(repId),
                    userId: { $in: activeUserIds }
                }
            },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const statusMap = {};
        statusCounts.forEach((item) => {
            statusMap[item._id] = item.count;
        });
        const totalResponses = await Response_js_1.Response.aggregate([
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
                    'assignment.assignedBy': new mongoose_1.default.Types.ObjectId(repId),
                    'assignment.userId': { $in: activeUserIds }
                }
            },
            { $count: 'total' },
        ]);
        const maturityAvg = await Response_js_1.Response.aggregate([
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
                    'assignment.assignedBy': new mongoose_1.default.Types.ObjectId(repId),
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
exports.RepService = RepService;
//# sourceMappingURL=RepService.js.map